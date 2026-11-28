const a=require('node:assert/strict'),{route}=require('./professional-guild-meeting-rules');
const q=[
 "我們職業公會不是勞工職業工會，是醫師公會，準備開會員大會改章程、改會址跟重選理監事，哪個主管機關、會前通知和會後文件要先看什麼？",
 "屏東的醫師公會說修章和換理監事要一併辦；不是商業同業公會。修章和改選哪個機關管？",
 "換一題：只問商業同業公會的公司代表能不能請員工帶委託書投票。",
 "我們商業同業公會開的是理事會，不是會員大會，理事請會計帶委託書可以嗎？",
 "不是醫師公會，我們是商業同業公會，代表不能到場，可委託同公會另一個會員代表嗎？",
 "醫師公會只是要搬會所，順便改章程，理監事這次不改選。會前通知和會後向哪裡報？",
 "換一題：一般協會會員可不可以由其他會員書面代理出席？",
 "工業同業公會的理事長能連任嗎？"
];
const t=i=>JSON.stringify(route(q[i]));
for(const i of [0,1,5]){
 for(const s of ['醫師法第37條','人民團體法第54條','十五日前','三十日內','過半數出席','三分之二以上','衛生','不是全部重立案'])a.ok(t(i).includes(s),s);
}
a.match(t(1),/屏東縣政府/);
for(const s of ['其他會員代表','半數','簽到先後','文件','改派'])a.ok(t(2).includes(s),s);
a.match(t(3),/理事、監事應親自出席/);
a.doesNotMatch(t(3),/親自出席人數的半數/);
a.match(t(4),/可以。若對方已是本公會另一名符合資格/);
for(const i of [6,7])a.equal(route(q[i]),null);
a.equal(route('醫師要到衛生局換執業執照，辦多久？'),null);
a.equal(route('工業同業公會章程修正和改選誰報？'),null);
console.log('professional guild meeting rules cases passed');
