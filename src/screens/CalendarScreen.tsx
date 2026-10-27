import { useState } from "react";
import { dayNumber, formatDayWithWeekday, monthGrid, monthOf, monthTitle, shiftMonth, WEEKDAYS_SHORT } from "../lib/dates";
import { tasksOn } from "../lib/logic";
import { hapticSelection } from "../lib/telegram";
import type { Task } from "../lib/types";
import { useStore } from "../store/useStore";
import { Icon } from "../components/Icon";
import { ScreenHeader } from "../components/ScreenHeader";
import { RowList, SectionTitle, useRowEntrance } from "../components/TaskList";
import { TaskRow } from "../components/TaskRow";

interface Props {
  today: string;
  onOpenTask(task: Task): void;
  onToggle(task: Task): void;
  onAddTask(due: string): void;
}

export function CalendarScreen({ today, onOpenTask, onToggle, onAddTask }: Props) {
  const { data } = useStore();
  const subjects = new Map(data.subjects.map((s) => [s.id, s]));
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState(() => monthOf(today));
  const cells = monthGrid(view.year, view.month);
  const dayTasks = tasksOn(data.tasks, selected);
  const scope = useRowEntrance<HTMLDivElement>(`calendar-${selected}`);

  const move = (delta: number) => {
    setView((v) => shiftMonth(v.year, v.month, delta));
    hapticSelection();
  };

  const pick = (iso: string) => {
    setSelected(iso);
    const m = monthOf(iso);
    if (m.month !== view.month || m.year !== view.year) setView(m);
    hapticSelection();
  };

  return (
    <div>
      <ScreenHeader title="Календарь" />
      <div className="px-5 lg:px-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em]">{monthTitle(view.year, view.month)}</h2>
          <div className="flex gap-1">
            <button type="button" onClick={() => move(-1)} aria-label="Предыдущий месяц" className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Icon name="back" size={20} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Следующий месяц" className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Icon name="forward" size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-[12px] text-muted" aria-hidden="true">
          {WEEKDAYS_SHORT.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div role="grid" aria-label={monthTitle(view.year, view.month)} className="grid grid-cols-7 gap-y-1">
          {cells.map((iso) => {
            const inMonth = monthOf(iso).month === view.month;
            const isSelected = iso === selected;
            const isToday = iso === today;
            const marks = tasksOn(data.tasks, iso);
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-label={`${formatDayWithWeekday(iso)}${marks.length > 0 ? `, заданий: ${marks.length}` : ""}`}
                onClick={() => pick(iso)}
                className="pressable flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={`num flex h-9 w-9 items-center justify-center rounded-full text-[16px] ${
                    isSelected ? "bg-ink font-semibold text-ground" : isToday ? "font-semibold text-accent" : inMonth ? "text-ink" : "text-muted/50"
                  }`}
                >
                  {dayNumber(iso)}
                </span>
                <span className="flex h-1.5 items-center gap-[3px]">
                  {marks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="block h-1.5 w-1.5 rounded-full"
                      style={{ background: t.status === "todo" ? subjects.get(t.subjectId)?.color ?? "var(--muted)" : "var(--raised)", opacity: inMonth ? 1 : 0.5 }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={scope}>
        <SectionTitle count={dayTasks.length > 0 ? dayTasks.length : undefined}>{formatDayWithWeekday(selected, today)}</SectionTitle>
        {dayTasks.length > 0 ? (
          <RowList>
            {dayTasks.map((task) => (
              <TaskRow key={task.id} task={task} subject={subjects.get(task.subjectId)} today={today} onOpen={onOpenTask} onToggle={onToggle} />
            ))}
          </RowList>
        ) : (
          <p className="px-5 pt-1 text-[15px] text-muted lg:px-0">Дедлайнов нет.</p>
        )}
        <div className="px-5 pt-4 lg:px-0">
          <button type="button" onClick={() => onAddTask(selected)} className="pressable inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
            <Icon name="plus" size={18} />
            Добавить задание на этот день
          </button>
        </div>
      </div>
    </div>
  );
}
