export interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  section_separator_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface Inset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MainButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface TelegramMainButton {
  text: string;
  isVisible: boolean;
  isActive: boolean;
  setText(text: string): TelegramMainButton;
  onClick(callback: () => void): TelegramMainButton;
  offClick(callback: () => void): TelegramMainButton;
  show(): TelegramMainButton;
  hide(): TelegramMainButton;
  enable(): TelegramMainButton;
  disable(): TelegramMainButton;
  showProgress(leaveActive?: boolean): TelegramMainButton;
  hideProgress(): TelegramMainButton;
  setParams(params: MainButtonParams): TelegramMainButton;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): TelegramBackButton;
  offClick(callback: () => void): TelegramBackButton;
  show(): TelegramBackButton;
  hide(): TelegramBackButton;
}

export type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type NotificationType = "error" | "success" | "warning";

export interface TelegramHaptic {
  impactOccurred(style: ImpactStyle): TelegramHaptic;
  notificationOccurred(type: NotificationType): TelegramHaptic;
  selectionChanged(): TelegramHaptic;
}

type CloudCallback<T> = (error: Error | string | null, result?: T) => void;

export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: CloudCallback<boolean>): TelegramCloudStorage;
  getItem(key: string, callback: CloudCallback<string>): TelegramCloudStorage;
  getItems(keys: string[], callback: CloudCallback<Record<string, string>>): TelegramCloudStorage;
  removeItem(key: string, callback?: CloudCallback<boolean>): TelegramCloudStorage;
  removeItems(keys: string[], callback?: CloudCallback<boolean>): TelegramCloudStorage;
  getKeys(callback: CloudCallback<string[]>): TelegramCloudStorage;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type TelegramEvent = "themeChanged" | "viewportChanged" | "safeAreaChanged" | "contentSafeAreaChanged" | "mainButtonClicked" | "backButtonClicked";

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramUser; start_param?: string };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset?: Inset;
  contentSafeAreaInset?: Inset;
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  HapticFeedback: TelegramHaptic;
  CloudStorage: TelegramCloudStorage;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
  onEvent(event: TelegramEvent, handler: () => void): void;
  offEvent(event: TelegramEvent, handler: () => void): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showAlert(message: string, callback?: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

function detect(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const app = window.Telegram?.WebApp;
  if (!app) return null;
  const inside = app.initData.length > 0 || (app.platform !== "unknown" && app.platform.length > 0);
  return inside ? app : null;
}

export const tg: TelegramWebApp | null = detect();
export const inTelegram = tg !== null;

function atLeast(version: string): boolean {
  return tg !== null && typeof tg.isVersionAtLeast === "function" && tg.isVersionAtLeast(version);
}

export const features = {
  haptics: atLeast("6.1"),
  cloud: atLeast("6.9"),
  dialogs: atLeast("6.2"),
  backButton: atLeast("6.1"),
  swipes: atLeast("7.7"),
  bottomBar: atLeast("7.10"),
  headerHex: atLeast("6.9"),
};

export function initTelegram(): void {
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (features.swipes) tg.disableVerticalSwipes?.();
}

export function hapticImpact(style: ImpactStyle = "light"): void {
  if (tg && features.haptics) tg.HapticFeedback.impactOccurred(style);
}

export function hapticNotify(type: NotificationType): void {
  if (tg && features.haptics) tg.HapticFeedback.notificationOccurred(type);
}

export function hapticSelection(): void {
  if (tg && features.haptics) tg.HapticFeedback.selectionChanged();
}

export function confirmDialog(message: string): Promise<boolean> {
  if (tg && features.dialogs) {
    return new Promise((resolve) => tg.showConfirm(message, (ok) => resolve(ok)));
  }
  return Promise.resolve(window.confirm(message));
}

export function alertDialog(message: string): Promise<void> {
  if (tg && features.dialogs) {
    return new Promise((resolve) => tg.showAlert(message, () => resolve()));
  }
  window.alert(message);
  return Promise.resolve();
}

export function openExternal(url: string): void {
  if (tg) tg.openLink(url);
  else window.open(url, "_blank", "noopener");
}

export function applyChromeColors(ground: string): void {
  if (!tg) return;
  try {
    tg.setBackgroundColor(ground);
    tg.setHeaderColor(features.headerHex ? ground : "bg_color");
    if (features.bottomBar) tg.setBottomBarColor?.(ground);
  } catch {
    return;
  }
}

export const cloud = {
  available: features.cloud,
  get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!tg) return resolve(null);
      tg.CloudStorage.getItem(key, (error, value) => (error ? reject(error) : resolve(value ? value : null)));
    });
  },
  getMany(keys: string[]): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      if (!tg || keys.length === 0) return resolve({});
      tg.CloudStorage.getItems(keys, (error, values) => (error ? reject(error) : resolve(values ?? {})));
    });
  },
  set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!tg) return resolve();
      tg.CloudStorage.setItem(key, value, (error) => (error ? reject(error) : resolve()));
    });
  },
  remove(keys: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!tg || keys.length === 0) return resolve();
      tg.CloudStorage.removeItems(keys, (error) => (error ? reject(error) : resolve()));
    });
  },
  keys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!tg) return resolve([]);
      tg.CloudStorage.getKeys((error, keys) => (error ? reject(error) : resolve(keys ?? [])));
    });
  },
};
