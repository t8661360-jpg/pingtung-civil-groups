const assert=require('assert');
const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});

const tests=[
 ['合作社決算表怎麼填','決算','合作社'],
 ['合作社資產負債表要不要報','1個月'],
 ['會員代表名額怎麼算','比例'],
 ['代表能不能再當理事','章程'],
 ['會員大會表決用舉手','表決'],
 ['理事會決議投票方式','舉手'],
 ['會員代表怎麼選出來','選舉'],
 ['代表大會怎麼開','通知'],
 ['合作社社員怎麼罷免','罷免'],
 ['合作社能向銀行借貸嗎','決議'],
 ['分支機構帳務要分開嗎','分開'],
 ['改選完多久要做帳','三個月'],
];

let pass=0;
tests.forEach(([q,exp],i)=>{
 const a=A(q);
 const ok=a&&a.title.includes(exp);
 if(ok){pass++; console.log('✓ '+(i+1));}
 else console.log('✗ '+(i+1)+': '+q.substring(0,20)+(a?' -> '+a.title.substring(0,30):''));
});

console.log('\n第14輪測試: '+pass+'/'+tests.length+'通過');
process.exit(pass===tests.length?0:1);
