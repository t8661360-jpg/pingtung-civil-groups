'use strict';
const a=require('node:assert/strict');
const {route}=require('./association-canceled-grant-in-kind');
const orig='屏東協會已核定補助辦活動，活動取消還有剩款；但收到民眾主動捐的物資想全送出去，這算勸募嗎、收據怎麼開、要向哪裡辦補助核銷或繳回、會計報告怎麼留紀錄？';
const reverse='民眾自己送物資，我們沒有公開募，這批物資全轉贈要開什麼收據、怎麼作帳？另外縣府補助的活動取消，剩下的補助要退還哪一單位？';
const x=route(orig),y=route(reverse);
a.match(x.steps[0][0],/^取消活動/);
a.match(y.steps[0][0],/^民眾自己送/);
const [p,n]=x.choices.map(c=>route(c.question));
a.match(p.steps[0][1],/第8-1點繳回.*不能直接當成取消後的期限/);
a.match(n.steps[0][1],/沒有該筆已收款可退/);
for(const z of [p,n]){
 a.match(z.steps.flat().join(' '),/第5條.*第6條/);
 a.match(z.steps.flat().join(' '),/每6個月.*5個月內/);
 a.match(z.steps.flat().join(' '),/收受清冊.*受領證明/);
 a.equal(z.choices,undefined);
}
a.equal(route('屏東縣府補助活動沒有取消，收到民眾主動捐物資，怎麼記？'),null);
a.equal(route(orig+'我們已有勸募許可。'),null);
a.match(route(orig+'捐贈人指定給這次活動。').steps.flat().join(' '),/不因活動取消就自行改作他用/);
