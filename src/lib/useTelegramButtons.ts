import { useEffect, useRef } from "react";
import { features, tg } from "./telegram";

export function useMainButton(options: { visible: boolean; text: string; onClick: () => void; enabled?: boolean; color?: string; textColor?: string }): void {
  const handlerRef = useRef(options.onClick);
  handlerRef.current = options.onClick;
  const { visible, text, enabled = true, color, textColor } = options;

  useEffect(() => {
    if (!tg || !visible) return;
    const button = tg.MainButton;
    const handler = () => handlerRef.current();
    button.setParams({ text, is_active: enabled, is_visible: true, color, text_color: textColor });
    button.onClick(handler);
    return () => {
      button.offClick(handler);
      button.hide();
    };
  }, [visible, text, enabled, color, textColor]);
}

export function useBackButton(visible: boolean, onBack: () => void): void {
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    if (!tg || !features.backButton || !visible) return;
    const button = tg.BackButton;
    const handler = () => handlerRef.current();
    button.onClick(handler);
    button.show();
    return () => {
      button.offClick(handler);
      button.hide();
    };
  }, [visible]);
}
