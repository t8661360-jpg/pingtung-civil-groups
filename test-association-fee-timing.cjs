const assert=require('node:assert/strict'); const {feeTiming}=require('./association-fee-timing.js');
const cases=[
 ['先問理事會能不能調常年會費，順便問同一次會員大會可不可以先修章再表決收新會費？',['理事會只能提案','未一律要求開兩次大會','出席者三分之二以上同意','修章與會費新額']],
 ['協會先用新常年會費通知會員，名冊存檔，但縣府還沒核備修章，能先收嗎？',['未核備不能先按新額收','不要把預告當作正式繳款通知','保留收據']],
 ['縣府核備前，協會可以先按同場通過的新常年會費通知會員嗎？章程本來有寫舊金額。',['未核備不能先按新額收','已送件或有收件證明','不能用單獨的普通收費決議取代']],
 ['協會章程寫舊額，理事會可以自己決定新會費嗎？',['單靠理事會不能直接調收','章程固定舊金額']],
 ['協會已送章程核備、公文還沒回，能先向會員按新常年會費催繳嗎？',['未核備不能先按新額收','已送件或有收件證明']],
];
for(const [q,yes] of cases){const a=feeTiming(q);assert.ok(a,q);const s=JSON.stringify(a);for(const x of yes)assert.ok(s.includes(x),q+' missing '+x);}
for(const q of ['我協會想調漲常年會費，章程需要改嗎？','合作社可否同一場大會修章繳會費？','協會退會可不可以拿回會費？','協會只修改會址需要先報備嗎？'])assert.equal(feeTiming(q),null,q);
const u=feeTiming('我不確定縣府是收件還是已核備，協會可以先按新常年會費催繳嗎？');
assert.equal(u?.choices.length,2);
assert.ok(feeTiming(u.choices[0].question)?.summary.includes('未核備不能先按新額收'));
assert.ok(feeTiming(u.choices[1].question)?.summary.includes('已到決議載明的生效日'));
const d=feeTiming('先問合作社社股能不能調，再問一般協會章程還沒核備可不可以收新會費？');
assert.ok(d?.steps[0][1].includes('至少一個月提出異議'));
console.log('調會費的章程、決議與核備先後通過');
