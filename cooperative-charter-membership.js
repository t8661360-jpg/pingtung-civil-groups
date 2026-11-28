(function(root){
'use strict';
const coop={title:'合作社法第9、9-1、11、14、21、26至30、35、46、48、50條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const rule={title:'合作社法施行細則第11條：減少每股金額或保證金額的登記資料',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050113&flno=11'};
const credit={title:'信用合作社法第2、5、8、11、15條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380058'};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
function route(q){
 const t=norm(q);if(!t||t.length>410||/^(?:新題|另問)|公會|工會|農會|漁會|基金會|保險合作社|管委會|股東|法院出庭/.test(t))return null;
 const forced=t.match(/;確認合作社種類:(ordinary|credit)$/)?.[1];
 const b=t.replace(/;確認合作社種類:[a-z]+$/,'').replace(/(?:不是|並非|不是問|不是要問|不談|不是指)(?:一家|一般|普通)?(?:信用合作社|合作社|社區發展協會|一般協會)/g,'');
 if(!forced&&!/(?:合作社|信合社)/.test(b)&&/協會|社團法人|社會團體/.test(b))return null;
 const isCredit=forced?forced==='credit':/信用合作社|信合社/.test(b);
 const ordinary=/合作社|社員/.test(b);
 const out=(title,summary,steps,refs)=>({direct:true,category:isCredit?'信用合作社｜修章與變更登記':'一般合作社｜修章、社籍與變更登記',title,summary,steps,refs});
 const clarify=!forced&&/不確定|不知道|不清楚|分不出/.test(b)&&/普通.{0,12}信用|信用.{0,12}一般|信用.{0,12}普通/.test(b);
 if(!ordinary&&!isCredit&&!clarify)return null;
 const exactChange=/(?:修正|修改|變更|更改|修訂|更新|更換|改)(?:合作社)?章程|修章|修社章/.test(b);
 const name=/改名|改.{0,4}社名|名稱.{0,4}(?:改|變更)|變更.{0,4}名稱/.test(b);
 const address=/社址.{0,5}(?:搬|變|改|遷)|(?:搬|改|遷|變更).{0,5}社址/.test(b);
 const business=/改業務|(?:改|變更|增加).{0,6}業務|業務項目.{0,4}(?:改|變更)/.test(b);
 const eligibility=/社員.{0,5}(?:資格|入社條件|入社資格)|(?:入社|社籍).{0,4}資格|社籍|名冊/.test(b)&&/(?:改|變|搬|外地|本鄉|重新|退股|原)/.test(b);
 const reducing=/(?:降低|調降|減少|改低|降).{0,8}(?:每股|社股金額|保證金額)|(?:每股|社股金額|保證金額).{0,8}(?:下調|減少|降低)/.test(b);
 const returnTo=/退社.{0,12}(?:回來|重新入社|再入社|再加入|撤回|反悔)|出社.{0,8}(?:再入社|再加入|回來)/.test(b);
 const onlyReturn=returnTo&&/(?:不是|並非|不談|不是要|不用|不想)修章|(?:不是|不辦|不改|不用改)章程/.test(b);
 const timing=/登記|備查|核定|社員大會|要重新|外地|退股|透過理事會|改章|股權/.test(b);
 if(!forced&&!clarify&&!exactChange&&!onlyReturn&&!returnTo&&!((name||address||business||eligibility||reducing)&&timing))return null;
 if(/解散|合併|併社|改成銀行|轉(?:成|為)銀行|改組為商業銀行/.test(b)&&!/(?:不|不是要)(?:解散|合併)/.test(b))return null;
 if(clarify)return {...out('先確認是一般合作社還是信用合作社','兩者都要先走適用的修章程序，但信用合作社另有核定程序，不能只套一般合作社的變更登記。請依登記證上的團體種類選擇。',[],[coop,credit]),
  choiceHeading:'您要辦哪一種合作社的修章？',choices:[['一般合作社','一般'],['信用合作社','信用']].map(([label,key])=>({label,question:String(q??'')+'；確認合作社種類:'+(key==='一般'?'ordinary':'credit')}))};
 if(isCredit&&returnTo&&!exactChange)return null;
 if(isCredit)return out('信用合作社修章：社內決議、主管機關核定與變更登記要分開','依信用合作社法第8條，修章不能只做一般合作社的變更登記，也不是有社員大會紀錄就能直接生效。',[
  ['先查這一項要如何提案及決議','核對現行核定章程和修正事項。信用合作社依法設有社員大會；有合法社員代表大會時，查第15條、相關法令、章程與本案的決議要求，不能把一般合作社的表決門檻直接搬來。'],
  ['縣（市）先轉請中央核定','在屏東，應依第8條向縣主管機關送件，由其轉請中央主管機關核定；直轄市走直轄市主管機關。第5條所列中央主管機關為金融監督管理委員會。'],
  ['另辦一個月內的變更登記','第8條也規定章程變更應於一個月內登記，未登記不能對抗善意第三人。請核對核定文件的生效／起算日期及應附資料，不拿一般合作社的社員大會決議日直接套算。']
 ],[credit]);
 if(returnTo&&(!exactChange||onlyReturn))return out('只是提出退社，和已經退社後再入社不同','先查退社是否已生效。只是提出申請但尚未出社，先向合作社書面釐清是否可撤回，不能當成已經重新入社；確已出社，才走再次入社。',[
  ['核對書面請求、生效日及章程','一般依合作社法第27條於年度終了時退社，原則提前三個月書面提出，章程得延長；依原申請、回覆和現行章程核對該次生效狀態與名冊。'],
  ['已出社才按第29條及第14條再申請','得由兩名以上社員介紹或提出書面請求。有限／保證責任由理事會同意並報告社員大會；無限責任由社務會提大會、出席社員四分之三以上通過。已退出的股金退還依第30條與章程處理，再入社不代表舊股金自動恢復。']
 ],[coop]);
 const steps=[
  ['先列清楚要改哪些章程條文', (name||address||business?'名稱、社址及經營業務均為章程事項及主要登記事項，不能只改招牌、聯絡地址或帳戶資料。如果只是通信地址而正式社址沒變，先核對原登記與章程。':'核對本次要變更的是社員資格、社址、股額或其他章程條款，區分只是填報聯絡資料和真的改章。')],
  ['由社員大會依法決議，再辦變更登記','如屬普通社員大會，理事會七日前以書面載明召集事由和提議事項通知社員。全體社員過半數出席且出席者過半數同意，正好一半不足；有其他法令或章程程序也要核對。確有合法社員代表大會者，先查代表資格及職權。修章決議後一個月內，依第9條第4項以書面檢具會議紀錄向主管機關辦變更登記。']
 ];
 if(/原社員|舊社員|重新|資格|退股|股金|名冊|居住|要住/.test(b))steps.push(['原社員不因修章自動重新入社或退股','先核對原名冊、舊章程與修正條款的生效和過渡安排：只限制將來入社，或也影響現有社員？不能只因住外地就自動刪名、強制退股、再收一筆或不發合法通知。出社、除名、再入與股金依第26至30條和適用章程辦；遇到資格改動的爭議先請主管機關確認。']);
 if(/委託|代投|代理|外地/.test(b))steps.push(['普通社員大會的書面委託','不能出席者可書面委託另一位社員，一人最多代理一人；要核對資格與委託書。這是普通社員大會，不直接套給理事會或另有選務限制的會議。']);
 if(reducing)steps.push(['減少每股金額另有債權人程序','有限責任減每股金額、保證責任減每股或保證金額，社員大會決議後須通知或公告債權人，給至少一個月異議。有人依法提出異議，先清償或提供相當擔保，不能先減。申請變更登記時敘明通知或公告結果，附決議紀錄、財產目錄及資產負債表。一般修章的一個月與債權人異議期不是同一件事；同次辦理時先向主管機關確認送件安排。']);
 return out('一般合作社修章：原社員不必為了修章重新入社','修章是同一合作社變更章程，不是成立新社。原則由社員大會決議、依法辦理變更登記；不能因為要送登記，就叫原社員全部重入。',steps,[coop,...(reducing?[rule]:[])]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeCharterMembership=route;
})(typeof window!=='undefined'?window:globalThis);
