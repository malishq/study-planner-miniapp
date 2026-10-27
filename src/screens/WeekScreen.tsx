import { addDays, dayNumber, formatDayWithWeekday, plural, WEEKDAYS_SHORT, weekdayIndex } from "../lib/dates";
import { groupByDue, laterTasks, overdueTasks, upcomingTasks } from "../lib/logic";
import type { Subject, Task } from "../lib/types";
import { useStore } from "../store/useStore";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ScreenHeader } from "../components/ScreenHeader";
import { RowList, SectionTitle, useRowEntrance } from "../components/TaskList";
import { TaskRow } from "../components/TaskRow";

interface Props {
  today: string;
  onAddTask(): void;
  onAddSubject(): void;
  onOpenTask(task: Task): void;
  onToggle(task: Task): void;
  onGoOverdue(): void;
}

function DayStrip({ today, tasks, subjects }: { today: string; tasks: Task[]; subjects: Map<string, Subject> }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  return (
    <div className="mx-5 grid grid-cols-7 gap-1 rounded-[20px] bg-surface px-2 py-3 lg:mx-0" aria-hidden="true">
      {days.map((day, i) => {
        const dots = tasks.filter((t) => t.due === day).map((t) => subjects.get(t.subjectId)?.color ?? "var(--muted)");
        return (
          <div key={day} className="flex flex-col items-center gap-1.5">
            <span className="text-[12px] text-muted">{WEEKDAYS_SHORT[weekdayIndex(day)]}</span>
            <span className={`num flex h-9 w-9 items-center justify-center rounded-full text-[17px] font-medium ${i === 0 ? "bg-ink text-ground" : "text-ink"}`}>{dayNumber(day)}</span>
            <span className="flex h-2 items-center gap-1">
              {dots.slice(0, 3).map((color, j) => (
                <span key={j} className="block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              ))}
              {dots.length > 3 && <span className="num text-[10px] leading-none text-muted">+{dots.length - 3}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function WeekScreen({ today, onAddTask, onAddSubject, onOpenTask, onToggle, onGoOverdue }: Props) {
  const { data, loadDemo } = useStore();
  const subjects = new Map(data.subjects.map((s) => [s.id, s]));
  const overdue = overdueTasks(data.tasks, today);
  const upcoming = upcomingTasks(data.tasks, today);
  const later = laterTasks(data.tasks, today);
  const groups = groupByDue(upcoming);
  const scope = useRowEntrance<HTMLDivElement>(`week-${data.tasks.length}`);
  const firstRun = data.subjects.length === 0 && data.tasks.length === 0;

  let subline: React.ReactNode = null;
  if (!firstRun) {
    const parts: React.ReactNode[] = [];
    parts.push(
      upcoming.length === 0 ? (
        <span key="none">За 7 дней дедлайнов нет</span>
      ) : (
        <span key="week">
          <span className="font-semibold text-ink">
            {upcoming.length} {plural(upcoming.length, ["дедлайн", "дедлайна", "дедлайнов"])}
          </span>{" "}
          за 7 дней
        </span>
      ),
    );
    if (overdue.length > 0) {
      parts.push(<span key="sep"> · </span>);
      parts.push(
        <span key="overdue" className="font-semibold text-danger">
          {overdue.length} просрочено
        </span>,
      );
    }
    subline = <>{parts}</>;
  }

  return (
    <div ref={scope}>
      <ScreenHeader
        title="Неделя"
        subline={subline}
        action={
          !firstRun && (
            <Button size="sm" onClick={onAddTask}>
              Добавить
            </Button>
          )
        }
      />

      {firstRun ? (
        <EmptyState title="Пока пусто" text="Добавьте предметы и задания с дедлайнами — здесь появится план на ближайшую неделю. Или посмотрите планер с демо-данными.">
          <Button onClick={onAddSubject}>Добавить предмет</Button>
          <Button variant="secondary" onClick={loadDemo}>
            Загрузить демо-данные
          </Button>
        </EmptyState>
      ) : (
        <>
          <DayStrip today={today} tasks={[...overdue, ...upcoming]} subjects={subjects} />

          {overdue.length > 0 && (
            <section>
              <SectionTitle tone="danger" count={overdue.length}>
                Просрочено
              </SectionTitle>
              <RowList>
                {overdue.map((task) => (
                  <TaskRow key={task.id} task={task} subject={subjects.get(task.subjectId)} today={today} onOpen={onOpenTask} onToggle={onToggle} />
                ))}
              </RowList>
            </section>
          )}

          {groups.map((group) => (
            <section key={group.date}>
              <SectionTitle>{formatDayWithWeekday(group.date, today)}</SectionTitle>
              <RowList>
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} subject={subjects.get(task.subjectId)} today={today} onOpen={onOpenTask} onToggle={onToggle} />
                ))}
              </RowList>
            </section>
          ))}

          {upcoming.length === 0 && overdue.length === 0 && (
            <EmptyState title="Неделя свободна" text={later.length > 0 ? `Ближайший дедлайн позже: ${later.length} ${plural(later.length, ["задание", "задания", "заданий"])} в разделе «Несданное».` : "Несданных заданий нет."} />
          )}

          {later.length > 0 && (upcoming.length > 0 || overdue.length > 0) && (
            <div className="px-5 pt-6 pb-2 lg:px-0">
              <button type="button" onClick={onGoOverdue} className="pressable text-[15px] font-medium text-accent">
                Ещё {later.length} {plural(later.length, ["задание", "задания", "заданий"])} позже — всё несданное
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
