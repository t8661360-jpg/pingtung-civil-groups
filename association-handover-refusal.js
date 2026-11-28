(function(root){
'use strict';
const cite=(title,pcode,flno)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+flno});
const refs={
 handover:cite('人民團體會務輔導辦法第18條：整屆改選的移交','D0020094',18),
 seal:cite('人民團體法第10條：團體圖記','D0050091',10),
 roster:cite('人民團體法第54條：負責人名冊異動','D0050091',54),
 election:cite('人民團體選舉罷免辦法第17條：任期中出缺','D0050093',17),
 resignation:cite('人民團體選舉罷免辦法第27條：書面辭職及准辭','D0050093',27),
 bank:cite('社會團體財務處理辦法第17條：提款共同蓋章','D0050097',17),
 deposit:cite('社會團體財務處理辦法第16條：團體收入存放','D0050097',16)
};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const officialHandover=['整屆改選：清冊交給新任理事長，由他和監交人會同接收',
 '改選前把立案證書、團體圖記、未完成案件、檔案、財務和人事資料列冊。依會務輔導辦法第18條，自下屆理事長就任起15日內，由新任理事長和監交人會同接收。監交人是新任監事會召集人（常務監事）或新任監事互推的人；不是所有監事都能代表。'];
const cannotSign=['監交不等於代收或代簽',
 '新任理事長不肯接，監交人可以記錄在場、協助清點和見證拒收，但不能只憑監交身分就替他簽收、把資料交給任一理事，或把整箱清冊交給縣府視為完成。拒收本身也不能直接當作已辭職或出缺。保留清冊、書面邀約與送達、拒收與缺漏紀錄；妥善保全原件，不在公開群組貼會員名冊或傳帳戶資料。'];
const late=['屆期仍未完成：證書及團體圖記',
 '若已確定是整屆改選、就任屆滿15日仍未完成，依第18條可報請主管機關註銷並重新發給原立案證書；該條規定原備查圖記失其效力，不宜由前任繼續拿舊圖記對外用印。由團體洽主管機關確認個案處理與新圖記印模備查，不把遺失、扣留或拒收寫成已完成。'];
