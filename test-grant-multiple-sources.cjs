const assert=require('node:assert/strict');
const {route}=require('./grant-multiple-sources');
const whole=a=>[a.summary,...a.steps.flat()].join(' ');
const county='我們屏東協會辦同一場活動，同年向縣府社會處報場租、教育處報講師費，沒有用同一張發票，可以兩邊都申請嗎？';
const joint='同一場屏東協會活動一份向縣府、一份向中央；我們把保險和場地費分開，不拿同一張單據，申請時還是要寫另一邊嗎？如果已經送兩邊現在怎麼補救？';
const settled='我們活動有兩筆政府補助，場地費一張單據兩邊先報了，兩邊都核銷後怎麼更正？';
const two='屏東同一協會今年辦兩場不同活動，時間和計畫不同，各向縣府承辦申請，各自有收據，這也算重複申請嗎？';
const other='新北協會同一案用市府補場地、中央補印刷，能套屏東規定嗎？';
const notKnown='我們屏東協會辦同一場活動拿兩筆補助，是不是可以把同一張發票跟兩邊報帳？';
for(const [q,terms] of [[county,['只向縣府一個機關','不同發票']],[joint,['還是', '全部預算','實際補助金額','已送件','第8點','須否撤回']],[settled,['已核銷','逐筆對照','實際應繳回金額']],[two,['不等於第11點','各計畫的年度上限']],[other,['不能直接套用屏東','中央的揭露規範']]]){
 const a=route(q);assert.ok(a,q);
 for(const k of terms.filter(s=>s!=='還是'))assert.ok(whole(a).includes(k),k+' '+q);
 assert.ok(!a.choices,q);
}
const a=route(notKnown);assert.ok(a.choices.length===3);
for(const [i,x] of a.choices.entries()){const b=route(x.question); assert.ok(x.question.startsWith(notKnown)&&!b.choices); assert.match(whole(b),[/不能兩邊都送/,/全部預算/,/已核銷：/][i]);}
assert.ok(!route(other).refs.some(r=>r.title.startsWith('屏東')));
assert.ok(!route(joint).summary.includes('不能兩邊都送'));
assert.ok(!route(two).summary.includes('只能'));
for(const q of ['屏東縣府補助做完要幾天核銷？','我們協會要開發票嗎？','協會解散清算，兩筆補助的設備可轉給別人嗎？','補助取消活動，剩餘款能用別案嗎？','我們屏東協會拿到縣府補助，講師費要改列餐費可以嗎？'])assert.equal(route(q),null,q);

assert.match(whole(route('分開場地費和保險費就不用告訴中央嗎？屏東協會同一計畫，縣府跟中央各一筆，都先送件了。')),/已送件：/);

assert.match(whole(route('另問新的：同一個協會在同年向屏東縣府兩個單位都報一場活動，各項費用分開，還要撤回其中一件嗎？')),/已送件：/);
