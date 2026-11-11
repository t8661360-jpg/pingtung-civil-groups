// 屏東數位櫃檯：無法回答問題 → GitHub Issue 中繼 ＋ 內部 AI 草稿（Cloudflare Worker）
// 公開路由 POST /      ：無法回答問題 → 開 GitHub Issue（不變）
// 內部路由 POST /draft ：依提供的法條原文產生草稿答案（需 X-Draft-Key，不對民眾開放）
// 環境變數（Settings → Variables）：REPO、PROVIDER（cloudflare|groq，預設 cloudflare）、CF_MODEL、GROQ_MODEL
// 綁定（Settings → Bindings）：AI（Workers AI）
// 密鑰（Settings → Secrets）：GITHUB_TOKEN、GROQ_API_KEY（選用）、DRAFT_KEY（內部路由用，自行設定一組隨機字串）
const DRAFT_SYSTEM = "你是屏東縣人民團體數位櫃檯的草稿助理。只能根據使用者提供的法條原文作答，每一點都要標註條號。民眾用語與法條用語可能不同，請對應理解：理事長＝理事長；總幹事、秘書長、幹事＝工作人員（人民團體法第24條）；協會、社團、團體＝人民團體（社會團體）。若法條原文中有相關規定，即使只能部分回答，也請直接作答並說明條號與不確定之處；只有在法條原文完全沒有相關規定時，才只回覆 NO_BASIS。不得推測或引用未提供的條文。";

async function callModel(env, messages) {
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
  const out = await env.AI.run(env.CF_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, temperature: 0.1 });
  return out.response || "";
}

export default {
  async fetch(req, env) {
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
    const gh = (path, init = {}) => fetch("https://api.github.com" + path, { ...init, headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "pingtung-unanswered-relay", "Content-Type": "application/json", ...(init.headers || {}) } });
    const search = await gh(`/search/issues?q=${encodeURIComponent(`repo:${env.REPO} is:issue is:open label:反饋 in:title "${q.slice(0, 60)}"`)}`).then(r => r.json()).catch(() => ({}));
    const dup = (search.items || []).find(i => i.title.includes(q.slice(0, 40)));
    if (dup) { await gh(`/repos/${env.REPO}/issues/${dup.number}/comments`, { method: "POST", body: JSON.stringify({ body: `又有民眾問了同樣的問題（${body.at || new Date().toISOString()}）。` }) }); return new Response(JSON.stringify({ ok: true, issue: dup.number, dup: true }), { headers: { ...cors, "Content-Type": "application/json" } }); }
    const r = await gh(`/repos/${env.REPO}/issues`, { method: "POST", body: JSON.stringify({ title: `[無法回答] ${q.slice(0, 80)}`, labels: ["反饋", "無法回答"], body: `## 民眾原問句\n\n> ${q}\n\n- 時間：${body.at || new Date().toISOString()}\n- 頁面：${body.page || "/"}\n- 裝置：${body.ua || ""}\n\n> 由數位櫃檯自動回報；每日校正巡檢會查法條後以 PR 補上答案。` }) });
    const j = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: r.ok, issue: j.number }), { status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
