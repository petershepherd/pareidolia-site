// lib/fs-data.ts
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataRoot = path.join(root, "data");
const contestsPath = path.join(dataRoot, "contests.json");
const memesPath = path.join(dataRoot, "memes.json");

type Json = any;

async function safeReadJSON(filePath: string, fallback: Json): Promise<Json> {
  try {
    const txt = await fs.readFile(filePath, "utf8");
    return JSON.parse(txt);
  } catch {
    return fallback;
  }
}

async function safeWriteJSON(filePath: string, data: Json) {
  const txt = JSON.stringify(data, null, 2);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, txt, "utf8");
}

/** ---- ÚJ API: contests/memes olvasás-írás ---- */
export async function readContestsFile(): Promise<Json> {
  // elvárt shape: { contests: [], submissions: [] }
  return safeReadJSON(contestsPath, { contests: [], submissions: [] });
}

export async function writeContestsFile(data: Json): Promise<void> {
  await safeWriteJSON(contestsPath, data);
}

export async function readMemesFile(): Promise<Json> {
  return safeReadJSON(memesPath, { items: [] });
}

export async function writeMemesFile(data: Json): Promise<void> {
  await safeWriteJSON(memesPath, data);
}

// ---- KOMPATIBILITÁSI RÉTEG a régi importokhoz ----

// Relatív data útvonal feloldása
export function repoDataPath(rel: string): string {
  return path.join(dataRoot, rel);
}

// Általános JSON olvasó (GENERIKUS, hogy lehessen readJson<T>-t hívni)
export async function readJson<T = any>(fileRelPath: string, fallback: T): Promise<T> {
  const full = repoDataPath(fileRelPath);
  try {
    const txt = await fs.readFile(full, "utf8");
    return JSON.parse(txt) as T;
  } catch {
    return fallback;
  }
}

// Általános JSON író (ha később kellene)
export async function writeJson(fileRelPath: string, data: any): Promise<void> {
  const full = repoDataPath(fileRelPath);
  const txt = JSON.stringify(data, null, 2);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, txt, "utf8");
}
