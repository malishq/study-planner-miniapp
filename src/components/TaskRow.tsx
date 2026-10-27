import { dueLabel } from "../lib/dates";
import { isOverdue } from "../lib/logic";
import { KIND_LABELS, type Subject, type Task } from "../lib/types";
import { Icon } from "./Icon";

interface Props {
  task: Task;
  subject: Subject | undefined;
  today: string;
  onOpen(task: Task): void;
  onToggle(task: Task): void;
  showSubject?: boolean;
}

export function TaskRow({ task, subject, today, onOpen, onToggle, showSubject = true }: Props) {
  const open = task.status === "todo";
  const overdue = isOverdue(task, today);
  const isToday = open && task.due === today;
  const meta = [showSubject ? subject?.name : null, KIND_LABELS[task.kind]].filter(Boolean).join(" · ");

  let right: React.ReactNode;
  if (task.status === "graded") {
    right = (
      <span className="text-[14px] text-muted">
        оценка <span className="num text-[16px] font-semibold text-ink">{task.grade ?? "—"}</span>
      </span>
    );
  } else if (task.status === "done") {
    right = <span className="text-[14px] text-muted">сдано</span>;
  } else {
    right = <span className={`num text-[14px] ${overdue ? "font-semibold text-danger" : isToday ? "font-semibold text-ink" : "text-muted"}`}>{dueLabel(task.due, today)}</span>;
  }

  return (
    <li data-row className="flex items-stretch gap-1">
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-pressed={!open}
        aria-label={open ? `Отметить сданным: ${task.title}` : `Вернуть в несданные: ${task.title}`}
        className="pressable flex w-11 shrink-0 items-center justify-center self-stretch"
      >
        <span
          className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 transition-colors ${
            open ? (overdue ? "border-danger" : "border-raised") : "border-accent bg-accent text-on-accent"
          }`}
        >
          {!open && <Icon name="check" size={16} />}
        </span>
      </button>
      <button type="button" onClick={() => onOpen(task)} className="pressable flex min-w-0 flex-1 items-start justify-between gap-3 border-b border-line py-3.5 pr-1 text-left">
        <span className="min-w-0">
          <span className={`line-clamp-2 text-[16px] leading-snug font-medium ${open ? "text-ink" : "text-muted"}`}>{task.title}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-snug text-muted">
            {showSubject && subject && <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: subject.color }} aria-hidden="true" />}
            <span className="truncate">{meta}</span>
            {task.link && <Icon name="link" size={13} className="shrink-0" />}
          </span>
        </span>
        <span className="shrink-0 pt-0.5 whitespace-nowrap">{right}</span>
      </button>
    </li>
  );
}
