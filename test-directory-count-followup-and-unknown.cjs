'use strict';
const assert=require('node:assert/strict');
const d=require('./directory-count-intent.js');
const data=require('./data/directory.json');
const locs=['萬丹鄉','佳冬鄉','內埔鄉','潮州鎮','長治鄉'];
const cats=[['學術文化團體',/文化|音樂/],['體育運動團體',/體育|運動/]];
const q=(s,p=null)=>d.query(s,locs,cats,p);
const r=(text,plan)=>d.response(text,plan,data.rows,data.meta);
const prev=q('萬丹鄉社區發展類存續多少');
const next=q('更正，萬丹鄉不要，佳冬鄉就好，其他條件一樣，只想知道總數。',prev);
assert.deepEqual(next.regions,['佳冬鄉']);
assert.deepEqual(next.filters,prev.filters);
assert.match(r('更正',next).summary,/社區發展協會：存續 11 個/);
const old=q('新題：只算佳冬鄉已解散團體的總數。');
const changed=q('更正，佳冬鄉不要，萬丹鄉就好，其他條件一樣，只想知道總數。',old);
assert.deepEqual(changed.regions,['萬丹鄉']);assert.equal(changed.scope,'gone');
for(const [q0,num] of [['另外問：佳冬鄉文化類存續有幾個？',5],['另問：內埔鄉文化類存續有幾個？',38],['新題：萬丹鄉全部名冊類別存續有幾個？',data.rows.filter(x=>x.d==='萬丹鄉'&&x.s!=='已解散').length]]){
 const a=q(q0,prev);assert.equal(a.kind,'count');assert.match(r(q0,a).summary,new RegExp('存續 '+num+' 個'));
}
const missing='我不是在查會員名冊，想問潮州鎮健走類協會存續多少個？';
assert.deepEqual(q(missing),{kind:'unsupported',name:'健走類',regions:['潮州鎮']});
assert.match(r(missing,q(missing)).summary,/不會把它算成 0/);
assert.equal(q('另問：潮州鎮體育運動類存續多少？').filters[0].name,'體育運動團體');
assert.equal(q('我想查佳冬鄉一個叫做『另問協會』的聯絡地址。',prev),null);
assert.equal(q('我只想找內埔鄉會員名冊，不是團體分類。',prev),null);
assert.deepEqual(q('新題：萬丹鄉全部存續團體多少，和佳冬鄉全部存續團體分開？',prev).regions,['萬丹鄉','佳冬鄉']);
console.log('Directory reset aliases, negated region, carried filters and unsupported category passed');
