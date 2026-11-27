const assert=require('node:assert/strict');
const {overdueTerm}=require('./association-overdue-term-signing.js');
for(const [q,wants] of [
 ['任期過了一年都沒改選，理事長還有權簽約嗎，縣府會怎樣？',['如果您問的是一般協會','最長三個月','不能靠這個規定補稱原任自動續任','第58條','不是逾期即自動罰款']],
 ['協會任期過期半年沒有改選，也沒核准延期，前理事長可以簽三年租約嗎？',['不要先用舊名義簽新長期租約','不因逾期改選一律有效或無效']],
 ['協會已依法按期改選了，但新屆第一次理事會還沒開，理事長能簽例行急件嗎？',['自大會閉會第7日至第15日','仍有權的原屆','新長約']],
 ['縣府會怎樣？我們協會理事長還能代表簽約嗎？任期已到期九個月都沒有改選。',['第5點把任期屆滿未改選列為不予補助','指定理事召集']],
]){
 const answer=overdueTerm(q);assert.ok(answer,q);const s=JSON.stringify(answer);for(const k of wants)assert.ok(s.includes(k),q+' missing '+k);
}
for(const q of ['信用合作社任期過期半年沒改選，理事長可簽約嗎？','商業同業公會理事長任期到期沒有改選，可以續簽契約嗎？','協會理事長任期還有多久，現在約還沒到期可否簽約？','協會改選後第一次理事會應在幾天內開？'])assert.equal(overdueTerm(q),null,q);
console.log('逾期、按期交接與其他組織分流通過');
const alt=['協會任期過期一年沒改選，縣府會怎樣？','臨時會員大會通知沒有列除名，現場能加案嗎？'];
for(const q of [alt.join('另外'),[...alt].reverse().join('另外')]){
 const a=overdueTerm(q),s=JSON.stringify(a);assert.match(a.title,/分開判斷/);assert.match(s,/第58條/);assert.match(s,/第1010320591號/);assert.match(s,/過半數出席/);assert.match(s,/出席者至少三分之二同意/);
}
const missing=overdueTerm('我們協會要簽租約，不知道有沒有按期改選，現在可以用印嗎？');
assert.equal(missing?.choices?.length,2);
assert.match(overdueTerm(missing.choices[0].question)?.title,/逾期未改選/);
assert.match(overdueTerm(missing.choices[1].question)?.title,/依法按期改選後/);
assert.match(JSON.stringify(overdueTerm('協會任期到期沒改選，又要換會址租約，可以簽嗎？')),/會址使用同意/);
const r=require('./association-overdue-term-signing.js').overdueTerm;
assert.match(r('社區協會理事長改選拖了很久，繼續租場地辦活動，團體是否一定負擔租金？').summary,/不能只憑.*要付租金或可以拒付/);
assert.match(JSON.stringify(r('協會剛收到租金請款，當初承租的是已經卸任的理事長。當時章程不同意他簽；現在場地也用過了，協會能拒付嗎？').steps),/也不能只憑章程不同意、前任簽名就直接拒付/);
assert.match(r('先問租約，再問開會。我們只知道是協會，有人要租場地辦活動還沒簽；如果還要開會通過，該開哪一種？').summary,/不是每次租場地都必須開大會/);
for(const q of ['合作社理事主席任期過了，想再簽辦公室租約和改社址，能不能一起處理？','協會活動租金支出如何核銷？','公寓管委會理事長卸任簽租約，還要付租金嗎？'])assert.equal(r(q),null,q);
