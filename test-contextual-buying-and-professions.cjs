const a=require('node:assert/strict');
const s=require('./charity-sale-fundraising.js').saleFundraising;
const l=require('./land-agent-guild-practice.js').route;
const p='醫師和地政士都要執業，誰先入公會，誰先辦登記？';
for(const q of [p,'地政士和醫師第一次執業，入會和登記順序一樣嗎？']){
 const r=l(q);a.match(r.title,/醫師先備公會證明；地政士先辦開業登記/);a.match(r.steps.flat().join(' '),/所在地醫事人員公會會員證明.*登記後須加入該管地政士公會才能執業/);
}
a.equal(l('我同一人有醫師和地政士證書，能同時執業嗎？'),null);
const c='不是我們協會在募款，是店家正常售價賣商品後自行捐款，和向民眾募款一樣嗎？';
a.match(s(c).summary,/未另收顧客捐款.*與向民眾募款不同/);
a.match(s('義買跟勸募一樣嗎？').title,/買方行為/);
a.match(s('商家照正常價格開發票賣商品，自行捐款，另外放捐款箱已收到但沒申請勸募許可怎麼辦？').title,/先停募/);
a.match(s('我們是公益性社團法人，公開義賣所得全捐給弱勢，要先申請勸募許可嗎？').title,/先申請勸募許可/);
