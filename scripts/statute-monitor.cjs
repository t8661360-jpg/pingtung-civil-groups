#!/usr/bin/env node
// 法規異動監測：把 data/statutes.json.gz 內每一部法規，與 kong0107/mojLawSplitJSON
// （每日自法務部全國法規資料庫開放資料拆分）比對，輸出 STATUTE_CHANGES.md。
// 用法：node scripts/statute-monitor.cjs [--out STATUTE_CHANGES.md]
// 結束碼：0 無異動／1 有異動／2 抓取全部失敗
const fs = require('fs'), zlib = require('zlib'), https = require('https');
const { createHash } = require('node:crypto');
const BASE = 'https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/master/';
const outPath = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'STATUTE_CHANGES.md';

const norm = s => String(s || '').replace(/\s+/g, '').replace(/ㄧ/g, '一');

// Confirmed against PDPC's effective/published Article 12 comparison on 2026-11-26.
const PDPC_ARTICLE_12 = 'https://www.pdpc.gov.tw/News_Html/100/';
const fingerprint = s => createHash('sha256').update(norm(s)).digest('hex');
function classifyDiff(pc, diff, remote) {
  if (pc !== 'I0050021' || diff.n !== '12') return diff;
  const date = String(remote['生效日期'] ?? '').trim();
  const metadata = remote['生效內容'];
  const pending = diff.kind === '修訂條文'
    && String(remote['最新異動日期']) === '20251111' && date === '99991231'
    && fingerprint(metadata) === '8742012fa219321c9ba5150df12f377f84c4d8cbc194b0dadf79d3ccd5c87edf'
    && fingerprint(diff.before) === '0626870369cab07c442311b836d37f0d140b4879197e831f3a6859fb5beca77e'
    && fingerprint(diff.after) === 'e51251507adf88911d0e3acfd723c779a118a3d80a6e91befd7f15478973ab5b';
  return { ...diff, pending, reviewCommencement: !pending, date };
}

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'pingtung-civic-counter-monitor' } }, r => {
      if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
      let d = ''; r.setEncoding('utf8'); r.on('data', c => d += c); r.on('end', () => res(d));
    }).on('error', rej).setTimeout(20000, function () { this.destroy(new Error('timeout')); });
  });
}

async function monitor(laws, fetch = get, today = new Date().toISOString().slice(0, 10)) {
  const updateDate = (await fetch(BASE + 'UpdateDate.txt').catch(() => '?')).trim();
  const changes = [], failed = [], same = [], pending = [];
  for (const [pc, law] of Object.entries(laws)) {
    let remote;
    try { remote = JSON.parse(await fetch(`${BASE}FalVMingLing/${pc}.json`)); }
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
    const classified = diffs.map(d => classifyDiff(pc, d, remote));
    const actionable = classified.filter(d => !d.pending);
    const deferred = classified.filter(d => d.pending);
    for (const d of deferred) pending.push({ pc, name: law.name, ...d });
    if (actionable.length || nameChanged) changes.push({ pc, name: law.name, remoteName: remote['法規名稱'], remoteDate: remote['最新異動日期'], localDate: law.modified, url: remote['法規網址'], diffs: actionable, nameChanged, dateChanged });
    else if (!deferred.length) same.push(pc);
  }
  const pendingOnly = pending.filter(d => !changes.some(c => c.pc === d.pc)).length;
  let md = `## 法規監測結果 ${today}\n\n來源資料日期：${updateDate}（法務部全國法規資料庫，經 mojLawSplitJSON 拆分）\n比對：${Object.keys(laws).length} 部；一致 ${same.length}；待核對異動 ${changes.length}；僅待施行 ${pendingOnly}；抓取失敗 ${failed.length}\n\n`;
  for (const c of changes) {
    md += `### ⚠️ ${c.name}（${c.pc}）\n${c.url || ''}\n本地版本日期 ${c.localDate || '?'} → 線上最新異動 ${c.remoteDate || '?'}\n`;
    if (c.nameChanged) md += `- 法規名稱變更：${c.name} → ${c.remoteName}\n`;
    for (const d of c.diffs.slice(0, 30)) {
      md += `- **${d.kind} §${d.n}**\n`;
      if (d.reviewCommencement) md += `  - **施行狀態須另核對**：來源生效日期欄為 ${d.date || '缺值'}，與已確認的待施行版本不再完全相符。請以行政院施行令與[個資主管機關](${PDPC_ARTICLE_12})為準，勿視為已生效。\n`;
      if (d.before) md += `  - 前：${String(d.before).slice(0, 120)}${d.before.length > 120 ? '…' : ''}\n`;
      if (d.after) md += `  - 後：${String(d.after).slice(0, 120)}${d.after.length > 120 ? '…' : ''}\n`;
    }
    if (c.diffs.length > 30) md += `- …另有 ${c.diffs.length - 30} 條差異\n`;
    md += '\n';
  }
  if (pending.length) {
    md += '### 已公布、待施行（不列入待核對異動）\n';
    for (const d of pending) {
      md += `- ${d.name}（${d.pc}）§${d.n}：2025-11-11 公布的修正仍待行政院定施行日期；目前保留現行有效條文。[主管機關條文對照](${PDPC_ARTICLE_12})\n`;
      md += `  - 已公布修正節錄：${String(d.after).slice(0, 120)}…\n`;
    }
    md += '\n';
  }
  if (failed.length) md += `### 抓取失敗\n${failed.map(f => '- ' + f).join('\n')}\n\n`;
  md += `### 承辦人行動\n1. 到法規網址核對原文。\n2. 確認是已施行的修正後，才更新 data/statutes.json.gz，並檢查 round-fixes.js 與知識庫中引用該條的答案。\n3. 修改後執行 ./check-syntax.sh 與 node eval-arbiter.cjs 再提交。\n`;
  return { md, code: failed.length === Object.keys(laws).length ? 2 : changes.length ? 1 : 0 };
}

if (require.main === module) {
  const local = JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')).toString('utf8'));
  monitor(local.laws || {}).then(({ md, code }) => {
    fs.writeFileSync(outPath, md);
    console.log(md.split('\n').slice(0, 4).join('\n'));
    process.exitCode = code;
  }).catch(e => { console.error(e); process.exitCode = 2; });
}
module.exports = { monitor, classifyDiff };
