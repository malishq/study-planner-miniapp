import { Icon, type IconName } from "./Icon";

export type Tab = "week" | "subjects" | "calendar" | "overdue" | "settings";

export const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: "week", label: "Неделя", icon: "week" },
  { id: "subjects", label: "Предметы", icon: "subjects" },
  { id: "calendar", label: "Календарь", icon: "calendar" },
  { id: "overdue", label: "Несданное", icon: "overdue" },
  { id: "settings", label: "Настройки", icon: "settings" },
];

interface Props {
  active: Tab;
  onChange(tab: Tab): void;
  overdueCount: number;
}

export function TabBar({ active, onChange, overdueCount }: Props) {
  return (
    <nav
      aria-label="Разделы"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ground pb-[var(--safe-bottom)] lg:static lg:inset-auto lg:w-60 lg:self-start lg:border-0 lg:pb-0 lg:pt-10"
    >
      <div className="hidden items-center gap-3 px-4 pb-8 lg:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent text-on-accent" aria-hidden="true">
          <Icon name="check" size={18} />
        </span>
        <span className="text-[17px] font-semibold tracking-[-0.01em]">Учебный планер</span>
      </div>
      <ul className="flex items-stretch justify-around px-2 lg:flex-col lg:gap-1 lg:px-2">
        {TABS.map((tab) => {
          const current = tab.id === active;
          return (
            <li key={tab.id} className="min-w-0 flex-1 lg:flex-none">
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={current ? "page" : undefined}
                className={`pressable relative flex w-full flex-col items-center gap-1 rounded-2xl px-0 pt-2.5 pb-2 text-[11px] font-medium tracking-[-0.01em] lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-[15px] ${
                  current ? "text-ink lg:bg-surface" : "text-muted"
                }`}
              >
                <Icon name={tab.icon} size={22} className="lg:size-5" />
                <span>{tab.label}</span>
                {tab.id === "overdue" && overdueCount > 0 && (
                  <span className="num absolute top-1.5 right-[calc(50%-22px)] min-w-[18px] rounded-full bg-danger px-1 text-center text-[11px] leading-[18px] font-semibold text-white lg:static lg:ml-auto">
                    {overdueCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
