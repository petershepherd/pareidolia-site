// lib/fs-data.ts
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contestsPath = path.join(root, "data", "contests.json");
const memesPath = path.join(root, "data", "memes.json");

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

/** ---- Contests ---- */
export async function readContestsFile(): Promise<Json> {
  // elvárt shape: { contests: [], submissions: [] }
  return safeReadJSON(contestsPath, { contests: [], submissions: [] });
}

export async function writeContestsFile(data: Json): Promise<void> {
  await safeWriteJSON(contestsPath, data);
}

/** ---- Memes (ha kell) ---- */
export async function readMemesFile(): Promise<Json> {
  return safeReadJSON(memesPath, { items: [] });
}

export async function writeMemesFile(data: Json): Promise<void> {
  await safeWriteJSON(memesPath, data);
}
