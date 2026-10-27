import { plural } from "../lib/dates";
import { laterTasks, overdueTasks, upcomingTasks } from "../lib/logic";
import type { Task } from "../lib/types";
import { useStore } from "../store/useStore";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ScreenHeader } from "../components/ScreenHeader";
import { RowList, SectionTitle, useRowEntrance } from "../components/TaskList";
import { TaskRow } from "../components/TaskRow";

interface Props {
  today: string;
  onOpenTask(task: Task): void;
  onToggle(task: Task): void;
  onAddTask(): void;
}

export function OverdueScreen({ today, onOpenTask, onToggle, onAddTask }: Props) {
  const { data } = useStore();
  const subjects = new Map(data.subjects.map((s) => [s.id, s]));
  const overdue = overdueTasks(data.tasks, today);
  const soon = upcomingTasks(data.tasks, today);
  const later = laterTasks(data.tasks, today);
  const total = overdue.length + soon.length + later.length;
  const scope = useRowEntrance<HTMLDivElement>(`overdue-${total}`);

  const sections: { title: string; tasks: Task[]; tone?: "danger" }[] = [
    { title: "Просрочено", tasks: overdue, tone: "danger" },
    { title: "Ближайшие 7 дней", tasks: soon },
    { title: "Позже", tasks: later },
  ];

  return (
    <div ref={scope}>
      <ScreenHeader
        title="Несданное"
        subline={
          total > 0 ? (
            <>
              <span className="num font-semibold text-ink">
                {total} {plural(total, ["задание", "задания", "заданий"])}
              </span>
              {overdue.length > 0 && (
                <>
                  {" · "}
                  <span className="num font-semibold text-danger">{overdue.length} просрочено</span>
                </>
              )}
            </>
          ) : null
        }
        action={
          data.subjects.length > 0 && (
            <Button size="sm" onClick={onAddTask}>
              Добавить
            </Button>
          )
        }
      />
      {total === 0 ? (
        <EmptyState title="Всё сдано" text={data.tasks.length > 0 ? "Несданных заданий нет. Новые появятся здесь, как только вы их добавите." : "Добавьте задания с дедлайнами, и здесь будет весь список несданного по срокам."} />
      ) : (
        sections
          .filter((s) => s.tasks.length > 0)
          .map((section) => (
            <section key={section.title}>
              <SectionTitle tone={section.tone} count={section.tasks.length}>
                {section.title}
              </SectionTitle>
              <RowList>
                {section.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} subject={subjects.get(task.subjectId)} today={today} onOpen={onOpenTask} onToggle={onToggle} />
                ))}
              </RowList>
            </section>
          ))
      )}
    </div>
  );
}
