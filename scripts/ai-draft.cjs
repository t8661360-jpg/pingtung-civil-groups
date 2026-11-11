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

// 條號核對：草稿引用的每個「第N條」都必須存在於提供的核心法規中，否則整則不採用
function providedArticleNumbers() {
  const d = JSON.parse(zlib.gunzipSync(fs.readFileSync("data/statutes.json.gz")).toString());
  const set = new Set();
  for (const law of Object.values(d.laws || {})) {
    if (!CORE.test(law.name)) continue;
    for (const no of Object.keys(law.articles || {})) set.add(no);
  }
  return set;
}
function checkCitations(answer) {
  const provided = providedArticleNumbers();
  const cited = [...String(answer).matchAll(/第\s*(\d+(?:-\d+)?)\s*條/g)].map(m => m[1]);
  const unknown = [...new Set(cited.filter(n => !provided.has(n)))];
  // 內容對應：引用條號所在的句子，要與該條原文有足夠的文字重疊（bigram）
  const text = articleTextMap();
  const mismatched = [];
  for (const line of String(answer).split("\n")) {
    for (const m of line.matchAll(/第\s*(\d+(?:-\d+)?)\s*條/g)) {
      const body = text.get(m[1]) || "";
      const claim = line.replace(/第\s*\d+(?:-\d+)?\s*條/g, "").replace(/[（(].*?[）)]/g, "");
      const cg = bigrams(claim);
      if (!cg.length || !body) continue;
      const hit = cg.filter(b => body.includes(b)).length;
      if (hit / cg.length < 0.35) mismatched.push(m[1]);
    }
  }
  return { cited: [...new Set(cited)], unknown, mismatched: [...new Set(mismatched)] };
}
function articleTextMap() {
  const d = JSON.parse(zlib.gunzipSync(fs.readFileSync("data/statutes.json.gz")).toString());
  const m = new Map();
  for (const law of Object.values(d.laws || {})) {
    if (!CORE.test(law.name)) continue;
    for (const [no, t] of Object.entries(law.articles || {})) m.set(no, (m.get(no) || "") + String(t));
  }
  return m;
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
    const chk = checkCitations(answer);
    let body;
    if (noBasis) {
      body = "【AI 草稿】依提供的法條原文，AI 判定沒有依據，未產生答案。請人工查證。";
    } else if (chk.unknown.length || chk.mismatched.length) {
      const parts = [];
      if (chk.unknown.length) parts.push(`不存在的條號：${chk.unknown.map(n => "第" + n + "條").join("、")}`);
      if (chk.mismatched.length) parts.push(`條文內容與所引句子可能不對應：${chk.mismatched.map(n => "第" + n + "條").join("、")}`);
      body = `【AI 草稿｜核對未通過，本草稿不採用】\n${parts.join("；")}。請人工查證。`;
    } else {
      body = `【AI 草稿｜僅供人工審核，未經核對不得上線】\n條號已核對存在於提供的法條中；條文內容是否對應，仍須人工核對。\n\n${answer.trim()}\n\n---\n參考的法條（檢索結果，請核對）：\n${refs}`;
    }
    await gh(`/repos/${REPO}/issues/${issue.number}/comments`, { method: "POST", body: JSON.stringify({ body }) });
    await gh(`/repos/${REPO}/issues/${issue.number}/labels`, { method: "POST", body: JSON.stringify({ labels: ["AI草稿"] }) });
    console.log(`#${issue.number} 已留言${noBasis ? "（NO_BASIS）" : ""}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
