const assert=require('assert');
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});

let pass=0;

const tests=[
 ['會員代表怎麼選出來','選舉'],
 ['分支機構要怎麼成立','程序'],
 ['常年會就是會員大會嗎','會員大會'],
 ['監事會幾個人才能成立','3人'],
 ['監事會要怎麼檢查帳目','查核'],
 ['協會有分支機構帳要分開嗎','分開'],
 ['理事長改選能連任幾次','一次'],
 ['社區發展協會理事長任期是幾年能連任','不得連任'],
];

for(let i=0;i<tests.length;i++){
 const [q,exp]=tests[i];
 const a=A(q);
 const ok=a&&a.title.includes(exp);
 if(ok){pass++; console.log('✓ '+(i+1));}
 else console.log('✗ '+(i+1)+': '+q+(a?' -> '+a.title.substring(0,30):''));
}

console.log('\n第13輪測試: '+pass+'/'+tests.length+'通過');
