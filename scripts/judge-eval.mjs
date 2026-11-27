// 離線實測：讓 Gemini 當「把關」——判斷小屏給的答案標題是否在回答民眾的問題。只用固定測試題，不含民眾提問。
import fs from 'node:fs';
const KEY = process.env.GEMINI_API_KEY; if (!KEY) { console.error('缺少 GEMINI_API_KEY'); process.exit(1); }
const API = 'https://generativelanguage.googleapis.com/v1beta';
const MODELS = (process.env.MODELS || 'models/gemini-flash-latest,models/gemini-2.5-flash,models/gemini-3-flash-preview,models/gemini-flash-lite-latest').split(',');
const d = JSON.parse(fs.readFileSync('verify/sem-eval-pairs.json', 'utf8'));
const hardPos = ['社區發展協會的小組是什麼', '可以只收女生嗎', '理事長往生', '不清算會怎樣', '我不想當理事了', '協會賠錢了怎麼辦', '搬去高雄要怎麼辦', '我想退群', '一人一票是真的嗎', '兼職工讀生要保險嗎', '義賣所得要怎麼報', '向下屬募款可以嗎', '大會當天沒人主持怎麼辦', '合併可以代替解散嗎'];
const pos = d.pos.filter(p => hardPos.includes(p.q)).map(p => [p.q, p.t, true]);
const cases = [...d.real_neg.map(([q, t]) => [q, t, false]), ...pos];
const SYS = '你是政府服務櫃檯的品管員。櫃檯系統替民眾的問題挑了一則答案，請只根據「答案標題」判斷：這則答案是不是在回答民眾問的那件事。標準：答案的主題和民眾要問的重點相同（即使用詞不同、或答案是「法規沒有規定」），回答 YES；答案談的是另一件事、只沾到相同關鍵字、或只是很籠統的流程而沒有回應民眾問的具體重點，回答 NO。只輸出 YES 或 NO。';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let active = 0;
async function judge(q, t) {
  for (let k = 0; k < MODELS.length; k++) {
    const m = MODELS[(active + k) % MODELS.length];
    for (let i = 0; i < 3; i++) {
      await sleep(6500);
      try {
        const r = await fetch(`${API}/${m}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, signal: AbortSignal.timeout(60000),
          body: JSON.stringify({ systemInstruction: { parts: [{ text: SYS }] }, contents: [{ role: 'user', parts: [{ text: `民眾的問題：${q}\n答案標題：${t}` }] }], generationConfig: { temperature: 0, maxOutputTokens: 1024 } }) });
        const j = await r.json();
        if (r.status === 429 || r.status >= 500) { console.log(`  (${m} ${r.status})`); await sleep(15000); continue; }
        if (!r.ok) break;
        const x = (j.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('').trim().toUpperCase();
        if (/YES|NO/.test(x)) { active = (active + k) % MODELS.length; return { v: /YES/.test(x), m }; }
      } catch (e) { console.log('  (逾時)'); }
    }
  }
  return null;
}
const rows = []; let fail = 0;
for (const [q, t, truth] of cases) {
  if (fail >= 3) { console.log('連續拿不到回覆，可能額度用完，先停'); break; }
  const r = await judge(q, t);
  if (!r) { fail++; console.log('略過：', q); continue; }
  fail = 0; rows.push({ q, t, truth, v: r.v, m: r.m });
  console.log(`${r.v === truth ? '○' : '×'}｜${truth ? '正確答案' : '錯配'}｜AI判：${r.v ? '對得上' : '對不上'}｜${q} → ${t.slice(0, 30)}`);
}
const neg = rows.filter(r => !r.truth), ps = rows.filter(r => r.truth);
const sum = ['# Gemini 把關實測', '', `- 實際發生過的錯配：擋下 ${neg.filter(r => !r.v).length}/${neg.length}`, `- 用詞差很多的正確答案：誤擋 ${ps.filter(r => !r.v).length}/${ps.length}`, `- 模型：${[...new Set(rows.map(r => r.m))].join(', ')}`].join('\n');
console.log(sum); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, sum + '\n');
