const assert=require('node:assert/strict');
const qa=require('./question-understanding.js');
const cases=[
 ['理事長任期屆滿多久以前要辦改選','election-window','social'],
 ['理監事到期前多久要改選','election-window','social'],
 ['協會何時應辦理換屆選舉','election-window','social'],
 ['任期快到期，最晚何時改選','election-window','social'],
 ['任期屆滿前30天可以改選嗎','election-window','social'],
 ['任期滿了才改選可以嗎','election-window','social'],
 ['合作社任期屆滿多久前要改選','election-window','coop'],
 ['協會改選來不及可以延期嗎','extension','social'],
 ['理事長任期可以延長三個月嗎','extension','social'],
 ['合作社改選可以延期多久','extension','coop'],
 ['協會已到期沒改選怎麼辦','overdue','social'],
 ['理事長任期過期可以繼續當嗎','overdue','social'],
 ['改選會員大會要提前幾天通知','notice','social'],
 ['改選通知要提前多久','notice','social'],
 ['理事會幾天前要寄通知','notice','social'],
 ['合作社社員大會通知幾天前寄','notice','coop'],
 ['合作社選舉通知要提前多久','notice','coop'],
 ['合作社理事會要提前多久通知','notice','coop'],
 ['理事長任期多久','term-length','social'],
 ['協會理監事一屆幾年','term-length','social'],
 ['理事長可以當幾年','term-length','social'],
 ['理事長幾年改選一次','term-length','social'],
 ['合作社理監事任期最長幾年','term-length','coop'],
 ['理事長可以連任幾次','reelection','social'],
 ['協會理事連選連任人數有限制嗎','reelection','social'],
 ['合作社理事長只能連任一次嗎','reelection','coop'],
 ['任期是從會員大會還是第一次理事會開始算','term-start','social'],
 ['合作社任期如何起算','term-start','coop'],
 ['理事長辭職後多久要補選','vacancy','social'],
 ['理事長剩五個月可以推代理嗎','vacancy','social'],
 ['理事出缺要怎麼遞補','vacancy','social'],
 ['合作社主席出缺多久要補選','vacancy','coop'],
 ['合作社監事出缺怎麼處理','vacancy','coop'],
 ['協會理監事會多久開一次','meeting-frequency','social'],
 ['合作社理事會每年要開幾次','meeting-frequency','coop'],
 ['會員大會一年要開幾次','assembly-frequency','social'],
 ['合作社社員大會多久開一次','assembly-frequency','coop'],
 ['改選要送哪些文件','documents','social'],
 ['合作社改選要準備哪些資料','documents','coop'],
 ['改選完多久要送資料給縣府','report-deadline','social'],
 ['改選流程辦完大概要多久','duration','social'],
 ['我要辦改選，要怎麼做','process','social'],
 ['人民團體法第13條法規說明','article','explicit'],
 ['工會任期屆滿多久前改選','special-law','special'],
 ['商業公會理事長可以連任幾次','special-law','special'],
 ['信用合作社何時改選','special-law','special'],
 ['屏東縣有多少文化團體','other','social'],
 ['屏東縣商業會的理事長是誰','other','social']
];
for(const [question,focus,domain] of cases){const r=qa.understand(question);assert.equal(r.focus,focus,question);assert.equal(r.domain,domain,question);}
assert.match(qa.resolve(cases[0][0]).summary,/任期屆滿前一個月內/);
assert.match(qa.resolve(cases[0][0]).summary,/不是「至少提前一個月以前完成」/);
assert.match(qa.resolve('改選可以延期多久').summary,/須申請主管機關核准/);
assert.match(qa.resolve('理事長連任幾次').summary,/連任以一次為限/);
assert.match(qa.resolve('一般理事可以連任嗎').summary,/連選得連任/);
assert.match(qa.resolve('合作社任期多久').summary,/三年/);
assert.match(qa.resolve('理監事任期多久').summary,/四年/);
assert.match(qa.resolve('會員大會通知幾天前寄').summary,/十五日前/);
assert.match(qa.resolve('合作社社員大會通知幾天前寄').summary,/七日前/);
assert.match(qa.resolve('合作社任期屆滿多久前改選').summary,/不能直接套用/);
assert.equal(qa.resolve('人民團體法第21條'),null);
assert.equal(qa.resolve('我要辦改選，要怎麼做'),null);
assert.equal(qa.resolve('工會改選多久以前'),null);
assert.equal(qa.resolve('屏東縣有多少文化團體'),null);
const prior=qa.understand('理事長任期屆滿多久前改選');
assert.equal(qa.understand('那可以延期多久',prior).focus,'extension');
assert.equal(qa.understand('那合作社呢',prior).domain,'coop');
assert.equal(qa.understand('那合作社呢',prior).focus,'election-window');
assert.equal(qa.resolve('那可以延期多久',{prior}).focus,'extension');
assert.match(qa.resolve('那可以延期多久',{prior}).summary,/主管機關核准/);
assert.match(qa.resolve('那合作社呢',{prior}).summary,/不能直接套用/);
assert.equal(qa.understand('那可以延期多久').focus,'other');
assert.equal(qa.understand('合作社呢',qa.understand('會員大會幾天前通知')).domain,'coop');
const fs=require('node:fs');const laws=JSON.parse(require('node:zlib').gunzipSync(fs.readFileSync('data/statutes.json.gz')).toString('utf8')).laws;
for(const [question] of cases){for(const row of qa.resolve(question)?.statutes||[]){const code=row.source.match(/pcode=(\w+)/)[1],n=row.title.match(/第(\d+)條/)[1];assert.ok(laws[code]?.articles[n],question+' missing statutory source');}}
console.log('Passed '+cases.length+' intent cases, 14 answer checks, 8 context checks and all statutory references.');

const noticeContext=qa.understand('\u5354\u6703\u6703\u54e1\u5927\u6703\u901a\u77e5\u9700\u8981\u63d0\u524d\u5e7e\u5929\u5bc4');
for (const question of ['\u90a3\u7406\u4e8b\u6703\u5462\uff1f','\u90a3\u76e3\u4e8b\u6703\u5462\uff1f']) {
  const response=qa.resolve(question,{prior:noticeContext});
  assert.match(response.summary,/\u4e03\u65e5\u524d/);
  assert.match(response.statutes[0].source,/D0020094/);
}
console.log('2 meeting notice followups passed');
