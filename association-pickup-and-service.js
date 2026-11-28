(function(root){
'use strict';
const law=(title,code)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const civil=law('民法第27、103、167條：代表權與個別代理權','B0000001');
const association=law('人民團體法第12、17、18、54條：團體職務、章程及異動','D0050091');
const procedure=law('行政程序法第22、24、48、67–73條：代理、送達及期間','A0030055');
const cooperative=law('合作社法第34、39條：一般代表權與監事的特定代表權','D0050112');
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const offScope=/信合社|信用合作社|公會|工會|農會|漁會|管委會|股份有限公司|刑事|傳票|民事庭|裁判|政府採購投標|勞資調解|內部會議開會通知/;
const groups=/協會|社會團體|人民團體|社團法人|合作社|團體/;
const labels={award:'只代領獎狀或物品',delivery:'簽收機關公文',consent:'代簽契約、同意書或獎金文件'};
const awardRe=/(?:代|去|只|一起|現場)?領(?:(?:縣府|公所|主辦單位|協會)(?:的)?)?(?:獎牌|獎狀|獎品|獎盃|獎)(?!金)|代拿(?:獎牌|獎狀|物品)|拿(?:獎牌|獎狀)|主辦.{0,10}(?:獎|頒獎)|代領(?:證書|物品)/;
const deliveryRe=/公文|行政文書|(?:限期|官方|補件|繳回).{0,10}(?:通知|文書)|掛號|送達|收文(?!件|字)/;
const signatureRe=/簽(?:署|合同|約|契約|租約|交易|同意|授權)|(?:契約|合約|委託書以外).{0,10}(?:簽|代表)|著作授權|照片公開授權|同意轉帳|獎金同意書|代簽|匯入文件|匯款帳戶|同意扣.{0,4}稅|授權書.{0,12}簽字/;
const statedOnly=/只(?:是|要|幫忙|獲授權)?(?:代)?(?:領|拿)(?:(?:縣府|公所|主辦單位|協會)(?:的)?)?(?:獎狀|獎牌|獎|證書|物品)(?!金)|沒有要簽|不簽(?:約|合約|契約|收公文|授權|別的)|不簽.{0,7}公文|不領獎金/;
function parse(q,prior){
 const t=norm(q);if(!t||t.length>480||/^新題/.test(t))return null;
 const plain=t.replace(/(?:不是|並非|而非)(?:一般|普通|法院)?(?:協會|法人|合作社)/g,'');
 if(offScope.test(plain))return null;
 const prefix=/^(?:更正(?:一下)?|補充(?:一下)?|確認|其實|選擇|改成)/.test(plain);
 const follow=prior&&prefix&&/領獎|拿獎|公文|通知|簽|監事|代表人/.test(plain);
 const c=follow?prior:{};
 const only=statedOnly.test(plain)&&!/地方政府.{0,4}(?:要|要求)/.test(plain);
 const pick=plain.startsWith('確認只代領')?'award':plain.startsWith('確認簽收機關')?'delivery':plain.startsWith('確認代簽契約')?'consent':null;
 const knownAward=awardRe.test(plain),knownDelivery=deliveryRe.test(plain);
 const ambiguous=!knownAward&&!knownDelivery&&/簽收|拿通知|順便簽|領通知/.test(plain)&&/文件|通知|文書/.test(plain)&&groups.test(plain);
 const sign=signatureRe.test(plain);
 const hasActor=groups.test(plain)||/理事長|監事|總幹事|理事|會址/.test(plain)||!!c.org;
 const strongReceipt=knownDelivery&&(/簽收|代收|代接|收件|收到了|接.{0,7}公文|送達|收文|拒收/.test(plain))&&hasActor;
 const strongPickup=knownAward&&hasActor;
 const narrowContract=/合作社/.test(plain)&&/監事/.test(plain)&&/(?:跟|與|和)(?:本社|自家|一位|自己的?)(?:某位?|一位)?理事.{0,12}(?:簽|契約|租約)|與本社理事.{0,8}(?:租約|契約|簽)/.test(plain);
 const coopSign=/合作社/.test(plain)&&/監事/.test(plain)&&sign&&/代表|對外|代替/.test(plain)&&/簽署文件|代簽|合作社.{0,8}簽署/.test(plain);
 if(!follow&&!ambiguous&&!strongReceipt&&!strongPickup&&!narrowContract&&!coopSign)return null;
 if(!follow&&/檢舉人|個資外洩|被跟蹤|偽造印章|冒用|勸募收據|買票/.test(plain))return null;
 const negDelivery=/不(?:代)?簽收公文|不簽.{0,7}公文|不(?:再|用|需要)收公文|公文已.{0,15}(?:收|簽).{0,6}另一件/.test(plain);
 const negSign=/不簽(?:約|合約|契約|署|授權)|不簽.{0,14}(?:任何契約|別的)|不領獎金/.test(plain);
 const priorFull=!(follow&&(pick||only));
 const award=pick?pick==='award':knownAward||(priorFull&&!!c.award);
 const delivery=pick?pick==='delivery':(!negDelivery&&knownDelivery&&!/公文.{0,14}(?:是|另為)另一件/.test(plain))||(priorFull&&!negDelivery&&!!c.delivery);
 const consent=pick?pick==='consent':sign&&!negSign||(priorFull&&!negSign&&!!c.consent);
 const already=/(?:已(?:經)?|先).{0,18}(?:簽收|收件|收了|收，是|會址收件人收)|已收到(?:公文|掛號)/.test(plain);
 const normalizedOrg=/合作社/.test(plain)?'coop':/協會|社會團體|人民團體|社團法人/.test(plain)?'assoc':c.org||null;
 return {org:normalizedOrg,award,delivery,consent,narrowContract:narrowContract||(priorFull&&!!c.narrowContract),ambiguous,only:only&&!consent&&!delivery,already,priorLetter:follow&&negDelivery&&(already||!!c.delivery),funds:/獎金|銀行|匯款|轉帳|扣稅/.test(plain)&&!negSign,photo:/肖像|照片|著作|公開授權/.test(plain)&&!negSign,deadline:/限期|怎麼算|期限|幾天|補件|繳回|送達/.test(plain),seal:/印章|協會章|用印|印鑑/.test(plain),absence:/缺席|出差|請假|不在|在外地|暫時/.test(plain),isSup:/監事/.test(plain)||!!c.isSup,forChair:/親自|理事長.{0,8}對外代表/.test(plain)};
}
const attendance=['代領獎狀、獎牌可採有限授權，先看主辦是否接受','監事、總幹事或工作人員不會因職稱自動取得領獎或對外代表權。請先看章程及有權代表人的範圍，由能授權者依主辦規則，載明團體、代領人、活動、物件、日期及僅限代領。主辦可能要求邀請通知、委託書、核驗身分或法人代表證明；是否看正本或留存影本，按主辦的實際要求，不必先交額外證件，也不要貼到小屏。理事長親自出席仍可能需主辦方核驗身分或代表證明。'];
const actualService=['公文簽收不等於同意內容，也不是領獎授權的一部分','行政程序法第69條：對團體原則向代表人或管理人送達。已有適法程序代理人時，另依第71條確認。若於應送達處所找不到應受送達人，第73條在法定條件下可交受僱人或收件人員；利害相反等例外要注意。不因代收人不是理事長就一律無效；也不因持章、拿一般代領書就當然合格。行政程序確需委任，依第24條由有權人辦理並在首次程序行為時出示委任書，與純收件不同。'];
const time=['收文時間、期限與轉交分開記，勿等理事長回來','保留原信封、回執、實際送達日期、收件方式、文號與收件人，立刻通知團體承辦及有權代表，向發文機關核對期限。若依法以日計算且從有效送達起算，第48條原則不計始日；特別規定、處分及末日要另核，不能只據口頭的天數。內部轉交或再次領件不會自行重算；無正當理由拒收，在法定情況仍可能構成留置送達，不建議以拒收拖延。'];
const mandate=['只寫代領，不能逕行簽同意書或契約','民法第103、167條：可依具體權限授權代理，拿獎牌不等於同意借款、契約、權利授權或其他義務。請先拆開領物、收受機關文件、契約／同意書；是否可用同一張委託書取決於各主辦／受理單位及各項實際授權，不輕率通用。有權人應明確記載可簽的文件、上限或條件，不在授權外簽。'];
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 const make=(title,summary,steps,refs)=>({direct:true,category:s.org==='coop'?'合作社會務｜簽收與對外代表':'團體會務｜代領、簽收與授權',title,summary,steps,refs,receiveAuthorityContext:s,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]});
 if(s.ambiguous&&!s.award&&!s.delivery&&!s.consent){
  const a=make('先分清楚只是領取、簽收還是簽署','替團體拿物品、簽收一份通知，和簽下契約或同意書的效果不同。先看文件種類，不要只因對方請你簽一下就代簽。',[],[civil,procedure]);
  return {...a,choiceHeading:'現場要辦的是哪一件？',choices:Object.entries(labels).map(([k,label])=>({label,question:'確認'+label}))};
 }
 const coop=s.org==='coop';
 const steps=[];
 if(s.award)steps.push(attendance);
 if(coop)steps.push(['持有合作社印章不是代表權','合作社法第34條：理事依法律、章程和社員大會決議執行，並互推有權代表的人。第39條第4款另規定，合作社與本社理事訂立契約或為訴訟行為時，監事就該事項代表合作社。'+(s.narrowContract?' 你提與本社理事簽租約，這件屬須確認第39條的特殊代表範圍；與非理事的房東或其他人簽約，不能沿用這個身分。':' 這不代表監事有一般對外簽署權。')+' 代表權和是否還要依章程及權責作決議，是兩件事；合約、印章及授權紀錄要分開確認。']);
 if(s.consent||s.award&&s.funds){
  steps.push(mandate);
  if(s.funds||s.photo)steps.push(['獎金、匯款、照片或著作授權另確認','若文件涉及獎金、扣稅或匯款同意，先確認主辦規則、款項應入的團體帳戶及有權同意人。照片公開、肖像或著作利用另由有權者確認範圍，不能從領獎推定同意。不要現場以他人名義代簽，也勿在這裡貼帳戶、證件或完整公文。']);
 }
 if(s.delivery){steps.push(actualService,time);}
 if(s.priorLetter&&!s.delivery)steps.push(['已簽收的那份公文仍是另一件','這次只領獎牌，不改變先前公文的送達認定。請保留原簽收日期，照原通知查期限；不要把領獎日當成補件起算日。']);
 if(!coop)steps.push(['單次授權不等於更換團體代表人','先看章程、有效決議和誰有對外代表權；社團法人另核民法第27條和登記，未登記團體按其章程及權責。有權人因請假或出差，通常不會因此喪失職務；臨時請人代領、代收或就某件事代理，不等於正式異動代表人。']);
 const headline=s.award&&(s.delivery||s.consent)?'代領獎、簽收公文和代簽文件要分開':s.delivery?'簽收機關公文：先分實際送達與代簽':s.award?'只代領獎狀或物品：確認主辦要求及授權':'先核對對外代表人及可簽的文件';
 const summary=s.only?'只代領獎狀或物品，不代簽其他文件。監事沒有自動領取權；主辦若接受代領，可先按要求備妥有限授權。':s.delivery?'拿印章或代領委託書，不能一併當成簽收、簽署與同意的權限。已收限期文書的話，先保留收件時間並核對期限。':'請分開確認代表權、單次委託和文件內容。不能只因是監事或持有印章就代表團體作所有決定。';
 return make(headline,summary,steps,[...(coop?[cooperative]:[association]),civil,...(s.delivery||s.priorLetter?[procedure]:[])]);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedAssociationPickupAndService=route;
})(typeof window==='object'?window:globalThis);
