// 屏東數位櫃檯：無法回答問題 → GitHub Issue 中繼 ＋ 內部 AI 草稿（Cloudflare Worker）
// 公開路由 POST /      ：無法回答問題 → 開 GitHub Issue（不變）
// 公開路由 POST /ask   ：AI 即時回覆（只引用檢索到的法條，核對通過才回傳；稅務問題不回覆）
// 內部路由 POST /draft ：依提供的法條原文產生草稿答案（需 X-Draft-Key，不對民眾開放）
// 環境變數（Settings → Variables）：REPO、PROVIDER（cloudflare|groq，預設 cloudflare）、CF_MODEL、GROQ_MODEL
// 綁定（Settings → Bindings）：AI（Workers AI）
// 密鑰（Settings → Secrets）：GITHUB_TOKEN、GROQ_API_KEY（選用）、DRAFT_KEY（內部路由用，自行設定一組隨機字串）
const DRAFT_SYSTEM = "你是屏東縣人民團體數位櫃檯的草稿助理。只能根據使用者提供的法條原文作答，每一點都要標註條號。民眾用語與法條用語可能不同，請對應理解：理事長＝理事長；總幹事、秘書長、幹事＝工作人員（人民團體法第24條）；協會、社團、團體＝人民團體（社會團體）。若法條原文中有相關規定，即使只能部分回答，也請直接作答並說明條號與不確定之處；只有在法條原文完全沒有相關規定時，才只回覆 NO_BASIS。不得推測或引用未提供的條文。";

function pickText(out) {
  if (!out) return "";
  if (typeof out === "string") return out;
  let t = out.response || out.result?.response || out.choices?.[0]?.message?.content || out.choices?.[0]?.text || "";
  if (!t && Array.isArray(out.output)) t = out.output.map(o => (o.content || []).map(c => c.text || "").join("")).join("");
  return String(t || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
async function callModel(env, messages, model) {
  if ((env.PROVIDER || "cloudflare") === "groq") {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: env.GROQ_MODEL || "llama-3.3-70b-versatile", messages, temperature: 0.1 }),
    });
    if (!r.ok) throw new Error("groq " + r.status);
    const j = await r.json();
    return j.choices?.[0]?.message?.content || "";
  }
  const out = await env.AI.run(model || env.CF_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, temperature: 0.1, max_tokens: 900 });
  return pickText(out);
}

