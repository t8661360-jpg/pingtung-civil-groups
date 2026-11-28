'use strict';
const assert=require('node:assert/strict');
const {route}=require('./association-grant-financial-readiness.js');
function check(q,patterns,prior){
 const a=route(q,prior);assert.ok(a,q);for(const p of patterns)assert.match(JSON.stringify(a),p,q);return a;
}
const a=check('協會年度決算還沒經會員大會通過，可以先申請下一年度補助嗎？',[/第5點第3款第4目/,/您目前的年度決算進度/]);
assert.equal(a.choices.length,4);
for(const [i,p] of [/先如實記錄表決/,/之後仍須大會追認/,/等待備查回函不等於未陳報/,/補報正在審/].entries())check(a.choices[i].question,[p]);
check('還沒開大會',[/追認後再報/,/不等於完成陳報/],a.grantFinanceContext);
assert.equal(route('還沒開大會'),null);
check('決算有開會員大會但沒過，屏東一般補助可以用理監事聯席會先過的那份嗎？',[/不可用聯席會先過的版本/,/大會已開但否決/,/第5點第3款第4目/]);
check('還沒到結算報送期限，但活動補助月底截止，主管機關的備查函來不及，可以先送財報和寄件憑證補嗎？',[/不等於逾期/,/最晚日/,/申請附件/]);
check('決算通過、送了縣府還沒收到核備函，想同時申請設備補助和活動補助，卻不確定兩案各要哪種年度財務資料。怎麼問？',[/等回函/,/請用計畫名稱分別核對/,/財產證明/]);
check('上一年度決算逾期但補報正在審，去年補助也還沒結案，這次要申請活動和補助購置器材，能否補件、先辦活動嗎？',[/不保證能補件/,/無正當理由逾越核銷期限/,/第7點是審查、簽奉核定後辦理/]);
const f=check('更正只問財報，沒有任何補助；不是沒到場，是會員大會把決算否決，要怎麼處理？',[/補正後重提/,/送監事會審核/]);
assert.doesNotMatch(JSON.stringify(f),/B114003910|第5點第3款/);
const c=check('不是申請屏東，是文化部補助，決算已通過也送出，但備查函還沒收到。',[/中央或專案計畫/,/等待備查回函不等於未陳報/]);
assert.doesNotMatch(JSON.stringify(c),/B114003910|第5點第3款/);
for(const q of ['合作社決算還沒開大會，補助怎麼申請','協會年度決算六張表怎麼填','新題：佳冬鄉文化類存續有幾個？','核定補助後收據是電子版可以核銷嗎','協會的年度預算被會員大會否決怎麼辦？'])assert.equal(route(q,a.grantFinanceContext),null,q);
console.log('Financial readiness and grant branch tests passed');
