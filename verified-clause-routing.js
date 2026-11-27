(function(root){
'use strict';
const group='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091';
const elections='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093';
const cooperatives='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112';
const personal='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021';
function recall(s){
 if(!/協會|社會團體|人民團體/.test(s)||/合作社|基金會|信用合作社|公會|工會|農會/.test(s)||!/理事長/.test(s)||!/罷免/.test(s)||/不想罷免|不要罷免|不是罷免|不是要罷免/.test(s))return null;
 if(/除名/.test(s)&&!/不是(?:要)?除名|非(?:要)?除名|不要除名|不作會員除名/.test(s))return null;
 return {
  kind:'association-chair-recall',title:'協會理事長：罷免職務，不是除名會員',
  summary:'要解除理事長職務，走職務罷免程序，不等同取消會員資格。應先看由誰選出、就任多久、具體理由和章程；不能只因不滿就直接宣布免職。',
  steps:[
   ['先確認提案資格','依人民團體選舉罷免辦法第29、30條，由原選舉人提出。就任未滿六個月不得提出；應書面敘明理由、經原選舉人總數三分之一以上簽署，向協會提出並副知主管機關。'],
   ['由原選出他的會議依法表決','依第32、34條通知被罷免者答辯，再依期限交原當選會議。若理事長由理事會選出，就是理事會；另依章程或法規由其他會議選出的要照實確認。應出席者過半數出席、出席者三分之二以上同意才通過。被罷免者出席也不得擔任該會主席；原召集人不依法召開，或原召集人就是被罷免人時，應申請主管機關指定其他理事或監事召集。'],
  ],
  refs:[{title:'人民團體選舉罷免辦法第29、30、32、34、38條',source:elections},{title:'人民團體法第22、27條',source:group}]
 };
}
function copyCoop(s){
 if(!/合作社/.test(s)||/信用合作社|信合社|保險合作社|協會|公會|工會/.test(s)||!/社員(?:的|之)?名(?:簿|冊|單)/.test(s)||!/整份|整本|複製|全拍|拍走|拍照|轉傳|拷貝|傳群/.test(s))return null;
 return {
  kind:'coop-roster-copy',title:'合作社：可依法查閱，不代表可拍走整份名簿',
  summary:'一般合作社的社員和合作社債權人可依法查閱社員名簿等法定簿冊；不是因為能查閱章程，就可任意拍下、拷貝或散布整份社員名簿。',
  steps:[['先確認查閱資格及方法','理事會依合作社法第35條備置名簿等，第37條給社員和合作社債權人查閱第35、36條書類的權利。不要以含個資為由全面拒絕法定查閱；完整複本、拍照或提供其他人則須另外確認法律依據、目的和必要範圍。若只需核對自己資格，先核對必要欄位，不要下載整份或貼到群組。']],
  refs:[{title:'合作社法第35、36、37、74條',source:cooperatives},{title:'個人資料保護法第5、19、20條',source:personal}]
 };
}
const registry=[recall,copyCoop];
function verifiedClauses(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>260)return null;
 // Only split when both independent topics are explicitly and uniquely recognized; do not infer a group from the other clause.
 const parts=t.split(/[；;。？！?!]+|另外|順便(?:請)?問|再請問|[，,](?=(?:一般)?(?:合作社|協會|社會團體))/).filter(Boolean);
 if(parts.length!==2)return null;
 const found=parts.map(s=>registry.map(r=>r(s)).filter(Boolean));
 if(found.some(xs=>xs.length!==1)||found[0][0].kind===found[1][0].kind)return null;
 const arr=found.map(x=>x[0]);
 const refs=[...new Map(arr.flatMap(x=>x.refs).map(x=>[x.source,x])).values()];
 return {direct:true,category:'跨類團體｜各題分開回答',title:'這兩題適用不同團體及程序',summary:arr.map(z=>z.title+'：'+z.summary).join('\n\n'),steps:arr.flatMap(z=>z.steps),refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={verifiedClauses,recall,copyCoop};return;}
root.verifiedIndependentClauses=verifiedClauses;
})(typeof window!=='undefined'?window:globalThis);
