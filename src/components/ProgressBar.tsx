import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function ProgressBar({ ratio, color, height = 6, label }: { ratio: number; color?: string; height?: number; label?: string }) {
  const fill = useRef<HTMLSpanElement>(null);
  const value = Math.max(0, Math.min(1, ratio));

  useGSAP(
    () => {
      const el = fill.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(el, { scaleX: value, duration: 0.7, ease: "power3.out", overwrite: true });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { scaleX: value });
      });
      return () => mm.revert();
    },
    { dependencies: [value] },
  );

  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-label={label}
      className="block w-full overflow-hidden rounded-full bg-raised"
      style={{ height }}
    >
      <span ref={fill} className="block h-full w-full origin-left rounded-full" style={{ background: color ?? "var(--accent)", transform: "scaleX(0)" }} />
    </span>
  );
}
