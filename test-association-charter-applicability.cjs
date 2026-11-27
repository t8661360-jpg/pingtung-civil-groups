const assert=require('node:assert/strict');
const {charterApplicability}=require('./association-charter-applicability.js');
const cases=[
 ['協會選任職員的新章程還在等縣府核准，可以先照新職稱改選並公告結果嗎？',['不可先依新制改選','不能先依尚未核准的新規則改選','再依規定公告與報備'],[]],
 ['協會的舊章程跟新規定衝突，章程還沒報縣府，我們可以先照舊規定開會再補嗎？',['不能用牴觸已生效強制法規的舊章程開會','過渡條款','不先判定整場無效'],['四分之三']],
 ['協會舊章程與新法牴觸，還沒施行就必須照新法開會嗎？',['還沒施行或有明定過渡期'],[]],
 ['協會是社團法人嗎？我要改章程，但不知道之前有沒有在法院登記。',['立案不等於法院法人登記','查不到不等於未登記','三分之二以上同意','四分之三以上同意'],[]],
 ['協會已在法院登記為社團法人，採全體會員大會，如何修章？',['全體會員過半數出席','四分之三以上同意','全體會員三分之二以上書面同意','原登記法院'],['只有主管機關立案：']],
 ['協會已完成法院法人登記，採會員代表大會，如何修章？',['會員代表制：先確認適用門檻','11103502450'],['全體會員過半數出席']],
 ['協會只有主管機關立案，未辦法院法人登記，要怎麼修章？',['三分之二以上同意','30日內報原立案主管機關核備'],['四分之三']]
];
for(const [q,yes,no] of cases){const a=charterApplicability(q);assert.ok(a,q); const s=JSON.stringify(a);for(const v of yes)assert.ok(s.includes(v),q+' missing '+v);for(const v of no)assert.ok(!s.includes(v),q+' unintended '+v);}
for(const x of charterApplicability(cases[3][0]).choices)assert.ok(!charterApplicability(x.question).choices,x.label);
for(const q of ['協會修章又換會址，法人已登記，要先辦哪個？','合作社章程和新規定相反怎麼辦？','協會沒有照章程開會可以檢舉嗎？','協會如何申請社團法人登記？'])assert.equal(charterApplicability(q),null,q);
console.log('章程衝突與法人狀態分流通過');
