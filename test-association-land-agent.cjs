const a=require('node:assert/strict'), answer=require('./association-land-agent.js');
for(const q of ['我是地政士，可以幫協會辦理土地移轉登記嗎？','協會買土地想請代書辦過戶，可以嗎？','社團法人收到人家捐建物，可以委託地政士辦移轉嗎？','協會土地過戶一定要找地政士嗎？']){
 const s=answer(q).summary;a.match(s,/可以/);a.match(s,/不是一定要找地政士/);a.match(s,/委託書/);a.match(s,/不等於協會已取得受讓資格/);
}
for(const q of ['地政士','地政士開業登記要怎麼辦？','地政士可以加入協會嗎？','協會會址變更要找地政士嗎？','合作社土地移轉可以找代書嗎？'])a.equal(answer(q),null,q);
