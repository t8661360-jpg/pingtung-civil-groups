const assert=require('node:assert/strict');
const {route,follow}=require('./election-roster-sharing');
const txt=a=>[a.summary,...a.steps.flat()].join(' ');
const cases=[
 ['我是協會會員想核對投票名冊，理事長只願現場看，不准拍照，還說要把名冊給候選人打電話拉票。三種做法都一樣嗎？',['合理可及的閱覽','不等於允許對整份拍照','私下拉票']],
 ['先問可以公開嗎：縣府要協會補報改選名冊，還有一張簽到表有手機、身分證字號和簽名。送主管機關、提供會員查閱、貼在LINE群、公開開放下載這四件，要怎麼分？',['正式方式交','簽到表','LINE 群組','公開網站']],
 ['我們屏東協會這週要換屆，候選人問能不能把舊聯絡簿導進私人的群發工具；會務人員問需不需要把名冊公開、名冊供核對是否含電話地址、不同意的會員能否一律刪除、已流出該先做什麼？',['私人群發工具','原目的消失','收回可撤回權限','查明後適當通知當事人']],
 ['換一題：一般合作社社員選舉名冊要公示15天，這是不是就要把全員身分證號和電話放在網路，跟協會理監事改選一樣？',['投票日六十日前','公告十五日','不用因此在網路公開']],
 ['一般合作社選舉公告的合格社員名冊有錯，我在15天公告期間寫信給合作社更正，需帶哪些資料，要不要公開附身分證照片？',['公告期間內以書面向合作社','不把身分證照片公開']],
 ['協會只給會員在辦公室查閱選舉名冊、不准翻拍；我想查自己的電話和地址是否正確，他們說候選人能拿整份電子檔，這兩種權利一樣嗎？',['和要求全員檔案是兩件事','不會自動變成候選人取得完整']],
 ['我們協會會員說已退會，要求把以前簽到表和本次選舉審定名冊的資料全部刪除，舊資料可否繼續寄活動通知？',['歷史簽到','無獨立依據就停止使用']]
];
for(const [q,terms] of cases){const a=route(q);assert.ok(a,q);for(const s of terms)assert.ok(txt(a).includes(s),s+' '+q);}
const u='我們選舉想讓大家看一下名單但不懂是協會還是合作社名冊，小屏會問我用在哪裡嗎？';
const a=route(u);assert.ok(a.needsRosterFacts&&a.choices.length===2);
for(const [i,x] of a.choices.entries()){assert.ok(x.question.startsWith(u));const b=route(x.question);assert.ok(!b.choices);assert.match(txt(b),[/合理可及/,/投票日六十日前/][i]);}
const next='補充：是一般協會內部改選，理事長只願現場看，不准拍照，也不想把整份檔給候選人或放LINE群。哪一個一定要？';
assert.ok(follow(next)); assert.match(txt(route(u+'；'+next)),/合理可及的閱覽/);
for(const q of ['公益勸募捐款人名冊、電話應否公開？','縣長選舉選舉人名冊可以拍嗎？','協會理事過世名冊要怎麼更正？','信用合作社社員選舉是否公告名冊？','人民團體選舉罷免辦法第5條'])assert.equal(route(q),null,q);
