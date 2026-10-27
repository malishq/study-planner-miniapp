import { plural } from "../lib/dates";
import { isOpen, progressOf, sortByDue, sortSubjects, subjectProgress } from "../lib/logic";
import { CONTROL_LABELS, type Subject, type Task } from "../lib/types";
import { useStore } from "../store/useStore";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenHeader } from "../components/ScreenHeader";
import { RowList, SectionTitle, useRowEntrance } from "../components/TaskList";
import { TaskRow } from "../components/TaskRow";

interface ListProps {
  onAddSubject(): void;
  onOpenSubject(subject: Subject): void;
}

export function SubjectsScreen({ onAddSubject, onOpenSubject }: ListProps) {
  const { data } = useStore();
  const subjects = sortSubjects(data.subjects);
  const total = progressOf(data.tasks);
  const scope = useRowEntrance<HTMLDivElement>(`subjects-${subjects.length}`);

  return (
    <div ref={scope}>
      <ScreenHeader
        title="Предметы"
        subline={
          subjects.length > 0 ? (
            <>
              {subjects.length} {plural(subjects.length, ["предмет", "предмета", "предметов"])} · сдано{" "}
              <span className="num font-semibold text-ink">
                {total.done} из {total.total}
              </span>{" "}
              {plural(total.total, ["задания", "заданий", "заданий"])}
            </>
          ) : null
        }
        action={
          <Button size="sm" onClick={onAddSubject}>
            Добавить
          </Button>
        }
      />
      {subjects.length === 0 ? (
        <EmptyState title="Предметов пока нет" text="Начните с предмета: название, преподаватель, зачёт или экзамен. Потом добавите к нему задания.">
          <Button onClick={onAddSubject}>Добавить предмет</Button>
        </EmptyState>
      ) : (
        <ul className="px-5 lg:px-0">
          {subjects.map((subject) => {
            const progress = subjectProgress(subject.id, data.tasks);
            return (
              <li key={subject.id} data-row>
                <button type="button" onClick={() => onOpenSubject(subject)} className="pressable block w-full border-b border-line py-4 text-left">
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="mt-[7px] block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: subject.color }} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate text-[17px] leading-snug font-medium">{subject.name}</span>
                        <span className="block truncate text-[13px] text-muted">{[subject.teacher, CONTROL_LABELS[subject.control].toLowerCase()].filter(Boolean).join(" · ")}</span>
                      </span>
                    </span>
                    <span className="num shrink-0 pt-0.5 text-[14px] text-muted">
                      {progress.total === 0 ? "нет заданий" : <>сдано <span className="font-semibold text-ink">{progress.done}</span> из {progress.total}</>}
                    </span>
                  </span>
                  <span className="mt-3 block pl-[22px]">
                    <ProgressBar ratio={progress.ratio} label={`${subject.name}: сдано ${progress.done} из ${progress.total}`} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface DetailProps {
  subjectId: string;
  today: string;
  onBack(): void;
  onEditSubject(subject: Subject): void;
  onAddTask(subject: Subject): void;
  onOpenTask(task: Task): void;
  onToggle(task: Task): void;
}

export function SubjectDetailScreen({ subjectId, today, onBack, onEditSubject, onAddTask, onOpenTask, onToggle }: DetailProps) {
  const { data } = useStore();
  const subject = data.subjects.find((s) => s.id === subjectId);
  const tasks = sortByDue(data.tasks.filter((t) => t.subjectId === subjectId));
  const open = tasks.filter(isOpen);
  const closed = tasks.filter((t) => !isOpen(t));
  const progress = progressOf(tasks);
  const scope = useRowEntrance<HTMLDivElement>(`subject-${subjectId}-${tasks.length}`);

  if (!subject) {
    return (
      <div>
        <ScreenHeader title="Предмет не найден" onBack={onBack} />
        <EmptyState title="Этот предмет удалён">
          <Button variant="secondary" onClick={onBack}>
            К списку предметов
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div ref={scope}>
      <ScreenHeader
        title={subject.name}
        onBack={onBack}
        subline={[subject.teacher, CONTROL_LABELS[subject.control]].filter(Boolean).join(" · ")}
        action={
          <button type="button" onClick={() => onEditSubject(subject)} className="pressable flex h-9 items-center gap-1.5 rounded-full bg-surface px-3.5 text-[14px] font-medium">
            Изменить
          </button>
        }
      />
      <div className="mx-5 rounded-[20px] bg-surface px-5 py-4 lg:mx-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] text-muted">Сдано</span>
          <span className="num text-[24px] font-semibold tracking-[-0.01em]">
            {progress.done} <span className="text-[15px] font-normal text-muted">из {progress.total}</span>
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar ratio={progress.ratio} height={8} color={subject.color} label={`Сдано ${progress.done} из ${progress.total}`} />
        </div>
        <Button className="mt-5 w-full" onClick={() => onAddTask(subject)}>
          <Icon name="plus" size={18} />
          Добавить задание
        </Button>
      </div>

      {open.length > 0 && (
        <section>
          <SectionTitle count={open.length}>Не сдано</SectionTitle>
          <RowList>
            {open.map((task) => (
              <TaskRow key={task.id} task={task} subject={subject} today={today} onOpen={onOpenTask} onToggle={onToggle} showSubject={false} />
            ))}
          </RowList>
        </section>
      )}
      {closed.length > 0 && (
        <section>
          <SectionTitle count={closed.length}>Сдано</SectionTitle>
          <RowList>
            {closed.map((task) => (
              <TaskRow key={task.id} task={task} subject={subject} today={today} onOpen={onOpenTask} onToggle={onToggle} showSubject={false} />
            ))}
          </RowList>
        </section>
      )}
      {tasks.length === 0 && <EmptyState title="Заданий ещё нет" text="Добавьте первое задание: практику, лабораторную, тест, курсовую или рабочую тетрадь." />}
    </div>
  );
}
