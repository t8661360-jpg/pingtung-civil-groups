const assert=require('node:assert/strict'); const {dissolutionNotice}=require('./association-dissolution-financial-notice.js');
const cases=[
 ['協會不是已經解散了嗎，為什麼還收到縣府要我們繳財務報表的公文？',['解散函、大會同意解散及清算完成是不同階段','先回覆發文機關','公文要的是哪一種報表？']],
 ['協會已經收到縣府解散函，現在又收到公文催去年的決算，還要理嗎？',['先確認及回覆去年度決算催報','不能用清算表替代','決算先送監事會']],
 ['協會昨天才大會決定解散，還沒有報主管機關；今天來文催去年的決算，要交哪一個？',['兩件分開','閉會後30日內報備查','不把兩件混成一份']],
 ['人民團體收到解散函，清算還沒完，縣府催財報但沒寫年度，可以把清算表當去年決算交嗎？',['不能把清算表自行當去年決算','公文要的是哪一種報表？']],
 ['社團法人協會收到解散函、法院清算未完成，縣府公文要求清算財務報表，要怎麼做？',['來文既然要求清算財報','清算必要範圍內視為存續','由法院監督']]
];
for(const [q,yes] of cases){const a=dissolutionNotice(q);assert.ok(a,q);const rr=JSON.stringify(a);for(const x of yes)assert.ok(rr.includes(x),q+' missing '+x);}
for(const x of dissolutionNotice(cases[0][0]).choices)assert.ok(!dissolutionNotice(x.question).choices,x.label);
for(const q of ['合作社清算，縣府催去年的決算','協會解散後，國稅局通知要補所得稅報表嗎？','協會一般決算要不要提大會？','民間團體買房要報財產清單嗎？'])assert.equal(dissolutionNotice(q),null,q);
assert.match(dissolutionNotice('協會去年有送決算，今年已收到解散函，清算還沒完；縣府又催同一年度的決算，我該補交還是先拿收據核對？').summary,/先用原送件收件證明核對年度和報表/);
const mixed=dissolutionNotice('我是合作社，社已經決議解散，縣府還要清算財報；跟協會以前年度決算的規定一樣嗎？');
assert.match(JSON.stringify(mixed),/第63條之1/);
assert.match(JSON.stringify(mixed),/二十日內/);
assert.match(JSON.stringify(mixed),/決算先送監事會/);
console.log('協會解散前年度財報與清算分流通過');
