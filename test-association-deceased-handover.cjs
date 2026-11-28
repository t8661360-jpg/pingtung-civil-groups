const assert=require('node:assert/strict');
const {route}=require('./association-deceased-handover.js');
const all=a=>[a.title,a.summary,...(a.steps||[]).flat()].join(' ');
for(const q of ['理事長沒有交接就過世了，家屬要負責移交嗎','家屬可以把公章交給理事保管嗎？協會理事長過世了，新任還沒選出']){
 const a=route(q);assert.match(a.summary,/家屬不會/);assert.match(all(a),/有權|接收權限/);assert.match(all(a),/一個月內補選/);
}
const mid=all(route('已合法補選新理事長（不是整屆改選），前任死亡，原圖記遺失、銀行留存章還在。能先用舊章、還是查誰能代理？'));
assert.match(mid,/一個月內補選/);assert.match(mid,/不要用舊章/);assert.doesNotMatch(mid,/與監交人於十五日內/);
const term=all(route('團體已整屆改選、新任已就任、監交人也選出，原理事長已故，家人只肯交過去會議紀錄，不清楚存摺在哪裡；十五日到了，能把缺件寫進清冊後向縣府問嗎？'));
assert.match(term,/與監交人於十五日內/);assert.match(term,/缺件可列在清冊/);assert.match(term,/註銷並重發立案證書/);assert.match(term,/原備查圖記失效/);
const phone=route('我是家屬，前任理事長過世，手機有志工的照片及個資、存摺也不確定屬誰，該交給誰？');
assert.match(all(phone),/只移交必要的團體資料，不交整支私人手機/);
const correction=route('更正，家屬只有照片資料，沒有存摺或圖記。不要談銀行，我問可否先要求確認交付範圍。',phone.handoverDeathContext);
assert.match(all(correction),/確認照片資料的交付範圍/);assert.doesNotMatch(all(correction),/銀行|補選/);
const gap=route('協會前任理事長走了，留下證書和公章，我要交給誰？');
assert.equal(gap.choices.length,3);
for(const {question} of gap.choices){assert.match(all(route(question,gap.handoverDeathContext)),/證書和公章|立案證書、圖記/);}
assert.notEqual(route(gap.choices[1].question,gap.handoverDeathContext).title,route(gap.choices[2].question,gap.handoverDeathContext).title);
for(const q of ['協會會員過世，家人能不能繼承會員資格？','合作社理事長過世後圖記誰收？','理事長沒有過世，只是辭任，協會存摺要怎麼交？','理事長沒過世，只是辭任，協會存摺要怎麼交？','一般協會新理事長何時能去銀行更印？','新題：萬巒鄉體育團體幾個？'])assert.equal(route(q,phone.handoverDeathContext),null,q);
assert.match(all(route('協會理事長過世，任期剩三個月，證書和公章能交給代理人嗎？')),/不足六個月.*常務理事互推.*由理事互推/);
console.log('Deceased chair handover cases passed');
