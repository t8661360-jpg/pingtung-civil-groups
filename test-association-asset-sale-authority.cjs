const a=require('node:assert/strict');
const {route}=require('./association-asset-sale-authority.js');
const text=r=>r.steps.flat().join(' ');
const cases=[
 '協會想賣會產給理事長，由誰代表簽約？大會要幾票才准？如果是合作社賣給自己理事，還能用一樣的程序嗎？那會議紀錄可貼群組嗎？',
 '合作社如果賣設備給自己理事，能原主席簽嗎？我們協會也想賣給理事長，章程沒特別寫，大會要幾票、紀錄能不能公開貼？',
 '會議紀錄能把資料全部直接貼公開群組嗎？我們協會賣會產給理事長，幾票才通過、誰能簽？合作社賣給自家理事也一樣嗎？'
];
for(const q of cases){
 const r=route(q); a.ok(r,q);
 for(const p of ['三分之二以上同意','大會同意處分，不等於','由監事代表合作社','勿把可辨識的全本直接公開'])a.ok(text(r).includes(p),q+' missing '+p);
 a.equal(r.refs.length,5);
}
for(const q of [
 '協會要處分一筆受贈的土地給理事長，章程沒寫誰能代表。大會要幾票？沒事前授權可以先賣再追認嗎？理事長能投自己那票嗎？紀錄都可以全部貼公開網站嗎？',
 '受贈的地打算賣給協會理事長，先賣後給大會追認可不可以？自己的表決票要避開嗎、有多少票門檻、誰能代表簽、紀錄可全部公開嗎？'
]){
 const y=route(q); for(const p of ['沒有事前授權','不自行從應到人數扣除','不得代理他人','核對受贈時','會議紀錄可以依法查閱'])a.ok(text(y).includes(p),q+' missing '+p);
 a.ok(y.refs.some(x=>x.title.includes('第13條')));
}
a.match(route('我們協會要處分會產，多少票才能通過？').summary,/三分之二以上/);
const unknown=route('我想賣設備給自己的理事，表決需要多少人同意？');
a.deepEqual(unknown.choices.map(c=>c.label),['一般協會','一般合作社']);
a.match(text(route(unknown.choices[0].question)),/理事是買方|理事是買方/);
a.match(text(route(unknown.choices[1].question)),/由監事代表合作社/);
a.equal(route('信用合作社要賣設備給自己理事，誰可以代表簽約？'),null);
a.equal(route('協會與合作社租用會館，同一人要同時代表兩邊簽約嗎？'),null);
a.equal(route('協會受贈的電腦拿去賣要留發票嗎？'),null);
a.equal(route('協會沒有要賣設備，只問大會多少票通過章程？'),null);
a.equal(route('協會解散時會產可以直接賣給理事長嗎？'),null);
a.equal(route('合作社賣設備給理事的公司，誰代表合作社？'),null);
console.log('asset disposition: paired organization, self dealing, land, disclosure, confirmation and negatives passed.');
