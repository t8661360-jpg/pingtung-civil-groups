// 產生 data/keyword-questions.json：關鍵字選單用的候選問題。
// 來源只用已驗證會答對的固定測試題（site-smoke CHECKS）與知識庫條目標題（自然問句）。
import fs from 'node:fs';
import zlib from 'node:zlib';
const src = fs.readFileSync('scripts/site-smoke.mjs', 'utf8');
const start = src.indexOf('const CHECKS = [');
const block = src.slice(start, src.indexOf('\n];', start) + 3);
const CHECKS = Function(block.replace('const CHECKS =', 'return'))();
const isQ = s => /[?？嗎呢]|怎|如何|可以|能不能|幾|什麼|哪|誰|是否|要不要|多久|多少|為何|為什麼|一定要/.test(s);
const set = new Set();
for (const [q] of CHECKS) if (q.length >= 6 && q.length <= 30 && isQ(q) && !/第\s*\d+\s*條|^\d/.test(q)) set.add(q.trim());
let kb = [];
try { const d = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/knowledge.json.gz')).toString()); kb = Array.isArray(d) ? d : (Object.values(d).find(Array.isArray) || []); } catch (e) {}
for (const it of kb) { const t = String(it.title || it.q || '').trim(); if (t.length >= 6 && t.length <= 30 && isQ(t) && !/函|字第|號/.test(t)) set.add(t); }
const list = [...set].sort((a, b) => a.length - b.length);
fs.writeFileSync('data/keyword-questions.json', JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), questions: list }));
console.log('候選問題', list.length);
