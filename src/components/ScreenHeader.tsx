import type { ReactNode } from "react";
import { inTelegram } from "../lib/telegram";
import { Icon } from "./Icon";

interface Props {
  title: string;
  subline?: ReactNode;
  action?: ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, subline, action, onBack }: Props) {
  return (
    <header className="px-5 pt-3 pb-4 lg:px-0 lg:pt-10">
      {onBack && !inTelegram && (
        <button type="button" onClick={onBack} className="pressable -ml-2 mb-2 inline-flex min-h-10 items-center gap-1 rounded-full pr-3 pl-1 text-[15px] font-medium text-muted">
          <Icon name="back" size={20} />
          Назад
        </button>
      )}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] lg:text-[34px]">{title}</h1>
        {action && <div className="shrink-0 pt-0.5">{action}</div>}
      </div>
      {subline && <p className="mt-2 text-[16px] leading-snug text-muted">{subline}</p>}
    </header>
  );
}
