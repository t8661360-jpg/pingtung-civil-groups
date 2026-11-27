const assert=require('node:assert/strict');
const {unionDues,donationSale}=require('./union-dues-social-donation-sale.js');
for(const q of ['工會的會員常年會費可以自己訂嗎？和協會一樣嗎？','一般協會會費和企業工會每月會費可以訂成一樣嗎？']){
 const a=unionDues(q);assert.match(a.title,/標準不同/);assert.match(JSON.stringify(a.steps),/0\.5%.*200 元/);
}
assert.match(unionDues('職業工會會費每月的級距可以自己訂？').summary,/不能低於/);
for(const q of ['一般協會入會費可以自己訂？','不是職業工會，是協會。會費可以調漲？','總工會跟會員工會收多少會費？','工會欠費可以停權嗎？','醫師公會的常年會費有最低標準嗎？'])assert.equal(unionDues(q),null,q);
for(const q of ['我們協會收到公司捐的舊電腦，賣掉拿現金做公益，跟直接免費轉贈的報稅方式相同嗎？另外要不要開收據？','開收據、所得稅怎麼處理？一般協會把受贈品轉售，拿錢助人。']){
 const a=donationSale(q);assert.match(a.summary,/不相同/);assert.match(JSON.stringify(a.steps),/不能把買賣對價當成純捐贈/);assert.match(JSON.stringify(a.refs),/GL008678/);
}
for(const q of ['協會收到民眾主動捐贈物資，沒有轉售而是免費轉贈，要報稅嗎？','合作社把企業捐贈電腦賣掉要開收據嗎？','協會受贈物資未轉售而是免費送出，要報稅嗎？','協會收到捐贈物資只是免費轉贈，不是出售，怎麼報稅？','協會出售自己的物品怎麼入帳？','協會義賣，需要申請勸募許可嗎？'])assert.equal(donationSale(q),null,q);
