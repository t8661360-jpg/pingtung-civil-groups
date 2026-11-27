const a=require('node:assert/strict');
const {grant,tax}=require('./association-fiscal-cases.js');
const flat=r=>r.steps.flat().join(' ');
const g1='我們屏東協會活動已收到縣府補助，另一機關也想補同一場活動；可以重複用同張發票嗎？講師臨時換了想把講師費轉成餐費，能不能先花再補報？活動結束後多久核銷？剩款去哪退？發票是用個人抬頭的要怎麼辦？';
const g2='拿了屏東縣府補助後，發票開個人、還有剩款與未核銷，幾天內要送、退給哪一機關？另一機關也要補同一活動，可以拿同張發票報兩邊嗎？講師費拿來付餐費能事後補嗎？';
for(const q of [g1,g2]){
 const r=grant(q);a.ok(r,q);
 for(const s of ['第11點','第8點要求分列','不可以','20日內','找原','不能自行','第24條']) {
    const expectation={'不可以':'不可拿同張發票','找原':'向原核定補助單位','不能自行':'不要自行改字'}[s]||s;
    a.ok(flat(r).includes(expectation),expectation+q);
 }
}
const u=grant('我們屏東協會辦活動有補助，另一機關也想補，能把同一張發票拿去兩邊報嗎？');
a.ok(u.choices?.length===2);
a.match(flat(grant(u.choices[0].question)),/兩邊都是縣府單位/);
a.match(flat(grant(u.choices[1].question)),/先查兩方計畫/);
a.equal(grant('屏東協會活動取消，剩餘補助要退回嗎？'),null);
a.equal(grant('合作社在屏東申請合作社縣府補助，有發票和餘款怎麼核銷？'),null);
for(const q of [
'我們協會收到商家捐來的物資，一半免費送給弱勢、一半拿去賣再把錢做公益，報年度所得稅時兩批都可以不列收入嗎？各要留什麼憑證？',
'有一批協會收到的實物賣掉再公益，另一批完全沒賣，免費給需要救助的人。兩批年度所得稅如何分開、各留哪些證明？',
'企業送物資給協會，先賣掉的和完全免費轉出去的，年度結算憑證各留哪種？']){
 const x=tax(q);a.ok(x,q);
 a.match(x.summary,/兩批不能一概不列/);
 a.match(flat(x),/未轉售.*經手簽章.*出售不能.*交易憑證.*國稅局/);
}
a.equal(tax('協會收到捐贈物資完全沒有出售，都免費轉贈，申報時不列嗎？'),null);
a.equal(tax('協會收到捐贈實物後出售，營業稅會怎麼算？'),null);
console.log('fiscal cases: multiple grants, splitting receipts, expense changes and in-kind tax validated');
a.match(grant('屏東協會同一支出想請兩個機關認列，同張發票能不能報兩份？').summary,/如果你問的是屏東縣府補助核銷/);
a.equal(grant('我們協會賣貨，開同樣發票給兩公司可以嗎？'),null);
