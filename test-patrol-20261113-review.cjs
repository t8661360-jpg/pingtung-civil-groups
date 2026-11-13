const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
const cases=[
 ['一般合作社什麼時候可以開社員代表大會','社員超過 200 人','D0050022'],
 ['合作社社員代表大會可以用嗎','社員超過 200 人','D0050022'],
 ['合作社解散後剩餘財產怎麼處理','清算人先收債','D0050115'],
 ['公會修改章程怎麼辦','商業、工業同業公會','D0020094'],
 ['工會成立要找哪個單位','勞動暨青年發展處',''],
];
let bad=0;
for(const [q,title,source] of cases){
 const a=A(q); const urls=(a&&a.statutes||[]).map(x=>x.source||'').join(' '); const text=a?(a.title+a.summary):'';
 if(!a||!text.includes(title)||(source&&!urls.includes(source))){bad++;console.log('✗',q,a&&a.title,urls)}
}
for(const q of ['合作社解散後剩餘財產怎麼處理','合作社清算後財產歸誰']){
 const a=A(q); const txt=a?(a.title+a.summary):'';
 if(/依出資比例或章程辦理|章程沒寫的依社員大會決議/.test(txt)){bad++;console.log('✗ 未移除舊說法',q)}
}
console.log(bad?'失敗 '+bad:'全部通過');process.exit(bad?1:0);
