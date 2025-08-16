import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // teljes ContestFile
    // egyszerű szerver oldali auth: "admin" headerrel PIN-t várunk
    const pin = process.env.ADMIN_PIN;
    const provided = req.headers.get("x-admin-pin");
    if (!pin || provided !== pin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const owner = process.env.CONTEST_REPO_OWNER!;
    const repo = process.env.CONTEST_REPO_NAME!;
    const path = process.env.CONTEST_REPO_FILE_PATH!;
    const token = process.env.GITHUB_TOKEN!;
    const octokit = new Octokit({ auth: token });

    // előbb lekérjük, hogy megkapjuk a sha-t (GitHub blob frissítéshez kell)
    const { data: current } = await octokit.repos.getContent({ owner, repo, path });
    const sha = Array.isArray(current) ? undefined : (current as any).sha;

    const newContent = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Update meme contests via admin panel",
      content: newContent,
      sha,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
