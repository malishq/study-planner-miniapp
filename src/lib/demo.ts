import { addDays } from "./dates";
import type { PlannerData, Subject, Task, TaskKind, TaskStatus } from "./types";

const subjects: Subject[] = [
  { id: "demo-os", name: "Операционные системы", color: "#3b66d6", teacher: "Громов И. А.", control: "exam" },
  { id: "demo-db", name: "Базы данных", color: "#2f9e63", teacher: "Литвинова Е. Н.", control: "credit" },
  { id: "demo-calc", name: "Математический анализ", color: "#d9573a", teacher: "Соколова М. В.", control: "exam" },
  { id: "demo-discrete", name: "Дискретная математика", color: "#e0932a", teacher: "Орлов Д. С.", control: "credit" },
  { id: "demo-cpp", name: "Программирование на C++", color: "#8a5bd3", teacher: "Беляев К. Р.", control: "exam" },
  { id: "demo-eng", name: "Английский язык", color: "#1f8fb2", teacher: "Нестерова О. Л.", control: "credit" },
];

interface Seed {
  id: string;
  subjectId: string;
  title: string;
  offset: number;
  kind: TaskKind;
  status: TaskStatus;
  grade?: number;
  note?: string;
  link?: string;
}

const seeds: Seed[] = [
  { id: "t-os-3", subjectId: "demo-os", title: "ПР3. Файловая система и права доступа", offset: -10, kind: "practice", status: "graded", grade: 5 },
  { id: "t-os-4", subjectId: "demo-os", title: "ПР4. Процессы и потоки", offset: -3, kind: "practice", status: "todo", note: "Нужны скриншоты из виртуальной машины и отчёт по образцу ПР1" },
  { id: "t-os-5", subjectId: "demo-os", title: "ПР5. Планировщик задач", offset: 6, kind: "practice", status: "todo" },
  { id: "t-db-2", subjectId: "demo-db", title: "Практика 2. Запросы SELECT и соединения", offset: -7, kind: "practice", status: "done" },
  { id: "t-db-3", subjectId: "demo-db", title: "Практика 3. Нормализация схемы", offset: 0, kind: "practice", status: "todo", note: "Вариант 24: сеть магазинов одежды. Привести до 3НФ", link: "https://example.com/sdo/db/practice-3" },
  { id: "t-db-4", subjectId: "demo-db", title: "Практика 4. Представления и индексы", offset: 9, kind: "practice", status: "todo" },
  { id: "t-calc-1", subjectId: "demo-calc", title: "Типовой расчёт 1. Пределы", offset: -14, kind: "workbook", status: "graded", grade: 4 },
  { id: "t-calc-2", subjectId: "demo-calc", title: "Контрольная по числовым рядам", offset: 2, kind: "test", status: "todo", note: "Разобрать признаки Даламбера и Коши" },
  { id: "t-dm-2", subjectId: "demo-discrete", title: "Рабочая тетрадь 2. Графы", offset: -5, kind: "workbook", status: "done" },
  { id: "t-dm-3", subjectId: "demo-discrete", title: "Рабочая тетрадь 3. Булевы функции", offset: 1, kind: "workbook", status: "todo" },
  { id: "t-cpp-4", subjectId: "demo-cpp", title: "Лабораторная 4. Классы и наследование", offset: -12, kind: "lab", status: "graded", grade: 5 },
  { id: "t-cpp-5", subjectId: "demo-cpp", title: "Лабораторная 5. Шаблоны и STL", offset: 4, kind: "lab", status: "todo", link: "https://example.com/sdo/cpp/lab-5" },
  { id: "t-cpp-kp", subjectId: "demo-cpp", title: "Курсовая работа: этап 1, постановка задачи", offset: 20, kind: "coursework", status: "todo", note: "Тема согласована: консольный менеджер задач" },
  { id: "t-eng-essay", subjectId: "demo-eng", title: "Эссе My future profession", offset: -1, kind: "practice", status: "todo", note: "250 слов, без переводчика" },
  { id: "t-eng-test", subjectId: "demo-eng", title: "Тест по модулю 3", offset: 13, kind: "test", status: "todo" },
];

export function buildDemo(today: string): PlannerData {
  const tasks: Task[] = seeds.map((seed) => ({
    id: seed.id,
    subjectId: seed.subjectId,
    title: seed.title,
    due: addDays(today, seed.offset),
    kind: seed.kind,
    status: seed.status,
    grade: seed.status === "graded" ? seed.grade ?? null : null,
    note: seed.note ?? "",
    link: seed.link ?? "",
  }));
  return { version: 1, subjects: subjects.map((s) => ({ ...s })), tasks, settings: { theme: "auto" }, updatedAt: Date.now() };
}
