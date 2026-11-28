const a=require('node:assert/strict');
const {route,underDiscussion}=require('./cooperative-stock-exit');
const {route:liquidate}=require('./cooperative-liquidation-residue');
const flat=r=>[r.summary,...r.steps.flat()].join(' ');
const opera='我們是一般消費合作社，不會解散，只是盤點完要把去年的盈餘和以前留下來的公積金分給社員，採購量大的和股金多的人要怎麼算？';
const death='我爸在一般合作社過世，沒有要解散也沒借社裡的錢，他有些股款還沒繳，家裡又有一筆代墊貨款。媽媽不是社員，可以接他的股、代他投票，還是只能領退股款？能拿代墊款抵嗎？';
const close='我們的合作社確定解散了，還有員工薪水、供應商貨款、以前留的公積金和公共基金，帳上還有沒收回的款項。理事誰管清算，債主怎麼通知，員工要等社員分完錢才拿嗎，剩下可以直接按出資分嗎？';
const credit='我在信用合作社是社員，年底要退社，不是清算，我有領過股息、股金、定存和還沒還完的房貸。社方說有虧損就不退、若有賺錢可以多拿，房貸和股金、定存一起直接抵。我今年要提前多久說，怎麼估金額和拿到錢的時間，家人可代領嗎？';
a.match(flat(route(opera)),/累積短絀.*10%公積金.*5%公益金.*交易額.*不能請求分配/);
a.match(flat(route('當年度有結餘，我們想按股數分給各社員，還有舊公積金。我們消費合作社還在營業，不打算解散。')),/依法可分的餘額按社員交易額/);
a.match(flat(route(death)),/不能用過世者名義投票.*第11、14條.*代墊款.*依第19條/);
a.match(flat(route(credit)),/提前三個月.*評價準備.*不超過面額.*決議通過後三個月內退.*貸款、存款和股金.*代理權/);
a.match(flat(route('年底打算退股，房貸沒繳清，我在信合社持有社股，什麼時候拿到款？')),/決議通過後三個月內退/);
a.equal(route(close),null);
a.match(flat(liquidate(close)),/理事充任.*15日.*債權人.*第28條.*公共基金.*第44條/);
a.match(flat(liquidate('原本沒有要解散，後來合作社已經解散，公告和欠薪要先怎麼辦？')),/公告.*第28條/);
for(const q of [opera,death,credit]){a.equal(underDiscussion(q),true);a.equal(liquidate(q),null);}
const changed=route('更正一下，不是信用合作社，是一般合作社，也不是家人代領，是我自己自願退社。其他條件先不變。',route(credit).coopStockContext);
a.match(flat(changed),/第30條.*第18條/);
a.doesNotMatch(flat(changed),/代理權|決議通過後三個月內退/);
const amb=route('合作社社員要離開，股金和他欠的款要怎麼處理？');
a.equal(amb.choices.length,2);
for(const x of amb.choices){
 const b=route(x.question,amb.coopStockContext);
 a.equal(b.choices.length,3);
 const exit=route(b.choices[0].question,b.coopStockContext);
 a.match(flat(exit),x.label.includes('信用')?/第12條之1.*存款/:/第30條.*第18條/);
 const death=route(b.choices[1].question,b.coopStockContext);
 a.match(death.title,/過世/);
 const dissolve=liquidate(b.choices[2].question);
 a.match(dissolve.category,x.label.includes('信用')?/信用合作社/:/一般合作社/);
}
for(const s of ['新題：佳冬鄉文化類團體有幾個？','合作社股金增資，吸收新社員怎麼算？','合作社社務會開會怎麼表決才能辦理除名？','合作社理事有沒有資格召開股金變更案？','信用合作社清算分配公益金，是否先主管機關核准？','社區協會常年會費繳不出來能不能退會？','我辭了勞動合作社理事會主席，又另外申請退社，股金是當場領還是年底做完才能領？','勞動合作社退社申請送了但還沒到年底，這週開社員大會還要算我嗎？','合作社社員退社後，還能把他欠繳的股金公布在網路嗎？','信合社今年年底才退社，送出退社申請三個月就能拿到股金嗎？','保險合作社員工退休能退股嗎？'])a.equal(route(s,route(credit).coopStockContext),null,s);
console.log('Cooperative stock/exit: active surplus, estate, refunds and debt, credit law, actual liquidation, corrections, index branches and reset passed');
