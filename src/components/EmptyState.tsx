import type { ReactNode } from "react";

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mx-5 my-6 rounded-[20px] bg-surface px-5 py-6 lg:mx-0">
      <p className="text-[20px] leading-tight font-semibold tracking-[-0.01em]">{title}</p>
      {text && <p className="mt-2 text-[15px] leading-snug text-muted">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
