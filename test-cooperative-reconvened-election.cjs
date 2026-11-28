'use strict';
const a=require('node:assert/strict');
const { route, continuation, eligibleTotal }=require('./cooperative-reconvened-election');
const all=x=>x.summary+' '+x.steps.flat().join(' ');
const first='屏東一般合作社在選理監事，章程准許流會後用三分之一。共有73人能投票，前天只到35人，今天打算直接重開，通知可不可以等到下禮拜再補？';
const res=route(first);
a.match(all(res),/至少25人.*首次至少37人.*流會後15日內.*預留7日.*不能先開再補通知/);
a.equal(eligibleTotal('只有35人到會'),null);
const original='屏東這間一般合作社要選理監事，不是合作社聯合社，也不是社員代表大會。具資格有110人，第一次沒超過一半，章程寫三分之一。延期後最少要多少人、何時重開、怎麼通知，還能沿用舊委託書嗎？';
a.match(all(route(original)),/首次至少56人。重開至少37人/);
const second='我們合作社要重開流會的社員大會，這次選理監事不是選社員代表。80個有資格，原本收到的委託一張只寫上次日期，另外兩張都讓同一個人代理。可不可以改線上電子投票，發書面通知要不要報主管機關？';
let r=route(second);
for(const p of [/至少27人.*至少41人/,/只限上次日期.*不能拿來/,/只能接一份有效委託/,/不能把社員代表選舉的通訊或電子投票例外/,/報主管機關備查/])a.match(all(r),p);
const no='我們是屏東合作社，第一次社員大會差幾人才過半就沒選成。章程沒寫重開可降到三分之一，理事主席卻排在流會後第16天，還說候選人改名單便不另外寄。兩位受託人各帶兩張舊委託。公告、書面通知、到場人數要怎麼補救？';
a.match(all(route(no)),/重開仍須全體具資格者過半數.*第16天.*不是15日內/);
const q='更正，不是社員大會選理監事，是理事會要另選理事主席；沒有要讓社員委託，理事共有7位。通知和出席的規定要怎麼看？';
r=route(continuation(no,q));a.match(all(r),/至少須4位出席.*首輪當選.*出席人數的一半/);
a.match(all(r),/出缺後一個月.*未滿六個月/);a.doesNotMatch(all(r),/重開至少|准許按三分之一/);
const unknown='一般合作社有121位可以投票，社員大會選理事流會，要重開。還沒查章程，最少幾人？';
r=route(unknown);a.match(all(r),/至少41人.*至少61人/);a.equal(r.choices.length,2);
for(const [i,n] of [41,61].entries()){const x=route(r.choices[i].question);a.match(x.summary,new RegExp('重開(?:仍須)?至少'+n+'人'));a.equal(x.choices,undefined);}
const representative='一般合作社選社員代表，第一次流會，要重開。可以改通訊投票、請同社的人代理嗎？';
a.match(all(route(representative)),/另須章程及選務規則.*不得用委託代理/);
for(const input of ['信用合作社的社員代表選舉流會後要重開，如何通知？','我們不是合作社，是協會，會員大會第一次流會，重開可以只要三分之一嗎？','屏東合作社選理監事，第一次會議有過半已經選出，得票最高但不到半能當選嗎？','我們是合作社聯合社，理監事選舉流會重開，章程可用三分之一嗎？','佳冬鄉的文化類團體有幾個？'])a.equal(route(input),null,input);

a.equal(route('我們不是合作社，是協會會員大會選理監事，流會後能重開嗎？'),null);
a.equal(route('合作社和協會會員大會選理監事流會，各自能重開嗎？'),null);
a.match(route('我們是一般合作社，不是信用合作社，社員大會選理監事流會，重開能只要三分之一嗎？').summary,/流會後15日/);
