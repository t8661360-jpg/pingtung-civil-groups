// 屏東數位櫃檯：無法回答問題 → GitHub Issue 中繼（Cloudflare Worker）
// 環境變數：GITHUB_TOKEN（fine-grained，僅 Issues: Read and write）、REPO（t8661360-jpg/pingtung-civil-groups）
// 選用：ALLOW_ORIGIN（預設 https://t8661360-jpg.github.io）
export default {
  async fetch(req, env) {
    const origin = env.ALLOW_ORIGIN || "https://t8661360-jpg.github.io";
    const cors = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
    if ((req.headers.get("Origin") || "") !== origin) return new Response("forbidden", { status: 403, headers: cors });
    let body; try { body = await req.json(); } catch { return new Response("bad json", { status: 400, headers: cors }); }
    const q = String(body.q || "").replace(/[\r\n]+/g, " ").trim().slice(0, 300);
    if (q.length < 2) return new Response("empty", { status: 400, headers: cors });
    // 簡單防洪：同 IP 每分鐘 5 次（KV 可選；沒有 KV 時略過）
    if (env.RATE) {
      const ip = req.headers.get("CF-Connecting-IP") || "x"; const k = `r:${ip}:${Math.floor(Date.now() / 60000)}`;
      const n = parseInt(await env.RATE.get(k) || "0") + 1; await env.RATE.put(k, String(n), { expirationTtl: 120 });
      if (n > 5) return new Response("slow down", { status: 429, headers: cors });
    }
    const gh = (path, init = {}) => fetch("https://api.github.com" + path, { ...init, headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "pingtung-unanswered-relay", "Content-Type": "application/json", ...(init.headers || {}) } });
    // 去重：同一問句已有 open issue → 留言 +1
    const search = await gh(`/search/issues?q=${encodeURIComponent(`repo:${env.REPO} is:issue is:open label:反饋 in:title "${q.slice(0, 60)}"`)}`).then(r => r.json()).catch(() => ({}));
    const dup = (search.items || []).find(i => i.title.includes(q.slice(0, 40)));
    if (dup) { await gh(`/repos/${env.REPO}/issues/${dup.number}/comments`, { method: "POST", body: JSON.stringify({ body: `又有民眾問了同樣的問題（${body.at || new Date().toISOString()}）。` }) }); return new Response(JSON.stringify({ ok: true, issue: dup.number, dup: true }), { headers: { ...cors, "Content-Type": "application/json" } }); }
    const r = await gh(`/repos/${env.REPO}/issues`, { method: "POST", body: JSON.stringify({ title: `[無法回答] ${q.slice(0, 80)}`, labels: ["反饋", "無法回答"], body: `## 民眾原問句\n\n> ${q}\n\n- 時間：${body.at || new Date().toISOString()}\n- 頁面：${body.page || "/"}\n- 裝置：${body.ua || ""}\n\n> 由數位櫃檯自動回報；每日校正巡檢會查法條後以 PR 補上答案。` }) });
    const j = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: r.ok, issue: j.number }), { status: r.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
