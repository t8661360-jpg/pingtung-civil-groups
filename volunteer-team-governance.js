(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const vol=law('志願服務法第3、4、6、7、15、16條','D0050131');
const assoc=law('人民團體法第8、10、12、33、34條','D0050091');
const finances=law('社會團體財務處理辦法第14、16–18條','D0050097');
const coop=law('合作社法第9-1條、第17條至第21條','D0050112');
const coopBooks=law('合作社財務報表及經費處理準則','D0050114');
const norm=q=>String(q||'').normalize('NFKC').replace(/\s+/g,'');
const team=/志工隊|志願服務隊|志工小組|志工服務|志願服務|服務小隊|附設.{0,8}志工|志工|隊上|隊員/;
const money=/費用|會費|月費|社費|社股|材料費|食材費|成本|分攤|報帳|收據|收錢|收款|帳戶|私戶|經費|匯款|先匯|群組對帳/;
const organize=/套章程|備案|備查|另(?:外)?(?:向.{0,6})?立案|獨立立案|報資料|計畫|年度報告|年底|運用單位|成立.{0,7}團體/;
const cases={a:['協會附設的志工隊','確認是一般協會志工隊'],c:['合作社的服務小隊／正式社員','確認是合作社的服務小隊'],ind:['想另成立一個獨立團體','確認要另成立獨立團體']};
const outside=/信用合作社|信合社|工會|公會|農會|漁會|義消|消防義勇|基金會|財團法人|值班薪資|加班|勞基法|就業保險|傷害賠償訴訟|政黨/;
const noFee=t=>/沒有(?:另外)?收(?:費|錢|志工月費)|小隊不收|服務小隊不收|不另外收費/.test(t);
function parse(q,prev){
 const t0=norm(q);
 if(!t0||t0.length>590||/^新題/.test(t0)||outside.test(t0))return null;
 if(/時數.{0,8}(?:抵|折抵|換)/.test(t0))return null;
 if(/(?:保險|保費)/.test(t0)&&/(?:會費|預算)/.test(t0)&&!/(?:隊費|月費|收(?:費|錢|取)|另(?:外)?立案|成立)/.test(t0))return null; /* 第37輪交叉 */
 /* 第258輪：志願服務計畫（書）要送哪裡／交給誰＝備案對象，交給 round-fixes 的備案規則 */
 if(/(?:計[畫劃]|計畫書)/.test(t0)&&/(?:[送交遞報寄](?:去|到|給)?.{0,2}(?:哪|誰|什麼單位)|哪(?:裡|個單位|邊|個機關).{0,3}(?:送|交|備案|報|辦))/.test(t0)&&!money.test(t0)&&!/(?:另(?:外)?立案|獨立立案|成立.{0,7}團體)/.test(t0))return null;
 /* 交叉巡檢第32輪：只問志工隊開銷要不要列入協會預算、能不能用協會經費（沒有問收費、立案），交給 round-fixes 的預算答案 */
 if(/預算/.test(t0)&&/(?:開銷|費用|支出|花費|開支)/.test(t0)&&!/(?:收(?:費|錢|取)|隊費|月費|繳|立案|備案|保險|成立)/.test(t0))return null;
 const k=Object.keys(cases).find(k=>cases[k][1]===t0);
 if(k)return {...prev,org:k,picked:true};
 const corrected=!!prev&&/^(更正|其實|補充|剛才說錯)/.test(t0)&&/章程|計畫|協會|合作社|社股|隊/.test(t0);
 const t=t0.replace(/沒有(?:另(?:外)?)?成立(?:一個)?協會/g,'').replace(/(?:不是|並非|不問|不談)(?:一般|普通)?(?:協會(?:的)?|合作社(?:的)?|人民團體)/g,'');
 if(!corrected&&!(team.test(t)&&(money.test(t)||organize.test(t)||/加入團體/.test(t))))return null;
 const a=/協會|人民團體|社會團體/.test(t), c=/合作社|社員|社股/.test(t);
 const org=a&&c?'joint':a?'a':c?'c':corrected?prev.org:null;
 const sportOnly=/章程.{0,12}(?:只|僅).{0,5}(?:體育|運動)|(?:宗旨|章程|計畫).{0,12}(?:不符|不一樣|不一致|不相符|不包含)|宗旨.{0,9}沒有送餐/.test(t);
 const planMatch=!sportOnly&&/已符章程|(?:計畫|服務|宗旨).{0,16}(?:符合|相符|一樣|一致)|章程.{0,10}(?:明寫|明列|確實.{0,3}有|也有|有寫|包括|包含|都在).{0,11}(?:送餐|服務|工作)|都在章程的宗旨內/.test(t);
 const charterCorrection=corrected&&(sportOnly||planMatch)&&org===prev.org&&!noFee(t)&&!/不收錢|不是協會|改成合作社/.test(t0);
 const finance=!noFee(t)&&money.test(t);
 const ifKeep=(k,v)=>!!(v||charterCorrection&&prev[k]);
 const duration=t.match(/(?:計畫|服務).{0,6}(?:為期|只有|未滿)?([一二兩三四五6-9\d])年/)?.[1]||t.match(/([一二兩三四五6-9\d])年(?:期|的)?(?:送餐|服務|計畫)/)?.[1];
 const member=/會員|入會|社員|社股/.test(t);
 return {org,isTeam:team.test(t)||charterCorrection&&prev.isTeam,internal:!/想另外成立|要另組新|想(?:另|新)成立獨立/.test(t),plan:ifKeep('plan',organize.test(t)),match:planMatch?'yes':sportOnly?'no':null,duration:duration||(charterCorrection?prev.duration:null),
  fee:ifKeep('fee',finance&&/會費|月費|固定.{0,11}收|固定每|要繳.{0,5}[0-9]+|不繳就|收每人/.test(t)),finance:ifKeep('finance',finance),member:ifKeep('member',member),community:/社區發展協會|社區協會/.test(t)||charterCorrection&&prev.community,
  private:ifKeep('private',finance&&/私人|私戶|個人帳戶|隊長.{0,10}帳戶|小孩.{0,7}帳戶/.test(t)),received:ifKeep('received',finance&&/已收|收到|收過|已經匯/.test(t)),
  split:ifKeep('split',finance&&/材料費|食材費|分攤|實支/.test(t)),insurance:ifKeep('insurance',/保險|意外險|傷害險/.test(t)),
  stock:/社股|認股|股金/.test(t),stockOnly:/社股|股金/.test(t)&&noFee(t),grant:ifKeep('grant',/補助/.test(t)&&!/不申請補助/.test(t)),group:ifKeep('group',/合辦|共同辦|合作辦|聯合|一起做/.test(t))};
}
function route(q,prev){
 const x=parse(q,prev);if(!x)return null;
 const output=(title,summary,steps,refs,keys)=>({direct:true,title,category:'志工隊、志願服務計畫及收費',summary,steps,refs,volunteerGovernanceContext:x,questionState:{focus:keys?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(keys?{choiceHeading:'您說的隊伍是哪一種？',choices:keys.map(k=>({label:cases[k][0],question:cases[k][1]}))}:{})});
 if(!x.org)return output('參加志工隊不等於已加入團體','先確認隊伍是不是原立案團體的內部小組。不要只因填了志工報名表或被要求先繳費，就認為自己是正式會員或社員。',[],[vol],['a','c','ind']);
 if(x.org==='ind')return output('要新成立獨立團體，和原團體的志工隊不同','若目的在另成立、以新團體名義管理財務、簽約或招會員，先向主管機關確認要依何種程序取得自己的資格；不是繳隊費或備志工計畫就成為獨立團體。',[
  ['原團體的內部隊伍不因收志工就要獨立立案','先查原主辦的立案證書、章程、計畫及實際財務管理。真要組成新的社會團體才按人民團體法成立、報立案及管理會務。']
 ],[assoc,vol]);
 const c=x.org==='c', joint=x.org==='joint';
 if(c&&x.stockOnly)return output('合作社社員繳社股，不是服務小隊會費','已正式取得社員身分後，依合作社章程認繳社股；小隊沒有另收費或邀捐，就不要當成隊費或公益勸募。',[
  ['由合作社管理社員名簿及股金資料','看章程所定社股金額、繳納及退還，按實記入股金及社員記錄，提供合作社法定或章程所需憑證。不要由小隊隊長或私人帳戶代收，也不要用協會的會員會費規定。']
 ],[coop,coopBooks]);
 const refs=[vol,...(c?[coop,coopBooks]:joint?[assoc,finances,coop,coopBooks]:[assoc,finances])],steps=[];
 if(x.internal)steps.push(['內部志工隊不必為此另外立案','已立案的'+(x.community?'社區發展協會':c?'合作社（符合志願服務運用單位資格時）':'協會')+'或其他合格機構可當志願服務運用單位；附設小隊不是另一個團體。若要真正另成立獨立團體、自己簽約和管理財務，才另外確認新團體成立程序。志工名冊和會員／社員名冊分開，不是填報名表或繳錢就入會。']);
 if(x.plan||!x.fee){
  let planText='先確認志願服務計畫的具體服務和章程所載存立目的。若不相符，適用第7條第3項，運用前送服務計畫及立案證書影本給主管機關與目的事業主管機關備案；未滿兩年，運用結束後兩個月內函報辦理情形，兩年以上則年度結束後兩個月內函報。若目的相符，依第7條第4項免事前備案，但仍須於年度結束後兩個月內函報這兩個機關。';
  if(x.match==='yes')planText='依你提供的「計畫確實符合章程所載存立目的」，第7條第4項免運用前申請備案，但仍要有計畫，並在年度結束後兩個月內把辦理情形函報主管機關及目的事業主管機關備查。計畫內容或服務對象改變時，先逐項核對，不能拿舊計畫保證仍屬免辦。';
  else if(x.match==='no')planText='依你提供的「計畫和章程存立目的不相符」，不適用第7條第4項的免辦條件；依第3項，在運用志工前檢送服務計畫及立案證書影本給主管機關與目的事業主管機關備案。運用期未滿兩年者於結束後兩個月內函報，達兩年以上者於年度結束後兩個月內函報。';
  steps.push(['事前備案、事後備查和團體立案是三件事',planText+'未依規備案或備查會影響志願服務計畫經費補助及考核。']);
 }
 if(x.fee){
  steps.push(['志工不一定是會員，不能把固定隊費直接當會員會費',
   (c?'合作社正式社員的社股或應繳費用須有章程和法定依據，不因參加服務小隊就成為社員，也不直接套協會的會費規則。':'一般社會團體的入會費、常年會費須按章程，金額與方式由會員大會通過並報主管機關核備後辦理（人民團體法第33條、社會團體財務處理辦法第14條）。非會員志工不能用這個名目的會費收據，隊長或理事會口頭同意不能創設收費依據。')+
   (joint?'若另一方是合作社，合作社社員股金或費用由其依社章與合作社法核對，不能共用協會會費的依據或收據。':'')+'要向非會員固定收、或規定不繳就不給排班，先查實際性質、權限及合法依據，再向主管機關核對；未核清前不要收。']);
 }
 if(x.split)steps.push(['有實際材料費，不等於可以先收一筆固定月費','和合作方按實支分攤，先書面說清由誰採買、各負擔多少、憑證歸誰，按支出對帳。服務材料費、會員會費、社員社股、志工保險和補助分開，不能用一個名稱概括。是否能向參與者收特定成本仍依章程、計畫及適用規定確認。']);
 if(x.finance)steps.push(['團體款項不進隊長或家人的私人帳戶','由實際有權的團體依規開正式收據或出具適當交易證明、據實入帳；社會團體依財務處理辦法第16–18條以團體管理，附設小組財務併入年度報表，不只用群組報帳，也不以個人帳戶收存。'+(x.received?'私戶已收的先停止新增，列原始金流、收款人、原因、用途和憑證，交團體財務及監督人員查核，再確認移轉、補正或依原款性質退回；不要補造收據或先當成自籌。':'應用團體的收款、保管及核決流程，不以私人先代收後報帳作為常態。')]);
 if(x.insurance||joint||x.group)steps.push(['志工意外事故保險由實際運用單位負責','依志願服務法第16條，由運用單位替其志工辦意外事故保險。協會和合作社合辦要先釐清哪一方是運用單位、負責哪些人、日期與服務範圍，不能因還沒分攤保費或有人沒繳隊費就把投保責任推給隊長、志工或另一個團體。']);
 if(x.grant)steps.push(['補助沒核定，不先算成已取得經費','先依原公告及核定條件編預算並保留各筆支出；未核定不以補助款抵付或承諾費用，已收的其他款也要照原性質分開處理。']);
 if(c&&x.stock)steps.push(['社股由合作社依章程收，不是小隊財務','繳納社股和志工資格、材料費或捐款分開，由合作社留相應股金與社員紀錄。']);
 const title=c&&(x.member||x.fee)&&!x.plan?'合作社正式社員的費用，和服務小隊分開':joint?'協會與合作社合辦志工服務，先分運用單位與財務':x.fee?'附設志工隊：先分會費、費用、收款和保險':'志工隊是否立案、服務計畫何時報，分開看';
 const summary=c&&(x.member||x.fee)&&!x.plan?'小隊不是另一個合作社。先確認費用究竟是正式社員依章程認繳的社股、依規定收的費用，還是服務活動的實際成本。不要只因名叫社費就收。':x.fee?'內部志工隊不是獨立團體，非會員也不因參加志工隊就有會員會費義務。團體的錢不放私人帳戶。':'若只是原團體的內部小隊，不用為招募志工另行立案；志願服務計畫的事前備案和事後備查，則看章程目的與服務計畫。';
 return output(title,summary,steps,refs);
}
if(typeof module==='object'&&module.exports)module.exports={route};else root.verifiedVolunteerTeamGovernance=route;
})(typeof window==='object'?window:globalThis);
