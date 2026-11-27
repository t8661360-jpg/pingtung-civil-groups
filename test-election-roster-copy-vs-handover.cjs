const assert=require('node:assert/strict');
const {electionRosterCopy}=require('./member-roster-access.js');
for(const q of ['協會改選前會員名冊可以影印帶回家嗎？','會員大會要改選，我可拍照帶走當天選舉人名冊嗎，還是只能當場閱覽？']){
 const a=electionRosterCopy(q);assert.match(a.summary,/依法可閱覽/);assert.match(a.summary,/並未規定必須讓會員影印/);assert.match(a.summary,/合法用途及必要範圍/);
}
for(const q of ['前任名冊移交新任理事長，改選後可以影印帶走嗎？','協會選舉時名冊可提供非會員影印？','合作社可影印選舉人名冊嗎？','協會改選前可以去查閱名冊嗎？'])assert.equal(electionRosterCopy(q),null,q);
const {rosterHandover}=require('./association-roster-handover.js');
const mixed=rosterHandover('先問新任理事長的名冊移交，再問影印。前任可以把舊名冊交給私人保管嗎？');
assert.match(JSON.stringify(mixed.steps),/移交清冊/);
assert.match(JSON.stringify(mixed.steps),/影印另看是交接備份，還是私人副本/);
assert.match(JSON.stringify(mixed.steps),/不把名冊任意交給私人/);
