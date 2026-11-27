const assert=require('node:assert/strict');
const {mixedRoster}=require('./cooperative-inspection-association-roster.js');
const coop='一般合作社社員可以調閱其他人的社員名簿嗎？';
const ass='同一戶還有親屬是協會會員，理事長能把協會名冊留在私人設備嗎？';
const raw='合作社要查社員名簿，另外一般協會新任理事長能不能留會員名冊在私人裝置？';
for(const q of [coop+ass,ass+coop,raw]){
 const a=mixedRoster(q);assert.ok(a,q);const s=JSON.stringify(a);for(const part of ['社員或合作社債權人','第37條','協會無法管理的保管處','不能僅因名簿有個資而一律拒絕'])assert.ok(s.includes(part),q+' '+part);
}
assert.doesNotMatch(JSON.stringify(mixedRoster(coop+ass)),/就任後15日/);
assert.match(JSON.stringify(mixedRoster(raw)),/就任後15日/);
assert.equal(mixedRoster(coop),null);
assert.equal(mixedRoster(ass),null);
assert.equal(mixedRoster('信用合作社社員可以調閱其他人的社員名簿嗎？'+ass),null);
console.log('合作社查閱及協會私人保管的交叉分流通過');
assert.ok(mixedRoster('合作社想查社員名簿，協會理事長能把會員名冊留在私人裝置嗎？'));
