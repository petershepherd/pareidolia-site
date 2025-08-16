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

/** ---- KOMPATIBILITÁSI RÉTEG a régi importokhoz ----
 * Ezeket más fájlok már használják: `readJson`, `repoDataPath`.
 * Hagyjuk meg őket, hogy ne kelljen mindenhol átírni az importokat.
 */

// Relatív data útvonal feloldása
export function repoDataPath(rel: string): string {
  return path.join(dataRoot, rel);
}

// Általános JSON olvasó (fallback-kel)
export async function readJson(fileRelPath: string, fallback: Json): Promise<Json> {
  const full = repoDataPath(fileRelPath);
  return safeReadJSON(full, fallback);
}

// Általános JSON író (ha később kellene)
export async function writeJson(fileRelPath: string, data: Json): Promise<void> {
  const full = repoDataPath(fileRelPath);
  await safeWriteJSON(full, data);
}
