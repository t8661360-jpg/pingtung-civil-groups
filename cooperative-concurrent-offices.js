(function(root){
'use strict';
const act=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const coop=act('合作社法','D0050112',40);
const charter=act('合作社法','D0050112','9-1');
const creditLaw={title:'信用合作社法第17條（銀行局）',source:'https://law.banking.gov.tw/Chi/FLAW/PrintFLAWDOC01.aspx?lno=17&lsid=FL006436'};
const association=act('人民團體法','D0050091',17);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>180||!/合作社|信合社/.test(t)||!/(?:理事會)?主席|理事主席/.test(t)||!/兼|同時|一人.{0,7}當/.test(t)
  ||/工會|公會|漁會|農會|基金會|農漁會|社員資格|罷免|補選|解任|簽約|買賣契約|核銷|扶輪|退社|股金|解散|清算/.test(t))return null;
 const assoc=/協會|社會團體/.test(t)&&/理事長|會長/.test(t);
 const credit=/信用合作社|信合社/.test(t);
 const bank=credit&&/銀行.{0,7}(?:董事|監察人)|(?:董事|監察人).{0,8}銀行/.test(t);
 if(!assoc&&!bank)return null;
 if(!credit&&/銀行|保險公司|金融機構|證券/.test(t))return null;
 const society=['協會資格與選任要另外核對','協會端先核對本人在該協會的會員、理事資格、選任程序及適用章程；不是擔任另一個團體主席，就自動成為協會理事長。仍須看實際業務、職權與個案是否受其他規定限制，不能只憑兩個職稱判定。'];
 if(credit){
  const financial=['銀行董事：原則不得兼任，投資例外須核准','依信用合作社法第17條，信合社理事、監事、經理人或職員，不得兼任其他信用合作社、銀行、保險、證券或其他金融機構的職務。但因投資關係且經中央主管機關核准，可兼任被投資銀行的董事或監察人；不能只憑投資或銀行邀請就兼任。'];
  const nonprofit=['協會理事長：不能直接套銀行的兼職結論','第17條所列金融機構的兼職限制，不能僅因對方名稱是協會就直接套用，也不能反推一定可兼。先確認協會的實際業務與法律性質、兩邊章程和職權；如涉及業務競爭或金融業務，請先向信合社的金融主管機關及協會主管機關確認。'];
  return {direct:true,category:'信用合作社｜跨組織兼職',title:bank&&assoc?'信合社主席兼任銀行董事和協會理事長，要分開看':bank?'信合社理事主席兼任銀行董事，原則禁止':'信合社理事主席能否兼協會理事長，要另查',
   summary:bank?'銀行董事原則不得兼任；只有投資關係且經中央主管機關核准的被投資銀行董事或監察人，才可能適用例外。'+(assoc?'協會職務要另看實際情況。':''):'不能把銀行兼任限制直接套作協會職務一律禁止或一律可以。',
   steps:bank&&assoc?(t.indexOf('銀行')<t.search(/協會|社會團體/)?[financial,nonprofit,society]:[nonprofit,society,financial]):bank?[financial]:[nonprofit,society],
   refs:[creditLaw,...(assoc?[association]:[])],questionState:{focus:'compound'}};
 }
 const noCompetition=/沒有(?:業務)?競爭|無(?:業務)?競爭|未(?:有|形成)競爭|不構成競爭|不(?:會)?和[^。？！,，;；]{0,15}競爭|沒有和[^。？！,，;；]{0,15}競爭/.test(t)&&!/不確定|不清楚|不知道/.test(t);
 const confirmed=!noCompetition&&!/不確定|不清楚|不知道|算不算|是否|如果|假如/.test(t)&&/確實(?:有|存在)競爭|確有(?:業務)?競爭|已確認(?:有|構成)競爭|兩邊(?:有|存在)(?:業務)?競爭關係/.test(t);
 const clues=!noCompetition&&!confirmed&&/同一(?:批|群|類).{0,6}(?:人|客戶)|同類商品|相同商品|相同服務|相同市場|同業競爭/.test(t);
 const general=['合作社理事主席也是理事，受合作社法第40條限制','不能兼任性質相同、同一層級的其他合作社的理事或監事，也不能在與本社有競爭關係的團體或事業任職。名稱叫「協會」而非公司，不代表這項競業限制就不適用。'];
 const decision=confirmed?['有競爭關係：不得兼任','依題目已確認兩邊有競爭關係，依第40條，不得兼任對方團體職務。不是簽署一般迴避聲明就能取代法定禁止。']:
   noCompetition?['沒有競爭，不等於已核准兼任','若確實沒有競爭關係，這一款競業禁止不適用；仍要確認兩邊章程、職務資格及其他適用規範。涉及兩邊交易或代表衝突時，再按實際關係確認迴避及合法代表，不以此答覆作個案認定。']:
   ['先把兩邊實際業務比對清楚','例如服務或商品、收費對象、區域、是否爭取同樣的客戶或交易。業務或對象重疊是判斷線索，不等於已由主管機關認定；未釐清先向合作社與協會主管機關詢明，不能只看是否公益或團體名稱。'];
 return {direct:true,category:'一般合作社｜跨組織兼任',title:'合作社理事主席兼協會理事長，先看有沒有競爭關係',
  summary:confirmed?'如果兩邊確有競爭關係，依法不得兼任。':noCompetition?'沒有競爭關係時，第40條的競業禁止不適用；但還要查資格及兩邊章程，不能直接認定可兼。':clues?'同一批客戶或同類商品是競爭線索；若確有競爭關係，依法不得兼任，須先核對實際業務。':'不能只憑職稱答可以或不可以。若兩邊有競爭關係，依法不得兼任；沒有競爭時，仍要查資格與章程。',
  steps:[general,decision,society],refs:[coop,act('合作社法','D0050112',53),charter,association],questionState:{focus:'compound'},
  ...(!confirmed&&!noCompetition?{choiceHeading:'兩個團體實際有業務競爭嗎？',choices:[
   {label:'已確認有業務競爭',question:'一般合作社理事主席要兼協會理事長，兩邊確實有競爭關係，能兼嗎？'},
   {label:'沒有競爭，想確認其他條件',question:'一般合作社理事主席要兼協會理事長，兩邊沒有競爭關係，能兼嗎？'}
  ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeConcurrentOffices=route;
})(typeof window!=='undefined'?window:globalThis);
