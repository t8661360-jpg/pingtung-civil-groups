const assert=require('node:assert/strict');
const r=require('./association-handover-refusal.js');
const original='新任理事長不肯接，舊理事長的移交清冊要給誰';
const generic=r(original);
assert.deepEqual(generic.choices.map(o=>o.label),['一般協會或社會團體','其他團體']);
assert.match(r(generic.choices[0].question).summary,/就任後15日/);
assert.match(r(generic.choices[1].question).summary,/請補充團體/);
const ambiguous='我們協會新理事長上任後第十六天仍不收清冊。監交人可以自己代收嗎？是不是印鑑和立案證書都能請縣府重新發？舊網銀帳號可以繼續給人用嗎？';
const a=r(ambiguous);
assert.match(a.summary,/已可能屆期/);
assert.equal(a.choices.length,2);
const b=r(a.choices[0].question), c=r(a.choices[1].question);
const ex=(x,...p)=>{for(const i of p) assert.match(JSON.stringify(x),i);};
ex(b,/依您提供的就任時間/,/屆期仍未完成/,/註銷並重新發給/,/不能只憑這個身分替新任理事長簽收/,/不代辦金融印鑑/,/不要共用舊任個人帳號/,/30日內/);
ex(c,/任期中只換/,/不足6個月/,/一個月內補選/,/不能直接套用整屆改選逾期失效/);
assert.doesNotMatch(c.summary,/已逾15日/);
ex(r('一般協會整屆改選，理事長上任才5天不肯接清冊，監事可代簽嗎？舊圖記失效了嗎？'),/就任後第5日/,/尚不能只因拒收就認定已逾期/,/尚未屆期/);
ex(r('圖記能不能先用？協會整屆改選，已就任16天，新任理事長不接、舊任無法點交，能由常務監事代收嗎？'),/依您提供的就任時間/,/原備查圖記失其效力/);
ex(r('前一任把銀行權限和存摺扣住，協會要換銀行的聯絡資料，縣府能幫我們改嗎？'),/原開戶機構/,/不代辦金融印鑑/);
ex(r('協會剩半年才改選，理事長臨時辭職換人，交接和重新刻章跟整屆改選一樣嗎？'),/剛好6個月不等於不足/);
ex(r('一般合作社原來的理事會主席不交接，跟監事交清冊適用人民團體15日嗎？'),/不直接套用協會的15日/,/不是移交清冊的期限/);
ex(r('協會借會員的私人存摺收會費，前理事長不交接，新理事長是不是換一下印鑑就能用？'),/私人帳戶不能只換印鑑/,/不要繼續用該戶收會費/);
for(const q of [
 '我們協會只換了理事長，在農會原有存款，印鑑要重做嗎？',
 '協會開會員大會，哪一天之前寄通知？',
 '會員名冊交接可以把個人身分證另複印嗎？',
 '信合社想換經理人，舊任扣住權限要交給誰？'
])assert.equal(r(q),null,q);
console.log('PASS chair handover, actual Issue 100 phrasing, timing, authority, financial security and jurisdiction');
