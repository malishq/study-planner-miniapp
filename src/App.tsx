import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { todayISO } from "./lib/dates";
import { overdueTasks } from "./lib/logic";
import { exportText } from "./lib/storage";
import { hapticImpact, hapticNotify, hapticSelection, initTelegram, inTelegram } from "./lib/telegram";
import type { Subject, Task } from "./lib/types";
import { useBackButton, useMainButton } from "./lib/useTelegramButtons";
import { useTheme } from "./lib/useTheme";
import { useToday } from "./lib/useToday";
import { StoreProvider, useStore } from "./store/useStore";
import { Button } from "./components/Button";
import { Sheet } from "./components/Sheet";
import { TabBar, type Tab } from "./components/TabBar";
import { SubjectForm, TaskForm } from "./components/TaskForm";
import { CalendarScreen } from "./screens/CalendarScreen";
import { OverdueScreen } from "./screens/OverdueScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SubjectDetailScreen, SubjectsScreen } from "./screens/SubjectsScreen";
import { WeekScreen } from "./screens/WeekScreen";

gsap.registerPlugin(useGSAP);

type SheetState = { kind: "task"; task: Task | null; defaults?: Partial<Task> } | { kind: "subject"; subject: Subject | null } | { kind: "export" } | null;

const FORM_ID = "planner-form";

