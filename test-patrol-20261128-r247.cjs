/* 第247輪：社區發展協會 */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
const neg=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(t.includes(k)){bad++;console.log('✗反',q,'=>',t)}});
pos(['社區發展協會要不要立案','社區發展協會要辦理立案嗎','社區協會沒有立案可以嗎','社區發展協會需要登記嗎','協會一定要立案嗎','協會沒有立案可不可以運作'],'依法申請許可');
pos(['社區協會理事長要不要是本社區的人','社區發展協會的理事長一定要是本村的人嗎','社區協會理事長一定要住在這個里嗎'],'外村');
pos(['社區發展協會要不要設常務理事'],'常務理事');
neg(['社區發展協會理事會每年開幾次'],'每年一定要辦幾場活動');
neg(['社區發展協會法人登記要怎麼辦','協會怎麼立案','社區發展協會立案證書遺失怎麼辦'],'依法申請許可');
pos(['社區協會可以跟政府拿補助嗎','社區發展協會可以向縣府申請經費嗎','社區協會有沒有政府補助可以拿','協會可以跟政府拿補助嗎','社區發展協會可以接政府補助嗎','社區發展協會可以申請補助嗎'],'這五種情形縣府不予補助');
pos(['社區發展協會常務理事要不要','社區協會有沒有常務理事','社區協會常務理事需不需要'],'常務理事');
neg(['社區協會常務理事有沒有車馬費'],'常務理事、常務監事由理事');
// 法條原文核對
const P=st.laws.D0050091.articles;
const chk=(n,s)=>{if(!P[n]||!P[n].includes(s)){bad++;console.log('✗法條',n,s)}};
chk(8,'向主管機關申請許可');chk(9,'召開成立大會');chk(10,'三十日內');chk(10,'核准立案');chk(11,'法人登記');chk(11,'三十日內');chk(60,'六萬元以下罰鍰');chk(61,'首謀者');chk(17,'常務理事');
const a=A('社區發展協會要不要立案');
if(!a||a.statutes.map(x=>x.title).join()!=='人民團體法第8條,人民團體法第9條,人民團體法第10條,人民團體法第11條,人民團體法第60條,人民團體法第61條'){bad++;console.log('✗引用法條')}
if(bad){console.log('失敗',bad);throw new Error('r247')}console.log('r247 OK');
