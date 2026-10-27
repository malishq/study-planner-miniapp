import type { ComponentProps, ReactNode } from "react";

export function Field({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="mb-2 block text-[14px] font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-[13px] text-danger">{error}</p> : hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

const inputClass = "w-full min-h-12 rounded-xl bg-surface px-4 text-[16px] text-ink placeholder:text-muted outline-none focus-visible:outline-2 focus-visible:outline-accent";

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: ComponentProps<"textarea">) {
  return <textarea rows={3} {...props} className={`${inputClass} resize-none py-3 leading-snug ${props.className ?? ""}`} />;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string; dot?: string }[];
  value: T | null;
  onChange(value: T): void;
}

export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`pressable inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[15px] font-medium ${selected ? "bg-ink text-ground" : "bg-surface text-ink"}`}
          >
            {option.dot && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: option.dot }} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ColorPicker({ colors, value, onChange }: { colors: string[]; value: string; onChange(color: string): void }) {
  return (
    <div role="radiogroup" aria-label="Цвет предмета" className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const selected = color === value;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Цвет ${color}`}
            onClick={() => onChange(color)}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full"
            style={{ boxShadow: selected ? `0 0 0 2px var(--ground), 0 0 0 4px ${color}` : "none" }}
          >
            <span className="block h-7 w-7 rounded-full" style={{ background: color }} />
          </button>
        );
      })}
    </div>
  );
}
