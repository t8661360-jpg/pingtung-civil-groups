(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const civil=law('民法第27、167、169、170條','B0000001');
const assocLaw=law('人民團體法第11、12、29條','D0050091');
const finance=law('社會團體財務處理辦法第5、16、17、22條','D0050097');
const coopLaw=law('合作社法第2、9之一、34、39條','D0050112');
const personnel=law('合作社組織編制及人事管理準則','D0050198');
const credit=law('信用合作社法第1、2條及相關規定','G0380058');
const county={title:'屏東縣政府對民間團體補助經費作業要點第8、8之一及10點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const contract=/簽約|簽了|合約|契約|租約|續約|簽訂|代簽|場租|租場|簽貸款/;
const relevant=/(?:未|沒|沒有|不|尚未|擅自|私下|先|不等).{0,13}(?:同意|授權|開(?:理|監)?事?會|決議|開會|照章程|委託書|簽約)|(?:越權|無權|代簽|追認|補開|事後同意|卻.{0,12}簽|擅自.{0,6}簽)|(?:會議|理事會).{0,7}沒.{0,3}(?:同意|開|決議)|(?:不知道|還不清楚).{0,9}(?:授權|權限)/;
const types={registered:'已辦法院登記的社團法人',association:'只有縣府立案的協會',coop:'一般合作社'};
function parse(q,prior){
 const full=norm(q);if(!full||full.length>580)return null;
 const fresh=/^新題[:：]?/.test(full); const raw=full.replace(/^新題[:：]?/,'');
 const t=raw.replace(/(?:不是|並非|不要說|不談|不問)(?:一般|公益|法院登記的)?(?:社團法人|合作社|協會|理事(?:會)?主席|理事長|秘書長|總幹事)/g,'');
 if(/工業同業公會|商業同業公會|工會|農會|漁會|家長會|管委會|公司董事|電信合約|離婚協議|保證人欠債|薪水|勞資調解/.test(t))return null;
 const choice=raw.match(/^確認簽約團體:(已辦法院登記的社團法人|只有縣府立案的協會|一般合作社)$/);
 const press=raw.match(/^確認簽字人:(對外代表|員工或委託人|不清楚)$/);
 const c=/合作社/.test(t),a=/協會|社會團體|人民團體|社團法人|社區團體/.test(t);
 const y=/已(?:經)?(?:在|向)?(?:法院)?(?:完成|辦理|辦)?(?:法院)?(?:社團)?法人登記|已登記(?:的|為)(?:公益)?社團法人|法院登記的(?:公益)?社團法人|登記為(?:公益)?社團法人/.test(t);
 const un=/只(?:有)?(?:縣府)?立案|沒(?:有)?辦(?:法院)?法人登記|未(?:辦|做|完成|經)(?:法院)?法人登記/.test(t);
 const isCredit=/信用合作社|信合社/.test(t);
 const follow=!!prior&&!fresh&&(choice||press||/^(?:更正|補充|其實|確認|剛才|剛剛|不是|那|他|現在)/.test(raw)&&(c||a||contract.test(t)||relevant.test(t)));
 const p=follow?prior:{};
 const need=/有效|效力|算數|作廢|算嗎|一樣嗎|追認|不付|怎麼辦|要先查|要不要|核銷|授權|權限|怎麼看|沒同意|誰查|要停|得停|不能簽/.test(t);
 if(!follow&&!(contract.test(t)&&relevant.test(t)&&need))return null;
 if(a&&!isCredit&&c)return null;
 const uncertain=/(?:不(?:知道|確定|清楚)|不曉得).{0,12}(?:法人登記|法院登記)/.test(t);
 const explicit=isCredit?'credit':c?'coop':uncertain?(a?'unknown-association':null):un?'association':y?'registered':a?'unknown-association':null;
 const tp=choice?Object.keys(types).find(key=>types[key]===choice[1]):explicit||p.tp||null;
 const changed=!choice&&!!p.tp&&p.tp!=='unknown-association'&&!!explicit&&p.tp!==explicit;
 const agent=/秘書長|總幹事|主秘|經理|會計|出納|員工|秘書|代理人|受委託人/.test(t);
 const rep=/理事長|理事(?:會)?主席|董事長|法人董事|對外代表|代表人/.test(t);
 const role=press?(press[1]==='對外代表'?'rep':press[1]==='員工或委託人'?'agent':'unknown'):agent&&/代簽|由.{0,5}(?:經理|秘書長).{0,4}簽|(?:經理|秘書長|總幹事|主秘|出納|會計).{0,7}簽/.test(t)?'agent':rep?'rep':agent?'agent':!changed?p.role:null;
 const keep=(re,k)=>!!(re.test(t)||!changed&&p[k]);
 return {tp,role,notice:keep(/對方|房東|廠商|第三人|善意|知道|看過章程/,'notice'),
  paid:keep(/尾款|訂金|定金|押金|已(?:經)?付|款已|先付|付款|不付|扣款|違約金/,'paid'),
  internal:keep(/理事會|章程|決議|表決|追認/,'internal'),monitor:keep(/監事|查帳|調帳/,'monitor'),
  grant:!/(?:沒有|無|不是|未用|沒用)(?:政府|縣府)?補助(?:款)?(?:[,，。；;]|$)/.test(t)&&keep(/補助|核銷/,'grant'),
  borrowed:keep(/公所借用|向公所借|公所借來|借用的(?:器材|設備)|借來的(?:器材|設備)/,'borrowed'),
  asset:keep(/(?:設備|器材|財物|資產).{0,8}(?:當押|擔保|抵押|處分|賣|拿去抵)|列管|財產卡/,'asset'),charter:keep(/章程|內規/,'charter')};
}
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 const refs=[civil], steps=[];
 const add=(title,body)=>steps.push([title,body]);
 const result=(title,summary,heading,choices)=>({direct:true,category:'團體簽約｜權限、契約與核銷',title,summary,steps,refs,contractSigningContext:s,questionState:{focus:choices?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices?{choiceHeading:heading,choices}:{})});
 const general='沒有先取得理事會同意，不能只憑這一點斷定對外合約有效或無效；蓋了圖記、有人付款，也不能代替查授權。先把團體內部決議、相對人的權利義務、補助核銷分開。';
 if(s.tp==='credit'){refs.push(credit);return result('信用合作社簽約或授信依金融監理及個案契約','信用合作社不能直接照一般合作社或協會的程序判斷。先分清是信用合作社本身訂租約，還是對客戶辦貸款／授信；查金管法規、章程與授權紀錄，請法遵或法律專業看個案。',null,null);}
 add('先留存章程、簽約及付款資料','保存合約、附件、簽章及真正授權文件、會議紀錄、付款或押金資料與對方往來。先向有權人或監事查核，不另簽補件、撤約、認債或移轉財物。已到付款期限、收受催告或違約金通知時，儘快請法律專業看完整文件，不要只因沒開會就自行拒付尾款；也不要自行承認債務。');
 if(s.tp==='coop'){
  refs.push(coopLaw,personnel);
  add('一般合作社：理事互推的代表與經理不是同一角色','合作社法第34條規定理事依法律、章程和社員大會決議執行，並互推一人或數人對外代表。經理、會計或其他員工不單憑職稱取得簽約權；確認理事會／有權代表授權、範圍、金額和有效期間，並核對相對人取得的證明。監事可按第39條查核業務、財產與書類。');
 }
 if(s.tp==='association'||s.tp==='registered'||s.tp==='unknown-association'){
  refs.push(assocLaw,finance);
  add('協會內部先按章程查理事會、監事會紀錄','人民團體法第29條規範理事會、監事會的決議，不能用決議門檻直接判契約。核對章程是否要求事前決議、簽字人和用印權限；監事會可依財務處理辦法第22條查款項、會議、原始憑證與授權。');
  if(s.tp==='registered')add('已登記為社團法人：代表權限制與對外效力分開','民法第27條對法人董事的代表權有規定，對董事代表權所加限制，原則不得對抗善意第三人。先確認簽約者是不是有權的代表，內規限制對方是否知道，以及具體契約。對方曾看過章程、或聲稱不知道，都只是要查的事實，不由小屏判定善意。');
  if(s.tp==='association')add('只有立案、未辦法院法人登記：不要直接套法人董事規定','先核對團體章程、對外代表及授權，以及合約寫誰是當事人。縣府立案和法院法人登記不是同一件事。誰能追認、是否已有有效承認或其他效力，要依章程、決議、簽約及履行證據核對。');
 }
 if(s.role==='agent'||s.internal||s.notice||!s.role)add('代簽時要看實際授權及是否依法承認','依民法第167、169、170條，先查是否真的授權。無代理權者以代理人名義簽約，未經本人承認原則上不對本人發生效力；若團體的表示或行為足以構成表見代理，結果可能不同，對方明知或可得而知無權時又不同。事後補開會、收件、使用場地或付款不是一律等於已追認；要查誰有權、實際決議和對外表示。');
 if(s.grant){
  refs.push(county);
  add('合約效力不是補助核銷資格','核對原補助是否書面核定、是否屬核定項目和期限、金流及原始憑證。未核准或用途有疑義，別先把租金列成可核銷，也不要自行用補助餘款抵尾款或添購設備。把核定函和真實支出向原補助機關核對；核銷准不准不能用來判斷租約效力。');
 }
 if(s.asset||s.borrowed)add('設備另核所有權、用途及擔保限制','先對財產卡、核定函、借用單及合約附件；補助買的列管設備不先設定擔保或變賣，向原補助機關確認限制。公所借來的器材不是團體自有，不擅拿它抵押、點交或承諾給第三人，並依借用條件向原機關確認。');
 if(!s.tp||s.tp==='unknown-association')return result('先辨別團體身分，再查簽約授權',general,'有無法院法人登記，或是合作社？',Object.entries(types).filter(([k])=>s.tp!=='unknown-association'||k!=='coop').map(([,v])=>({label:v,question:'確認簽約團體:'+v})));
 if(!s.role)return result('先辨別簽約的人是不是有權代表',general,'當時是由誰簽約？',[['理事長或其他對外代表','對外代表'],['經理、秘書長或受委託的人','員工或委託人'],['不清楚誰簽','不清楚']].map(([label,k])=>({label,question:'確認簽字人:'+k})));
 return result(s.tp==='coop'?'合作社簽約：先查法定代表或經理授權':'協會簽約：先分內部決議與對外契約效力',general);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedContractSigningAuthority=route;
})(typeof window==='object'?window:globalThis);
