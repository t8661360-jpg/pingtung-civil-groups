// 無法回答 Issue → 內部 AI 草稿（只寫留言，不改網站內容；需人工審核）
// 環境變數：GITHUB_TOKEN、REPO（owner/repo）、DRAFT_URL（Worker /draft 網址）、DRAFT_KEY（與 Worker 相同）
// 用法：node scripts/ai-draft.cjs [--max 5] [--dry]
const fs = require("fs");
const zlib = require("zlib");

const args = process.argv.slice(2);
const MAX = Number(args[args.indexOf("--max") + 1]) || 5;
const DRY = args.includes("--dry");
const { GITHUB_TOKEN, REPO, DRAFT_URL, DRAFT_KEY } = process.env;
if (!DRY && (!GITHUB_TOKEN || !REPO || !DRAFT_URL || !DRAFT_KEY)) {
  console.error("缺少環境變數：GITHUB_TOKEN / REPO / DRAFT_URL / DRAFT_KEY");
  process.exit(2);
}

const STOP = /[\s，。、？?！!：:；;「」『』（）()\[\]【】\-—…·．.]/g;
function bigrams(s) {
  const t = String(s).replace(STOP, "");
  const out = new Set();
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return [...out];
}

// 核心法規整批提供（人民團體法、選罷辦法、會務輔導辦法、社會團體財務處理辦法）
// 切成每段 1500 字以內，最多 12 段（Worker 上限）；讓模型自行找條文，不靠關鍵字檢索
const CORE = /^(人民團體法|人民團體選舉罷免辦法|人民團體會務輔導辦法|社會團體財務處理辦法)$/;
function coreChunks() {
  const d = JSON.parse(zlib.gunzipSync(fs.readFileSync("data/statutes.json.gz")).toString());
  const chunks = [];
  for (const law of Object.values(d.laws || {})) {
    if (!CORE.test(law.name)) continue;
    let buf = "", from = null, last = null;
    const flush = () => { if (buf) chunks.push({ title: `${law.name}第${from}至${last}條`, text: buf }); buf = ""; from = null; };
    for (const [no, text] of Object.entries(law.articles || {})) {
      const line = `第${no}條 ${String(text)}\n`;
      if (buf.length + line.length > 1450) flush();
      if (from === null) from = no;
      buf += line; last = no;
    }
    flush();
  }
  return chunks;
}

async function gh(path, init = {}) {
  const r = await fetch("https://api.github.com" + path, {
    ...init,
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "ai-draft", "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} ${path}`);
  return r.status === 204 ? null : r.json();
}

async function draft(question, statutes) {
  const r = await fetch(DRAFT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Draft-Key": DRAFT_KEY },
    body: JSON.stringify({ q: question, statutes }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(`draft ${r.status} ${j.error || ""}`);
  return j.answer || "";
}

(async () => {
  const issues = DRY ? [] : await gh(`/repos/${REPO}/issues?state=open&labels=${encodeURIComponent("無法回答")}&per_page=30`);
  const todo = issues.filter(i => !i.pull_request && !(i.labels || []).some(l => (l.name || l) === "AI草稿")).slice(0, MAX);
  console.log(`待處理 ${todo.length} 筆`);
  if (DRY) { console.log(coreChunks().map(c => c.title).join("\n")); return; }

  for (const issue of todo) {
    const question = issue.title.replace(/^\[無法回答\]\s*/, "").trim();
    const statutes = coreChunks();
    if (!statutes.length) {
      await gh(`/repos/${REPO}/issues/${issue.number}/comments`, { method: "POST", body: JSON.stringify({ body: "【AI 草稿】檢索不到相關法條，無法產生草稿，請人工查證。" }) });
      continue;
    }
    let answer;
    try { answer = await draft(question, statutes); }
    catch (e) { console.error(`#${issue.number} ${e.message}`); continue; }
    const noBasis = !answer.trim() || /NO_BASIS/.test(answer);
    const refs = statutes.map(s => `- ${s.title}`).join("\n");
    const body = noBasis
      ? "【AI 草稿】依提供的法條原文，AI 判定沒有依據，未產生答案。請人工查證。"
      : `【AI 草稿｜僅供人工審核，未經核對不得上線】\n\n${answer.trim()}\n\n---\n參考的法條（檢索結果，請核對）：\n${refs}`;
    await gh(`/repos/${REPO}/issues/${issue.number}/comments`, { method: "POST", body: JSON.stringify({ body }) });
    await gh(`/repos/${REPO}/issues/${issue.number}/labels`, { method: "POST", body: JSON.stringify({ labels: ["AI草稿"] }) });
    console.log(`#${issue.number} 已留言${noBasis ? "（NO_BASIS）" : ""}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
