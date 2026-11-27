const assert=require('node:assert/strict'),{route}=require('./association-notice-dispatch-delivery.js');
const a=route('協會能用電子郵件通知會員開大會嗎？通知寄了但沒收到，還能照開嗎？');assert.match(a?.summary,/十五日前/);assert.match(JSON.stringify(a),/不等於退信/);
const d=route('已經定好115年12月15日開大會，究竟最晚哪天要寄出或送達開會通知？');assert.match(d?.summary,/12月1日前/);
const b=route('這是臨時理事會，不是會員大會。若今天寄信，明天開會算有通知嗎？');assert.match(b?.summary,/七日前/);assert.doesNotMatch(b.summary,/十五日前/);assert.match(JSON.stringify(b),/開會前一日確實送達/);
for(const q of ['合作社大會可以寄電郵通知嗎？','一般協會大會的財務報表要填到哪天？','學校家長會開會電郵通知？'])assert.equal(route(q),null,q);
console.log('普通發送、緊急送達及非大會否定分流通過');
