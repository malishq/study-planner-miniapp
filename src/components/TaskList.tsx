import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { ReactNode } from "react";

export function useRowEntrance<T extends HTMLElement>(key: string) {
  const scope = useRef<T>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]", scope.current);
        if (rows.length === 0) return;
        gsap.from(rows, { y: 14, opacity: 0, duration: 0.32, ease: "power2.out", stagger: 0.035, clearProps: "transform,opacity", overwrite: true });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [key] },
  );
  return scope;
}

export function SectionTitle({ children, tone = "default", count }: { children: ReactNode; tone?: "default" | "danger"; count?: number }) {
  return (
    <h2 className={`flex items-baseline gap-2 px-5 pt-5 pb-1 text-[15px] font-semibold lg:px-0 ${tone === "danger" ? "text-danger" : "text-ink"}`}>
      {children}
      {count !== undefined && <span className={`num text-[14px] font-medium ${tone === "danger" ? "text-danger" : "text-muted"}`}>{count}</span>}
    </h2>
  );
}

export function RowList({ children }: { children: ReactNode }) {
  return <ul className="pl-2 pr-5 lg:pr-0">{children}</ul>;
}
