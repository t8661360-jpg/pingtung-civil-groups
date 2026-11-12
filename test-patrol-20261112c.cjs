const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[
 ['協會的錢要放在哪裡','銀行、農會'],['協會帳戶可以用理事長私人名義開嗎','不可以'],
 ['預算要誰通過','會員大會'],['預算沒有通過大會可以花錢嗎','沒有明文'],
 ['經費超支了怎麼辦','沒有明文規定'],['年度中途想追加預算可以嗎','沒有明文規定'],
 ['收據要用什麼樣的','沒有規定收據的統一樣式'],['會計是誰負責','財務人員'],
 ['財產清冊要怎麼做','財產目錄'],['財報誰核章','核章欄'],
 ['收了捐款要記帳嗎','要。'],['忘記做決算怎麼辦','盡快補編'],
];
const no=['合作社的錢放在哪裡','合作社預算誰通過','工會財產清冊怎麼做','會計可以由理事長兼任嗎','監事可以當會計嗎','會計師要請嗎','理事會幾天前通知','補助款要怎麼核銷','捐款可以抵稅嗎','公會預算要誰通過','財產報廢怎麼做','領款要誰蓋章'];
let bad=0;
yes.forEach(([q,e])=>{const a=A(q);const txt=a?(a.title+a.summary):'';if(!txt.includes(e)){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&/預算由理事會編造|財產目錄|財務人員，原則專任|要存在銀行、農會、漁會|收到捐款要記帳|盡快補編/.test(a.title)){bad++;console.log('✗誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
