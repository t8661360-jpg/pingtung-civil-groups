const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const yes=[['協會開收據要貼印花嗎','印花'],['收據要印花稅嗎','印花'],['協會賣義賣品要開發票嗎','義賣'],['協會有收入沒開發票會怎樣','義賣'],['協會有營業收入要開發票嗎','義賣'],['協會買東西要發票嗎','合法憑證'],['會員繳會費可以抵稅嗎','會費'],['會費收據可以給會員抵稅嗎','會費'],['發志工津貼要報稅嗎','志工'],['工作人員薪水要報國稅局嗎','扣繳'],['協會年終獎金要申報嗎','扣繳'],['公司捐錢給協會可以列費用嗎','公司'],['協會稅務要問誰','國稅局'],['我們協會沒賺錢還要報稅嗎','自動']];
const no=['協會年終獎金可以發嗎','合作社稅務要問誰','魅力社區補助要報稅嗎','協會要開發票嗎','怎麼申請成立協會','協會補助要找誰'];
const mine=/^(協會開收據要不要貼印花|協會的稅務問題要問誰|協會有營業收入|協會買東西要不要|會員繳會費能不能|公司或企業捐錢|協會發給志工|協會發給工作人員|協會沒有賺錢還要)/;
let bad=0;
yes.forEach(([q,e])=>{const a=A(q);const x=a&&a.title?(a.title+a.summary):'';if(!x.includes(e)||!a.direct||!mine.test(a.title)){bad++;console.log('✗',q,a&&a.title)}});
no.forEach(q=>{const a=A(q);if(a&&a.title&&mine.test(a.title)){bad++;console.log('✗誤觸',q,a.title)}});
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
