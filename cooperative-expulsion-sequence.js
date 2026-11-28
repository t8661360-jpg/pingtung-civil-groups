(function(root){
'use strict';
const cite=(title,pcode,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const coop=n=>cite('合作社法第'+n+'條','D0050112',n);
const ass=n=>cite('人民團體法第'+n+'條','D0050091',n);
const noticeDate={title:'內政部兩則除名生效日函釋（臺北市訴願決定所引）',source:'https://laws.gov.taipei/law/LawDecision/ContentExport?id=1624-071'};
const combined={title:'內政部函釋：社務會出席以理監事合計',source:'https://laws.gov.taipei/Law/Interpretation/Content/FE000944'};
const electronic=cite('電子簽章法第5條：可供查驗的電子書面','J0080037',5);
const credit=cite('信用合作社法第12-1條：自請退社與股金','G0380058','12-1');
const clean=q=>String(q??'').normalize('NFKC').replace(/\s/g,'').replace(/(?<=\d),(?=\d{3}(?!\d))/g,'');
const simple={零:0,〇:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100,千:1000};
const num='[0-9〇零一二兩三四五六七八九十百千]{1,8}';
function read(s){
 if(!s)return null;
 if(/^\d+$/.test(s)){const n=+s;return n<=100000?n:null;}
 if(/[0-9]/.test(s)||/[百千][一二兩三四五六七八九]$/.test(s))return null;
 if(!/[十百千]/.test(s))return +[...s].map(x=>simple[x]).join('');
 let total=0,carry=null,previous=Infinity;
 for(const c of s){
  const d=simple[c];
  if(d>=10){if(d>=previous)return null;total+=(carry??1)*d;carry=null;previous=d;}
  else {if(carry!==null&&carry!==0)return null;carry=d;}
 }
 return total+(carry??0);
}
function find(t,list){
 for(const p of list){const x=t.match(new RegExp(p.replace('#','('+num+')')))?.[1];const n=read(x);if(n!==null)return n;}
 return null;
}
function counts(t){
 const attendance=find(t,[
  '(?:實際|實到|實出席|實際出席|出席|到場)(?:人數)?(?:是|有|共|為|:)?#(?:位|人|名|席)(?:理事|監事|理監事|社員|會員)?',
  '#(?:位|人|名|席)(?:理事(?:與|和|及|、)?監事|理監事|理事|監事|社員|會員)?(?:有)?(?:實際)?(?:出席|到場|到會|在場)',
  '社務會(?:共|有)?#(?:位|人|名)(?:理監事|理事和監事|理事監事)']);
 const ayes=find(t,[
  '(?:有|只有|僅|只|贊成|同意|票數|表決)(?:票數)?(?:是|為|共|:)?#票(?:同意|贊成|通過)?',
  '#票(?:同意|贊成|決定|表決|通過|要|想|支持|除名)',
  '#(?:位|人|名)(?:理監事|理事監事)?(?:同意|贊成|投贊成票)']);
 const total=find(t,[
  '(?:全體|全部|總共|總計|總數)(?:理事(?:與|和|及|、)?監事|理監事)(?:合計|總數|人數|有|共|是|為|:){0,3}#(?:位|人|名|席)?',
  '(?:理事(?:與|和|及|、)?監事|理監事)(?:合計|總計|總共|總數)(?:有|是|為|:)?#(?:位|人|名|席)?',
  '全體(?:有|共)?#(?:位|人|名|席)(?:理監事|理事|成員)?']);
 return {attendance,ayes,total};
}
const common=['除名事由、表決、書面通知各是一步',
 '一般合作社除名事由須依章程。依合作社法第28條，先由社務會的實際出席理事、監事四分之三以上議決，再以書面通知被除名的社員，並向社員大會報告。只在群組用語音口頭說明或電話轉述，不能代替書面通知。投票達標不等於除名已生效；應核對正式書面通知和實際通知日期。'];
const returnTo=['合法出社後，能重新申請，但不會自動回復社員資格',
 '合作社法第26條將合法除名列為出社事由，第29條仍可按第14條申請再入社。由兩名以上社員介紹，或提出書面請求；有限責任或保證責任合作社須經理事會同意、報告社員大會；無限責任合作社由社務會提請社員大會出席社員四分之三以上通過。新加入者許可後一個月內報主管機關備查。'];
const shares=['退股金另外算：通常不是除名那天，也不保證全退',
 '已依法出社的社員，可依合作社法第30條和章程請求退還部分或全部股金。原則按合作社營業年度終了時的財產計算，章程另有規定則按章程；不是一律按實繳金額全退、按除名日結算或當日付款。先確認合法出社日期、章程及年度財務資料，再向合作社核對金額與付款安排。'];
const creditContrast=['信用合作社自請退社另有特別規則',
 '信用合作社社員自請退社適用信用合作社法第12-1條：按年度終了經社員代表大會決議通過的決算淨值除以股數，每股不超過面額；依法應在社員代表大會決議通過後三個月內退還。這是信用合作社的自請退社規則，不是一般合作社被除名時的統一付款期限。'];
function answer(q){
 const t=clean(q);if(!t||t.length>385||!/除名|開除社員|把.{0,6}踢出|被踢出/.test(t)||/工會|公會|農會|漁會|基金會|管委會|保險合作社/.test(t))return null;
 const general=/(?:一般|普通|消費|勞動|生產|運銷|供給|利用|運輸|公用)合作社/.test(t);
 const creditMention=/信用合作社|信合社/.test(t);
 const coopWord=/合作社/.test(t.replace(/信用合作社/g,''));
 const assoc=/協會|社會團體|人民團體/.test(t);
 const crossCredit=creditMention&&general&&/自請退社|自己申請退社|自行退社|三個月|3個月/.test(t);
 const crossAssoc=assoc&&coopWord&&/會員(?:代表)?大會|社務會/.test(t)&&/一樣|相同|怎麼比|差別|四分之三/.test(t);
 const parts=counts(t);
 if(crossAssoc&&!creditMention&&/協會.{0,10}會員(?:代表)?大會/.test(t)&&!general){
   const n=parts.attendance,yes=parts.ayes,min=n&&Math.ceil(n*2/3);
   const numeric=n&&min?'若這次協會大會已依法成會且以'+n+'位出席者為分母，需至少'+min+'票。'+(yes!==null&&yes<=n?'您說'+yes+'票'+(yes<min?'不足。':'達同意票門檻，但仍須符合其他程序。'):''):'';
   return {direct:true,category:'除名｜協會及合作社分開',title:'協會會員大會和合作社社務會，除名票數不能套同一公式',
    summary:'協會會員除名由會員（代表）大會依法律及章程處理。人民團體法第27條要求應出席者過半數出席，並經出席者三分之二以上同意。'+numeric,
    steps:[['一般合作社是另一個程序','合作社法第28條以社務會中出席理事、監事為分母，需四分之三以上同意，再書面通知社員及報告社員大會。題目提供的是協會大會數字，不能拿來推算合作社出席人數。']],
    refs:[ass(14),ass(27),coop(28)],questionState:{focus:'compound'}};
 }
 if(!coopWord||creditMention&&!crossCredit||assoc&&!crossAssoc||/不是(?:一般|普通|消費|勞動)?合作社|非屬(?:一般)?合作社/.test(t))return null;
 const askedRe=/再(?:請|進|加|入|申請|加入)|重新(?:加入|申請|入社|審)|回(?:到|去|原)|恢復|再當社員/.test(t);
 const askedShares=/股金|股款|社股|出資|全(?:數|部|額)退/.test(t);
 const voteOrNotice=/社務會|票|四分之三|通知|語音|書面|報告|還要報|向誰|社(?:員|務)大會|先除名|考慮|還沒開|未開|除名的流程/.test(t);
 if(!askedRe&&!askedShares&&!voteOrNotice)return null;
 const pending=/考慮|還沒(?:開|做|表決)|尚未(?:開|表決)|還沒有(?:開|表決)|只是.{0,6}(?:提議|想)|擬除名/.test(t);
 const {attendance,ayes,total}=parts;
 const noMeeting=attendance>0&&total>0&&attendance<=total&&attendance<Math.ceil(total*2/3);
 const badTotal=total!==null&&(!total||attendance>total);
 const needTotal=attendance>0&&ayes!==null&&ayes<=attendance&&ayes>=Math.ceil(attendance*3/4)&&total===null;
 const voice=/語音|口頭|電話通知/.test(t);
 const askElectronic=/電子書面|電子文件|PDF|附件|電子郵件|電子簽|傳文字|群組.{0,5}文字|通訊軟體|訊息送達/i.test(t);
 const backdate=/溯及|追溯|補發|回溯|補寄|補送|警告|生效|有效日期|回填/.test(t);
 const valid=attendance>0&&ayes!==null&&ayes<=attendance;
 const min=attendance?Math.ceil(attendance*3/4):null;
 const suff=valid&&ayes>=min;
 const steps=[];
 if(voteOrNotice)steps.push(common);
 if(voteOrNotice){
  const floor=total>0?Math.ceil(total*2/3):null;
  const quorum='合作社法第52條的成會門檻是全體理事及監事合計的三分之二；第28條另算實際出席者四分之三的除名同意票。';
  if(badTotal)steps.push(['先核對全體及出席人數',quorum+'題目的全體人數有誤或小於出席人數，不能算成會。']);
  else if(total>0&&attendance>0)steps.push(['先確認社務會是否合法成會',quorum+'全體'+total+'位，至少要'+floor+'位出席；'+attendance+'位出席'+(noMeeting?'未達成會門檻，不能以這場表決認定已除名。':'已達成會門檻，接著才看同意票與程序。')]);
  else if(needTotal)steps.push(['還需全體理監事合計人數',quorum+'您已提供出席和同意票；若要確認是否成會，只要補例如「全體理監事12位」，不必提供姓名。']);
  else steps.push(['成會和同意票另算',quorum]);
 }
 if(valid){
  steps.push(['依題目的出席與票數','社務會有'+attendance+'位理監事出席，四分之三門檻要至少'+min+'票同意。'+ayes+'票'+(suff?(noMeeting?'雖達出席者四分之三，但未合法成會，不能據此除名。':'已達同意票門檻，但不等於除名已生效；仍要核成會、章程事由、書面通知及報告社員大會。'):'不夠；不能據此決議當作已依法除名，先核對社務會的出席及表決紀錄。')]);
 }else if(attendance>0){
  steps.push(['先核對實際的同意票','社務會如確有'+attendance+'位理事、監事出席，至少要'+min+'票。'+(ayes!==null?'所填同意票比出席人數多，請核對兩個數字；目前不能判定。':'還不知道同意票，不猜實際結果。')]);
 }else if(ayes!==null){
  steps.push(['只提供同意票，還不能判定','已有'+ayes+'票同意；仍需社務會實際出席理監事人數才能算門檻，不用提供名單或個資。']);
 }
 if(backdate||voice)steps.push(['除名不得倒填生效日','依內政部函釋，在合法決議後以正式書面通知之日期判斷生效；只有口頭或群組語音，不能據此認定已生效。先前只說「將來可能除名」的警告不是正式除名通知，事後補寄也不能追溯為先前就已生效。請保存通知內容與可查證的送達紀錄。']);
 if(askElectronic)steps.push(['可否電子通知要核對內容、採用方式及收受','電子文件不是一律無效。書面內容須能完整呈現並可日後取出查驗；已同意電子形式，或事先有合理期間與方式可反對且告知不反對的效果，才按電子簽章法第5條檢查，並核對是否依法送達。不要把任一群組附件自動當正式通知。']);
 if(pending)steps.push(['只有提議或尚未表決時，不能先當作已除名','不能只因正在考慮除名，就說該社員當然喪失社員資格或大會權利。若另有依法適用的權利限制，須按章程、議事程序及實際情況核對，不以傳話代替決議。']);
 if(askedRe)steps.push(returnTo);
 if(askedShares||crossCredit)steps.push(shares);
 if(crossCredit)steps.push(creditContrast);
 const summary=valid?'以'+attendance+'位實際出席理監事計，至少要'+min+'票；'+ayes+'票'+(suff?(noMeeting?'達同意票門檻，但社務會出席未達成會門檻，不能據此除名。':needTotal?'達同意票門檻；還要確認全體理監事合計人數、社務會成會及正式書面通知。':'達同意票門檻，但仍須確認合法成會及正式書面通知等程序。'):'不足，不能當作已依法除名。'):
   pending?'還沒依法議決，不能因目前只在考慮除名，就先把社員當成已出社。':
   crossCredit?'一般合作社被除名的退股金，不能直接套信用合作社自請退社的三個月規則。':
   !voteOrNotice?'若已依法出社，重新入社與退股金是兩件事，不能把除名當成永久不能再申請或必然全額退款。':
   '一般合作社除名須依章程事由，由社務會依法表決，並書面通知本人、向社員大會報告。';
 return {direct:true,category:'一般合作社｜除名、再入社與股金',title:crossCredit?'一般合作社與信用合作社的退股金，要先分情形':pending?'只有提議除名，不能先當作社員已出社':'一般合作社：除名、重新申請入社與退股金分開看',
  summary,steps,needsCoopTotal:needTotal,refs:[coop(26),coop(28),...(voteOrNotice?[coop(52),combined]:[]),...(backdate||voice?[noticeDate]:[]),...(askElectronic?[electronic]:[]),...(askedRe?[coop(29),coop(14)]:[]),...(askedShares||crossCredit?[coop(30)]:[]),...(crossCredit?[credit]:[])],questionState:{focus:'compound'}};
}
function totalReply(q){
 const t=clean(q).replace(/[。!?？！]$/,'');
 return new RegExp('^(?:補充[:：]?)?(?:全體(?:有|共)?|全體理監事(?:共|有|合計|總數|是|為|:)?|理監事(?:總計|合計|總數)(?:共|有|是|為|:)?)'+num+'(?:位|人|名|席)?(?:理監事)?$').test(t)&&counts(t).total!==null;
}
if(typeof module!=='undefined'&&module.exports){module.exports={answer,counts,totalReply};return;}
root.verifiedCooperativeExpulsionSequence=answer;
root.isCooperativeExpulsionTotalReply=totalReply;
})(typeof window!=='undefined'?window:globalThis);
