const a=require('node:assert/strict');
const {route,counts,isCountReply}=require('./association-assembly-recount.js');
const flat=r=>r.steps.flat().join(' ');
const originals=[
'一般協會開會員大會，100個應到、簽到60個，後來有人離席，依法通過清點動議只剩49個。還能表決除名嗎？修章可不可以等幾個人回來補票？已排的補選還能辦嗎？紀錄要怎麼報？',
'會員大會紀錄要報嗎？協會100人應到，依法重新清點只剩49人；補選還可以做、等人回來再投修章或除名嗎？'
];
for(const q of originals){
 const r=route(q);a.ok(r,q);
 a.match(r.summary,/49人.*門檻51人.*應宣布散會.*不能再補票.*不能接著補選/);
 a.match(flat(r),/不能等幾位回來.*擇日依法召集.*不因後來離席就一律自動無效.*閉會後30日內/);
 a.equal(r.choices,undefined);
}
const equal=route('協會會員大會應出席一百人，簽到六十；清查動議有通過，重新點五十一位在場。除名要幾票、補選也用那個門檻嗎？');
a.match(equal.summary,/51人達51人/);
a.match(flat(equal),/至少需34票同意.*不能把三分之二當作補選的當選門檻.*未達章程所定名額三分之二/);
const denied=route('一般協會會員大會有人離席，清查動議沒過。票數基準要不要改？紀錄閉會後多久報？');
a.match(denied.summary,/未依法通過清查動議/);
a.match(flat(denied),/不因有人離席就必然散會.*閉會後30日內/);
const ambiguous=route('我們協會會員大會應到100人，簽到60人，中途離席後在場49人，能補選和表決除名嗎？');
a.equal(ambiguous.choices.length,2);
a.match(route(ambiguous.choices[0].question).summary,/應宣布散會/);
a.match(route(ambiguous.choices[1].question).summary,/未依法通過清查動議/);
const later='協會會員大會有人離席，清查動議已通過，但還想問除名、補選和紀錄。';
a.equal(route(later).followQuorumCounts,true);
a.equal(isCountReply('應到100人、清查後49人'),true);
a.equal(isCountReply('協會要改選理事長，應到100人'),false);
a.match(route(later+'；補充：應到100人、清查後49人').summary,/應宣布散會/);
a.match(route(later+'；補充：應到100人、清查後140人；補充：清查後49人').summary,/應宣布散會/);
a.equal(route('我們合作社社員大會有人離席，清點不夠還能表決嗎？'),null);
a.equal(route('我們協會不是會員大會，是理事會，清點人數夠不夠？'),null);
a.deepEqual(counts('100個應到、簽到60個、合法清點只剩49個'),{total:100,sign:60,now:49});
console.log('assembly recheck: motion state, threshold, each agenda and meeting record passed');
a.equal(counts('應到一百二人').total,null);
a.equal(counts('應到一零零人').total,100);
a.equal(counts('應到一百零二人').total,102);
