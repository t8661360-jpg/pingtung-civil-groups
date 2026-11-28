const assert=require('node:assert/strict');
const {route}=require('./cooperative-meeting-ballots.js');
const answer=q=>JSON.stringify(route(q));
for(const [q,good,bad] of [
 ['我們是一般合作社，250個社員要分組選社員代表，理事會才通過，沒報備可郵寄嗎？',[/還未備查，不要寄選票/,/章程還要明訂/,/不得委託代理/],[/應於15日內重開/]],
 ['代表已選完，合作社代表大會想視訊、線上選理事和通過財報，只備查過選社員代表',[/不能沿用/,/指揮中心解編/,/監事會審核/],[/先確認有沒有設社員代表的依據/]],
 ['合作社的社員大會流會兩次，財報修章七天回郵，另外用LINE選監事',[/至少10日/,/7日是第46條/,/選舉會議人數不足流會/,/一個月內檢具紀錄/],[]],
 ['合作社的社員代表大會流會兩次，寄給代表修章表決可以嗎？',[/不要直接套用/,/適用規定/],[/不要寄選票/]],
 ['合作社流會兩次，財報可以寄給社員表決嗎？另外理監事可不可以用LINE群組投票？',[/不能沿用/,/至少10日/],[]],
 ['信合社郵寄選社員代表是否可以？',[/專門選舉規定/,/G0380069/],[/超過200名/]],
 ['更正：不是合作社，是一般協會會員大會，章程有視訊條款，只報告年度決算，不選人',[/一般協會章程已明訂/,/人民團體法第25條/],[/合作社法第51條/]]
]){
 const s=answer(q);for(const r of good)assert.match(s,r,q);for(const r of bad)assert.doesNotMatch(s,r,q);
}
const ambiguous=route('合作社社員大會可以郵寄投票嗎？');
assert.equal(ambiguous.choices.length,3);
for(const {question,label} of ambiguous.choices){
 const a=route(question);assert.ok(a.title&&a.steps.length,label);
}
for(const q of ['合作社監事可以兼做會計嗎？','合作社普通修章需要原社員重新入社嗎？','協會幾天前寄開會通知？','新題：恆春鎮全部存續團體幾個？'])assert.equal(route(q),null,q);
console.log('合作社會議及選務途徑分流通過');