// ===== 公開 AI 即時回覆（POST /ask）：只在櫃檯規則與知識庫答不出來時由網頁呼叫 =====
const ASK_SYSTEM = "你是屏東縣人民團體數位櫃檯的小屏助理，要用親切、口語的繁體中文，直接回答民眾的問題。只能根據使用者提供的法條原文作答：先用一兩句話講結論，再說依據。每個依據都要標註條號（例如「人民團體法第27條」），並逐字引用該條原文中支持這個結論的一句話，用「」括起來（至少8個字、必須與原文完全一致）；沒有可以逐字引用的原文，就不要下這個結論。結論不得超出引用原文的意思，不要把「移交」「整理小組」等不同情形的條文套到一般情形。民眾用語與法條用語可能不同，請自行對應（社團、協會＝人民團體；總幹事、秘書長＝工作人員）。不得推測或引用未提供的條文；不得編造電話、姓名、金額、期限；法條沒寫清楚的地方，要明講「法規沒有明確規定，建議電洽承辦人員」。稅務、個案認定、訴訟請民眾洽詢國稅局或專業人士。若提供的法條原文完全沒有相關規定，只回覆 NO_BASIS。";
const CORE_LAWS = /^(人民團體法|人民團體選舉罷免辦法|人民團體會務輔導辦法|社會團體財務處理辦法|社會團體工作人員管理辦法|公益勸募條例|公益勸募條例施行細則|志願服務法)$/;
let STAT_CACHE = null, STAT_AT = 0;
async function loadStatutes(env) {
  if (STAT_CACHE && Date.now() - STAT_AT < 6 * 3600 * 1000) return STAT_CACHE;
  const url = env.STATUTES_URL || "https://t8661360-jpg.github.io/pingtung-civil-groups/data/statutes.json.gz";
  const r = await fetch(url);
  if (!r.ok) throw new Error("statutes " + r.status);
  const txt = await new Response(r.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const d = JSON.parse(txt), rows = [];
  for (const law of Object.values(d.laws || {})) {
    if (!CORE_LAWS.test(law.name)) continue;
    for (const [no, text] of Object.entries(law.articles || {})) rows.push({ law: law.name, no, text: String(text) });
  }
  STAT_CACHE = rows; STAT_AT = Date.now();
  return rows;
}
const STOP_RE = /[\s，。、？?！!：:；;「」『』（）()\[\]【】\-—…·．.]/g;
function bigrams(s) { const t = String(s).replace(STOP_RE, ""), o = new Set(); for (let i = 0; i < t.length - 1; i++) o.add(t.slice(i, i + 2)); return [...o]; }
const GENERIC = new Set(["協會", "社團", "團體", "可以", "怎麼", "什麼", "需要", "可不", "不可", "會員", "人民", "民團"]);
// 民眾口語 → 法規用語（只做檢索擴充，不影響顯示）
/** @type {[RegExp, string][]} */
const SYN = [[/印章|大小章|章子/, "圖記 印模"], [/總幹事|秘書長|幹事|員工|職員/, "工作人員 聘僱 解聘"], [/請假|沒到|缺席|不來/, "出席 缺席 視同辭職"], [/開除|踢掉|退會|除名/, "除名 退會 出會"], [/換人|撤換|下台|罷免/, "罷免 解任 改選"], [/開會|開大會|大會/, "會議 召集 通知 出席"], [/收據|發票/, "正式收據 經費收入"], [/存款|領錢|提款|帳戶|銀行/, "存款 領款憑證 共同蓋章"], [/帳|會計|預算|決算/, "預算 決算 會計 財務"], [/地址|搬家|遷移/, "會址 變更 備查"], [/解散|關掉|結束/, "解散 清算 剩餘財產"], [/捐款|募款|勸募/, "勸募 捐款 經費"], [/出席費|車馬費|報酬|薪水/, "出席費 交通費 工作人員 報酬"], [/不開會|不召開|不召集/, "不召開 解除職務 召集"], [/報備|備查|核備|報縣府/, "報請 核備 備查 三十日 異動"], [/存在|存哪|誰可以領/, "存款 領款憑證 共同蓋章 財務人員"], [/補助/, "補助 經費"], [/立案|成立|設立/, "發起人 許可 成立大會"]];
let IDF = null;
function idfOf(rows) {
  if (IDF) return IDF;
  const df = new Map();
  for (const r of rows) for (const b of new Set(bigrams(r.text))) df.set(b, (df.get(b) || 0) + 1);
  IDF = { df, n: rows.length };
  return IDF;
}
function retrieve(rows, q, k = 8) {
  let qq = q;
  for (const [re, add] of SYN) if (re.test(q)) qq += " " + add;
  const qg = bigrams(qq).filter(b => !GENERIC.has(b));
  if (!qg.length) return [];
  const { df, n } = idfOf(rows);
  const w = b => Math.log(1 + n / (1 + (df.get(b) || 0)));
  const scored = rows.map(r => { let s = 0; for (const b of qg) if (r.text.includes(b)) s += w(b); return { r, s: s / Math.pow(r.text.length + 60, 0.35) }; }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map(x => x.r);
}
function checkAnswer(answer, used) {
  const provided = new Map(used.map(r => [r.no, r.text]));
  const bad = [];
  for (const line of String(answer).split("\n")) {
    for (const m of line.matchAll(/第\s*(\d+(?:-\d+)?)\s*條/g)) {
      const body = provided.get(m[1]);
      if (body === undefined) { bad.push("unknown:" + m[1]); continue; }
      const claim = line.replace(/第\s*\d+(?:-\d+)?\s*條/g, "").replace(/[（(].*?[）)]/g, "");
      const cg = bigrams(claim);
      if (cg.length && cg.filter(b => body.includes(b)).length / cg.length < 0.3) bad.push("mismatch:" + m[1]);
    }
  }
  // 逐字引用核對：「」內 8 字以上的引文，必須出現在檢索到的條文原文中
  const norm = x => String(x).replace(/[\s，。、；：:,.;（）()「」『』]/g, "");
  const allText = norm(used.map(r => r.text).join(""));
  const quotes = [...String(answer).matchAll(/「([^」]{8,})」/g)].map(m => norm(m[1]));
  for (const qt of quotes) if (!allText.includes(qt)) bad.push("quote");
  if (!quotes.length) bad.push("noquote");
  const cited = [...new Set([...String(answer).matchAll(/第\s*(\d+(?:-\d+)?)\s*條/g)].map(m => m[1]))];
  // 不得出現未提供的電話（縣府總機 08-7320415 除外）或網址
  const phones = (String(answer).match(/0\d{1,2}[- ]?\d{6,8}/g) || []).filter(x => x.replace(/\D/g, "") !== "087320415");
  if (phones.length || /https?:\/\//.test(answer)) bad.push("contact");
  return { ok: !bad.length && cited.length > 0, bad, cited };
}
async function handleAsk(req, env, ctx, cors, gh) {
  const origin = env.ALLOW_ORIGIN || "https://t8661360-jpg.github.io";
  if ((req.headers.get("Origin") || "") !== origin) return new Response("forbidden", { status: 403, headers: cors });
  let b; try { b = await req.json(); } catch { return new Response("bad json", { status: 400, headers: cors }); }
  const q = String(b.q || "").replace(/[\r\n]+/g, " ").trim().slice(0, 200);
  const J = { ...cors, "Content-Type": "application/json" };
  const none = (why) => new Response(JSON.stringify({ ok: true, answer: null, why }), { headers: J });
  if (q.length < 4) return none("short");
  if (/稅|報稅|扣繳|免稅|抵稅/.test(q)) return none("tax");
  if (env.RATE) {
    const ip = req.headers.get("CF-Connecting-IP") || "x", k = `a:${ip}:${Math.floor(Date.now() / 60000)}`;
    const n = parseInt(await env.RATE.get(k) || "0") + 1; await env.RATE.put(k, String(n), { expirationTtl: 120 });
    if (n > 3) return new Response("slow down", { status: 429, headers: cors });
  }
  try {
    const rows = await loadStatutes(env);
    const used = retrieve(rows, q, 8);
    if (!used.length) return none("no-retrieval");
    // 只列最相關法條原文，不讓模型下結論（避免「引文是真的、結論是錯的」）
    const top = used.slice(0, 3);
    const answer = "這個問題小屏沒有現成的答案，先幫您找到下面幾條可能相關的法條原文。是否適用於您的情況，建議電洽承辦人員確認。";
    const cites = top.map(r => ({ law: r.law, no: r.no, text: r.text.slice(0, 600) }));
    if (ctx && env.GITHUB_TOKEN && env.REPO) ctx.waitUntil((async () => {
      const s = await gh(`/search/issues?q=${encodeURIComponent(`repo:${env.REPO} is:issue is:open label:無法回答 in:title "${q.slice(0, 40)}"`)}`).then(r => r.json()).catch(() => ({}));
      const it = (s.items || []).find(i => i.title.includes(q.slice(0, 30)));
      if (it) await gh(`/repos/${env.REPO}/issues/${it.number}/comments`, { method: "POST", body: JSON.stringify({ body: `【檢索到的相關條文（已顯示給民眾，僅列原文、未下結論）】\n${top.map(r => `- ${r.law}第${r.no}條`).join("\n")}\n\n請人工確認後再整理成正式答案。` }) });
    })());
    return new Response(JSON.stringify({ ok: true, answer, cites }), { headers: J });
  } catch (e) {
    return none("error");
  }
}

export default {
  async fetch(req, env, ctx) {
    const origin = env.ALLOW_ORIGIN || "https://t8661360-jpg.github.io";
    const cors = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Draft-Key" };
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });

    // ---- 內部 AI 草稿（不接受瀏覽器來源；需金鑰）----
    if (url.pathname === "/draft") {
      if (!env.DRAFT_KEY || req.headers.get("X-Draft-Key") !== env.DRAFT_KEY) return new Response("forbidden", { status: 403 });
      let b; try { b = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
      const q = String(b.q || "").slice(0, 300);
      const law = (Array.isArray(b.statutes) ? b.statutes : []).slice(0, 20).map(s => `【${s.title}】\n${String(s.text || "").slice(0, 2000)}`).join("\n\n");
      if (!q || !law) return new Response("need q and statutes", { status: 400 });
      try {
        const answer = await callModel(env, [
          { role: "system", content: DRAFT_SYSTEM },
          { role: "user", content: `問題：${q}\n\n法條原文：\n${law}\n\n請用繁體中文、條列式回答，並標註條號。` },
        ]);
        return new Response(JSON.stringify({ ok: true, provider: env.PROVIDER || "cloudflare", answer }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { "Content-Type": "application/json" } });
      }
    }

    const gh = (path, init = {}) => fetch("https://api.github.com" + path, { ...init, headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "pingtung-unanswered-relay", "Content-Type": "application/json", ...(init.headers || {}) } });
    // ---- 公開：AI 即時回覆 ----
    if (url.pathname === "/ask") return handleAsk(req, env, ctx, cors, gh);

    // ---- 公開：無法回答問題 → GitHub Issue ----
    if ((req.headers.get("Origin") || "") !== origin) return new Response("forbidden", { status: 403, headers: cors });
    let body; try { body = await req.json(); } catch { return new Response("bad json", { status: 400, headers: cors }); }
    const q = String(body.q || "").replace(/[\r\n]+/g, " ").trim().slice(0, 300);
    if (q.length < 2) return new Response("empty", { status: 400, headers: cors });
    if (env.RATE) {
      const ip = req.headers.get("CF-Connecting-IP") || "x"; const k = `r:${ip}:${Math.floor(Date.now() / 60000)}`;
      const n = parseInt(await env.RATE.get(k) || "0") + 1; await env.RATE.put(k, String(n), { expirationTtl: 120 });
      if (n > 5) return new Response("slow down", { status: 429, headers: cors });
    }
    const search = await gh(`/search/issues?q=${encodeURIComponent(`repo:${env.REPO} is:issue is:open label:反饋 in:title "${q.slice(0, 60)}"`)}`).then(r => r.json()).catch(() => ({}));
    const dup = (search.items || []).find(i => i.title.includes(q.slice(0, 40)));
    if (dup) { await gh(`/repos/${env.REPO}/issues/${dup.number}/comments`, { method: "POST", body: JSON.stringify({ body: `又有民眾問了同樣的問題（${body.at || new Date().toISOString()}）。` }) }); return new Response(JSON.stringify({ ok: true, issue: dup.number, dup: true }), { headers: { ...cors, "Content-Type": "application/json" } }); }
    const r = await gh(`/repos/${env.REPO}/issues`, { method: "POST", body: JSON.stringify({ title: `[無法回答] ${q.slice(0, 80)}`, labels: ["反饋", "無法回答"], body: `## 民眾原問句\n\n> ${q}\n\n- 時間：${body.at || new Date().toISOString()}\n- 頁面：${body.page || "/"}\n- 裝置：${body.ua || ""}\n\n> 由數位櫃檯自動回報；每日校正巡檢會查法條後以 PR 補上答案。` }) });
    const j = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: r.ok, issue: j.number }), { status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
