import { useEffect, useState } from "react";
import { applyChromeColors, tg } from "./telegram";
import type { ThemeSetting } from "./types";

export type Scheme = "light" | "dark";

const OWN_VARS = ["--ground", "--surface", "--ink", "--line"] as const;

function systemScheme(): Scheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isHex(value: string | undefined): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function resolveScheme(setting: ThemeSetting, telegramScheme: Scheme | null, system: Scheme): Scheme {
  if (setting !== "auto") return setting;
  return telegramScheme ?? system;
}

export function useTheme(setting: ThemeSetting): Scheme {
  const [telegramScheme, setTelegramScheme] = useState<Scheme | null>(tg ? tg.colorScheme : null);
  const [system, setSystem] = useState<Scheme>(systemScheme);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!tg) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setSystem(media.matches ? "dark" : "light");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    const app = tg;
    const onTheme = () => {
      setTelegramScheme(app.colorScheme);
      setTick((n) => n + 1);
    };
    app.onEvent("themeChanged", onTheme);
    return () => app.offEvent("themeChanged", onTheme);
  }, []);

  const scheme = resolveScheme(setting, telegramScheme, system);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = scheme;
    for (const name of OWN_VARS) root.style.removeProperty(name);
    if (tg && setting === "auto") {
      const p = tg.themeParams;
      if (isHex(p.bg_color)) root.style.setProperty("--ground", p.bg_color);
      if (isHex(p.secondary_bg_color) && p.secondary_bg_color.toLowerCase() !== p.bg_color?.toLowerCase()) root.style.setProperty("--surface", p.secondary_bg_color);
      if (isHex(p.text_color)) root.style.setProperty("--ink", p.text_color);
      if (isHex(p.section_separator_color)) root.style.setProperty("--line", p.section_separator_color);
    }
    const ground = getComputedStyle(root).getPropertyValue("--ground").trim();
    if (isHex(ground)) applyChromeColors(ground);
  }, [scheme, setting, tick]);

  return scheme;
}
