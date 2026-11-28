(function(root){
'use strict';
const ref=(title,code,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const plan={title:'衛福部 115 年長照服務發展基金一般性獎助計畫',source:'https://www.mohw.gov.tw/cp-6626-76083-1.html'};
const data={title:'屏東縣社區照顧關懷據點（政府開放資料）',source:'https://data.gov.tw/dataset/136022'};
const publicGuide={title:'衛福部：設立長照機構與特約是不同程序',source:'https://1966.gov.tw/LTC/cp-6533-70776-207.html'};
const permit=ref('長期照顧服務法第23條：事先申請許可','L0070040',23);
const service=ref('長期照顧服務法第9條：社區式服務','L0070040',9);
const fees=ref('長期照顧服務法第35條：收費項目、金額核定','L0070040',35);
const benefits={title:'長期照顧特約管理辦法',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0070064'};
const register=ref('長期照顧服務法第19條：長照人員登錄','L0070040',19);
const privateData={title:'個人資料保護法第5、6、19、20條：資料最小化與使用',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021'};
const food=ref('食品安全衛生管理法第8條：衛生及登錄','L0040001',8);
const fund={title:'中央對民間團體及個人補（捐）助預算執行注意事項（中央補助適用）',source:'https://law.dgbas.gov.tw/LawContent.aspx?id=FL033828'};
const labels=[['center','共餐與關懷據點'],['station','巷弄長照站與預防服務'],['day','失能日間照顧'],['unknown','還不確定是哪一種']];
const center=['關懷據點申請不是長照機構設立','立案的社區發展協會可向屏東縣社會處洽當年度據點方案。衛福部 115 年一般性獎助計畫是每時段至少 3 小時、從關懷訪視、電話問安／諮詢轉介、餐飲、健康促進中至少辦理 3 項。單做共餐或再加電話問安仍未達此三項標準；是否能受理新設、村里是否已設點或有例外，查當年度及縣府公告。'];
const station=['巷弄站與個別特約服務再分開','115 年一般性獎助計畫的巷弄長照站有據點服務、共餐及預防延緩失能服務；若要另外提供喘息等服務，要核准設置內容、適用特約與人員條件。既有據點核定、站名或有照服員，都不能直接開放個別長照服務。'];
const day=['先確認實際服務、許可與人員','若實際提供對失能者的社區式日間照顧，應向所在地長照主管機關確認設立或變更許可、場所與人員資格／登錄。依法應取得長照機構許可的服務須先辦許可；既有據點或共餐獎助核定函不能代替。屏東機構服務可向縣府長期照護處詢問。'];
const price=['分自費、政府給付與共餐分擔','長照機構的收費項目、金額須由提供服務所在地主管機關核定。若要申報長照給付，另查特約、給付對象、核定照顧計畫與服務項目；不是有機構執照就自動有給付。據點共餐分攤另依當年度補助規定及核定內容，不自行填費率。'];
const land=['場地借用同意不是照顧服務許可','核對村活動中心是否同意實際用途、時段及設備；涉及新增依法受管制服務時，也要查使用、消防、無障礙等適用條件。'];
const grant=['補助、分擔與憑證各自記清楚','查本案核定可支用項目與期間，社區共餐、個案照顧、民眾分擔或自籌分列；同一筆食材不能向不同補助重複核銷。若有共同部分，要先向原核定機關確認是否允許分攤、憑證與留存方法。依法應開收據的收入依適用規定辦。'];
const records=['送餐、外包及長者個資','外包供餐先核業者適用的登錄、衛生及配送規範；志工送餐按據點及服務計畫安排。長者聯絡或照顧名冊只供負責此服務且有必要的人使用，不貼公開群組；若含依法受特別保護的醫療、健康檢查等資料，須另有合法依據。'];
const out=(title,summary,steps,refs,extra={})=>({direct:true,category:'社區照顧｜據點、巷弄站與日間照顧',title,summary,steps,refs,questionState:{focus:'cross-community-care-service'},...extra});
function route(q,active){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>550||/^(?:另問|新題|換題)|食品中毒|過期食品|性騷擾/.test(t))return null;
 const pick=t.match(/;櫃檯確認社區照顧:(center|station|day|unknown)$/)?.[1];
 const source=/關懷據點|巷弄長照站|巷弄站|日間照顧|日照中心|白天照顧|托老|長照機構/.test(t);
 const scope=/協會|社區|共餐|關懷據點|巷弄/.test(t);
 const ask=/申請|設立|立案|提供|核定|可不可以|要先|想用|想做|想辦|居住|要做|辦長輩|收費|特約|怎麼分|給付|按規|能不能|名冊|照服員|負責/.test(t);
 const follow=active&&/^(?:更正|補充|那|如果|不是)/.test(t);
 if(!pick&&(!scope&&!follow||!ask||!source&&!(follow&&/共餐|失能照顧|長照給付/.test(t))))return null;
 const negative=/不(?:是要辦|是要做|是要|提供|做|辦|會提供)(?:日間照顧|日照|托老|身體照顧)|不做身體照顧/.test(t);
 const stationAsked=/巷弄長照站|巷弄站/.test(t);
 const dayAsked=!negative&&/日間照顧|日照中心|白天照顧|托老|照服員.{0,22}失能|失能.{0,10}照顧/.test(t);
 const finance=/補助|費用|收費|自費|外包|同筆|核銷|給付/.test(t);
 const mixed=!pick&&((stationAsked&&/失智|失能.{0,9}照顧/.test(t)&&finance)||/共餐|關懷訪視/.test(t)&&finance&&/名冊|場地|送餐/.test(t));
 const needs=/哪一種|不確定|想選|讓我選|哪個方案|到底要先確認|據點還是巷弄/.test(t);
 const useRefs=[plan,data,permit,benefits,publicGuide];
 if(pick==='unknown'||(!pick&&needs&&!mixed)){
  const base=raw.replace(/[;；]櫃檯確認社區照顧:[a-z]+$/i,'');
  return out('按服務內容分：據點、巷弄長照站或日間照顧','只做共餐及關懷，與固定替失能者提供日間照顧不同。您可以先選服務，不用提供長者的身分、病況或名冊。',[],useRefs,{choiceHeading:'您想辦哪一種服務？',choices:labels.filter(([id])=>!(negative&&id==='day')).map(([id,label])=>({label,question:base+'；櫃檯確認社區照顧:'+id}))});
 }
 if(mixed)return out(negative?'只做共餐與關懷：場地、補助和長者資料分開':'加開照顧服務前，先分據點計畫、機構許可和特約',negative?'目前已知只做共餐、訪視或健康促進，不應當成申請日照。先確認據點當年度核定內容，再處理借場地、據點經費、衛生及資料。':'先確認是據點或巷弄站的預防服務、特約喘息，還是日間照顧。不能用原共餐計畫直接開始失能照顧、報長照給付或混用原補助。',[
  negative?center:station,...(negative?[]:[day,price]),land,grant,records
 ],[...useRefs,fees,food,privateData,fund]);
 if(pick==='day'||(!pick&&dayAsked))return out('日間照顧：據點核定函不能代替許可或特約','不能直接沿用據點核定函。若您要替失能長者提供固定日間照顧，先確認長照機構許可；另要報長照給付，才再辦理及核對特約。',[day,price,land],[service,permit,register,fees,benefits,publicGuide]);
 if(pick==='station'||!pick&&stationAsked)return out('巷弄長照站：共餐與預防服務，另查特約','巷弄長照站不是只辦一項聚餐，也不等於已開設日照。先核對當年度站點方案、原據點資格及要提供的服務。',[station,center,land,...(finance?[grant]:[])],[...useRefs]);
 return out('共餐與關懷：先核對社區照顧關懷據點方案','如果只做關懷、共餐或健康促進，先向屏東縣社會處查當年度關懷據點方案，不必先把它當成日照機構籌設。能否補助要看服務項目、場地及縣府當年度受理。',[center,land,...(finance?[grant,records]:[])],[plan,data,permit]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCommunityCareServiceTriage=route;
})(typeof window!=='undefined'?window:globalThis);
