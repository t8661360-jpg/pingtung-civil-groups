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
/* 檢查項目本身就是預期「出選單／難倒小屏」的題目（把關測試題），不能再拿來當選單候選題 */
const guardOnly = want => (Array.isArray(want) ? want : [want]).some(w => /您是不是要問|難倒小屏|您一次問了不只一件事|不是這個櫃檯/.test(String(w)));
for (const [q, want] of CHECKS) if (!guardOnly(want) && q.length >= 6 && q.length <= 30 && isQ(q) && !/第\s*\d+\s*條|^\d/.test(q)) set.add(q.trim());
let kb = [];
try { const d = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/knowledge.json.gz')).toString()); kb = Array.isArray(d) ? d : (Object.values(d).find(Array.isArray) || []); } catch (e) {}
for (const it of kb) { const t = String(it.title || it.q || '').trim(); if (t.length >= 6 && t.length <= 30 && isQ(t) && !/函|字第|號/.test(t)) set.add(t); }
/* 以題目原文直接問時答不到重點的候選題（第193輪點選檢查），先排除 */
const EXCLUDE = ['阮協會的會員過身了，伊的會籍會使予後生接嗎','理事長、理監事是無給職，需要用員工的身分幫他們投保嗎？','入會費和常年會費的比例，有沒有規定？可以比照工商團體嗎？','理事會依章程把會員停權3年，可以嗎？','義買跟勸募一樣嗎','收據和帳簿要保存多久？收入可以直接拿去抵支出嗎？','勞動合作社的社員同時是員工時，營業稅怎麼算？','發票和帳冊不見了，可以寫一張切結書全部補過去嗎？','前任幹部不交出印章和帳冊，可以直接取消他的會員權利嗎？','已經有一個協會了，可以直接改名變成合作社嗎？','解散大會要討論哪些事？通知和紀錄要注意什麼？','佳冬的房屋稅、地價稅要找哪裡？東港財稅分局的電話地址？','協會的房屋免了房屋稅之後，出租出去還能繼續全部免稅嗎？','總幹事年資會合併嗎','夫妻合併列舉，捐款原始收據寫我太太，須改開我嗎？','公會的會費沒繳，專業證照會直接被廢止嗎？','幹部的專業證照被廢止，他在公會的職位會怎麼樣？'];
for (const q of EXCLUDE) set.delete(q);
const list = [...set].sort((a, b) => a.length - b.length);
fs.writeFileSync('data/keyword-questions.json', JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), questions: list }));
console.log('候選問題', list.length);
