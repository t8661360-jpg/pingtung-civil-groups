#!/usr/bin/env node
// 法規異動監測：把 data/statutes.json.gz 內每一部法規，與 kong0107/mojLawSplitJSON
// （每日自法務部全國法規資料庫開放資料拆分）比對，輸出 STATUTE_CHANGES.md。
// 用法：node scripts/statute-monitor.cjs [--out STATUTE_CHANGES.md]
// 結束碼：0 無異動／1 有異動／2 抓取全部失敗
const fs = require('fs'), zlib = require('zlib'), https = require('https');
const BASE = 'https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/master/';
const outPath = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'STATUTE_CHANGES.md';

const local = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')).toString('utf8'));
const laws = local.laws || {};
const norm = s => String(s || '').replace(/\s+/g, '').replace(/ㄧ/g, '一');

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'pingtung-civic-counter-monitor' } }, r => {
      if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
      let d = ''; r.setEncoding('utf8'); r.on('data', c => d += c); r.on('end', () => res(d));
    }).on('error', rej).setTimeout(20000, function () { this.destroy(new Error('timeout')); });
  });
}

(async () => {
  const updateDate = (await get(BASE + 'UpdateDate.txt').catch(() => '?')).trim();
  const changes = [], failed = [], same = [];
  for (const [pc, law] of Object.entries(laws)) {
    let remote;
    try { remote = JSON.parse(await get(`${BASE}FalVMingLing/${pc}.json`)); }
    catch (e) { failed.push(`${law.name} (${pc})：${e.message}`); continue; }
    const rArts = {};
    for (const it of remote['法規內容'] || []) {
      if (!it['條號']) continue;
      const m = /第\s*([0-9]+(?:-[0-9]+)?)\s*條/.exec(it['條號']);
      if (m) rArts[m[1]] = it['條文內容'];
    }
    const lArts = law.articles || {}, diffs = [];
    for (const [n, t] of Object.entries(rArts)) {
      if (!(n in lArts)) diffs.push({ kind: '新增條文', n, after: t });
      else if (norm(lArts[n]) !== norm(t)) diffs.push({ kind: '修訂條文', n, before: lArts[n], after: t });
    }
    for (const n of Object.keys(lArts)) if (!(n in rArts)) diffs.push({ kind: '刪除條文', n, before: lArts[n] });
    const nameChanged = remote['法規名稱'] && remote['法規名稱'] !== law.name;
    const dateChanged = remote['最新異動日期'] && law.modified && remote['最新異動日期'].replace(/\D/g, '') !== String(law.modified).replace(/\D/g, '');
    if (diffs.length || nameChanged) changes.push({ pc, name: law.name, remoteName: remote['法規名稱'], remoteDate: remote['最新異動日期'], localDate: law.modified, url: remote['法規網址'], diffs, nameChanged, dateChanged });
    else same.push(pc);
  }
  const today = new Date().toISOString().slice(0, 10);
  let md = `## 法規監測結果 ${today}\n\n來源資料日期：${updateDate}（法務部全國法規資料庫，經 mojLawSplitJSON 拆分）\n比對：${Object.keys(laws).length} 部；一致 ${same.length}；有異動 ${changes.length}；抓取失敗 ${failed.length}\n\n`;
  for (const c of changes) {
    md += `### ⚠️ ${c.name}（${c.pc}）\n${c.url || ''}\n本地版本日期 ${c.localDate || '?'} → 線上最新異動 ${c.remoteDate || '?'}\n`;
    if (c.nameChanged) md += `- 法規名稱變更：${c.name} → ${c.remoteName}\n`;
    for (const d of c.diffs.slice(0, 30)) {
      md += `- **${d.kind} §${d.n}**\n`;
      if (d.before) md += `  - 前：${String(d.before).slice(0, 120)}${d.before.length > 120 ? '…' : ''}\n`;
      if (d.after) md += `  - 後：${String(d.after).slice(0, 120)}${d.after.length > 120 ? '…' : ''}\n`;
    }
    if (c.diffs.length > 30) md += `- …另有 ${c.diffs.length - 30} 條差異\n`;
    md += '\n';
  }
  if (failed.length) md += `### 抓取失敗\n${failed.map(f => '- ' + f).join('\n')}\n\n`;
  md += `### 承辦人行動\n1. 到法規網址核對原文。\n2. 確認是法規修正（非資料整理差異）後，更新 data/statutes.json.gz，並檢查 round-fixes.js 與知識庫中引用該條的答案。\n3. 修改後執行 ./check-syntax.sh 與 node eval-arbiter.cjs 再提交。\n`;
  fs.writeFileSync(outPath, md);
  console.log(md.split('\n').slice(0, 4).join('\n'));
  process.exit(failed.length === Object.keys(laws).length ? 2 : changes.length ? 1 : 0);
})();
