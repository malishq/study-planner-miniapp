import { describe, expect, it } from "vitest";
import { addDays, daysBetween, dueLabel, formatDayWithWeekday, monthGrid, plural, pluralDays, relativeDays, weekdayIndex } from "./dates";

describe("словоформы дней", () => {
  it("склоняет «день» по числу", () => {
    expect(pluralDays(1)).toBe("1 день");
    expect(pluralDays(2)).toBe("2 дня");
    expect(pluralDays(5)).toBe("5 дней");
    expect(pluralDays(11)).toBe("11 дней");
    expect(pluralDays(12)).toBe("12 дней");
    expect(pluralDays(21)).toBe("21 день");
    expect(pluralDays(22)).toBe("22 дня");
    expect(pluralDays(100)).toBe("100 дней");
    expect(pluralDays(101)).toBe("101 день");
  });

  it("строит подпись «через N дней»", () => {
    expect(relativeDays(0)).toBe("сегодня");
    expect(relativeDays(1)).toBe("через 1 день");
    expect(relativeDays(2)).toBe("через 2 дня");
    expect(relativeDays(5)).toBe("через 5 дней");
    expect(relativeDays(-3)).toBe("3 дня назад");
  });

  it("склоняет другие слова", () => {
    expect(plural(1, ["задание", "задания", "заданий"])).toBe("задание");
    expect(plural(3, ["задание", "задания", "заданий"])).toBe("задания");
    expect(plural(14, ["задание", "задания", "заданий"])).toBe("заданий");
  });
});

describe("подписи дедлайнов", () => {
  const today = "2026-10-28";
  it("различает сегодня, завтра, вчера и дальние даты", () => {
    expect(dueLabel("2026-10-28", today)).toBe("сегодня");
    expect(dueLabel("2026-10-29", today)).toBe("завтра");
    expect(dueLabel("2026-10-30", today)).toBe("через 2 дня");
    expect(dueLabel("2026-11-02", today)).toBe("через 5 дней");
    expect(dueLabel("2026-10-27", today)).toBe("вчера");
    expect(dueLabel("2026-10-25", today)).toBe("3 дня назад");
  });

  it("называет день недели", () => {
    expect(formatDayWithWeekday("2026-10-28", today)).toBe("Сегодня, 28 октября");
    expect(formatDayWithWeekday("2026-10-29", today)).toBe("Завтра, 29 октября");
    expect(formatDayWithWeekday("2026-10-30", today)).toBe("Пятница, 30 октября");
  });
});

describe("календарная арифметика", () => {
  it("считает дни между датами через границу месяца и перевод часов", () => {
    expect(daysBetween("2026-10-28", "2026-11-02")).toBe(5);
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(addDays("2026-10-28", 4)).toBe("2026-11-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("начинает неделю с понедельника", () => {
    expect(weekdayIndex("2026-10-26")).toBe(0);
    expect(weekdayIndex("2026-11-01")).toBe(6);
  });

  it("строит сетку месяца полными неделями", () => {
    const grid = monthGrid(2026, 9);
    expect(grid.length % 7).toBe(0);
    expect(grid[0]).toBe("2026-09-28");
    expect(grid[grid.length - 1]).toBe("2026-11-01");
  });
});
