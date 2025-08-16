export async function githubWriteFile(params: {
  repo: string;           // "owner/repo"
  branch: string;         // "main"
  token: string;          // PAT
  path: string;           // "data/memes.json"
  content: string;        // raw string (UTF-8)
  message: string;        // commit message
}) {
  const { repo, branch, token, path, content, message } = params;
  const api = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  // Meg kell kérdezni a sha-t (ha létezik a fájl), hogy update-et tudjunk csinálni
  const getRes = await fetch(`${api}?ref=${branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
  });
  let sha: string | undefined = undefined;
  if (getRes.ok) {
    const json = await getRes.json();
    if (json && json.sha) sha = json.sha;
  }

  const putRes = await fetch(api, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch,
      sha
    })
  });

  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error(`GitHub write failed: ${putRes.status} ${txt}`);
  }
}
