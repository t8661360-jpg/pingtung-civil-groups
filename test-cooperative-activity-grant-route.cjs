const assert=require('node:assert/strict');
const {activityGrant}=require('./cooperative-activity-grant-route.js');
for(const q of ['合作社可以申請縣府社會處的活動補助嗎，跟協會一樣嗎？','屏東勞動合作社幫社區辦課，有資格直接拿社會團體的活動經費嗎？','縣級合作社要申請合作事業補助，哪裡送？']){
 const a=activityGrant(q);assert.ok(a,q);const s=JSON.stringify(a);
 for(const w of ['不能直接套協會資格','送內政部核辦','合作教育','六月底前','課程表'])assert.ok(s.includes(w),q+' '+w);
}
for(const q of ['協會志工保險能用縣府活動補助嗎？','信用合作社有資格申請活動補助嗎？','合作社要申請貸款利息補助？'])assert.equal(activityGrant(q),null,q);
console.log('縣府補助公告和中央核轉分開通過');
const a=activityGrant('社會團體和合作社一起辦公益課，還不確定是哪個單位補助，能用合作社名義填申請嗎？');
assert.equal(a?.choices?.length,2);
assert.match(a.summary,/先不要用合作社或協會名義送件/);
assert.match(JSON.stringify(activityGrant(a.choices[0].question)),/先看該案列的申請對象/);
assert.match(JSON.stringify(activityGrant(a.choices[1].question)),/送內政部核辦/);
assert.match(JSON.stringify(activityGrant('合作社可以申請縣府社會處的活動補助嗎，跟協會一樣嗎？')),/社員權益淨值不得為負數/);
const {changeGrant}=require('./cooperative-activity-grant-route.js');
const mix=changeGrant('合作社不是協會。收到企業捐款要用於社員福利，可是收到的其實是指定買設備的補助，可以挪嗎？');
assert.match(mix.summary,/先不要挪用/);
assert.equal(mix.choices.length,3);
const [central,local,funder]=mix.choices.map(x=>changeGrant(x.question));
assert.match(central.steps[0][1],/不予核銷，並停止補助一年/);
assert.match(central.refs[0].source,/eg032053/);
assert.match(local.steps[0][1],/向原補助機關確認/);
assert.doesNotMatch(JSON.stringify(local.steps),/停止補助一年/);
assert.match(funder.steps[0][1],/民法第412條/);
assert.doesNotMatch(JSON.stringify(funder.steps),/停止補助一年/);
assert.match(changeGrant('想將設備補助挪去發福利。我們是合作社，縣府核定的。').summary,/原核定用途/);
assert.match(changeGrant('合作社有兩筆錢：內政部合作事業補助、公司指定捐款。能改用來發社員福利嗎？').summary,/帳務及用途不能混在一起/);
for(const q of ['協會設備補助要怎麼改用？','合作社想申請內政部的設備補助','合作社收到企業捐款，可以開收據嗎？','信用合作社補助能不能改用？','不是合作社，是協會的補助要改用'])assert.equal(changeGrant(q),null,q);
