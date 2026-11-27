const assert=require('node:assert/strict');
const {financeReportKind}=require('./association-finance-report-kind.js');
for(const q of [
 '我們的團體財務報告要送縣府，會議還沒排，不確定屆期也不確定報告種類，能先填哪一個期間？',
 '協會的會計報告縣府說要補，但通知上看不出是期中還是去年決算，我可以直接填今年嗎？'
]){
 const a=financeReportKind(q);assert.match(a.summary,/先不要直接填今年/);
 assert.deepEqual(a.choices.map(x=>x.label),['上年度決算','期中收支','改選交接','通知仍看不出種類']);
 const all=a.choices.map(x=>financeReportKind(x.question));
 assert.match(all[0].title,/指定會計年度/);assert.match(all[0].summary,/1月1日至12月31日/);assert.match(JSON.stringify(all[0]),/三個月內編造/);assert.match(JSON.stringify(all[0]),/大會追認/);
 assert.match(all[1].title,/不套全年/);assert.match(all[2].title,/交接基準/);assert.equal(all[3].choices,undefined);
}
const a=financeReportKind('協會來文看不出種類，只寫截至六月，這份會計報告的期間怎麼填？');
assert.ok(a?.choices?.[1]?.question.includes('截至六月'));
assert.match(financeReportKind(a.choices[1].question).summary,/保留來文「截至六月」/);
assert.match(financeReportKind('縣府要求補協會期中收支報表，指定截至民國115年6月30日，這份財報期間怎麼填？').summary,/保留來文「截至民國115年6月30日」/);
for(const q of ['協會八月開會員大會，這次收支決算要做哪一年？','合作社財務報告縣府說要補，不確定哪個期間？','協會要填公益勸募財務報告的期間，縣府有說嗎？'])assert.equal(financeReportKind(q),null,q);
console.log('財務報告種類、指定日期與原會議流程分流通過');
const uncertain=financeReportKind('協會要補會計報告，不確定是去年決算還是今年期中，能先填哪個期間？');
assert.equal(uncertain?.choices?.length,4);
const dual=(q)=>require('./association-finance-report-kind.js').financeReportKind(q);
assert.match(dual('如果8月只開理監事聯席會，不是會員大會，想看上半年帳跟去年的正式決算，要各抓哪一段？').summary,/今天|今年上半年收支是1月1日至6月30日；去年正式決算是1月1日至12月31日/);
assert.match(dual('縣府要求補去年度上半年收支，以及同年度決算，兩份日期各怎麼填？').summary,/去年上半年收支是1月1日至6月30日；去年正式決算/);
assert.match(dual('我們協會看115年上半年帳，前一年度決算也要補，今年七月開會，哪兩段期間？').summary,/115年上半年收支是1月1日至6月30日/);
assert.match(dual('協會先問114年正式決算期間，再問115年上半年的帳要哪一段？').summary,/115年上半.*114年正式決算/);
assert.equal(dual('合作社今年上半年收支與去年決算各抓哪一段？'),null);
assert.equal(dual('國際性協會今年上半年收支與去年決算各抓哪一段？'),null);
