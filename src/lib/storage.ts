import { normalizeData, serializeData } from "./logic";
import { cloud } from "./telegram";
import type { PlannerData } from "./types";

export const LOCAL_KEY = "study-planner:data";
const META_KEY = "planner_meta";
const PART_PREFIX = "planner_part_";
const PART_SIZE = 3800;

export type StorageSource = "cloud" | "local" | "none";

export function loadLocal(): PlannerData | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return normalizeData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLocal(data: PlannerData): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

export function clearLocal(): void {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    return;
  }
}

export function splitParts(text: string, size = PART_SIZE): string[] {
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts.length === 0 ? [""] : parts;
}

export async function loadCloud(): Promise<PlannerData | null> {
  if (!cloud.available) return null;
  const metaRaw = await cloud.get(META_KEY);
  if (!metaRaw) return null;
  const meta = JSON.parse(metaRaw) as { parts: number };
  const keys = Array.from({ length: meta.parts }, (_, i) => `${PART_PREFIX}${i}`);
  const values = await cloud.getMany(keys);
  const text = keys.map((k) => values[k] ?? "").join("");
  return normalizeData(JSON.parse(text));
}

export async function saveCloud(data: PlannerData): Promise<void> {
  if (!cloud.available) return;
  const parts = splitParts(JSON.stringify(data));
  await Promise.all(parts.map((part, i) => cloud.set(`${PART_PREFIX}${i}`, part)));
  await cloud.set(META_KEY, JSON.stringify({ parts: parts.length, updatedAt: data.updatedAt }));
  const stale = (await cloud.keys()).filter((k) => k.startsWith(PART_PREFIX) && Number(k.slice(PART_PREFIX.length)) >= parts.length);
  if (stale.length > 0) await cloud.remove(stale);
}

export async function clearCloud(): Promise<void> {
  if (!cloud.available) return;
  const keys = (await cloud.keys()).filter((k) => k === META_KEY || k.startsWith(PART_PREFIX));
  await cloud.remove(keys);
}

export async function loadData(): Promise<{ data: PlannerData | null; source: StorageSource }> {
  const local = loadLocal();
  if (!cloud.available) return { data: local, source: local ? "local" : "none" };
  try {
    const remote = await loadCloud();
    if (remote && (!local || remote.updatedAt >= local.updatedAt)) {
      saveLocal(remote);
      return { data: remote, source: "cloud" };
    }
    if (local) {
      void saveCloud(local).catch(() => undefined);
      return { data: local, source: "local" };
    }
    return { data: null, source: "none" };
  } catch {
    return { data: local, source: local ? "local" : "none" };
  }
}

export function createPersister(delay = 400): (data: PlannerData) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: PlannerData | null = null;
  const flush = () => {
    timer = null;
    if (!pending) return;
    const data = pending;
    pending = null;
    saveLocal(data);
    void saveCloud(data).catch(() => undefined);
  };
  return (data) => {
    pending = data;
    saveLocal(data);
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, delay);
  };
}

export function exportText(data: PlannerData): string {
  return serializeData(data);
}
