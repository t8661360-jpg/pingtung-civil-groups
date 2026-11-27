(function(root){
'use strict';
const ref=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>ref('人民團體法','D0050091',n),c=n=>ref('合作社法','D0050112',n),e=n=>ref('合作社選舉罷免辦法','D0050022',n);
const county={title:'屏東縣政府對民間團體補助經費作業要點第5、8點（115年度公告附件）',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const model={title:'彰化縣社會處合作社章程範例第32條（只作比較）',source:'https://social.chcg.gov.tw/files/合作社章程範例_8_1090325_8_1090520.pdf'};
const example={title:'食在永續消費合作社章程第23條（個別章程範例）',source:'https://coop.tcu.edu.tw/?page_id=905'};
const base={direct:true,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>230)return null;
 const compare=/一般協會|協會|社會團體/.test(t)&&/會員代表大會|全體會員|會員大會/.test(t);
 const reps=/合作社/.test(t)&&/社員代表大會|社員代表.{0,12}過半/.test(t)&&!/信用合作社|信合社|保險合作社|聯合社|工會|農會|漁會|罷免|解散|合併|轉銀行/.test(t);
 const isNotice=/通知|公告|書面|報主管機關|提前.{0,4}(?:七天|七日|7天|7日)/.test(t)&&/幾天|幾日|多久|七天|七日|7天|7日|何時|需要|要不要/.test(t);
 const ordinaryMotion=/一般議案|一般提案|普通議案|不是選舉|不辦選舉|不選理監事/.test(t);
 if(reps&&isNotice&&!compare){
  const election=!ordinaryMotion&&/要選理監事|要選理事|選理監事|理監事選舉|改選/.test(t);
  if(election||ordinaryMotion)return {...base,category:'合作社會務｜社員代表大會通知',title:election?'選理監事：選舉日前七日公告、個別書面通知並報備':'普通議案的代表大會：不能直接套選舉七日規則',summary:election?'依法以社員代表大會開會選理監事時，依選舉罷免辦法第18條，選舉日前七日公告，並個別書面通知應出席人員、報主管機關備查。':'若只有一般提案，先確認合作社社別、現行章程與議程；第18條的選舉通知不能直接當成普通代表大會一律七日前。',steps:election?[['公告、通知、報備是三件事','公告選舉種類、時間、地點、應選及候補名額、選舉方式，逐一書面通知應出席人員，並報主管機關備查；採登記候選方式者，並公告候選人名單。不要僅在群組貼一則公告代替個別書面通知。']]:[['先確認是一般社員大會，還是合法社員代表大會','合作社法第46條對一般社員大會有七日前書面通知規定，內容載明召集事由及提議事項。代表大會的普通議案請查適用章程與主管機關確認，不把一般社員大會或選舉的期限硬套。']],refs:[e(18),...(ordinaryMotion?[c(46),e(4)]:[])]};
 }
 const bothHalves=/章程.{0,24}(?:代表)?過半(?:數)?(?:出席|到場)/.test(t)&&/(?:出席|實到).{0,10}過半(?:數)?同意/.test(t);
 const due=Number(t.match(/(?:應到|應出席(?:人數)?(?:為|有)?)(\d{1,4})(?:位|名|人)/)?.[1]||0);
 const actual=Number(t.match(/(?:實到|實際出席(?:為|有)?)(\d{1,4})(?:位|名|人)/)?.[1]||0);
 if(reps&&bothHalves&&due&&actual&&ordinaryMotion&&!compare&&!/改選|選理監事(?![。！？?，,]*$)|修章|除名|特殊議案/.test(t)){
  const threshold=Math.floor(due/2)+1, votes=Math.floor(actual/2)+1;
  const low=due<51?' 應到'+due+'位低於選罷辦法第4條一般代表名額51名下限；若這是現行名額或名冊有減少，先請主管機關核對，不單用下面算式判定可開會。':'';
  const calc=actual>due?'實到不能大於應到，先查名冊及簽到紀錄。':actual<threshold?'若應到'+due+'位已核實，至少'+threshold+'位才成會；實到'+actual+'位不足，不再計算這案需幾票。':'若章程確如您所述、應到'+due+'位和實到'+actual+'位均已核實，至少'+threshold+'位才成會；有效出席'+actual+'位時，普通議案至少'+votes+'票同意。';
  return {...base,category:'合作社會務｜章程出席與同意門檻',title:'依您所述章程算普通議案：開會門檻與同意票分開',summary:calc+low,steps:[['只在你們章程確有這兩個過半門檻時才這樣算','過半是超過一半，不是至少一半。彰化縣公開章程範例及食在永續消費合作社章程可參考，但這不是屏東全縣所有合作社的通用規則。先看現行章程、合法代表名額和當次名冊；特別議案不按這個簡式計算。']],refs:[e(4),model,example]};
 }
 const qCoop=/合作社/.test(t)&&/社員(?:代表)?大會/.test(t)&&/多少人|幾(?:個)?人|過半|出席|成會|算誰|門檻/.test(t)&&!/信用合作社|信合社|保險合作社|聯合社|工會|農會|漁會|委託|罷免|解散|合併|轉銀行/.test(t);
 if(qCoop&&(compare||/社員代表大會/.test(t))){
  const ordinary=/不是社員代表大會|只開社員大會|我們開一般社員大會|一般合作社社員大會(?!或)/.test(t)&&!/社員代表大會.{0,8}(?:又|也要|則|能不能|可否)/.test(t);
  const notElection=/一般議案|不是選舉|沒有選舉|不選理監事|不辦選舉/.test(t);
  const election=!notElection&&/要選理監事|要選理事|理監事選舉|改選/.test(t);
  const memberForm=/會員代表大會/.test(t)?'會員代表大會':'全體會員大會';
  const ag=['協會：先分會員大會或會員代表大會','依人民團體法第27條，一般協會的全體會員大會，要有應出席會員過半；合法的會員代表大會，則算應出席會員代表過半，不以全體會員算。依會務輔導辦法第10條核對審定名冊。'];
  const co=['合作社的一般社員大會，不是社員代表大會','合作社法第48條以全體社員過半數出席為一般成會門檻；普通決議原則上以出席社員過半數同意。章程和特定議案如有適用的特別規定，須另外核對。'];
  const voted=['合作社有選舉議程：依選罷辦法第3條','依合作社選舉罷免辦法第3條，依法以會議辦理選舉時，出席須超過具當次出席資格者總數的一半。若以合法社員代表大會進行選舉，先核定具資格的代表名冊，不把全體社員當作代表會議的出席分母。選舉會議若流會，15日內重開；章程得在符合第3條條件時以實到人數辦選舉，且不得低於應出席人數三分之一。'];
  const motion=['合作社社員代表大會：一般議案不照抄選舉規則','合作社選舉罷免辦法第4條有社員超過200人及依章程分組選代表的規定；第3條的過半規則適用選舉等該條的會議，不直接決定普通議案的成會門檻。合作社法第48條明文是社員大會；社別、現行章程與議案不明，就先查主管機關認可的章程及本次應出席代表名冊，請主管機關核對，不能套協會數字。'];
  const choices=!ordinary&&!notElection&&!election?[
   {label:'社員代表大會：一般議案',question:'一般合作社的社員代表大會是一般議案，不是選舉。成會人數怎麼算？'+(compare?'另問協會'+memberForm+'過半怎麼算？':'')},
   {label:'社員代表大會：選理監事',question:'一般合作社的社員代表大會要選理監事，出席門檻怎麼算？'+(compare?'另問協會'+memberForm+'過半怎麼算？':'')}
  ]:[];
  const coopScope=ordinary?'合作社的一般社員大會算全體社員過半。':election?'合作社依法開選舉會議算該次具出席資格者過半。':'合作社社員代表大會的一般議案不能直接套選舉門檻；先核對社別、章程與議案。';
  return {...base,category:'成會門檻｜協會與合作社',title:compare?'協會會員代表與合作社社員代表，成會分開看':'合作社社員代表大會：選舉與一般議案分開看',summary:(compare?'協會按這場大會應出席的會員或代表算過半。':'')+coopScope,steps:[...(compare?[ag]:[]),...(ordinary?[co]:election?[voted]:notElection?[motion]:[motion,voted])],refs:[...(compare?[p(27),ref('人民團體會務輔導辦法','D0020094',10)]:[]),c(48),e(3),e(4)],...(choices.length?{choiceHeading:'合作社這場大會要做什麼？',choices}:{})};
 }
 const meal=/協會|社會團體|民間團體/.test(t)&&/志工|志願服務人員/.test(t)&&/便當|餐費|誤餐|餐點/.test(t)&&/補助/.test(t)&&/報|核銷|單據|發票|收據|憑證|上限/.test(t)&&!/合作社|信用部|公司|其他縣|外縣市|中央補助|衛福部補助|教育部補助|高雄市|台南市|臺南市|新北市|台北市|臺北市|所得稅/.test(t);
 if(!meal)return null;
 const notListed=/核定表.{0,10}(?:沒列|未列|沒有列)|預算沒列|核定.{0,6}未列|補助項目.{0,8}沒有/.test(t);
 const listed=!notListed&&/核定表.{0,10}(?:有列|已列)|已核定.{0,8}(?:便當|誤餐|餐費)|核定.{0,9}確有/.test(t);
 const docs=['通案核銷文件與個案加附文件要分開','第8點一般須檢附核准補助文件影本、領款收據、實際支用明細表與各項支用單據；成果報告（含照片）按各補助單位規定。便當費若已核定，保留店家出具的發票或收據等實際支用憑證；查核定函對抬頭、份數、單價、志工服務／簽領名冊有無要求。縣府通案未統一訂每人每餐上限或一律要哪份名冊，別把某一專案表格套到其他方案。'];
 const check=['先看核定經費表有沒有列餐費或誤餐費','志願服務法第16條允許運用單位在必要時補助誤餐，並不等於任一縣府補助可以核銷。屏東通案要點第5點未把志工便當列為一律可報的項目，列舉之外的支出以縣府核准為限，旅遊性質餐費明列不補助。'+(notListed?'沒列入核定項目，不要先從補助款核銷；先問原補助承辦能否依方案辦經費變更或應改由自籌支應。':listed?'已列，仍以核定用途、金額和方案附件為準，不能改列別的科目或重複報支。':'請先看核定項目、金額及有無專案特別規定，不確定先問原補助承辦。')];
 return {...base,category:'屏東活動補助｜志工餐費與核銷憑證',title:'志工便當能否用補助與應附單據，分開看',summary:notListed?'核定表沒列志工便當或誤餐費，不要先用補助款核銷，先向原補助單位確認。':listed?'核定表有列志工餐費，也要按核定用途、金額和憑證要求核銷。':'能不能報，先看核定函及經費表；志願服務法允許運用單位補助誤餐，不等於這筆縣府補助可報。',steps:[check,docs],refs:[county,ref('志願服務法','D0050131',16)],...(!notListed&&!listed?{choiceHeading:'核定經費表有列餐費或誤餐費嗎？',choices:[{label:'核定表有列',question:'屏東協會活動用縣府補助買志工便當，核定表有列餐費，要附什麼核銷單據？'},{label:'核定表沒有列',question:'屏東協會活動請志工吃便當，縣府補助核定表沒有列餐費，可以核銷嗎？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationCoopQuorumVolunteerGrant=route;
})(typeof window!=='undefined'?window:globalThis);
