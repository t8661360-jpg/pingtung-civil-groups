'use strict';
const assert=require('node:assert/strict');
const {route}=require('./community-association-continuity.js');
const counter=require('./directory-count-intent.js');
function verify(q,patterns,prior){
 const a=route(q,prior);assert.ok(a,q);
 for(const r of patterns)assert.match(JSON.stringify(a),r,q);
 return a;
}
const a=verify('社區發展協會想改成一般協會，原會員要全部重新入會嗎？',[/不能先斷定原會員/,/不能只靠修章/,/社區發展工作要點/]);
assert.equal(a.choices.length,3);
for(const [i,r] of [/原則不超出一個鄉鎮市/,/原會員不會自動加入/,/會址不會使原會員一律重新入會/].entries()){
 verify(a.choices[i].question,[r]);
}
verify('另成立新協會',[/不同團體/,/補助器材/],a.continuityContext);
assert.equal(route('另成立新協會'),null);
verify('原本是社區發展協會；如果只能另成立一般協會，舊會員、帳戶、補助器材和章程能不能直接搬過去？',[/立案證書也不能沿用/,/所有權/,/不是直接移轉/,/不直接接用舊會帳戶/]);
verify('我是社區發展協會，想擴到別的鄉、改名稱、改宗旨、不換負責人、會員不重入，可以直接報縣府修章嗎？',[/不能只靠一場修章/,/三分之二以上同意/,/會籍不直接歸零/]);
const b=verify('名稱、服務區和地址都要改，但我們不想解散，原會員和立案證書可以沿用嗎？',[/先補一項/,/原本是一般社會團體/]);
assert.equal(b.choices.length,2);
verify(b.choices[0].question,[/原則不超出一個鄉鎮市/]);
verify(b.choices[1].question,[/不直接套用社區發展協會/]);
verify('更正，我們不轉型，只是同一個社區發展協會換會址，會籍不變。',[/不會使原會員一律重新入會/,/新址使用證明/]);
for(const q of ['協會改宗旨要怎麼修章？','新題：萬丹鄉團體多嗎？','社區發展協會會員搬到別的縣但想續會是否要重入？','合作社改成一般協會，社員要重入嗎？'])assert.equal(route(q,a.continuityContext),null,q);
const alias='萬丹鄉社區發展類存續多少？',directory=require('./data/directory.json'),towns=['萬丹鄉','佳冬鄉'];
const expected=directory.rows.filter(x=>x.d==='萬丹鄉'&&x.t==='社區發展協會'&&x.s!=='已解散').length;
assert.ok(expected>0);
for(const q of [alias,'新題：'+alias]){
 const plan=counter.query(q,towns,[],null);
 assert.deepEqual(plan.filters,[{name:'社區發展協會',key:'t',at:3}]);
 assert.match(counter.response(q,plan,directory.rows,directory.meta).summary,new RegExp('社區發展協會：存續 '+expected+' 個'));
}
assert.equal(counter.query('萬丹鄉社區發展類協會改章程需要幾個會員',towns,[],null),null);
console.log('Community continuity, directory alias, choices and exclusions passed');
