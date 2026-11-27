(function(root){
'use strict';
const law=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const fundraising=n=>law('公益勸募條例','D0050138',n);
const ruling={title:'財政部台財稅字第09900359720號令',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=GL008678'};
function answerDonation(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/協會|社會團體|公益性社團法人/.test(t)||!/物資|物品|食品|實物/.test(t))return null;
 if(/合作社|政治獻金|宗教活動|政府機關|公立學校|行政法人|遺產|募款專戶/.test(t))return null;
 const passive=/主動(?:送來|捐贈|捐出|捐來|捐給|提供)|自發(?:送來|捐贈)|被動受贈|沒(?:有)?(?:公開|對外)(?:募集|勸募|徵集)/.test(t);
 if(!passive)return null;
 const positive=t.replace(/(?:沒(?:有)?|從未|未曾|並未|不曾)(?:公開|對外)?(?:發文|公告|號召|募集|勸募|徵集)/g,'');
 if(/(?:已經|先|正在|打算|曾經|曾|有在).{0,6}(?:發文|貼文|公告|公開募集|對外募集|號召|發起勸募)|已取得.{0,6}許可|許可期內|勸募活動期間|上網(?:募集|徵集)|公開(?:號召|徵集|募集)(?:物品|物資|食品)/.test(positive))return null;
 const tax=/所得稅|報稅|國稅局|列(?:為|入)?收入|收入.{0,5}支出|已申報|年度申報/.test(t);
 const askPermit=/公開勸募|公益勸募|勸募許可|申請許可|需.{0,3}許可|要.{0,3}許可/.test(t);
 if(!tax&&!askPermit)return null;
 const onward=/轉贈|轉送|分送|免費發給/.test(t);
 const sold=/轉售|賣掉|出售|販售|變賣|賣給/.test(t.replace(/(?:未|沒有|不曾|不)(?:轉售|賣掉|出售|販售|變賣)/g,''));
 const steps=[],refs=[];
 if(askPermit){
  steps.push(['要不要申請公益勸募許可','如果只是接受民眾主動捐贈，沒有對外發起募集，不是第7條所指須先申請許可的勸募活動。若協會有公開發文、號召不特定人捐物，不能只因收到的是物資，就當成被動受贈；須先核對第5條的團體資格及第7條的許可。']);
  steps.push(['被動受贈也可能有備查義務','若是第5條所稱勸募團體，且是基於公益目的接受外界主動捐贈，依第6條仍要開收據、定期公開徵信、依指定用途使用。公益性社團法人另須在年度終了後五個月內，將辦理情形及收支決算報設立、立案或監督機關備查。僅有協會立案，不等同已取得公益性社團法人資格；其收據及帳務仍須核對團體適用規定。']);
  refs.push(fundraising(5),fundraising(6),fundraising(7));
 }
 if(tax){
  const explanation=sold?'如果有轉售，不能用這道財政部函令把物資價值直接排除在所得稅收入、支出計算之外。應依實際交易及團體適用規定向管轄國稅局核對。':
   '不一定要列入所得稅收入及支出計算。這項處理限於符合所得稅法第11條第4項的機關團體，物資未轉售、依創設目的公益轉贈給受救助者或其他機關團體，且留有實際受贈、轉贈的登記簿及證明時。'+(onward?'免費轉贈本身並不代表全部條件都已符合。':'如果尚未轉贈或無法證明實際轉贈，不能直接適用。');
  steps.push(['所得稅是否列收入',explanation+' 符合函令條件時，轉贈給個人應留存有簽章的收據、清冊或證明；轉贈給機關團體，應留存對方開立的收據。未確定資格、紀錄不足或已申報而不確定是否漏列，宜帶受贈、轉贈及申報紀錄向管轄國稅局核對，再決定是否更正。不要把個資貼到櫃檯。']);
  refs.push(law('所得稅法','G0340003',11),ruling);
 }
 return {direct:true,category:'人民團體財務',title:askPermit?'民眾主動捐物與公開勸募不同'+(tax?'，所得稅另看轉贈條件':''):'受贈物資的所得稅處理，先核對轉贈條件',
  summary:askPermit&&tax?'是否需要勸募許可，和是否列入所得稅收入及支出，是兩件事。':askPermit?'先看有沒有對外發起募集。':'依團體資格、物資用途及實際受贈、轉贈紀錄判斷。',steps,refs};
}
if(typeof module!=='undefined'&&module.exports){module.exports={answerDonation};return;}
root.verifiedInKindDonationAnswer=answerDonation;
})(typeof window!=='undefined'?window:globalThis);
