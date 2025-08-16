// lib/fs-data.ts
import path from "path";
import fs from "fs/promises";

type ContestsFile = {
  contests?: any[];
  submissions?: any[];
};

export async function readContestsFile(): Promise<{
  contests: any[];
  submissions: any[];
}> {
  try {
    const p = path.join(process.cwd(), "data", "contests.json");
    const raw = await fs.readFile(p, "utf8");
    const json: ContestsFile = JSON.parse(raw);
    return {
      contests: Array.isArray(json.contests) ? json.contests : [],
      submissions: Array.isArray(json.submissions) ? json.submissions : [],
    };
  } catch {
    // Ha nincs fájl vagy rossz a JSON, térjünk vissza üres struktúrával,
    // így a frontend nem dől el.
    return { contests: [], submissions: [] };
  }
}
