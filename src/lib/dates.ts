const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTHS_NOMINATIVE = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const WEEKDAYS_SHORT = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const WEEKDAYS_LONG = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isISODate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = ISO_RE.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(mo) - 1 && date.getUTCDate() === Number(d);
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = parts(iso);
  return new Date(y, m - 1, d);
}

function utcDays(iso: string): number {
  const [y, m, d] = parts(iso);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function daysBetween(fromISO: string, toISO: string): number {
  return utcDays(toISO) - utcDays(fromISO);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = parts(iso);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function weekdayIndex(iso: string): number {
  const [y, m, d] = parts(iso);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function pluralDays(n: number): string {
  return `${n} ${plural(n, ["день", "дня", "дней"])}`;
}

export function relativeDays(diff: number): string {
  if (diff === 0) return "сегодня";
  if (diff > 0) return `через ${pluralDays(diff)}`;
  return `${pluralDays(-diff)} назад`;
}

export function dueLabel(due: string, today: string): string {
  const diff = daysBetween(today, due);
  if (diff === 1) return "завтра";
  if (diff === -1) return "вчера";
  return relativeDays(diff);
}

export function formatDayLong(iso: string): string {
  const [, m, d] = parts(iso);
  return `${d} ${MONTHS_GENITIVE[m - 1]}`;
}

export function formatDayWithWeekday(iso: string, today?: string): string {
  if (today !== undefined) {
    const diff = daysBetween(today, iso);
    if (diff === 0) return `Сегодня, ${formatDayLong(iso)}`;
    if (diff === 1) return `Завтра, ${formatDayLong(iso)}`;
  }
  const weekday = WEEKDAYS_LONG[weekdayIndex(iso)];
  return `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${formatDayLong(iso)}`;
}

export function formatDayShort(iso: string): string {
  const [, m, d] = parts(iso);
  return `${d} ${MONTHS_GENITIVE[m - 1].slice(0, 3)}`;
}

export function monthTitle(year: number, month: number): string {
  return `${MONTHS_NOMINATIVE[month]} ${year}`;
}

export function monthOf(iso: string): { year: number; month: number } {
  const [y, m] = parts(iso);
  return { year: y, month: m - 1 };
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export function monthGrid(year: number, month: number): string[] {
  const first = `${year}-${pad(month + 1)}-01`;
  const start = addDays(first, -weekdayIndex(first));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const rows = Math.ceil((weekdayIndex(first) + daysInMonth) / 7);
  const cells: string[] = [];
  for (let i = 0; i < rows * 7; i += 1) cells.push(addDays(start, i));
  return cells;
}

export function dayNumber(iso: string): number {
  return parts(iso)[2];
}
