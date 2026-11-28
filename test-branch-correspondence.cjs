'use strict';
const assert=require('node:assert/strict');
const {route}=require('./branch-correspondence');
const all=x=>JSON.stringify(x);
const local=route('地方分會的立案證書是自己的，不是總會的，想問鄉公所有沒有教室可借。沒有去法院登記也能用立案名稱發函嗎？');
assert.match(local.title,/可用立案名稱發函詢問/);
assert.match(all(local),/不需只為詢問先辦法院登記/);
const office=route('全國性協會在屏東依法核准設一個辦事處，沒有獨立立案，与一間當地合作社合辦社區課程。表格想寫辦事處、場地要簽租約、經費想給合作社代領、總會只同意活動、另外要開收據。能做哪些？');
for(const s of ['正式申請權','辦事處與聯絡人','民法第103條','共同主辦','原機關核對可否','帳戶、領款收據','書面授權'])assert.ok(all(office).includes(s),s);
const pair=route('我們同時有在屏東自己立案但沒法院登記的一個地方分會，和一個是全國總會核准設置的辦事處，承辦說兩邊都要附發文。兩個團體資料、借場地、誰代表、簽書面契約、總會口頭同意、分會印章、補助資格、款項帳戶、正式收據和主管機關窗口各怎麼分？');
assert.match(pair.title,/分別用正確名義/);
assert.match(all(pair),/自己立案的地方團體/);
assert.match(all(pair),/總會的分支/);
const cor=route('更正：沒有國外總會，也不簽約、不收補助。我們是獨立立案的地方社會團體，只有想問活動中心何時開放借用。',pair.branchCorrespondenceContext);
assert.match(cor.summary,/只是問場地開放時間/);
assert.doesNotMatch(all(cor),/補助看該案|代表簽約或收款|登記負責人/);
const unclear=route('國際獅子會的縣分會可以自己發公文給縣府嗎，還是要透過總會');
assert.equal(unclear.choices.length,4);
for(const [i,c] of unclear.choices.entries()){
 const y=route(c.question,unclear.branchCorrespondenceContext);
 assert.ok(y?.steps.length, String(i));
 if(i===2)assert.match(y.title,/境外機構辦事處/);
 if(i===3)assert.equal(y.choices,undefined);
}
for(const s of ['新題：萬丹鄉有哪些社區發展協會？','我們協會辦會員大會要幾天前通知？','合作社要跟協會共用地址需要怎麼處理租約？','台灣某銀行分行要出公文可以自己蓋章嗎？'])assert.equal(route(s,pair.branchCorrespondenceContext),null,s);
