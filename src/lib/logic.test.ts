import { describe, expect, it } from "vitest";
import { buildDemo } from "./demo";
import { groupByDue, isOverdue, laterTasks, normalizeData, overdueTasks, progressOf, sortByDue, subjectProgress, upcomingTasks, validateTask } from "./logic";
import type { Task } from "./types";

const base: Task = { id: "", subjectId: "s1", title: "", due: "2026-10-28", kind: "practice", status: "todo", grade: null, note: "", link: "" };

function task(id: string, due: string, extra: Partial<Task> = {}): Task {
  return { ...base, id, title: `Задание ${id}`, due, ...extra };
}

describe("сортировка дедлайнов", () => {
  it("ставит ранние даты первыми, одинаковые — по названию", () => {
    const tasks = [task("c", "2026-11-03"), task("a", "2026-10-28", { title: "Б" }), task("b", "2026-10-28", { title: "А" })];
    expect(sortByDue(tasks).map((t) => t.id)).toEqual(["b", "a", "c"]);
  });

  it("не меняет исходный массив", () => {
    const tasks = [task("b", "2026-11-01"), task("a", "2026-10-01")];
    sortByDue(tasks);
    expect(tasks[0].id).toBe("b");
  });

  it("делит задания на просроченные, ближайшие и дальние", () => {
    const today = "2026-10-28";
    const tasks = [
      task("late", "2026-10-25"),
      task("today", "2026-10-28"),
      task("week", "2026-11-03"),
      task("far", "2026-11-04"),
      task("done", "2026-10-20", { status: "done" }),
    ];
    expect(overdueTasks(tasks, today).map((t) => t.id)).toEqual(["late"]);
    expect(upcomingTasks(tasks, today).map((t) => t.id)).toEqual(["today", "week"]);
    expect(laterTasks(tasks, today).map((t) => t.id)).toEqual(["far"]);
    expect(isOverdue(tasks[0], today)).toBe(true);
    expect(isOverdue(tasks[4], today)).toBe(false);
  });

  it("группирует по дате в порядке возрастания", () => {
    const groups = groupByDue([task("b", "2026-11-01"), task("a", "2026-10-28"), task("c", "2026-11-01")]);
    expect(groups.map((g) => g.date)).toEqual(["2026-10-28", "2026-11-01"]);
    expect(groups[1].tasks.map((t) => t.id)).toEqual(["b", "c"]);
  });
});

describe("прогресс", () => {
  it("считает сданные и проверенные задания как выполненные", () => {
    const tasks = [task("1", "2026-10-01", { status: "done" }), task("2", "2026-10-02", { status: "graded", grade: 5 }), task("3", "2026-10-03"), task("4", "2026-10-04")];
    expect(progressOf(tasks)).toEqual({ done: 2, total: 4, ratio: 0.5 });
  });

  it("возвращает ноль без заданий", () => {
    expect(progressOf([])).toEqual({ done: 0, total: 0, ratio: 0 });
  });

  it("считает прогресс по предмету", () => {
    const tasks = [task("1", "2026-10-01", { subjectId: "a", status: "done" }), task("2", "2026-10-02", { subjectId: "a" }), task("3", "2026-10-03", { subjectId: "b" })];
    expect(subjectProgress("a", tasks)).toEqual({ done: 1, total: 2, ratio: 0.5 });
    expect(subjectProgress("b", tasks).done).toBe(0);
  });
});

describe("проверка формы и импорт", () => {
  it("находит пустые поля и неверные значения", () => {
    const errors = validateTask({ title: "  ", subjectId: "", due: "2026-02-30", status: "graded", grade: 7, link: "sdo.example" });
    expect(Object.keys(errors).sort()).toEqual(["due", "grade", "link", "subjectId", "title"]);
    expect(validateTask({ title: "ПР1", subjectId: "s", due: "2026-10-28", status: "todo", grade: null, link: "" })).toEqual({});
  });

  it("принимает демо-данные и отбрасывает битые записи", () => {
    const demo = buildDemo("2026-10-28");
    const restored = normalizeData(JSON.parse(JSON.stringify(demo)));
    expect(restored.subjects.length).toBe(demo.subjects.length);
    expect(restored.tasks.length).toBe(demo.tasks.length);
    const broken = normalizeData({ subjects: [{ id: "s", name: "Физика" }], tasks: [{ id: "t", subjectId: "нет", title: "x", due: "2026-10-28" }, { id: "ok", subjectId: "s", title: "Отчёт", due: "2026-10-30", status: "graded", grade: 4 }] });
    expect(broken.tasks.map((t) => t.id)).toEqual(["ok"]);
    expect(broken.tasks[0].grade).toBe(4);
    expect(broken.subjects[0].control).toBe("credit");
    expect(() => normalizeData({ hello: 1 })).toThrow();
  });

  it("демо строится относительно сегодняшнего дня", () => {
    const demo = buildDemo("2026-10-28");
    const today = demo.tasks.find((t) => t.id === "t-db-3");
    expect(today?.due).toBe("2026-10-28");
    expect(overdueTasks(demo.tasks, "2026-10-28").length).toBe(2);
  });
});
