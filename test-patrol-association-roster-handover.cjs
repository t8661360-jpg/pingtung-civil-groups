'use strict';
const assert=require('node:assert/strict');
const {rosterHandover:answer}=require('./association-roster-handover');
const original='協會剛交接，新的理事長可以把整份會員名單帶回家保管嗎，能再要會員的身分證影本嗎？';
for(const q of [
 original,
 '協會要會員重交身分證影本嗎？新任理事長交接後可把會員名冊放在私人雲端保存嗎？'
]){
 const a=answer(q);
 assert.match(a.summary,/自行把整份會員名單帶回家.*不是重新向會員索取身分證影本的依據/);
 const body=a.steps.flat().join(' ');
 assert.match(body,/就任後十五日內會同監交人接收/);
 assert.match(body,/沒有要求附每位會員的身分證影本/);
 assert.match(body,/不是每|這個十五日規定是每屆理監事改選/);
}
const old=answer('前任理事長卸任了，還能把原本的會員名冊放在自己手機備份嗎？我們協會理監事已改選。');
assert.match(old.summary,/沒有另外的授權或合法保留依據/);
assert.match(answer('前任理事長卸任了，還能把原本的會員名冊放在自己手機備份嗎？我們理監事已改選。').summary,/若屬其他團體，還要核對專法/);
assert.match(old.steps[0][1],/不要把團體為會務仍需要的唯一原檔一併刪除/);
const noOffice=answer('我是協會新理事長，協會沒有辦公室，會員資料暫時放我家有什麼條件？');
assert.match(noOffice.steps[0][1],/未一律寫「只能放辦公室」.*書面指定保管人/);
for(const q of [
 '我想入會，協會要我的身分證正反面，只有出示正本可以嗎？',
 '合作社換理事主席，前任可把社員名冊留在私人雲端嗎？',
 '協會理事長可以把會員名單公開在官網嗎？',
 '協會新任理事長交接要給我什麼文件？',
 '協會成立大會的發起人資料需要身分證影本嗎？'
])assert.equal(answer(q),null,q);
console.log('roster custody, proper handover and limited ID copies OK');
