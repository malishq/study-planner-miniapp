export type IconName = "week" | "subjects" | "calendar" | "overdue" | "settings" | "plus" | "check" | "back" | "forward" | "close" | "link" | "trash";

const paths: Record<IconName, string> = {
  week: "M4 6.5h16M4 12h16M4 17.5h10",
  subjects: "M5 4.5h11a2 2 0 0 1 2 2v13H7a2 2 0 0 0-2 2V4.5ZM5 17.5a2 2 0 0 1 2-2h11",
  calendar: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM4 10.5h16M8 4v3.5M16 4v3.5",
  overdue: "M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM12 8v4.5l2.8 1.8",
  settings: "M4 8h10M18 8h2M4 16h4M12 16h8M14 5.5v5M8 13.5v5",
  plus: "M12 5v14M5 12h14",
  check: "M5.5 12.5l4 4 9-9.5",
  back: "M14.5 5.5 8 12l6.5 6.5",
  forward: "M9.5 5.5 16 12l-6.5 6.5",
  close: "M6 6l12 12M18 6 6 18",
  link: "M10 14 14 10M8.5 15.5l-1 1a3.2 3.2 0 0 1-4.5-4.5l2.5-2.5a3.2 3.2 0 0 1 4.5 0M15.5 8.5l1-1a3.2 3.2 0 0 1 4.5 4.5l-2.5 2.5a3.2 3.2 0 0 1-4.5 0",
  trash: "M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12M10 11v5M14 11v5",
};

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}
