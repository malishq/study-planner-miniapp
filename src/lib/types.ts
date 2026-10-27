export type ControlType = "credit" | "exam";
export type TaskKind = "practice" | "lab" | "test" | "coursework" | "workbook";
export type TaskStatus = "todo" | "done" | "graded";
export type ThemeSetting = "auto" | "light" | "dark";

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher: string;
  control: ControlType;
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  due: string;
  kind: TaskKind;
  status: TaskStatus;
  grade: number | null;
  note: string;
  link: string;
}

export interface Settings {
  theme: ThemeSetting;
}

export interface PlannerData {
  version: 1;
  subjects: Subject[];
  tasks: Task[];
  settings: Settings;
  updatedAt: number;
}

export const KIND_LABELS: Record<TaskKind, string> = {
  practice: "Практика",
  lab: "Лабораторная",
  test: "Тест",
  coursework: "Курсовая",
  workbook: "Рабочая тетрадь",
};

export const KIND_ORDER: TaskKind[] = ["practice", "lab", "test", "coursework", "workbook"];

export const CONTROL_LABELS: Record<ControlType, string> = {
  credit: "Зачёт",
  exam: "Экзамен",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Не сдано",
  done: "Сдано",
  graded: "Проверено",
};

export const SUBJECT_COLORS = [
  "#d9573a",
  "#e0932a",
  "#2f9e63",
  "#1f8fb2",
  "#3b66d6",
  "#8a5bd3",
  "#cf4a8b",
  "#8a6a3b",
  "#5f8f22",
  "#6c7682",
];

export function emptyData(): PlannerData {
  return { version: 1, subjects: [], tasks: [], settings: { theme: "auto" }, updatedAt: 0 };
}
