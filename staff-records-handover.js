(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const books=law('社會團體財務處理辦法第4、5、16、17、21、22條','D0050097');
const staff=law('社會團體工作人員管理辦法第2、3、8條','D0050096');
const chair=law('人民團體會務輔導辦法第18條','D0020094');
const coop=law('合作社法第35、39、40條','D0050112');
const monitoring=law('合作社監事監查規則第6、7條','D0050122');
const county={title:'屏東縣政府對民間團體補助經費作業要點第8點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const postal={title:'中華郵政：非營利法人及非法人團體帳戶的驗證文件（機構實例）',source:'https://www.post.gov.tw/post/internet/Templates/faq_templates.jsp?faq_kind_sn=7'};
const people=/總幹事|秘書長|出納|會計(?:人員)?|工作人員|員工|經理|職員/;
const change=/離職|離開(?:了)?|走了|辭職|辭掉|解聘|不做了|退休/;
const delivery=/沒(?:有)?(?:交給|交回|交還|交出|交接|交)|還沒給|不(?:肯|願)?(?:交|還)|未(?:交|歸還)|退還|交接|移交|點交|交回|交還|交給誰|得交誰|要交誰|該交誰|在(?:我|他|她)手上|在(?:我|他|她)那|還留|留下|沒給/;
const materials=/帳[簿冊本目]|帳跟|舊帳|憑證|發票|收據|存[摺折]|提款|印鑑|網銀|戶頭|帳戶|單據|帳(?:和|與|都|沒|不交)/;
const bank=/另(?:行)?開|(?:先|新)開(?:戶|帳)|開(?:個|一個)?新帳[戶号]|開一個新的戶頭|新(?:的)?戶頭|換(?:一家)?銀行|換(?:個)?帳戶|別家銀行|(?:先|另|新|銀行).{0,12}開戶|(?:另一家|其他|別家).{0,4}銀行.{0,4}開戶/;
const elected=/改選|換屆|新(?:一任|任|舊)?(?:理事長|會長)|新的(?:理事長|會長)|前任理事長|舊理監事|原任理事長/;
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const types={a:'一般協會／社區發展協會',c:'一般合作社'};
const choice=(label,question)=>({label,question});
function parse(q,prior){
 const raw=norm(q); if(!raw||raw.length>480||/^新題/.test(raw))return null;
 const t=raw.replace(/(?:不是|並非|不問)(?:一般|原本的)?(?:協會|社會團體|合作社)(?:的總幹事)?/g,'');
 if(/信合社|信用合作社|公會|工會|農會|漁會|管委會|家長會|財團法人|勞資調解|離職預告|離職證明|資遣費|解散|清算/.test(t))return null;
 const c=/合作社/.test(t),a=/協會|社會團體|社團法人|社團/.test(t);
 if(c&&a)return null;
 const pick=raw.match(/^確認是(一般協會|一般合作社)，接著處理離職交接$/);
 const items=raw.match(/^確認主要要交還(財務帳冊|銀行實體物品|網銀存取權限)$/);
 const prefix=/^(?:確認|更正|補充|其實|不是|沒改選|剛才|剛剛|他|那)/.test(raw);
 const follow=!!prior&&(pick||items||prefix&&(c||a||delivery.test(t)||materials.test(t)||/改選|縣府補助/.test(t)));
 const x=follow?prior:{};
 const left=people.test(t)&&change.test(t), giving=delivery.test(t), relevant=materials.test(t);
 const noChair=/(?:沒(?:有)?|並未|不用|不曾|沒有要|不是)(?:真的|辦|經過|要|剛)?改選|沒有換(?:屆|理事長)/.test(t);
 const regular=(!noChair&&elected.test(t))||!noChair&&!!x.regular;
 const opening=bank.test(t);
 if(!follow&&!(left&&(giving&&relevant||/會計(?:人員)?離職要怎麼交接/.test(t))||regular&&opening&&giving||giving&&relevant&&/(?:都沒交|可能不交|沒有交完)/.test(t)))return null;
 const newOrg=c?'c':a?'a':pick?(pick[1]==='一般合作社'?'c':'a'):x.org||null;
 const switched=!!x.org&&!!newOrg&&newOrg!==x.org;
 const keep=(v,k)=>!!(v||!switched&&x[k]);
 const item=items?.[1]||null;
 return {org:newOrg,left:keep(left||!!(follow&&people.test(t)&&giving),'left'),regular:regular&&(!switched||elected.test(t)),opening:keep(opening,'opening'),
  books:keep(/帳[簿冊本目]|帳跟|舊帳|憑證|發票|收據|單據|財務帳冊|帳(?:和|與|都|沒|不交)/.test(t),'books'),
  bank:keep(/存[摺折]|印鑑|提款|銀行|帳戶|戶頭|網銀|銀行實體物品/.test(t)||opening,'bank'),
  online:keep(/網銀|提款.{0,4}密碼|網銀存取權限|存取權限|登入.{0,3}密碼/.test(t),'online'),
  grant:!/(?:沒有|不涉及|不是)補助/.test(t)&&keep(/補助|核銷/.test(t),'grant'),
  legal:keep(/報警|告(?:他|她|對方)|提告|報案|侵[占佔]/.test(t),'legal'),
  monitor:keep(/監事|查帳|監交/.test(t),'monitor'),item};
}
function route(q,prior){
 const x=parse(q,prior);if(!x)return null;
 const isC=x.org==='c', isA=x.org==='a';
 const refs=[],steps=[];
 const add=(title,body)=>steps.push([title,body]);
 const out=(title,summary,heading,choices)=>({direct:true,category:'財務交接與帳戶安全',title,summary,steps,refs,staffRecordsContext:x,questionState:{focus:choices?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices?{choiceHeading:heading,choices}:{})});
 const basic='先把收到和缺少的項目分開做清冊，註明日期及保管人，保留通知、點收和交易紀錄。由團體有權的人辦交接，不要把帳冊或存摺交到私人代管，也不要簽「全部無誤」。';
 add('先列出缺件、書面點交',basic);
 if(x.left){
  if(isA){refs.push(staff,books);add('總幹事、會計或出納離職，由協會指定接收人','依章程、理事會授權、契約與工作規則核對，由有權代表協會的人確認接收者，例如接任的財務人員，再逐項點交帳簿、憑證及存摺。協會依法保管帳簿和憑證；監事會可按職權查核，必要時召開臨時監事會，但監事查帳不等於可自行拿存摺或提領。改選的十五日是新任理事長接收移交的期限，不是工作人員離職的規定。');}
  if(isC){refs.push(coop,monitoring);add('合作社經理或出納離職，由理事會接手安排','由理事會依章程、授權與人事規則指定接管人，請離職者書面點交帳簿、憑證、實體銀行用品與未完事項。依法應置的簿冊留在合作社；監事可從理事會取得資料依法監查，不套一般協會的理事長交接規則。');}
 }
 if(isA&&x.regular){
  refs.push(chair);
  add('理事長改選，是另外一套移交','依人民團體會務輔導辦法第18條，整屆理監事改選前造清冊，新任理事長就任後十五日內會同監交人接收。監交人是新任監事會召集人（常務監事）或由新任監事互推一人。沒交的列入紀錄，屆期未完成可向原主管機關說明，按規定處理證書與圖記；不是改選後自動失效。');
 }
 if(isC&&x.regular&&!refs.includes(coop))refs.push(coop,monitoring);
 if(x.opening){
  refs.push(postal);
  add('可以先問銀行並備件，不能把另開新帳戶當作完成交接','沒有查到「未完成交接就一律禁止另開」或「一改選就保證開得成」的通案規定。另開新帳戶由該銀行核對團體名稱、代表權與相關資料，按機構要求準備立案／登記證明、章程、改選及代表權證明等；備查函是否必須由該銀行確認。不要先把公款轉入私人帳戶。另開戶也不會停用舊印鑑、取得舊帳或改掉補助指定帳戶；分別洽原銀行及補助機關。');
 }
 if(x.bank||x.online){
  add('原帳戶的提領及網銀權限先保全','如存摺、印鑑或網銀存取還在離職人員手上，由團體帳戶有權人盡快聯絡原銀行，依銀行流程核對近期交易、停用舊授權或重設存取。不要要求對方交出網銀密碼、驗證碼，也不要代登入。印鑑變更、補發或風險控管由原銀行依權限及資料確認。');
 }
 if(x.grant){
  refs.push(county);
  add('補助核銷先聯絡原核定承辦，別等交接全部完成','記下缺的是哪筆原始憑證，留付款資料，向原開立者查找可用的副本或交易佐證；網銀明細能證明付款線索，不能自行當成發票或支用單據的替代品。把已執行、缺件、核定函與核銷期限告知原補助承辦，確認可否補件、先送已核實部分或另行處理；詢問不會自動展延。');
 }
 if(x.legal)add('可先保全資料；是否涉刑事由警察、檢察或法院判斷','沒有辦法單憑離職後沒交帳簿就判定侵占或一定要告。先書面催還，保存點收、催告、銀行交易及異常資料。若發現未授權提款或公款短少，先從官方管道聯絡銀行保全帳戶，並可帶事證向警方詢問或向法律專業求助；一般交接爭議可先洽團體主管機關、視個案循民事途徑。');
 const sum=x.opening?'新任能否在交接前另開新帳戶，請由銀行依代表權證明審查。原帳不必等新帳戶開成才保全，兩件事應分開辦。':x.left?'先把團體的帳簿、憑證、存摺交給有權接收的人，留逐項簽收；不因離職了就要自動報警。':'先保留帳冊、單據與銀行紀錄，按要交還的項目處理。有帳戶風險優先找原銀行。';
 const title=x.opening?'另開新帳戶由銀行審查，舊帳仍要交接':isC?'合作社離職交接：帳簿交還、銀行權限由有權人處理':'離職沒交帳簿或存摺：先確認誰接收、保全團體資料';
 if(!x.org)return out(title,sum,'先確認是哪類團體。',[choice(types.a,'確認是一般協會，接著處理離職交接'),choice(types.c,'確認是一般合作社，接著處理離職交接')]);
 if(!x.books&&!x.bank&&!x.online)return out(title,sum,'目前還缺哪一類？',[choice('帳簿／憑證','確認主要要交還財務帳冊'),choice('存摺／印鑑','確認主要要交還銀行實體物品'),choice('網銀存取權限','確認主要要交還網銀存取權限')]);
 return out(title,sum);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedStaffRecordsHandover=route;
})(typeof window==='object'?window:globalThis);