function Planner() {
  const store = useStore();
  const today = useToday();
  const [tab, setTab] = useState<Tab>("week");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [copied, setCopied] = useState(false);
  const main = useRef<HTMLElement>(null);

  useTheme(store.data.settings.theme);

  useEffect(() => {
    initTelegram();
  }, []);

  useGSAP(
    () => {
      const el = main.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", clearProps: "all", overwrite: true });
      });
      return () => mm.revert();
    },
    { dependencies: [tab, detailId] },
  );

  const changeTab = (next: Tab) => {
    if (next === tab && detailId === null) return;
    setTab(next);
    setDetailId(null);
    hapticSelection();
    main.current?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const closeSheet = useCallback(() => setSheet(null), []);

  const goBack = useCallback(() => {
    if (sheet) {
      setSheet(null);
      return;
    }
    if (detailId) setDetailId(null);
  }, [sheet, detailId]);

  useBackButton(sheet !== null || detailId !== null, goBack);

  const submitForm = useCallback(() => {
    const form = document.getElementById(FORM_ID) as HTMLFormElement | null;
    form?.requestSubmit();
  }, []);

  useMainButton({
    visible: sheet !== null && sheet.kind !== "export",
    text: "Сохранить",
    onClick: submitForm,
    color: "#157a46",
    textColor: "#ffffff",
  });

  const openTask = (task: Task) => setSheet({ kind: "task", task });
  const newTask = (defaults?: Partial<Task>) => setSheet({ kind: "task", task: null, defaults });
  const editSubject = (subject: Subject) => setSheet({ kind: "subject", subject });
  const newSubject = () => setSheet({ kind: "subject", subject: null });

  const toggleTask = (task: Task) => {
    store.toggleTask(task.id);
    if (task.status === "todo") hapticNotify("success");
    else hapticImpact("light");
  };

  const saveTask = (task: Task) => {
    store.saveTask(task);
    hapticNotify("success");
    setSheet(null);
  };

  const deleteTask = (task: Task) => {
    store.deleteTask(task.id);
    hapticNotify("warning");
    setSheet(null);
  };

  const saveSubject = (subject: Subject) => {
    store.saveSubject(subject);
    hapticNotify("success");
    setSheet(null);
  };

  const deleteSubject = (subject: Subject) => {
    store.deleteSubject(subject.id);
    hapticNotify("warning");
    setSheet(null);
    if (detailId === subject.id) setDetailId(null);
  };

  const handleExport = () => {
    if (inTelegram) {
      setCopied(false);
      setSheet({ kind: "export" });
      return;
    }
    const blob = new Blob([exportText(store.data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study-planner-${todayISO()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText(store.data));
      setCopied(true);
      hapticNotify("success");
    } catch {
      setCopied(false);
    }
  };

  if (!store.ready) return <div className="min-h-dvh bg-ground" />;

  const overdueCount = overdueTasks(store.data.tasks, today).length;

  let screen: React.ReactNode;
  if (tab === "subjects" && detailId) {
    screen = (
      <SubjectDetailScreen
        subjectId={detailId}
        today={today}
        onBack={() => setDetailId(null)}
        onEditSubject={editSubject}
        onAddTask={(subject) => newTask({ subjectId: subject.id })}
        onOpenTask={openTask}
        onToggle={toggleTask}
      />
    );
  } else if (tab === "subjects") {
    screen = <SubjectsScreen onAddSubject={newSubject} onOpenSubject={(subject) => setDetailId(subject.id)} />;
  } else if (tab === "calendar") {
    screen = <CalendarScreen today={today} onOpenTask={openTask} onToggle={toggleTask} onAddTask={(due) => newTask({ due })} />;
  } else if (tab === "overdue") {
    screen = <OverdueScreen today={today} onOpenTask={openTask} onToggle={toggleTask} onAddTask={() => newTask()} />;
  } else if (tab === "settings") {
    screen = <SettingsScreen onExport={handleExport} />;
  } else {
    screen = <WeekScreen today={today} onAddTask={() => newTask()} onAddSubject={newSubject} onOpenTask={openTask} onToggle={toggleTask} onGoOverdue={() => changeTab("overdue")} />;
  }

  const sheetTitle = sheet?.kind === "task" ? (sheet.task ? "Задание" : "Новое задание") : sheet?.kind === "subject" ? (sheet.subject ? "Предмет" : "Новый предмет") : "Экспорт";

  return (
    <div className="min-h-dvh bg-ground pt-[var(--safe-top)] lg:mx-auto lg:flex lg:max-w-[1000px] lg:gap-10 lg:px-8">
      <TabBar active={detailId ? "subjects" : tab} onChange={changeTab} overdueCount={overdueCount} />
      <main ref={main} className="pb-[calc(84px+var(--safe-bottom))] lg:min-w-0 lg:flex-1 lg:pb-16">
        {screen}
      </main>

      <Sheet open={sheet !== null} title={sheetTitle} onClose={closeSheet} formId={sheet && sheet.kind !== "export" ? FORM_ID : undefined}>
        {sheet?.kind === "task" && (
          <TaskForm
            key={sheet.task?.id ?? "new"}
            formId={FORM_ID}
            task={sheet.task}
            defaults={sheet.defaults}
            subjects={store.data.subjects}
            today={today}
            onSubmit={saveTask}
            onDelete={sheet.task ? deleteTask : undefined}
            onNeedSubject={newSubject}
          />
        )}
        {sheet?.kind === "subject" && (
          <SubjectForm
            key={sheet.subject?.id ?? "new"}
            formId={FORM_ID}
            subject={sheet.subject}
            subjects={store.data.subjects}
            taskCount={sheet.subject ? store.data.tasks.filter((t) => t.subjectId === sheet.subject?.id).length : 0}
            onSubmit={saveSubject}
            onDelete={sheet.subject ? deleteSubject : undefined}
          />
        )}
        {sheet?.kind === "export" && (
          <div>
            <p className="text-[15px] text-muted">Скопируйте JSON и сохраните его в заметках или файле. Импортировать можно на любом устройстве через «Импортировать из JSON».</p>
            <textarea readOnly value={exportText(store.data)} rows={8} className="mt-3 w-full rounded-xl bg-surface p-3 text-[13px] leading-snug outline-none" />
            <Button className="mt-3 w-full" onClick={copyExport} data-autofocus>
              {copied ? "Скопировано" : "Скопировать JSON"}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Planner />
    </StoreProvider>
  );
}
