// 離線實測：用 Gemini「改寫民眾問句」後，櫃檯（既有已核對答案）答對率是否提高。
// 不接正式網站、不送民眾真實提問；題目只用 scripts/site-smoke.mjs 內固定、已核實的測試問句。
// 需要 GitHub Actions secret：GEMINI_API_KEY（由使用者自行設定）。
import { chromium } from 'playwright';
import fs from 'node:fs';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('缺少 GEMINI_API_KEY'); process.exit(1); }
const BASE = (process.env.BASE_URL || 'http://localhost:8765/').replace(/\/?$/, '/');
const N = Number(process.env.N || 40);
const GAP = Number(process.env.GAP_MS || 6500); // 控制每分鐘請求數
const API = 'https://generativelanguage.googleapis.com/v1beta';

// 1. 讀取固定測試題
const src = fs.readFileSync('scripts/site-smoke.mjs', 'utf8');
const block = src.slice(src.indexOf('const CHECKS = ['), src.indexOf('\n];', src.indexOf('const CHECKS = [')) + 3);
const CHECKS = Function(block.replace('const CHECKS =', 'return'))();
// 固定亂數抽樣，讓每次結果可比較
let seed = Number(process.env.SEED || 20261123);
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pool = CHECKS.filter(([q, w]) => q.length >= 5 && w.length >= 2);
const sample = [];
while (sample.length < Math.min(N, pool.length)) { const i = Math.floor(rnd() * pool.length); sample.push(pool.splice(i, 1)[0]); }

// 2. 選模型：優先使用環境變數，否則自動挑最新的 Flash（非 lite / image / tts）
async function pickModel() {
  if (process.env.MODEL) return process.env.MODEL;
  const r = await fetch(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': KEY } });
  const j = await r.json();
  const names = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name);
  console.log('可用模型：', names.join(', '));
  const flash = names.filter(n => /flash/.test(n) && !/lite|image|tts|audio|live|exp|preview/.test(n));
  const cand = (flash.length ? flash : names.filter(n => /flash/.test(n))).sort().reverse();
  if (!cand.length) throw new Error('找不到可用的 Flash 模型');
  return cand[0];
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function gen(model, system, user, temperature) {
  for (let t = 0; t < 6; t++) {
    await sleep(GAP);
    const r = await fetch(`${API}/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature, maxOutputTokens: 1024 } })
    });
    if (r.status === 429 || r.status >= 500) { console.log(`  （${r.status}，稍候重試）`); await sleep(30000); continue; }
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
    return text.split('\n').map(s => s.trim()).filter(Boolean)[0] || '';
  }
  throw new Error('Gemini 一直回 429／5xx，可能已達免費額度');
}
const PARA = '你在幫忙測試一個政府服務櫃檯。請把使用者給的問題，改用一般民眾很口語、跟原句用詞明顯不同的說法再問一次，意思必須完全相同。原句提到的對象（例如協會、合作社、社區發展協會、理事長）要保留同一種對象，但可以換成口語說法。只輸出一句問題，不要回答，不要加任何說明。';
const REWRITE = '你是屏東縣政府社會處人民團體數位櫃檯的前置助手，只負責「把民眾的問題改寫成清楚、標準的一句問題」，交給後端已核對過的答案庫查詢。業務範圍：一般協會（社會團體）、職業團體、社區發展協會、合作社的籌組、立案、會議、改選、任期、會員、財務、解散等。規則：1. 保留原意，不新增事實、不回答問題。2. 口語詞改成常用正式說法，例如「會長」→「理事長」、「社團」→「協會」。3. 沒寫主體但用詞明顯屬於合作社（股息、社股、社員、結餘分配）時補上「合作社」；屬於社區發展協會時補上「社區發展協會」；其他情況不要自行猜主體。4. 問「可不可以」就保留「可以…嗎」的問法。只輸出改寫後的一句問題。';

// 3. 在本機網站上詢問
async function makeAsker(browser) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(BASE + '?eval=' + Date.now(), { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(4000);
  return async q => {
    await page.fill('#q', q); await page.click('#askform button[type=submit]');
    await page.waitForTimeout(1800);
    const text = await page.innerText('#board');
    const title = (await page.$eval('#board .atitle', e => e.innerText).catch(() => '')) || '';
    return { text, title };
  };
}

const model = await pickModel();
console.log('使用模型：', model, '｜題數：', sample.length);
const browser = await chromium.launch();
const ask = await makeAsker(browser);
const rows = [];
for (const [q, want] of sample) {
  const para = await gen(model, PARA, q, 0.9);
  const rq = await gen(model, REWRITE, q, 0);
  const rp = await gen(model, REWRITE, para, 0);
  const a1 = await ask(q), a2 = await ask(para), a3 = await ask(rq), a4 = await ask(rp);
  const row = { q, want, para, rq, rp, orig: a1.text.includes(want), paraRaw: a2.text.includes(want), origRew: a3.text.includes(want), paraRew: a4.text.includes(want), tParaRaw: a2.title, tParaRew: a4.title };
  rows.push(row);
  console.log(`${row.orig ? '○' : '×'}${row.origRew ? '○' : '×'}｜${row.paraRaw ? '○' : '×'}${row.paraRew ? '○' : '×'}｜${q} → 口語「${para}」→ 改寫「${rp}」`);
}
await browser.close();
const pct = k => `${rows.filter(r => r[k]).length}/${rows.length}`;
const summary = [
  `# Gemini 改寫問句實測（${model}）`,
  '',
  '| 情境 | 答對 |', '|---|---|',
  `| 原題直接問 | ${pct('orig')} |`,
  `| 原題經 AI 改寫後問 | ${pct('origRew')} |`,
  `| 換成口語說法直接問 | ${pct('paraRaw')} |`,
  `| 口語說法經 AI 改寫後問 | ${pct('paraRew')} |`,
  '',
  '## 口語題：改寫前後有差異的題目', '',
  '| 原題 | 口語說法 | AI 改寫 | 改寫前 | 改寫後 |', '|---|---|---|---|---|',
  ...rows.filter(r => r.paraRaw !== r.paraRew || !r.paraRew).map(r => `| ${r.q} | ${r.para} | ${r.rp} | ${r.paraRaw ? '○' : '×'} ${r.tParaRaw} | ${r.paraRew ? '○' : '×'} ${r.tParaRew} |`),
  '',
  '## 原題被改寫弄壞的題目', '',
  ...rows.filter(r => r.orig && !r.origRew).map(r => `- ${r.q} → ${r.rq}`)
].join('\n');
fs.writeFileSync('llm-eval-result.md', summary);
fs.writeFileSync('llm-eval-result.json', JSON.stringify({ model, rows }, null, 1));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
console.log(summary);
