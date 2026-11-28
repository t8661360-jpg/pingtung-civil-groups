const A=require('node:assert/strict');
const legal=require('./association-legal-property'), proc=require('./grant-procurement-threshold');
function check(fn,q,...xs){const r=fn.route(q);A(r,q);const s=[r.title,r.summary,...r.steps.flat()].join('\n');for(const x of xs)A.match(s,x);}
const lp='我們屏東協會有縣府立案和扣繳統編。會員捐的房子是籌備代表登記、謄本有籌備註記，法院只寄財產專用登記簿謄本。剛換理事長，會址也搬同縣別鄉。這算正式法人證書嗎、先跑法院或地政、要不要過戶給新理事長、回法院繳什麼、法院期限怎麼看、何時送縣府證書、誰簽法院變更、會址和負責人怎麼報、銀行要重開嗎、統編要重辦嗎？';
const follow='補充：剛查到房子不是籌備人登記，沒有籌備註記和協議，謄本只有舊理事長私人名義。其他條件沒變。房子這一項要改怎麼處理？';
check(legal,lp,/不是正式法人登記證書/,/向原登記法院繳驗/,/不過戶給新理事長/,/現任理事半數以上/);
A(legal.follow(follow));check(legal,lp+'；'+follow,/不能套第150條籌備代表更名/,/法院指定期限與縣府期限不同/);
check(legal,'屏東協會已是法院登記的法人，房子原本登記協會自己，舊理事長剛換。要向法院重新設立嗎、房屋要過戶嗎、原銀行戶要重開嗎？',/不重做設立登記/,/不必過戶給新理事長/,/不表示必須重開戶/);
check(legal,'換題：協會只收到法院的財產取得專用謄本，完成更名後要回法院還是直接去縣府？',/向原登記法院繳驗/);
check(proc,'我們社區協會同一批器材做兩批交貨，預算240萬，縣府120萬和中央30萬都補這批，另有縣府講師費補助不屬這批。可以分兩張發票不招標嗎？要算哪個總價、哪些補助、半數、150萬、誰監督、核銷留什麼？',/150萬元 ÷ 採購240萬元＝62.5%/,/同一採購不能靠拆發票規避/);
check(proc,'換題：補助100萬元、採購160萬，即使已過半也要走政府採購法第4條嗎？',/補助100萬元 ÷ 採購160萬元＝62.5%/,/補助本身未達150萬元/);
A.equal(proc.route('政府採購法第4條全文'),null);
A.equal(proc.route('公所自行採購160萬，有補助100萬，要看政府採購法第4條嗎？'),null);
A.equal(legal.route('人民團體法第11條全文'),null);
console.log('ADVANCED_ALIASES_UNIT_OK');
