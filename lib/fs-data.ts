import fs from "fs";
import path from "path";

export function repoDataPath(...parts: string[]) {
  return path.join(process.cwd(), ...parts);
}

export function readJson<T>(p: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
