'use strict';
// GPT replies remain drafts. Literal quote checks never approve a legal conclusion.
const fs = require('node:fs');
const zlib = require('node:zlib');
const { articleNumber, checkReply } = require('./legal-citation-check.cjs');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const brief = process.argv.includes('--brief');
const [inFile, outFile = 'verify/report.json'] = args;
if (!inFile) { console.error('用法：node scripts/gpt-verify.cjs <queue.json> [report.json] [--brief]'); process.exit(2); }
const laws = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz'))).laws;
const byName = Object.fromEntries(Object.entries(laws).map(([pcode, law]) => [law.name, { pcode, articles: law.articles }]));
function artText(name, article) {
  const no = articleNumber(article);
  const law = byName[name];
  return no && law && law.articles[no] != null ? String(law.articles[no]) : null;
}
function context(item) {
  return (item.statutes || []).map(s => {
    const text = artText(s.law, s.article);
    return text == null ? `【${s.law}第${s.article}條：資料庫查無】` : `【${s.law}第${s.article}條】\n${text}`;
  }).join('\n\n') || '（本題未提供法條，無法確認；不代表全部現行法規均無規定。）';
}
const instructions = '你是台灣人民團體法規初審助手。只能依提供的法條原文回答，逐字引用，不得臆測。原文沒有寫時，限縮為「本題提供原文未載」，不得宣稱全部法規均無明文。回覆 JSON：{"conclusion":"一至三句結論","cites":[{"law":"法規全名","article":"條號","quote":"自原文逐字摘錄的一段"}],"confidence":"high|medium|low","gaps":"原文不足、來源完整性或需承辦確認之處"}。本結果是草稿，須人工實質審查。';
async function ask(item, ctx) {
  if (process.env.GPT_MOCK) {
    const replies = JSON.parse(fs.readFileSync(process.env.GPT_MOCK, 'utf8'));
    return replies[item.id] || null;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('未設定 OPENAI_API_KEY');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o', temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: '問題：' + item.question + (item.claim ? '\n待驗證的現行說法：' + item.claim : '') + '\n\n可用法條原文：\n' + ctx }
      ]
    })
  });
  if (!response.ok) throw new Error('OpenAI HTTP ' + response.status);
  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}
(async () => {
  const items = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  if (!Array.isArray(items)) throw new Error('題單必須是 JSON 陣列');
  if (brief) {
    let md = '# 請 ChatGPT 初審（貼整份）\n\n' + instructions + '\n最後將所有題目合成一個 JSON：{"題目id":該題物件,...}。\n\n';
    for (const item of items) md += `---\n## 題目id：${item.id}\n問題：${item.question}\n` + (item.claim ? `待驗證的現行說法：${item.claim}\n` : '') + '\n可用法條原文：\n' + context(item) + '\n\n';
    fs.writeFileSync('verify/brief.md', md);
    console.log('已產生 verify/brief.md；法源不完整時須補查，不能直接推論無明文。');
    return;
  }
  const report = [];
  for (const item of items) {
    let reply = null;
    let error = null;
    try { reply = await ask(item, context(item)); } catch (e) { error = e.message; }
    const verification = checkReply(item, reply, byName);
    if (error) verification.problems.unshift('呼叫失敗：' + error);
    report.push({ id: item.id, question: item.question, gpt: reply, ...verification });
    console.log(`[${verification.status}] ${item.id} ${item.question}`);
    for (const p of verification.problems) console.log('  - ' + p);
  }
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log('報告已寫入 ' + outFile + '；所有題目仍須人工實質審查。');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
