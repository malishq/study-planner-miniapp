import { addDays, daysBetween, isISODate } from "./dates";
import { emptyData, KIND_LABELS, SUBJECT_COLORS, type PlannerData, type Subject, type Task, type TaskKind, type TaskStatus } from "./types";

export const collator = new Intl.Collator("ru");

export function isOpen(task: Task): boolean {
  return task.status === "todo";
}

export function sortByDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due !== b.due) return a.due < b.due ? -1 : 1;
    const byTitle = collator.compare(a.title, b.title);
    if (byTitle !== 0) return byTitle;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function openTasks(tasks: Task[]): Task[] {
  return sortByDue(tasks.filter(isOpen));
}

export function overdueTasks(tasks: Task[], today: string): Task[] {
  return openTasks(tasks).filter((t) => t.due < today);
}

export function upcomingTasks(tasks: Task[], today: string, horizonDays = 6): Task[] {
  const end = addDays(today, horizonDays);
  return openTasks(tasks).filter((t) => t.due >= today && t.due <= end);
}

export function laterTasks(tasks: Task[], today: string, horizonDays = 6): Task[] {
  const end = addDays(today, horizonDays);
  return openTasks(tasks).filter((t) => t.due > end);
}

export function tasksOn(tasks: Task[], iso: string): Task[] {
  return sortByDue(tasks.filter((t) => t.due === iso));
}

export interface DueGroup {
  date: string;
  tasks: Task[];
}

export function groupByDue(tasks: Task[]): DueGroup[] {
  const groups: DueGroup[] = [];
  for (const task of sortByDue(tasks)) {
    const last = groups[groups.length - 1];
    if (last && last.date === task.due) last.tasks.push(task);
    else groups.push({ date: task.due, tasks: [task] });
  }
  return groups;
}

export interface Progress {
  done: number;
  total: number;
  ratio: number;
}

export function progressOf(tasks: Task[]): Progress {
  const total = tasks.length;
  const done = tasks.filter((t) => !isOpen(t)).length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}

export function subjectProgress(subjectId: string, tasks: Task[]): Progress {
  return progressOf(tasks.filter((t) => t.subjectId === subjectId));
}

export function isOverdue(task: Task, today: string): boolean {
  return isOpen(task) && daysBetween(today, task.due) < 0;
}

export function sortSubjects(subjects: Subject[]): Subject[] {
  return [...subjects].sort((a, b) => collator.compare(a.name, b.name));
}

export function nextSubjectColor(subjects: Subject[]): string {
  const used = new Set(subjects.map((s) => s.color));
  return SUBJECT_COLORS.find((c) => !used.has(c)) ?? SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length];
}

export interface TaskErrors {
  title?: string;
  subjectId?: string;
  due?: string;
  grade?: string;
  link?: string;
}

export function validateTask(task: Pick<Task, "title" | "subjectId" | "due" | "status" | "grade" | "link">): TaskErrors {
  const errors: TaskErrors = {};
  if (task.title.trim().length === 0) errors.title = "Напишите название задания";
  if (task.subjectId.length === 0) errors.subjectId = "Выберите предмет";
  if (!isISODate(task.due)) errors.due = "Укажите дату дедлайна";
  if (task.status === "graded" && (task.grade === null || task.grade < 2 || task.grade > 5)) errors.grade = "Оценка от 2 до 5";
  if (task.link.trim().length > 0 && !/^https?:\/\//i.test(task.link.trim())) errors.link = "Ссылка должна начинаться с http:// или https://";
  return errors;
}

export function validateSubject(subject: Pick<Subject, "name">): { name?: string } {
  return subject.name.trim().length === 0 ? { name: "Напишите название предмета" } : {};
}

const KINDS = Object.keys(KIND_LABELS) as TaskKind[];
const STATUSES: TaskStatus[] = ["todo", "done", "graded"];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function normalizeData(raw: unknown): PlannerData {
  if (typeof raw !== "object" || raw === null) throw new Error("Файл не похож на экспорт планера");
  const input = raw as Record<string, unknown>;
  const subjectsRaw = Array.isArray(input.subjects) ? input.subjects : null;
  const tasksRaw = Array.isArray(input.tasks) ? input.tasks : null;
  if (!subjectsRaw || !tasksRaw) throw new Error("В файле нет списков предметов и заданий");
  const data = emptyData();
  const subjectIds = new Set<string>();
  for (const item of subjectsRaw) {
    if (typeof item !== "object" || item === null) continue;
    const s = item as Record<string, unknown>;
    const id = asString(s.id);
    const name = asString(s.name).trim();
    if (!id || !name || subjectIds.has(id)) continue;
    subjectIds.add(id);
    data.subjects.push({
      id,
      name,
      color: /^#[0-9a-f]{6}$/i.test(asString(s.color)) ? asString(s.color) : nextSubjectColor(data.subjects),
      teacher: asString(s.teacher),
      control: s.control === "exam" ? "exam" : "credit",
    });
  }
  const taskIds = new Set<string>();
  for (const item of tasksRaw) {
    if (typeof item !== "object" || item === null) continue;
    const t = item as Record<string, unknown>;
    const id = asString(t.id);
    const title = asString(t.title).trim();
    const subjectId = asString(t.subjectId);
    if (!id || !title || taskIds.has(id) || !subjectIds.has(subjectId) || !isISODate(t.due)) continue;
    taskIds.add(id);
    const status = STATUSES.includes(t.status as TaskStatus) ? (t.status as TaskStatus) : "todo";
    const grade = typeof t.grade === "number" && t.grade >= 2 && t.grade <= 5 ? Math.round(t.grade) : null;
    data.tasks.push({
      id,
      subjectId,
      title,
      due: t.due,
      kind: KINDS.includes(t.kind as TaskKind) ? (t.kind as TaskKind) : "practice",
      status,
      grade: status === "graded" ? grade : null,
      note: asString(t.note),
      link: asString(t.link),
    });
  }
  const settings = typeof input.settings === "object" && input.settings !== null ? (input.settings as Record<string, unknown>) : {};
  data.settings.theme = settings.theme === "light" || settings.theme === "dark" ? settings.theme : "auto";
  data.updatedAt = typeof input.updatedAt === "number" ? input.updatedAt : Date.now();
  return data;
}

export function serializeData(data: PlannerData): string {
  return JSON.stringify(data, null, 2);
}
