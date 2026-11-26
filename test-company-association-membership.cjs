const a=require('node:assert/strict'), answer=require('./company-association-membership.js');
for(const q of ['公司行號可否入會','公司想加入一般協會當正式會員','公司可以當協會的會員嗎','公司行號可以入會嗎','企業能用團體名義加入社會團體嗎？']){
 const x=answer(q);a.match(x.summary,/沒有規定公司、行號不能入會/);a.match(x.summary,/依章程辦理申請和審查/);a.match(x.summary,/不會.{0,32}自動轉為正式會員/);a.equal(x.statutes.length,4);
}
for(const q of ['公司登記後一定要加入同業公會嗎？','公司是贊助會員，能投票嗎？','公司入會費是多少？','公司可不可以當協會理事？','企業想加入合作社','公司的員工可以加入一般協會嗎？'])a.equal(answer(q),null,q);
