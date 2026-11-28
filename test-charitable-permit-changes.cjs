const {route,follow}=require('./charitable-permit-changes.js');
const assert=require('node:assert/strict');
const q=[
 "我們受核准公開募款是做社區送餐，要延長收款再把原本送餐改成買設備，捐款人不同意怎麼辦？",
 "屏東某協會本來核准公開募款做偏鄉課輔，建議延長募款期間、把一部分改買車，捐款人指定買教材，活動剩款想留三年，紙本帳上少一筆一萬元以上的現金付款，還要把過去公告改成公開姓名；同月收到沒有邀募的企業捐物，想跟核准募款一起報，企業要捐物收據。先辦什麼、哪些可做、哪些要報准？",
 "更正，不是要改公開姓名，捐款人反而明確要求不公開名字；大筆款仍沒付，其他都一樣。",
 {
  "q": "公益勸募原本核准做社區送餐，想延長募款期間，這樣要先報准嗎？",
  "choose": "還在原核准期間"
 },
 {
  "q": "公益勸募原來核准做課輔，要延長募款期間。主管機關怎麼辦？",
  "choose": "原許可已期滿"
 },
 "換一題：會員大會是否可以委託其他會員代為出席",
 "公益勸募結案成果報告要延期怎麼辦？"
];
const a=route(q[0]);
assert.equal(a.choices.length,2);
const text=x=>x.steps.map(z=>z.join('：')).join('\n');
for(const x of ['七日前','最長一年','重新申請','後七日內','一個月異議期','應返還'])assert.ok(text(a).includes(x),x);
const before=route(a.choices[0].question), after=route(a.choices[1].question);
assert.match(before.summary,/還在原期內/);
assert.match(text(before),/於預定變更事實發生七日前/);
assert.doesNotMatch(text(before),/逾期已募集/);
assert.doesNotMatch(text(after),/於預定變更事實發生七日前/);
assert.match(text(after),/逾期已募集的財物依法返還/);
assert.equal(before.choices,undefined);assert.equal(after.choices,undefined);
const long=route(q[1]);
for(const x of ['賸餘','三個月內','三年','一萬元','時','完整姓名','企業','五個月'])assert.ok(text(long).includes(x),x);
assert.ok(follow(q[2]));
const updated=route(q[1]+'；更新資料：'+q[2]);
assert.match(text(updated),/你已說尚未付/);
assert.doesNotMatch(text(updated),/若已付現/);
assert.match(text(updated),/完整姓名/);
assert.match(text(updated),/企業/);
for(const x of q.slice(5))assert.equal(route(x),null);
assert.equal(follow('換一題，合作社怎麼辦？'),false);
assert.equal(route('縣府補助活動要延長使用期限嗎？'),null);
assert.equal(route('公開募款買設備，不是選舉募款；單純想問收據'),null);
assert.equal(route('勸募期間可以延長嗎').choices.length,2);
assert.match(route('公益勸募原許可已經期滿了，又收企業兩筆現金，還能展延公益勸募期限嗎？').summary,/原許可已期滿/);
console.log('charitable permit changes cases passed');
