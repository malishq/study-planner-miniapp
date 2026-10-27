import { useRef, useState, type ReactNode } from "react";
import { formatDayLong, plural, toISODate } from "../lib/dates";
import { normalizeData } from "../lib/logic";
import { alertDialog, confirmDialog, hapticNotify, inTelegram } from "../lib/telegram";
import type { ThemeSetting } from "../lib/types";
import { useStore } from "../store/useStore";
import { Segmented } from "../components/Field";
import { ScreenHeader } from "../components/ScreenHeader";

interface Props {
  onExport(): void;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-5 pt-6 lg:px-0">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ActionRow({ title, text, onClick, tone = "default" }: { title: string; text: string; onClick(): void; tone?: "default" | "danger" }) {
  return (
    <button type="button" onClick={onClick} className="pressable block w-full border-b border-line py-3.5 text-left">
      <span className={`block text-[16px] font-medium ${tone === "danger" ? "text-danger" : "text-ink"}`}>{title}</span>
      <span className="block text-[13px] text-muted">{text}</span>
    </button>
  );
}

export function SettingsScreen({ onExport }: Props) {
  const { data, source, setSettings, loadDemo, replaceData, clearAll } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const themeOptions: { value: ThemeSetting; label: string }[] = [
    { value: "auto", label: inTelegram ? "Как в Telegram" : "Как в системе" },
    { value: "light", label: "Светлая" },
    { value: "dark", label: "Тёмная" },
  ];

  const handleImport = async (file: File) => {
    try {
      const parsed = normalizeData(JSON.parse(await file.text()));
      const summary = `${parsed.subjects.length} ${plural(parsed.subjects.length, ["предмет", "предмета", "предметов"])} и ${parsed.tasks.length} ${plural(parsed.tasks.length, ["задание", "задания", "заданий"])}`;
      const hasData = data.subjects.length > 0 || data.tasks.length > 0;
      if (hasData && !(await confirmDialog(`В файле ${summary}. Заменить текущие данные?`))) return;
      replaceData(parsed);
      hapticNotify("success");
      setStatus(`Импортировано: ${summary}`);
    } catch (error) {
      hapticNotify("error");
      await alertDialog(error instanceof Error ? error.message : "Не удалось прочитать файл");
    }
  };

  const handleDemo = async () => {
    const hasData = data.subjects.length > 0 || data.tasks.length > 0;
    if (hasData && !(await confirmDialog("Заменить текущие данные демо-набором?"))) return;
    loadDemo();
    hapticNotify("success");
    setStatus("Демо-данные загружены");
  };

  const handleClear = async () => {
    if (!(await confirmDialog("Удалить все предметы и задания? Отменить это нельзя."))) return;
    await clearAll();
    hapticNotify("warning");
    setStatus("Данные удалены");
  };

  const storageText = inTelegram
    ? source === "cloud"
      ? "Telegram CloudStorage, копия в этом устройстве"
      : "Telegram CloudStorage"
    : "браузер этого устройства";

  return (
    <div>
      <ScreenHeader title="Настройки" />

      <Group title="Оформление">
        <Segmented<ThemeSetting> label="Тема" options={themeOptions} value={data.settings.theme} onChange={(theme) => setSettings({ theme })} />
      </Group>

      <Group title="Данные">
        <p className="mb-2 text-[14px] text-muted">
          Хранение: {storageText}. {data.subjects.length} {plural(data.subjects.length, ["предмет", "предмета", "предметов"])}, {data.tasks.length}{" "}
          {plural(data.tasks.length, ["задание", "задания", "заданий"])}
          {data.updatedAt > 0 && `, изменено ${formatDayLong(toISODate(new Date(data.updatedAt)))}`}.
        </p>
        <ActionRow title="Экспортировать в JSON" text="Резервная копия всех предметов, заданий и настроек" onClick={onExport} />
        <ActionRow title="Импортировать из JSON" text="Восстановить данные из файла экспорта" onClick={() => fileInput.current?.click()} />
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = "";
          }}
        />
        <ActionRow title="Загрузить демо-данные" text="Шесть учебных предметов и задания с разными сроками" onClick={handleDemo} />
        <ActionRow title="Очистить всё" text="Удалить предметы и задания с этого устройства и из облака" onClick={handleClear} tone="danger" />
        {status && <p className="pt-3 text-[14px] text-accent">{status}</p>}
      </Group>

      <Group title="О приложении">
        <p className="text-[15px] leading-snug text-muted">
          Учебный планер 1.0. Предметы, задания с дедлайнами и статусами, прогресс по курсам. Данные остаются у вас: в облаке Telegram или в браузере, сервер не нужен.
        </p>
      </Group>
    </div>
  );
}
