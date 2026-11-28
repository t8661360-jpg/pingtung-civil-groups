'use strict';
const assert=require('node:assert/strict');const {route}=require('./event-fees-and-fundraising');
const all=r=>JSON.stringify(r);
const fee=route('我們協會開活動，每個人一定要付300元才能進來，收據要寫捐款嗎？');
assert.match(fee.title,/固定收費或售價不能改開捐款收據/);
assert.doesNotMatch(all(fee),/先確認適格勸募主體/);
const mixed=route('親子課要報名費，企業給物資換活動海報標榜合作，另外店家私下自發送點心，社區發展協會打算放捐款箱而且已經登記為社團法人；要怎麼分收據、許可、記帳和是否可抵稅？');
for(const s of ['固定報名費','有約定廣告曝光','真的自發捐送','第5、7條','第16條','不能把它拿去列報捐贈扣除','按性質分開'])
 assert.ok(all(mixed).includes(s),s);
const big=route('普通合作社想與一個獲准的公益團體聯辦市集，原來蔬菜每箱定價，收入一成由合作社自己捐，顧客另可在收銀台自願勾選捐款，有實體捐款箱，合作社準備先代收，公益團體的許可是別場地別週，贊助商提供物資要上廣告，合作社想集體開捐款收據，並已有幾筆入帳。款項怎麼分，哪些要先停、退還或問主管機關、誰應開收據？');
for(const s of ['商品價款','捐贈人不是購買者','不是第5條列舉的勸募團體','不會自動授權代收','先停新增收款','第22條','難以返還要報請主管機關'])
 assert.ok(all(big).includes(s),s);
const cor=route('更正：不對外勸募、沒有箱子、也沒有說要宣傳商標，我們是一般協會；只照收課程報名費，另外有人自己帶點心來。',big.eventFinanceContext);
assert.match(all(cor),/真的自發捐送/);assert.doesNotMatch(all(cor),/先停新增收款|有約定廣告曝光|先確認適格勸募主體/);
const q=route('我們收活動的錢，能一起開捐款收據嗎？');
assert.equal(q.choices.length,4);
assert.equal(new Set(q.choices.map(o=>route(o.question,q.eventFinanceContext).title)).size,4);
for(const s of ['協會買設備，已核定的補助沒撥款，如何記帳？','合作社召開社員大會的會議地點變更需要通知嗎？','新題：琉球鄉有哪些社區發展協會？'])
 assert.equal(route(s,big.eventFinanceContext),null,s);
