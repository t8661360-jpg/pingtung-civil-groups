const a=require('node:assert/strict');
const {associationWagesAndSigning:fn}=require('./association-wages-and-signing.js');
const text=q=>JSON.stringify(fn(q));
a.match(text('理事長不簽字發薪水給總幹事，副理事長可以代簽嗎'),/不能只憑職稱代簽.*共同蓋章/);
a.match(text('我們是協會受僱的總幹事，薪水兩個月沒發，理事長說等補助才給，我可以找誰？'),/不能以等補助.*拖欠薪資.*1955/);
a.match(text('協會總幹事領薪的日子到了，理事長人在國外，其他人可代簽嗎？我可以申請勞資調解嗎？'),/暫時不在，不等於出缺.*工作所在地/);
a.doesNotMatch(text('我在高雄的協會當總幹事，薪資兩個月沒發，要找誰？'),/08-7558048/);
for(const q of ['協會想知道活動補助可不可以列工作人員薪水？','協會的志工誤餐費沒給，算拖欠薪資嗎？','協會給總幹事薪水要報扣繳嗎？','信合社經理薪水不給能怎麼辦？'])a.equal(fn(q),null,q);
a.match(text('我不是協會總幹事，是公司員工，老闆欠我兩個月薪水，在高雄怎麼處理？'),/不是協會會務.*高雄市政府勞工局/);
