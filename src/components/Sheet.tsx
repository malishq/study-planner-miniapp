import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { inTelegram } from "../lib/telegram";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface Props {
  open: boolean;
  title: string;
  onClose(): void;
  formId?: string;
  saveLabel?: string;
  children: ReactNode;
}

export function Sheet({ open, title, onClose, formId, saveLabel = "Сохранить", children }: Props) {
  const [mounted, setMounted] = useState(open);
  const cached = useRef<ReactNode>(children);
  const cachedTitle = useRef(title);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  if (open) {
    cached.current = children;
    cachedTitle.current = title;
  }

  useEffect(() => {
    if (open) {
      closing.current = false;
      setMounted(true);
    }
  }, [open]);

  useGSAP(
    () => {
      const p = panel.current;
      const b = backdrop.current;
      if (!p || !b) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (open) {
        if (reduce) {
          gsap.set([p, b], { clearProps: "all" });
          return;
        }
        gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", overwrite: true });
        gsap.fromTo(p, { yPercent: 100 }, { yPercent: 0, duration: 0.38, ease: "power3.out", overwrite: true, clearProps: "transform" });
      } else if (mounted && !closing.current) {
        closing.current = true;
        if (reduce) {
          setMounted(false);
          return;
        }
        gsap.to(b, { opacity: 0, duration: 0.2, ease: "power1.in", overwrite: true });
        gsap.to(p, { yPercent: 100, duration: 0.26, ease: "power2.in", overwrite: true, onComplete: () => setMounted(false) });
      }
    },
    { dependencies: [open, mounted] },
  );

  useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("input, textarea, select, button[data-autofocus]");
    first?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center">
      <div ref={backdrop} className="absolute inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="relative flex max-h-[92dvh] w-full flex-col rounded-t-[22px] bg-ground pb-[var(--safe-bottom)] lg:max-h-[86vh] lg:max-w-[520px] lg:rounded-[22px]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 id="sheet-title" className="text-[22px] font-semibold tracking-[-0.01em]">
            {cachedTitle.current}
          </h2>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="pressable -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-muted">
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4">{cached.current}</div>
        {formId && !inTelegram && (
          <div className="px-5 pt-2 pb-5">
            <Button type="submit" form={formId} className="w-full">
              {saveLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
