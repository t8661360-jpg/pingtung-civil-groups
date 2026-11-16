const r=require('./round-fixes.js');
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const cases=[
 [['合作社解散要附什麼文件','合作社解散要多久內登記','合作社解散要通知債權人嗎'],/合作社解散：一個月內向主管機關聲請解散登記/,/合作社法第57條/],
 [['合作社要繳所得稅嗎','合作社要繳營業稅嗎','合作社可以免稅嗎'],/合作社法第7條規定「得免徵」/,/國稅局/],
 [['會員名冊可以提供給廠商嗎','會員個資可以拿去做別的用途嗎'],/只能在當初蒐集的目的範圍內使用/,/個人資料保護法第20條/],
 [['已經法人登記的協會改章程要幾成同意','社團法人修改章程門檻'],/民法另有四分之三的規定/,/民法第53條/],
 [['社團法人會員可以隨時退會嗎'],/原則上可以隨時退社/,/民法第54條/],
 [['退會的人可以要回協會的財產嗎'],/不能要求分協會的財產/,/民法第55條/],
 [['會員對大會決議不滿可以告嗎'],/三個月內請求法院撤銷/,/民法第56條/],
 [['開會通知太晚寄決議算數嗎'],/開會通知漏寄或太晚寄/,/./],
];
for(const [qs,tt,ss] of cases)for(const q of qs){const x=A(q);const all=x&&(x.title+x.summary+JSON.stringify(x.statutes||[]));if(!x||!tt.test(all)||!ss.test(all)){console.error('FAIL',q,x&&x.title);bad++;}}
for(const q of ['捐款給合作社可以抵稅嗎','合作社解散後財產怎麼分','合作社可以解散嗎','會員名冊可以給外人看嗎','志工的名冊可以公開嗎','修改章程要幾成同意','想退會要怎麼退','協會解散後財產可以分給會員嗎','對大會決議有意見能不能告']){const x=A(q);if(x&&/得免徵|一個月內向主管機關聲請解散登記|目的範圍內使用|民法另有四分之三|隨時退社|不能要求分協會的財產/.test(x.title)){console.error('MISFIRE',q,x.title);bad++;}}
if(bad)throw new Error('patrol77 failed '+bad);console.log('ok');
