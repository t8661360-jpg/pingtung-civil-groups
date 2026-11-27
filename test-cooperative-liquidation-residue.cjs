const a=require('node:assert/strict');
const {route}=require('./cooperative-liquidation-residue.js');
const flat=r=>r.steps.flat().join(' ');
const both=[
'我們一般合作社打算解散，清算人剛上任，多久要發公告？已知道有一個債權人還要另外通知嗎？最後的清算報告幾天內要送？有剩餘財產能直接按股金分嗎？',
'要把合作社剩的財產按各自的股金分之前，清算人還沒公告但知道一位債權人，需要另外通知他嗎？從就任多久內公告、結束後報告要幾天內送？'
];
for(const q of both){
 const r=route(q);a.ok(r,q);
 for(const p of ['至少一個月提出異議','就任後15日內公告','已知債權人還要個別通知','終結後20日內','民法第44條','不是直接按出資或人頭分']) a.ok(flat(r).includes(p),q+' '+p);
}
const u=route('一般消費合作社已清償債務，章程沒寫、社員大會也沒有有效決議，剩下的普通財產歸誰？公益金能按股金分給社員嗎？');
a.match(u.summary,/住所所在地的地方自治團體/);
a.match(flat(u),/公益金.*解散後仍只用於法定用途/);
a.equal(u.choices,undefined);
const v=route('我們一般合作社正在清算，有一位應退股金的社員找不到。這筆可以直接併入剩餘財產嗎？找不到人還能做什麼？章程沒寫其他餘額歸誰，能直接分嗎？');
a.match(flat(v),/應退股金.*不能因聯絡不上.*第326、327條.*清償提存.*不等於符合/);
a.equal(v.choices.length,2);
a.match(flat(route(v.choices[1].question)),/你已說沒有章程規定，也沒有有效大會決議/);
const n=route('一般合作社先決議解散、後來才交給清算人。我想分清楚解散登記多久、清算人報到期限、就任後幾天公告以及終結時要幾天內報告？');
a.match(flat(n),/一個月內聲請登記.*就任後15日內另辦就任備查.*就任後15日內公告.*終結後20日內交報告/);
const f=route('一般合作社被命令解散，現在有公積金、公益金、政府補助買的設備、欠一筆應還社員的股金，還有一般餘款。大家投票說五種都按每人一份分，可不可以？如果章程已訂普通餘款捐所在地自治團體呢？');
for(const str of ['普通公積','優先捐贈合作事業發展基金','政府補助的固定資產','應退股金','不用大會臨時平分來取代章程']) a.ok(flat(f).includes(str),str);
a.doesNotMatch(flat(f),/決議解散：一個月內/);
for(const q of ['保險合作社清算有餘產嗎？','我們協會已清算，餘產歸誰？','一般合作社今年的結餘想按股金分，能不留公益金嗎？']) a.equal(route(q),null,q);
console.log('cooperative liquidation: notices, residue, restricted assets, share claims and special-law negatives passed');

const credit=route('信用合作社解散和一般合作社一樣嗎？結清後公益金及未退款股金可以一起分嗎？');
a.match(credit.summary,/不應把公益金與未退股金一起/);
a.match(flat(credit),/第28條.*金融監督管理委員會核准.*第35條/);
a.doesNotMatch(flat(credit),/美元|地方自治團體|第65條/);
a.match(flat(route('一般合作社當年提供非社員使用業務所提公積金，已解散能用來補社員應退股金嗎？')),/受限制的公積，不能自行挪去退股/);
