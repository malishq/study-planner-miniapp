import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { buildDemo } from "../lib/demo";
import { todayISO } from "../lib/dates";
import { clearCloud, clearLocal, createPersister, loadData, type StorageSource } from "../lib/storage";
import { emptyData, type PlannerData, type Settings, type Subject, type Task } from "../lib/types";

interface State {
  data: PlannerData;
  ready: boolean;
  source: StorageSource;
  revision: number;
}

type Action =
  | { type: "hydrate"; data: PlannerData | null; source: StorageSource }
  | { type: "replace"; data: PlannerData }
  | { type: "clear" }
  | { type: "subject.save"; subject: Subject }
  | { type: "subject.delete"; id: string }
  | { type: "task.save"; task: Task }
  | { type: "task.delete"; id: string }
  | { type: "task.toggle"; id: string }
  | { type: "settings"; settings: Partial<Settings> };

function touch(state: State, data: PlannerData): State {
  return { ...state, data: { ...data, updatedAt: Date.now() }, revision: state.revision + 1 };
}

function reducer(state: State, action: Action): State {
  const { data } = state;
  switch (action.type) {
    case "hydrate":
      return { ...state, data: action.data ?? emptyData(), source: action.source, ready: true };
    case "replace":
      return touch(state, { ...action.data, settings: { ...data.settings, ...action.data.settings } });
    case "clear":
      return touch(state, { ...emptyData(), settings: data.settings });
    case "subject.save": {
      const exists = data.subjects.some((s) => s.id === action.subject.id);
      const subjects = exists ? data.subjects.map((s) => (s.id === action.subject.id ? action.subject : s)) : [...data.subjects, action.subject];
      return touch(state, { ...data, subjects });
    }
    case "subject.delete":
      return touch(state, {
        ...data,
        subjects: data.subjects.filter((s) => s.id !== action.id),
        tasks: data.tasks.filter((t) => t.subjectId !== action.id),
      });
    case "task.save": {
      const exists = data.tasks.some((t) => t.id === action.task.id);
      const tasks = exists ? data.tasks.map((t) => (t.id === action.task.id ? action.task : t)) : [...data.tasks, action.task];
      return touch(state, { ...data, tasks });
    }
    case "task.delete":
      return touch(state, { ...data, tasks: data.tasks.filter((t) => t.id !== action.id) });
    case "task.toggle":
      return touch(state, {
        ...data,
        tasks: data.tasks.map((t) => {
          if (t.id !== action.id) return t;
          if (t.status === "todo") return { ...t, status: "done" };
          return { ...t, status: "todo", grade: null };
        }),
      });
    case "settings":
      return touch(state, { ...data, settings: { ...data.settings, ...action.settings } });
    default:
      return state;
  }
}

interface StoreValue {
  data: PlannerData;
  ready: boolean;
  source: StorageSource;
  saveSubject(subject: Subject): void;
  deleteSubject(id: string): void;
  saveTask(task: Task): void;
  deleteTask(id: string): void;
  toggleTask(id: string): void;
  replaceData(data: PlannerData): void;
  loadDemo(): void;
  clearAll(): Promise<void>;
  setSettings(settings: Partial<Settings>): void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { data: emptyData(), ready: false, source: "none", revision: 0 });
  const persist = useRef(createPersister());

  useEffect(() => {
    let cancelled = false;
    loadData()
      .then(({ data, source }) => {
        if (!cancelled) dispatch({ type: "hydrate", data, source });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "hydrate", data: null, source: "none" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.ready && state.revision > 0) persist.current(state.data);
  }, [state.data, state.ready, state.revision]);

  const clearAll = useCallback(async () => {
    dispatch({ type: "clear" });
    clearLocal();
    await clearCloud().catch(() => undefined);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      data: state.data,
      ready: state.ready,
      source: state.source,
      saveSubject: (subject) => dispatch({ type: "subject.save", subject }),
      deleteSubject: (id) => dispatch({ type: "subject.delete", id }),
      saveTask: (task) => dispatch({ type: "task.save", task }),
      deleteTask: (id) => dispatch({ type: "task.delete", id }),
      toggleTask: (id) => dispatch({ type: "task.toggle", id }),
      replaceData: (data) => dispatch({ type: "replace", data }),
      loadDemo: () => dispatch({ type: "replace", data: buildDemo(todayISO()) }),
      clearAll,
      setSettings: (settings) => dispatch({ type: "settings", settings }),
    }),
    [state.data, state.ready, state.source, clearAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("StoreProvider отсутствует");
  return value;
}
