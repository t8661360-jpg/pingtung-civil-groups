(function(root){
'use strict';
const ref=(title,p,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const assoc=n=>ref('人民團體選舉罷免辦法第'+n+'條','D0050093',n);
const trade=ref('商業團體法施行細則第45條','D0050101',45);
const industry=ref('工業團體法施行細則第52條','D0050104',52);
const clean=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'');
const ballots=/發選舉票|發選票|發放(?:選舉票|選票)|發票員|發票|唱票|記票|監票|選務人員/;
const accounting=/統一發票|電子發票|開(?:立|具)發票|會計憑證|收支憑證|支出傳票|報帳|核銷|年度決算/;
const ballotUse=t=>!accounting.test(t)&&ballots.test(t)&&/選務|改選|投票|選票|選舉|開票|參選|候選/.test(t);
const ordinaryDispute=q=>{const t=clean(q);return /合作社/.test(t)&&!/信用合作社|信合社|協會|公會|農會|漁會/.test(t)&&/候選人|參選人/.test(t)&&/兼(?:任|當|做|記|監|唱|發)|自己(?:當|做|記|監|唱|發)/.test(t)&&/監票|唱票|記票|發票員|選務人員/.test(t)&&/異議|違規|爭議/.test(t);};
const stageReply=t=>/^(?:更正[:,，：]?|補充[:,，：]?)?(?:(?:我們|我|現在)?(?:還沒選|選前安排|還沒投票|正在投票|正在開票|結果(?:已|剛)宣布|已經公布結果))[。！!？?]?$/.test(t);
function route(q,held){
 const raw=String(q??'').trim(),short=clean(raw),t=held&&stageReply(short)?clean(held)+'；階段確認:'+short:short;
 if(!t||t.length>670||!ballotUse(t)||/通訊選舉|通訊投票|郵寄選票/.test(t))return null;
 const z=t.replace(/(?:不是|並非)(?:問|要|在談)?(?:一般)?(?:社區發展協會|協會|一般合作社|合作社|信用合作社|商業同業公會|工業同業公會)(?=[，,、；;。]|$)/g,'');
 if(/合作社|信合社|農會|漁會|工會|基金會|里長|里民|立委|議員|總統|股東|管委會/.test(z))return null;
 const guild=/商業(?:同業)?公會/.test(z)?'trade':/工業(?:同業)?公會/.test(z)?'industry':'';
 const association=/協會|社會團體|人民團體/.test(z);
 if(guild&&association||!guild&&/公會/.test(z))return null;
 const candidate=/候選人|候選|被選舉人|參選/.test(z);
 const combine=/同一(?:個)?人|兼(?:任|做|當|發|監|唱|記)|一人(?:兼|發|監|唱|記)|同時|自己(?:當|作|做|發|監|唱|記)|指派自己|負責.{0,12}(?:和|及|與|並)/.test(z);
 const before=/選務準備|(?:還|尚)沒(?:開始)?選|(?:還|尚)未(?:開始)?選|還沒改選|投票前|還沒投票|選前|未投票|明天(?:才|將)?(?:選|投票)/.test(z);
 const now=/現在.{0,6}(?:開票|投票|計票)|(?:正在|現場|開始|還在)(?:投票|開票|計票)|結果還沒宣布|當場提出/.test(z);
 const after=/已(?:經)?(?:宣布|公布)|昨天.{0,4}(?:公布|宣布)|(?:結果|名次).{0,6}(?:宣布|公布|出爐|揭曉)|開完票|開票完|已開票/.test(z)&&!/(?:尚未|未|還沒|沒有)(?:宣布|公布)/.test(z);
 const confirmed=t.match(/(?:階段確認|選務階段確認):([^；]*)$/)?.[1]||'';
 const preOnly=/(?:不是|並非)(?:要|問|在問)?(?:異議|申訴|事後)|只想.{0,18}(?:安排|配置)/.test(z);
 if(!combine&&!(candidate&&(guild||now||before||/自己可以當|(?:想|要|能|可)(?:自己)?(?:當|做)|兼|還沒簽/.test(z))))return null;
 if(!guild&&!association)return null;
 const phase=confirmed?(/沒選|選前|沒投票/.test(confirmed)?'before':/正在/.test(confirmed)?'now':'after'):before&&!after?'before':after?'after':now?'now':'';
 const absent=/未出席|沒(?:有)?出席|沒去|缺席|不在場/.test(z)&&!/不是沒出席/.test(z);
 const present=!absent&&/我(?:在場|有(?:到|到場|出席|參加|投票))|(?:確實|實際|曾|有)出席|出席的(?:會員|代表)|(?:實際|有)投票的(?:會員|代表)/.test(z);
 const name=guild==='trade'?'商業同業公會':guild==='industry'?'工業同業公會':/社區發展協會/.test(z)?'社區發展協會':'一般協會';
 const scope=guild?'先適用'+(guild==='trade'?'商業團體法及其施行細則；施行細則第45條':'工業團體法及其施行細則；施行細則第52條')+'另要求依人民團體選舉罷免辦法辦理。':'';
 const roles=['先把發選舉票、唱票、記票和監票分工說清楚',scope+'第8條要求先確定這四類選務人員。該條沒有明定所有職務一定要由不同人擔任，也沒有明定候選人一律不得兼任；不能因此說候選人一定可以兼任。先核對章程及自訂選舉規則。為避免爭議，建議讓未參選且無利害關係的人負責，能分工就分工，尤其不要讓候選人經手自己參選那一項的票。選務分工也不是判定候選人有沒有投票權的依據。'];
 const at=['還在投票或開票，先找會議主席或主持人', '出席參加選舉的會員或會員代表可當場具體指出哪個角色、哪條規則及哪個環節有疑義，請主席或主持人處理，並請把異議和當場處理方式列入紀錄。不是一定要先找監事，也不要自行碰票或宣布停選。'];
 const written=['兩個15日，從不同事件開始','依第25條，出席參加選舉的會員或會員代表，可從結果宣布之日起15日內，書面向該團體提出異議；團體從收件起另有15日查明並書面回覆。曾口頭反映但紀錄沒寫，可在原期限內書面補述，附可合法提供的事證並留收件紀錄，不要以為口頭反映會重算期限。向主管機關反映不能取代向團體送異議。仍有爭議得依法向法院提起訴訟。'];
 const noAttendance=['先確認提出人是否出席參加選舉','第25條這項程序的對象是出席參加選舉的會員或會員代表，不是任何在場的人。未出席者不要直接套用；可先核對章程並向該團體或主管機關了解其他途徑。'];
 const preservation=['紙本票與電子選舉資料，分開保存','依第26條，紙本票在結果宣布後全數包封，封面標示團體名稱、屆次、職稱、票張數與日期，經會議主席和監票員一同驗簽後由團體保管。若是電子方式選舉，要保存歷程及結果原始資料，另作異地備份。若封面疑似漏簽，先維持原狀、記下缺漏並依規處理，不要自行拆封、回填、刪改或把票與個資貼到群組。無爭訟才在任期屆滿改選完成後銷毀，不是過了15日就刪。'];
 const noReelect=['有疑義先釐清，不等於自己立即重選','保存合法可取得的規則、通知、選務分工、結果宣布時間和送達紀錄。由有權處理者釐清是否違規及其影響，不能單憑兼任或紀錄缺漏就認定選舉當然有效或無效。'];
 const opts=!phase&&!preOnly;
 let steps=phase==='before'||preOnly?[roles]:phase==='now'?[at,roles,...(absent?[noAttendance]:[written]),noReelect]:phase==='after'?[absent?noAttendance:written,roles,preservation,noReelect]:[roles,noAttendance];
 if(phase==='after'&&absent)steps=[noAttendance,roles,preservation,noReelect];
 if(phase==='now'&&absent)steps=[noAttendance,roles,noReelect];
 const summary=phase==='before'||preOnly?'如果還沒選，先核對章程與選務規則。發票在這裡指發選舉票；能分派給未參選、無利害關係的人，最好不要讓同一人同時發票與記票，也不宜讓候選人經手自己參選項目的選票。':
  phase==='now'?(absent?'未出席不能以第25條的出席參加者身分當場異議，可再向團體了解其他程序。':'正在投票或開票，出席參加的會員或會員代表可先找主席或主持人，請把具體異議和處理方式寫進紀錄。'):
  phase==='after'?(absent?'未出席者不直接適用第25條的15日異議程序。請先保全資料，向團體查核其他途徑。':(present?'您提到出席參加選舉的會員或會員代表，可':'如果是出席參加選舉的會員或會員代表，可')+'在結果宣布之日起15日內，書面向'+name+'提出異議。團體收件後另有15日書面回覆，並應妥善保全選舉資料。'):
  '第8條沒有一律禁止候選人兼任選務，但還須看章程及自訂選舉規則。為避免爭議，建議另找未參選、無利害關係的人。要不要當場提出或書面送件，要看選舉進行到哪一步。';
 return {direct:true,category:name+'｜選務分工與選舉異議',title:(guild||association?name+'：':'')+'發選舉票、記票和監票，先分選前或異議',summary,steps,refs:[...(guild?[guild==='trade'?trade:industry]:[]),assoc(8),...(phase==='before'||preOnly?[]:[assoc(25)]),...(phase==='after'?[assoc(26)]:[])],questionState:{focus:opts?'clarify':'compound'},
 ...(opts?{pendingBallotStage:raw,choiceHeading:'選舉目前到哪一步？',choices:[['尚未開始投票','選前安排'],['正在投票或開票','正在開票'],['結果已經宣布','結果已宣布']].map(([label,key])=>({label,question:raw+'；選務階段確認：'+key}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route,ballotUse,ordinaryDispute};
else {root.verifiedElectionBallotStaffRoles=route;root.isOrdinaryCoopStaffDispute=ordinaryDispute;}
})(typeof window==='object'?window:globalThis);
