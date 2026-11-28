const assert=require('node:assert/strict');
const {route}=require('./meeting-notice-calendar.js');
const now=new Date('2026-11-28T12:00:00+08:00');
const ask=(q,c)=>route(q,now,c);
for(const q of ['屏東協會的會員大會要辦理理監事改選，開會通知最晚要提前幾天寄給會員？','屏東協會辦全縣性會員大會，理監事改選要提前通知會員幾天？','換題，理監事改選排進會員代表大會，幾天前通知？']){
 const a=ask(q);assert.match(a.title,/會員大會改選理監事：15日前通知/);assert.match(a.summary,/不是理事會的7日前/);
 assert.match(a.steps[0][1],/報請主管機關派員列席/);
}
const exact=ask('協會把會員大會排在2027年2月20日，理監事改選，要提前幾日通知？');
assert.match(exact.steps[0][1],/2027年2月5日/);
const pair=ask('會員大會改選理監事，當天後面另開理監事聯席會選理事長，兩場通知各提前幾日？');
assert.deepEqual(pair.steps.map(x=>x[0]),['會員（代表）大會：一般15日前','理監事聯席會：一般7日前']);
const dates=ask('會員大會改選理監事在2027年3月20日，理監事聯席會在2027年3月21日選理事長，兩場通知哪天寄？');
assert.match(JSON.stringify(dates.steps),/2027年3月5日.*2027年3月14日/);
const j=ask('更正，不是會員大會，而是理監事聯席會選理事長，幾天前通知？');
assert.match(j.title,/聯席會：7日前/);assert.match(ask('2027年2月20日',j.nextNoticeDate).steps[0][1],/2027年2月13日/);
const menu=ask('理監事改選要提前幾天通知？');
assert.equal(menu.choices.length,2);
assert.match(ask(menu.choices[0].question).title,/15日前/);
assert.match(ask(menu.choices[1].question).title,/7日前/);
assert.match(ask('會員大會改選理監事來不及通知，可說緊急臨時會開會前一日送嗎？').summary,/不能當緊急事故/);
for(const q of ['合作社社員大會選理事、監事，幾天前通知？','職業公會會員大會理監事改選，何時通知？','會員大會通訊選舉理監事改選，何時通知？','協會成立大會選理監事通知幾天前？','協會會員大會理監事改選，選完幾日要通知選舉結果？','協會會員大會理監事改選前要先準備決算，何時通知？']) assert.equal(ask(q),null,q);
console.log('改選議程與會議種類、通知天數、日期、更正及排除案例通過');
