(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const c=law('商業團體法第6、33、35、37、38條','D0050100');
const i=law('工業團體法第5、33、36、38、39條','D0050103');
const business=law('工商團體財務處理辦法第2、11、12、25、29、30條','D0050106');
const a=law('人民團體法第34條','D0050091');
const soc=law('社會團體財務處理辦法第11條','D0050097');
const county={title:'屏東縣政府對民間團體補助經費作業要點（公告所附）',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const cRe=/商業(?:同業)?公會/;
const iRe=/工業(?:同業)?公會/;
const common=/協會|社會團體|社團法人/;
const orgs={c:'商業同業公會',i:'工業同業公會',a:'一般協會／社區發展協會'};
const stages={g:'政府補助',f:'會費／展覽加繳',p:'事業費或興辦事業',b:'年度預算或決算'};
const aid=/補助|縣府核定經費|核定函|計畫款|核銷|政府核定/;
const cost=/預算|工作計畫|沒編|未編|年底|決算|監事(?:會)?(?:沒|未|先|還沒|還未)?審|先簽|押金|先支|支出/;
const fees=/會費|會員.{0,7}(?:加繳|增繳|多收)|追加.{0,4}(?:會員費|費用)|臨時加繳/;
const enterprise=/事業費|興辦事業|展示館|展館收益|長期經營|另立會計|分帳|不同帳/;
const negAid=/(?:不是|沒有|沒|不問|不涉及|沒有任何|無)(?:任何|政府|縣府){0,2}補助/;
function parse(q,prior){
 const full=norm(q);if(!full||full.length>590)return null;
 const fresh=/^新題[:：]?/.test(full), raw=full.replace(/^新題[:：]?/,'');
 const t=raw.replace(/(?:不是|並非|不問|不談)(?:一般)?(?:工商(?:同業)?公會|商業(?:同業)?公會|工業(?:同業)?公會|社會團體|協會|合作社)/g,'');
 if(/合作社|工會|家長會|管委會|農會|漁會|募款|勸募|解散|清算|出席費|交通費/.test(t))return null;
 const pickOrg=Object.keys(orgs).find(k=>raw==='確認預算團體:'+orgs[k]);
 const pickStage=Object.keys(stages).find(k=>raw==='確認這筆款項:'+stages[k]);
 const declared=[...(cRe.test(t)?['c']:[]),...(iRe.test(t)?['i']:[]),...(common.test(t)?['a']:[])];
 const guild=declared.includes('c')||declared.includes('i')||/公會|職業團體/.test(t);
 const follow=!!prior&&!fresh&&(pickOrg||pickStage||/^(?:更正|補充|確認|其實|不是|剛才|剛剛|現在|這筆)/.test(raw)&&(guild||declared.length||aid.test(t)||cost.test(t)||fees.test(t)||enterprise.test(t)));
 const prev=follow?prior:{};
 const g=aid.test(t)&&!negAid.test(raw), b=cost.test(t), f=fees.test(t), p=enterprise.test(t);
 const missing=/這筆(?:錢|款).{0,18}(?:開大會|大會通過|大會決議)/.test(t)&&(/(?:還不確定|不確定類型|哪一種|種類)/.test(t)||t.length<20);
 if(!follow&&!(guild&&(g||b&&(f||p||/協會.{0,15}一樣|一樣嗎/.test(t))||negAid.test(raw)&&f)||missing))return null;
 const list=pickOrg?[pickOrg]:declared.length?declared:prev.list||[];
 const typeChanged=!pickOrg&&!!prev.list?.length&&declared.length>0&&declared.join('')!==prev.list.join('');
 const keep=(v,k)=>!!(v||!typeChanged&&prev[k]);
 const onlyFees=/只(?:問|是|有).{0,9}(?:常年)?會費|不(?:是|問)展覽加繳/.test(t);
 const onlyBudget=/只是年度(?:預算|決算)|只問年度(?:預算|決算)|不(?:問|要)增收會費/.test(t);
 return {list,needsOrg:guild&&!list.length,grant:!negAid.test(raw)&&(pickStage==='g'||keep(g,'grant')),
  budget:!onlyFees&&(pickStage==='b'||keep(b,'budget')),fees:!onlyBudget&&(pickStage==='f'||keep(f,'fees')),
  venture:!onlyFees&&!onlyBudget&&keep(/興辦事業|展示館|展館收益|長期經營|另立會計|不同帳/.test(t),'venture'),
  enterprise:!onlyFees&&!onlyBudget&&(pickStage==='p'||keep(/事業費/.test(t),'enterprise')),
  increment:!onlyFees&&!onlyBudget&&keep(/加收|增收|加繳|增繳|多收|追加.{0,4}會費|會費.{0,4}增加/.test(t),'increment'),
  absent:!onlyFees&&keep(/沒(?:有)?開(?:大會|會)|未開(?:大會|會)|尚未開大會|大會.{0,5}(?:沒開|還沒開|開不了|不能開)|沒(?:有)?(?:會員)?大會紀錄/.test(t),'absent'),
  outPlan:!onlyFees&&keep(/預算.{0,7}(?:沒|未|無).{0,3}(?:編|列|這一項|這案)|年度沒編|工作計畫沒列|沒編這案|預算外|先簽|先支|押金/.test(t),'outPlan'),
  known:keep(/已(?:經)?(?:收到|拿到).{0,8}核定|已核定|政府核定|核定函|拿了.{0,8}核定/.test(t),'known'),
  local:keep(/縣府|屏東|縣級|本縣/.test(t),'local')};
}
function route(q,prev){
 const s=parse(q,prev);if(!s)return null;
 const refs=[],steps=[];
 const add=(h,b)=>steps.push([h,b]);
 const out=(title,summary,heading,choices)=>({direct:true,category:'公會財務｜補助、年度預決算與會費',title,summary,steps,refs,guildBudgetContext:s,questionState:{focus:choices?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices?{choiceHeading:heading,choices}:{})});
 const summary='補助資格、會費或事業費決議、年度預決算及專案核銷是不同流程。先按錢的來源和公會種類核對，不用一份理事會或會員大會紀錄代替全部。';
 if(!s.grant&&!s.budget&&!s.fees&&!s.venture&&!s.enterprise)return out('先分清這筆錢是什麼，再看是否需要開大會',summary,'您問的是哪種款項？',Object.values(stages).map(v=>({label:v,question:'確認這筆款項:'+v})));
 if(!s.list.length){
   if(s.grant){refs.push(county);add('補助先看實際計畫規定','是否接受申請及是否須附會員大會紀錄，先看公告的申請對象及附件清單。尚無紀錄就向原機關核對是否可補件，不借其他會議紀錄，也不保證可收件。');}
   return out('先確認是哪一類公會或協會',summary,'請選立案文件上的團體類型。',Object.values(orgs).map(v=>({label:v,question:'確認預算團體:'+v})));
 }
 if(s.grant){
  refs.push(county);
  add('能否申請與是否先過大會，看這筆補助計畫','先看申請對象、計畫用途、補助的機關和檢附文件。'+(s.list.includes('c')?'商業團體法第33條沒有明列政府補助，不能僅憑這條斷定每案都能領或一概不得領。':'')+'要不要在申請或領款前附會員大會紀錄、可否補件，依原公告或核定函，向原補助承辦問清楚。'+(s.absent?'還沒開大會，不要把理事會紀錄當成大會紀錄。':'')+'已核定與已撥款不同，不是有核定函就一律可支。');
  add('核銷向原補助機關，另算期限','查核定的項目、實支憑證、成果與期限；若適用屏東縣通案要點第8點，計畫執行完畢後20日內辦核銷，有剩餘依第8點之一繳回。依原方案另有條件者也核對；不以年度決算的日期代替核銷。');
 }
 if(s.list.includes('c')||s.list.includes('i')){
  refs.push(business);
  if(s.budget||s.outPlan||s.grant){
   add('工商團體的年度預算和決算：監事先審、大會通過','年度預算由理事會在年度開始前二個月編，送監事會或監事審核，再提會員（代表）大會，通常應在年度開始前報團體主管機關備查。決算由理事會於年度終了後三個月內編，監事先審、大會通過，原則於五月底前報主管機關。因故大會未能及時召開，按工商團體財務處理辦法第11、12條先報主管機關、事後提大會追認。'+(s.outPlan||s.known?'年度沒編或監事未審，不只憑理事會同意就先簽新支出，也不要等決算才補程序。查原預算、章程、核定及支出授權，向原主管機關確認調整途徑；已簽的契約另照實處理。':''));
  }
 }
 const detail=(industrial)=>{
  const name=industrial?'工業同業公會':'商業同業公會';
  refs.push(industrial?i:c);
  if(s.fees||s.increment)add(name+'：常年會費和展覽加繳不同',industrial?'依工業團體法第33條，常年會費依資本額、生產工具、工人數額或產品數量等章程標準，按月繳納。若為購置會所、增設備或辦展覽而要另外酌增，須核對主管機關核准，不直接搬用商業公會的大會加繳規則。':'依商業團體法第33條，常年會費依資本額並參照營業額，按章程分級與繳法收取。因辦展覽、購置會所或增設備而向會員酌增，應經會員大會決議，和申請政府補助分開。');
  if(s.enterprise)add(name+'：事業費另議',industrial?'依工業團體法第36條，事業費總額和每份金額由會員大會決議，報請主管機關轉目的事業主管機關核准。':'依商業團體法第35條，事業費的總額、每份金額與會員分擔份數，由會員大會決議；調整也一樣。不是收一般會費或獲補助就自動成立。');
  if(s.venture)add(name+'：興辦事業另立會計','若已屬法律所指公會興辦的事業，依'+(industrial?'工業團體法第39條':'商業團體法第38條')+'另立會計，每年送監事會審核且'+(industrial?'提報會員大會':'提報會員大會通過')+'，分報團體主管機關及目的事業主管機關備查。不把每一次展覽或補助一概當成這類事業。');
  if(s.budget||s.grant)add(name+'：這張報表要送哪裡',industrial?'一般預決算依工業團體法第38條報法定主管機關備查，依第5條看組織層級；特定地區及全國工業同業公會由內政部主管，縣（市）工業會是不同種類。補助報原補助機關。':'一般預決算依商業團體法第37條報團體主管機關，縣級商業同業公會依第6條是縣政府。別把這與興辦事業的雙機關、或補助的核銷承辦當成同一件事。');
 };
 if(s.list.includes('c'))detail(false);
 if(s.list.includes('i'))detail(true);
 if(s.list.includes('a')){
  refs.push(a,soc);
  add('一般協會：依人民團體法第34條，不拿工商期限來套','一般協會及社區發展協會的理事會，依社會團體財務處理辦法第11條編年度工作計畫與預算、年度終了後三個月內編年度工作及會計報告。年度預決算通常提大會通過後報主管機關，決算須先送監事會審核。若不能及時開大會，第11條有理事會及監事會或聯席會議先行、事後提大會追認再備查的程序；不套用工商「五月底」或單案補助核銷時限。');
 }
 const title=s.grant?'公會補助先看計畫，預算、會費與核銷要分開':s.list.length>1?'協會與公會的年度預決算各依規定':s.fees&&!s.budget?(s.list[0]==='i'?'工業同業公會常年會費依章程、按月繳納':'公會會費與事業費各按適用規定'):'年度預算或決算，依團體種類辦理';
 return out(title,summary);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedGuildGrantAndBudget=route;
})(typeof window==='object'?window:globalThis);
