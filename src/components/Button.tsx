import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent font-semibold",
  secondary: "bg-surface text-ink font-medium",
  ghost: "text-accent font-medium",
  danger: "text-danger font-medium",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-[16px]",
  sm: "min-h-9 px-4 text-[14px]",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      {...props}
      className={`pressable inline-flex items-center justify-center gap-2 rounded-full disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    />
  );
}
