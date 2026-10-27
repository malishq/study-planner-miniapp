import { useState, type FormEvent } from "react";
import { addDays } from "../lib/dates";
import { newId } from "../lib/id";
import { sortSubjects, validateTask, type TaskErrors } from "../lib/logic";
import { confirmDialog, openExternal } from "../lib/telegram";
import { KIND_LABELS, KIND_ORDER, STATUS_LABELS, type Subject, type Task, type TaskKind, type TaskStatus } from "../lib/types";
import { Button } from "./Button";
import { ColorPicker, Field, Segmented, TextArea, TextInput } from "./Field";
import { SUBJECT_COLORS } from "../lib/types";
import { Icon } from "./Icon";

interface Props {
  formId: string;
  task: Task | null;
  defaults?: Partial<Task>;
  subjects: Subject[];
  today: string;
  onSubmit(task: Task): void;
  onDelete?(task: Task): void;
  onNeedSubject(): void;
}

export function TaskForm({ formId, task, defaults, subjects, today, onSubmit, onDelete, onNeedSubject }: Props) {
  const sorted = sortSubjects(subjects);
  const [draft, setDraft] = useState<Task>(() => ({
    id: task?.id ?? newId(),
    subjectId: task?.subjectId ?? defaults?.subjectId ?? (sorted.length === 1 ? sorted[0].id : ""),
    title: task?.title ?? "",
    due: task?.due ?? defaults?.due ?? today,
    kind: task?.kind ?? "practice",
    status: task?.status ?? "todo",
    grade: task?.grade ?? null,
    note: task?.note ?? "",
    link: task?.link ?? "",
  }));
  const [errors, setErrors] = useState<TaskErrors>({});

  const update = <K extends keyof Task>(key: K, value: Task[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const clean: Task = { ...draft, title: draft.title.trim(), note: draft.note.trim(), link: draft.link.trim(), grade: draft.status === "graded" ? draft.grade : null };
    const found = validateTask(clean);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(clean);
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    if (await confirmDialog(`Удалить задание «${task.title}»?`)) onDelete(task);
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-[20px] bg-surface px-5 py-6">
        <p className="text-[18px] font-semibold">Сначала добавьте предмет</p>
        <p className="mt-2 text-[15px] text-muted">Задание привязывается к предмету: так считается прогресс по каждому курсу.</p>
        <Button className="mt-5" onClick={onNeedSubject} data-autofocus>
          Добавить предмет
        </Button>
      </div>
    );
  }

  const quickDates: { label: string; value: string }[] = [
    { label: "Сегодня", value: today },
    { label: "Завтра", value: addDays(today, 1) },
    { label: "Через неделю", value: addDays(today, 7) },
  ];

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      <Field label="Название" error={errors.title} htmlFor={`${formId}-title`}>
        <TextInput id={`${formId}-title`} value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="ПР4. Процессы и потоки" autoComplete="off" />
      </Field>

      <Field label="Предмет" error={errors.subjectId}>
        <Segmented label="Предмет" options={sorted.map((s) => ({ value: s.id, label: s.name, dot: s.color }))} value={draft.subjectId || null} onChange={(v) => update("subjectId", v)} />
      </Field>

      <Field label="Тип работы">
        <Segmented<TaskKind> label="Тип работы" options={KIND_ORDER.map((k) => ({ value: k, label: KIND_LABELS[k] }))} value={draft.kind} onChange={(v) => update("kind", v)} />
      </Field>

      <Field label="Дедлайн" error={errors.due} htmlFor={`${formId}-due`}>
        <TextInput id={`${formId}-due`} type="date" value={draft.due} onChange={(e) => update("due", e.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">
          {quickDates.map((q) => (
            <button
              key={q.value}
              type="button"
              onClick={() => update("due", q.value)}
              className={`pressable min-h-9 rounded-full px-3.5 text-[14px] font-medium ${draft.due === q.value ? "bg-ink text-ground" : "bg-surface text-muted"}`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Статус">
        <Segmented<TaskStatus>
          label="Статус"
          options={(["todo", "done", "graded"] as TaskStatus[]).map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          value={draft.status}
          onChange={(v) => update("status", v)}
        />
      </Field>

      {draft.status === "graded" && (
        <Field label="Оценка" error={errors.grade}>
          <Segmented<"2" | "3" | "4" | "5">
            label="Оценка"
            options={(["2", "3", "4", "5"] as const).map((g) => ({ value: g, label: g }))}
            value={draft.grade === null ? null : (String(draft.grade) as "2" | "3" | "4" | "5")}
            onChange={(v) => update("grade", Number(v))}
          />
        </Field>
      )}

      <Field label="Заметка" htmlFor={`${formId}-note`}>
        <TextArea id={`${formId}-note`} value={draft.note} onChange={(e) => update("note", e.target.value)} placeholder="Что нужно сделать, вариант, требования к отчёту" />
      </Field>

      <Field label="Ссылка" error={errors.link} htmlFor={`${formId}-link`}>
        <div className="flex gap-2">
          <TextInput id={`${formId}-link`} type="url" inputMode="url" value={draft.link} onChange={(e) => update("link", e.target.value)} placeholder="https://" autoComplete="off" />
          {draft.link.trim().length > 0 && !errors.link && (
            <button type="button" onClick={() => openExternal(draft.link.trim())} aria-label="Открыть ссылку" className="pressable flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-ink">
              <Icon name="link" size={20} />
            </button>
          )}
        </div>
      </Field>

      {task && onDelete && (
        <div className="pt-1 pb-2">
          <Button variant="danger" size="sm" onClick={handleDelete} className="-ml-4">
            <Icon name="trash" size={18} />
            Удалить задание
          </Button>
        </div>
      )}
    </form>
  );
}

interface SubjectProps {
  formId: string;
  subject: Subject | null;
  subjects: Subject[];
  taskCount: number;
  onSubmit(subject: Subject): void;
  onDelete?(subject: Subject): void;
}

export function SubjectForm({ formId, subject, subjects, taskCount, onSubmit, onDelete }: SubjectProps) {
  const used = new Set(subjects.map((s) => s.color));
  const [draft, setDraft] = useState<Subject>(() => ({
    id: subject?.id ?? newId(),
    name: subject?.name ?? "",
    color: subject?.color ?? SUBJECT_COLORS.find((c) => !used.has(c)) ?? SUBJECT_COLORS[0],
    teacher: subject?.teacher ?? "",
    control: subject?.control ?? "credit",
  }));
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const clean = { ...draft, name: draft.name.trim(), teacher: draft.teacher.trim() };
    if (clean.name.length === 0) {
      setError("Напишите название предмета");
      return;
    }
    onSubmit(clean);
  };

  const handleDelete = async () => {
    if (!subject || !onDelete) return;
    const tail = taskCount > 0 ? ` Вместе с ним удалятся ${taskCount} ${taskCount === 1 ? "задание" : taskCount < 5 ? "задания" : "заданий"}.` : "";
    if (await confirmDialog(`Удалить предмет «${subject.name}»?${tail}`)) onDelete(subject);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      <Field label="Название" error={error} htmlFor={`${formId}-name`}>
        <TextInput id={`${formId}-name`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Операционные системы" autoComplete="off" />
      </Field>
      <Field label="Цвет">
        <ColorPicker colors={SUBJECT_COLORS} value={draft.color} onChange={(color) => setDraft({ ...draft, color })} />
      </Field>
      <Field label="Преподаватель" htmlFor={`${formId}-teacher`}>
        <TextInput id={`${formId}-teacher`} value={draft.teacher} onChange={(e) => setDraft({ ...draft, teacher: e.target.value })} placeholder="Фамилия И. О." autoComplete="off" />
      </Field>
      <Field label="Форма контроля">
        <Segmented<"credit" | "exam">
          label="Форма контроля"
          options={[
            { value: "credit", label: "Зачёт" },
            { value: "exam", label: "Экзамен" },
          ]}
          value={draft.control}
          onChange={(control) => setDraft({ ...draft, control })}
        />
      </Field>
      {subject && onDelete && (
        <div className="pt-1 pb-2">
          <Button variant="danger" size="sm" onClick={handleDelete} className="-ml-4">
            <Icon name="trash" size={18} />
            Удалить предмет
          </Button>
        </div>
      )}
    </form>
  );
}