const bankQuestion=/網銀|網路銀行|銀行|郵局|金融機構|信用部|存摺|印鑑卡|印鑑|提款|帳戶|帳號|戶頭|聯絡資料/;
function bankStep(t){
 const target=/郵局/.test(t)?'原開戶郵局':/農會|漁會|信用部/.test(t)?'原開戶信用部':/信合社|信用合作社/.test(t)?'原開戶信用合作社':'原開戶金融機構';
 return ['銀行、郵局留存的印鑑及網銀權限，另向原開戶機構辦',
  '縣府處理的是團體立案證書、備查圖記與負責人名冊，不代辦金融印鑑、聯絡資料、存摺或網銀帳號異動。若是本會名下團體戶，請'+target+'核對現任代表權與所需文件，並確認如何先控管舊權限、再變更代表人、聯絡資料及必要印鑑；是否可先受理，依該機構核對，不保證只帶清冊就能改。不要共用舊任個人帳號、密碼、一次性驗證碼或私自用舊印鑑提款。一般協會提用存款依財務辦法第17條，由團體負責人、秘書長或總幹事、財務人員共同蓋章。'+(/(?:個人|私人)(?:戶|帳戶)|他人名下/.test(t)?'若原戶是個人或別的團體名下，不能當成協會戶直接改名或提款；先停用該戶代收團體款、留存帳證，由有權人確認款項及後續程序。':'')];
}
function cooperativeHandover(t){
 if(!/一般合作社|消費合作社|勞動合作社|合作社.{0,8}(?:理事會主席|社長)/.test(t)||/信用合作社|信合社|保險合作社|協會.{0,9}(?:拒收|不接)|公會|工會/.test(t)||!/理事會主席|監事會主席|社長/.test(t)||!/交接|移交|清冊/.test(t)||!/不交|拒|-?15[天日]|十五[天日]|跟監事交|接收/.test(t))return null;
 return {direct:true,category:'一般合作社｜主席交接',title:'一般合作社的主席交接，不直接套用協會的15日',
  summary:'合作社選舉罷免辦法第6條的15日，是理事、監事選出後召集互選主席會議的期限，不是移交清冊的期限。不能把協會的15日和圖記失效規則套給合作社。',
  steps:[['先分清辭職或屆期改選','辭職時依合作社選舉罷免辦法第8條完成原工作交接，將交接、辭職及遞補情形在會議報告。屆期改選時核對章程、有效決議及原主管機關要求，不猜逾期處分。'],
   ['清冊由合作社保管，監事查核不等於當然代理接收','合作社理事會依合作社法第34、35條執行會務，在社址備置社員名簿等簿冊；監事依第39條查核。拒交先書面記錄、由有權者安排交接，不能把清冊交任一監事便算完成；有爭議向原主管機關確認。']],
  refs:[cite('合作社選舉罷免辦法第6條：主席互選','D0050022',6),cite('合作社選舉罷免辦法第8條：辭職及交接','D0050022',8),cite('合作社法第35條：簿冊備置','D0050112',35),cite('合作社法第39條：監事職權','D0050112',39)],questionState:{focus:'compound'}};
}
function askOrganization(raw,t){
 if(t.length>210||!/新(?:任)?理事長/.test(t)||!/不肯接|不肯收|不接|拒絕接|拒收|不收/.test(t)||!/移交清冊|交接清冊|清冊.{0,8}(?:交|給|收)/.test(t)||/合作社|信合社|公會|工會|基金會|農會|漁會|管委會|公司/.test(t))return null;
 if(/交接團體:其他團體/.test(t))return {direct:true,category:'交接｜團體分流',title:'其他團體的交接，不能直接套用協會規則',summary:'請補充團體是哪一類，例如一般合作社、信用合作社或基金會，以及這是整屆改選還是任期中換人。不要提供人名、清冊或帳戶資料。先留存邀約與拒收事實，不把未完成寫成已交接。',steps:[],refs:[],questionState:{focus:'clarify'}};
 return {direct:true,category:'交接｜團體分流',title:'先確認團體，再看誰可以接收清冊',
  summary:'如果是一般協會整屆改選，原則上由新任理事長就任起15日內會同監交人接收，不是監交人單獨代收。若新任拒接，先保全資料、留下書面邀約和拒收紀錄；先別把它登記成已完成。其他團體不直接套用這條。',
  choiceHeading:'您問的是哪一類團體？',choices:[
   {label:'一般協會或社會團體',question:'我們是一般協會，'+raw},
   {label:'其他團體',question:raw+'；交接團體：其他團體。'}
  ],refs:[refs.handover],questionState:{focus:'clarify'}};
}
function route(q){
 const raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>390)return null;
 const cooperative=cooperativeHandover(t);if(cooperative)return cooperative;
 if(!/協會|社會團體|人民團體|社團法人/.test(t))return askOrganization(raw,t);
 if(/不是(?:一般)?(?:協會|社會團體)|不是.{0,5}團體|工會|公會|基金會|管委會|(?:一般|消費|勞動|本|我們是)合作社|(?:農會|漁會|信合社)(?:本身|自己的|理事長|主席)/.test(t))return null;
 // Financial institutions may be mentioned as account providers, not as the subject of the handover.
 if(/合作社/.test(t.replace(/信用合作社/g,''))&&!/不是.{0,4}合作社/.test(t))return null;
 const disputed=/不[肯願想](?:接|收|簽)|不接|不收|拒(?:絕)?(?:接收|收|簽|交接|移交|交付)|沒.{0,5}(?:交接|移交|接收)|未.{0,5}(?:交接|移交|接收)|不交|扣住|交不出|代(?:收|簽|接|為收|為簽)|可否.{0,5}簽收|找不到.{0,5}(?:章|圖記)|交接.{0,6}(?:沒|未|不)|尚未簽|仍不.{0,3}(?:肯|接|收|簽)|還要.{0,4}用舊/;
 const transition=/辭職|請辭|新任|新理事長|新主席|換.{0,2}理事長|改選|換屆|接任|接班|前任|前一任|舊任|原任|卸任|監交人/;
 const handover=/交接|移交|清冊|接收|簽收|監交|證書|圖記|重新刻章/;
 const interim=/交接類型:任期中換人|(?:任期中|任期內|臨時|只|單獨|中途).{0,13}(?:換理事長|補選|辭職|離任|出缺|換人)|理事長.{0,7}(?:辭職|請辭|過世|死亡|出缺)|其他理監事(?:都)?沒換/;
 const chosen=t.match(/交接類型:(整屆改選|任期中換人)/)?.[1];
 const mainText=t.replace(/交接類型:(?:整屆改選|任期中換人)/,'');
 const mid=chosen?chosen==='任期中換人':interim.test(t);
 const full=chosen?chosen==='整屆改選':!mid&&/整屆|全屆|換屆|理監事.{0,5}改選|理事.{0,4}監事.{0,4}改選/.test(t);
 if(!transition.test(mainText)||(!disputed.test(mainText)&&!mid)||/會員名冊複印|對外公開名冊|團體解散|補助費|核銷|員工欠薪|申請成立/.test(t))return null;
 const bank=bankQuestion.test(mainText);
 if(bank&&/(?:個人|私人)(?:戶|帳戶|存摺)|他人名下|借會員.{0,4}(?:存摺|帳戶)/.test(mainText))
   return {direct:true,category:'協會財務｜私人帳戶與交接',title:'私人帳戶不能只換印鑑就當成協會團體戶',
    summary:'不能。私人存摺、個人或其他組織名下的帳戶，不會因為協會換理事長就變成協會團體戶。別用舊印鑑或網銀私自提領，也不要繼續用該戶收會費。',
    steps:[['先把帳與交接事實保全','保留收支、轉帳與對帳紀錄，記下拒絕交接及缺少的資料；團體有權代表和財務、監事確認款項性質，向原開戶機構、主管機關確認處理。就算整屆改選，移交清冊也不會把私人戶的處分權移給協會。']],refs:[refs.deposit,refs.bank,refs.handover],questionState:{focus:'compound'}};

 if(!handover.test(mainText)){
   if(!bank||!/網銀|存摺|帳戶|帳號|銀行.{0,5}權限/.test(mainText)||!/拒|不交|扣住|不給/.test(mainText))return null;
   return {direct:true,category:'協會財務｜原戶權限',title:'協會帳戶的權限不能由縣府改，先向原開戶機構確認',
    summary:'前任握有存摺、印鑑或網銀，不等於有權繼續使用，也不是縣府可以代換。先留存拒交事實並由有權代表向原開戶機構確認如何控管。',
    steps:[bankStep(mainText)],refs:[refs.deposit,refs.bank],questionState:{focus:'compound'}};
 }
 const day=t.match(/(?:就任|上任)(?:之後|後)?(?:已經|已|才|剛|第)?(?:是)?([0-9]{1,3}|十六|十五|五|八|二十)(?:個)?[天日]/)?.[1];
 const n=day?({'十六':16,'十五':15,'五':5,'八':8,'二十':20}[day]??Number(day)):null;
 const elapsed=Number.isFinite(n)&&n>15||/已[經]?(?:逾期|超過15日|滿15天)|逾15日|逾十五日/.test(t);
 const inTime=Number.isFinite(n)&&n<15;
 let title='協會移交清冊：監交人不是接任人';
 let summary='監交人協助清點和見證，不能只憑這個身分替新任理事長簽收。';
 const steps=[];
 if(full){
   steps.push(officialHandover,cannotSign);
   if(elapsed){summary+='依您提供的就任時間，若已逾15日且尚未完成，請把未交接情形書面整理，洽主管機關處理，別再使用原備查圖記。';steps.push(late);}
   else if(inTime){
    summary+='如果確為就任後第'+n+'日，尚不能只因拒收就認定已逾期或舊團體圖記已失效。';
    steps.push(['尚未屆期，先留下紀錄並安排會同點交','通知約定期限、地點與監交人，記下是否出席與缺件。圖記妥善保管，不因前任手上有章就讓前任繼續用印。若屆期仍未交，按第18條處理證書與原備查圖記。']);
   } else steps.push(['先確認合法就任日與是否已完成','從合法就任時計算交接期限，不從投票日或縣府核備日一概起算。只因出現爭議，不直接推定已逾期或圖記當下失效。'],late);
 } else if(mid){
   title='任期中只換協會理事長：先核出缺與代表權，不把整屆改選照搬';
   summary='任期中只換人或代理，要先確認書面辭職已依第27條准辭、是否完成合法補選或取得代理權。不能只因換人就說舊圖記一定失效或監事可代簽。';
   steps.push(['任期中出缺和整屆交接不是同一天限','選罷辦法第17條原則上自出缺一個月內補選；所遺任期不足6個月才有依該條推代理的選項，剛好6個月不等於不足。不要把補選期限當成整屆改選15日接收期限，或認定新任或代理已經就任。'],cannotSign,['依組織內規完成實物與權限交接','核對章程、合法補選或代理決議，列冊交立案證書、團體圖記、財務與未完案，拒收或缺漏如實記錄。無法交接時把事實交主管機關確認，不能直接套用整屆改選逾期失效或一律重刻。']);
 } else {
   title='先分整屆改選或任期中換人，再算交接期限';
   summary+='目前只知道理事長換人，不能直接認定15日規則或舊圖記失效。若是整屆改選，由新任理事長就任後15日內會同監交人接收。';
   if(elapsed)summary+='若選整屆改選，依您提供的時間已可能屆期，請先保全圖記和文件，不由前任繼續用印。';
   steps.push(cannotSign,['已知事實不必再填','先選這次換人屬於哪一類；小屏會沿用您已提到的就任時間、清冊及金融資料的情況，不需要再提供姓名或帳號。']);
 }
 if(bank)steps.push(bankStep(t));
 if(/縣府|主管機關|證書|圖記|核備|備查|報備/.test(t)&&!mid)
  steps.push(['交接期限與異動報備各自計算','負責人名冊如有異動，依人民團體法第54條於異動後30日內報主管機關核備。這不是第18條的15日移交期限，也不是金融機構必須受理的期限。']);
 const choices=!full&&!mid&&raw.length<318?[
  {label:'整屆理監事改選',question:raw+'；交接類型：整屆改選。'},
  {label:'任期中只換理事長',question:raw+'；交接類型：任期中換人。'}
 ]:[];
 return {direct:true,category:'協會會務｜交接與金融權限',title,summary,steps,
  refs:[refs.handover,refs.seal,refs.roster,...(mid?[refs.election,refs.resignation]:[]),...(bank?[refs.deposit,refs.bank]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:choices.length?'clarify':'compound'},
  ...(choices.length?{choices,choiceHeading:'這次是整屆改選，還是任期中換人？'}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports=route;return;}
root.verifiedAssociationHandoverRefusal=route;
})(typeof window!=='undefined'?window:globalThis);
