(function(root){
'use strict';
const ref=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const coop=ref('合作社法第34、39、48–50、53、54條','D0050112');
const ele=ref('合作社選舉罷免辦法第6、7、23條','D0050022');
const credit=ref('信用合作社選聘辦法第27條','G0380069');
const fine=ref('合作社法施行細則第13條','D0050113');
const check=ref('合作社監事監查規則','D0050122');
const clean=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const mode=/合作社會議確認:(理事會|監事會|社員大會|信用社選舉|不確定)(?=[。；;]|$)/;
const neg=/(?:不是|並非|不問|不在問|也不是)(?:說|在問|問)?(?:選社員代表|社員代表選舉|社員代表大會|社員大會|理事會|監事會|一般合作社|消費合作社|信用合作社|信合社|一般協會|協會)(?=[、，,；;。]|$)/g;
const num='[一二兩三四五六七八九十0-9]{1,3}';
function count(s){
 if(!s)return null;
 if(/^\d+$/.test(s))return Number(s);
 const d={'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
 if(s==='十')return 10;
 if(s.includes('十')){const [a,b]=s.split('十');return (a?d[a]:1)*10+(b?d[b]:0);}
 return d[s]??null;
}
function route(q){
 const raw=String(q??'').trim(),t=clean(raw),marked=t.match(mode)?.[1],z=t.replace(neg,'').split(/合作社會議確認:/)[0];
 if(!t||t.length>690||/^新題/.test(t)||/農會|漁會|管委會|工會|公司董事會|協會跟合作社/.test(z))return null;
 const hasCoop=/合作社|信用社|信合社/.test(z);
 const hasCredit=/信用合作社|信用社|信合社/.test(z);
 const board=/理事會|監事會|理監事會/.test(z), assembly=/社員大會|社員代表大會/.test(z);
 const isElection=/選社員代表|社員代表選舉|選舉社員代表|社員代表.{0,5}(?:選舉|投票)/.test(z);
 const intent=/委託|代理|代出席|代投|代簽|算(?:人數|人頭|席次|第)|持委託|可以請.{0,10}代/.test(z);
 const doubt=/(?:不知道|不確定|不清楚|沒寫|未寫).{0,25}(?:大會|理事會|監事會|信用社|信用合作社|一般合作社)/.test(z)&&/社員|理事/.test(z);
 if(!intent||!hasCoop&&!marked&&!doubt)return null;
 if(/社會團體|協會/.test(z)&&!hasCoop)return null;
 if(!marked&&/社員代表大會|社務會/.test(z)&&!/社員大會/.test(z)&&!board&&!doubt)return null;
 const isAudit=/監事會/.test(z)&&!/理事會/.test(z);
 const creditMode=marked==='信用社選舉'||hasCredit&&isElection&&!doubt;
 if(hasCredit&&!creditMode&&!doubt&&!marked)return null;
 if(isElection&&!creditMode&&!board&&!marked&&!doubt)return null;
 const focus=marked||(doubt?'':creditMode?'信用社選舉':board?(isAudit?'監事會':'理事會'):assembly?'社員大會':'');
 const action=[{label:'聯絡承辦',view:'contact',sub:''}];
 const boardStep=['理事和監事的實際出席，不用社員大會的委託書補人數','合作社法第53條：理事會由主席召集，有理事過半數出席才開會，出席理事過半數同意才決議；第54條準用於監事會。第50條只准社員大會書面代理，不是理事會或監事會代出席、代投票、計入人數的依據。未確認其他適用規則，先不要把代理席次算進去。'];
 const memberStep=['一般合作社社員大會：書面請其他社員代為出席','依合作社法第50條，社員不能出席社員大會時，可用書面委託其他社員；同一位受託人最多代理一位，不能同時替兩名社員。請核對有效社員、委託範圍及社方收件規則，不用空白委託書。第48條的社員大會門檻不是理事會的計算規則。'];
 const visual=['一位在線上要不要算，先查有效規則及實際出席','核對章程、適用規範和當時會議通知、身分確認及實際參與紀錄。未查清前先不要把該位視訊算進有效出席，也不因未帶章程就宣告全國所有合作社一律不能視訊。'];
 const records=['簽完紀錄也不能代替成會，請保留原始資料','保留原通知、簽到、委託書、視訊出席佐證、原會議紀錄及有爭議的票數。記下差異，向主席及監事會反映；需重議就依法及章程重新召集，不刪改或倒填舊紀錄。外送資料前先遮蔽不必提供的個資。'];
 const fiscal=['不要單憑有疑義的決議付款','預算或採購要核對章程、有效決議、授權及既有契約，不把任一場理事會等同社員大會已通過。先交合法權責人核實。若另有確定已到期的契約義務，仍須另行依法處理，不能只因會議有疑義就拒付；可請監事依第39條及監查規則查核。'];
 const chair=['換主席先辨明改選、出缺或其他法定情形','合作社選舉罷免辦法第6條規定理事會主席由理事互選，原則以得票超過出席人數半數者當選，無人過半另有次輪。第7條有主席出缺的補選及不足六個月代理規則，不等於未具足成會人數也能改選，或一項預算決議就能改掉主席。'];
 if(creditMode)return {direct:true,title:'信用合作社社員代表選舉，選舉人要親自出席',category:'信用合作社｜選舉委託',summary:'不可以委託。信用合作社選聘辦法第27條規定，選舉人須親自出席，不得委託他人代理；不要套一般合作社的社員大會委託。',steps:[['看通知確認是信用合作社的選舉','社員代表選舉和社員大會、理事會不是同一場。即使同一人兼具理事與社員身分，該次選舉仍須由有選舉權的人親自出席；如果收到的通知其實只是一般會議，請向信用合作社確認會議種類和適用規則，不直接按選舉答案處理。']],refs:[credit],actions:action,questionState:{focus:'compound'}};
 if(focus==='社員大會')return {direct:true,title:'一般合作社社員大會：一位社員最多代理一人',category:'合作社｜社員大會委託',summary:'不能請任意親友代替；請另一位社員持書面委託。同一代理人最多代理一位社員，不能代理兩位。',steps:[memberStep],refs:[coop],actions:action,questionState:{focus:'compound'}};
 if(!focus||focus==='不確定')return {direct:true,title:'先確認是理事會還是社員大會，再判斷能否委託',category:'合作社｜會議及代理分流',summary:'先看通知的會議名稱、召集單位及議程；兼具理事、社員身分也不代表兩種會議都能委託。還沒確認時，不要先交空白委託書或把代理算進理事會。',steps:[boardStep,memberStep],refs:[coop,credit],actions:action,questionState:{focus:marked?'compound':'clarify'},...(!marked?{choiceHeading:'您指的是哪一種會議？',choices:[['一般合作社理事會','理事會'],['一般合作社社員大會','社員大會'],['信用合作社選舉','信用社選舉'],['通知仍不確定','不確定']].map(([label,k])=>({label,question:raw+'；合作社會議確認：'+k+'。'}))}:{})};
 const total=count(z.match(new RegExp('(?:共|總共|總計|一共|有)('+num+')(?:名|席|位|個)?(?:理事|監事|席)'))?.[1]||z.match(new RegExp('(?:理事會|監事會)(?:共|總共|有)?('+num+')席'))?.[1]);
 const actual=count(z.match(new RegExp('('+num+')(?:個|位|名|人|席)?(?:親自(?:出席|到場|到)|到場|本人出席|人到場)'))?.[1]);
 const literal=total&&actual!==null&&total>0&&total<=99&&actual<=total;
 const quorum=literal?Math.floor(total/2)+1:null;
 const hasVideo=/視訊|線上|遠距/.test(z);
 const usedVote=/會議紀錄|已簽|證據|補救|紀錄有誤|怎麼補|重新開/.test(z);
 const hasSpend=/預算|付款|採購|請款|支出|核銷/.test(z);
 const hasChair=/換主席|改選主席|主席出缺|選(?:理事會)?主席/.test(z);
 const both=board&&assembly&&!marked;
 const summary=literal&&actual<quorum?(''+total+'位'+(focus==='監事會'?'監事':'理事')+'至少要有'+quorum+'位有效出席；已確認本人到場只有'+actual+'位。不要把委託書算成多一席。'+(hasVideo?'視訊席次要先查是否合法，未確認則不能據此認定成會。':'沒有其他合法出席時，不足以開會表決。')+(hasSpend?'先不要憑這項有疑義的決議付款。':'')):
 both?'兩場要分開：一般合作社社員大會可以依法書面代理，但不把大會委託書帶到理事會代出席、代投或算人數。':
 '這是'+focus+'，不能把社員大會的委託書用來代出席、代投票或湊人數。先按合作社法第53、54條核對有效出席，再算表決。';
 return {direct:true,title:literal?'合作社'+focus+'：先算有效出席，再看能否表決':'合作社'+focus+'：社員大會委託書不能用來算出席',category:'合作社｜理監事實際出席及決議',summary,steps:[boardStep,...(hasVideo?[visual]:[]),...(hasSpend?[fiscal]:[]),...(hasChair?[chair]:[]),...(usedVote?[records]:[]),...(both?[memberStep]:[])],refs:[coop,...(hasChair?[ele]:[]),...(usedVote?[fine]:[]),...(hasSpend?[check]:[])],actions:action,questionState:{focus:'compound'}};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedCoopBoardProxyQuorum=route;
})(typeof window==='object'?window:globalThis);
