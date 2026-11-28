(function(root){
'use strict';
const ref=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const commerce=ref('商業團體法第3、6、16、28、29、31條','D0050100');
const commerceRules=ref('商業團體法施行細則第13、14、23、25條','D0050101');
const industry=ref('工業團體法第3、5、28、29、31條','D0050103');
const industryRules=ref('工業團體法施行細則第14、16、26、30條','D0050104');
const common=ref('人民團體會務輔導辦法第10、12條','D0020094');
const people=ref('人民團體法第1、3、26、54條','D0050091');
const nurse=ref('護理人員法第48、51、53條','L0020166');
const doctor=ref('醫師法第34、38、39條','L0020001');
const commerceType=/商業(?:同業)?公會/;
const industryType=/工業(?:同業)?公會/;
const professional=/自由職業(?:公會|團體)|護理(?:師|人員)公會|醫師公會|社工師公會|社會工作師公會|物理治療師公會|藥師公會|會計師公會|律師公會|建築師公會|地政士公會/;
const guild=/公會|職業團體/;
const record=/紀錄|記錄|會議錄|會後.{0,12}(?:報|寄|送|分發)|開完.{0,12}(?:報|寄|送|分發)|幾份.{0,8}(?:報|寄|送)/;
const agenda=/通知|送達|議程|派員|列席|監選|指導|臨時(?:會員)?大會/;
const roster=/名冊|會籍|(?:(?:改派|續派)|會員代表.{0,4}(?:變更|更換))|(?:換|改)代表/;
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const label={c:'商業同業公會',i:'工業同業公會',p:'自由職業公會（如醫師或護理師）'};
function parse(q,prior){
 const full=norm(q);if(!full||full.length>560)return null;
 const fresh=/^新題[：:]?/.test(full);
 const raw=full.replace(/^新題[：:]?/,'');
 const t=raw.replace(/(?:不是|並非|非屬|不是指|不問|不談)(?:一般|縣級|原來的)?(?:商業(?:同業)?公會|工業(?:同業)?公會|自由職業公會|社會團體|協會|合作社)/g,'');
 if(/工會|合作社|基金會|管委會|家長會|醫療紀錄|工作人員離職|報警|財產處分|清算人|公聽會/.test(t))return null;
 const c=commerceType.test(t), i=industryType.test(t), p=professional.test(t);
 const clarified=raw.match(/^確認公會類型:(商業同業公會|工業同業公會|自由職業公會)$/);
 const named=/護理(?:師|人員)公會/.test(t)?'nurse':/醫師公會/.test(t)?'doctor':(p&&t.match(professional)?.[0])||null;
 const unknown=/不(?:確定|知道).{0,10}(?:公會|職業)|只有(?:說)?(?:我們是|知道是)?公會|只知道是公會/.test(raw);
 const follow=!!prior&&!fresh&&!unknown&&(clarified||/^(?:更正|補充|確認|其實|不是|剛才|剛剛|現在只問|那|改成)/.test(raw)&&(c||i||p||record.test(t)));
 if(!follow&&!(guild.test(t)&&record.test(t)&&(/會議|大會|理事會|監事會|理監事|會後|開完|幾天|多少天/.test(t)||/紀錄要報|紀錄要送|記錄要報/.test(t))))return null;
 const prev=follow?prior:{};
 const orgs=[...(p?['p']:[]),...(c?['c']:[]),...(i?['i']:[])];
 if(!orgs.length)orgs.push(...(prev.orgs||[]));
 const onlyRecords=/只(?:想|要|是)?問.{0,20}(?:紀錄|記錄)|只(?:想|要|是)?問.{0,16}(?:理事會|監事會)|只問.{0,10}會後/.test(t);
 const negCharter=/沒(?:有)?(?:要|辦|改過)?改章程|沒(?:有)?修章|不是修章/.test(t);
 const charter=/修章|章程.{0,4}(?:變更|修改)|改(?:了|過)?章程/.test(t)&&!negCharter;
 const newType=orgs.length&&prev.orgs?.length&&orgs.join('')!==prev.orgs.join('');
 const keep=(re,k)=>!!(re.test(t)||!newType&&prev[k]);
 return {orgs,named:named||(!newType?prev.named:null),roster:!onlyRecords&&keep(roster,'roster'),agenda:!onlyRecords&&keep(agenda,'agenda'),
  charter:!onlyRecords&&!negCharter&&(charter||!newType&&!!prev.charter), election:!onlyRecords&&!/沒(?:有)?改選|無選舉|不改選/.test(t)&&keep(/改選|改遴|選理監事|監選|選舉/, 'election'),
  local:keep(/屏東|本縣|縣內|縣級|縣政府|縣府/,'local'), assembly:keep(/大會/,'assembly'),
  board:keep(/理事會|監事會|理監事會|理、監事會|理監事各/,'board'),record:keep(record,'record')};
}
function route(q,prev){
 const s=parse(q,prev);if(!s)return null;
 const refs=[],steps=[];
 const add=(title,body)=>steps.push([title,body]);
 const out=(title,summary,opts)=>({direct:true,category:'公會會議｜通知、名冊與會後紀錄',title,summary,steps,refs,guildRecordsContext:s,questionState:{focus:opts?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(opts?{choiceHeading:'您是哪一類公會？',choices:opts}: {})});
 if(!s.orgs.length){
  return out('先確認公會種類，再算會議紀錄期限','商業、工業和自由職業公會的規則不同。您已提到的會議種類會保留，不必重說；先對照立案證書上的全名，再選一類。',Object.entries(label).map(([k,v])=>({label:v,question:'確認公會類型:'+({c:'商業同業公會',i:'工業同業公會',p:'自由職業公會'})[k]})));
 }
 const clause=(k)=>{
  const com=k==='c';
  const name=label[k];
  refs.push(com?commerce:industry,com?commerceRules:industryRules);
  const site=com?'縣級商業同業公會的團體主管機關是縣政府，直轄市屬市政府，全國屬內政部。目的事業主管機關另依行業與組織層級核對；在屏東活動不代表兩份都送縣府。':'依工業團體法第5條，直轄市工業同業公會由該市政府主管，省、特定地區、全國工業同業公會由內政部主管；縣（市）工業會屬縣（市）政府，和工業同業公會不是同一種組織。目的事業主管機關另依行業與組織層級核對。';
  if(s.agenda)add(name+'｜會前通知、議程和派員', (s.assembly||!s.board?'會員大會原則在開會十五日前通知；因緊急事故召開臨時會員大會，通知實際送達且能適時到會時，才適用例外。不用提前十五日不等於不用通知，也不延後會後紀錄期限。':'這裡問的是理事會或監事會，不直接套用會員大會的十五日前通知。')+(com?' 會員大會通知及報請派員時，載明會議種類、時間、地點並附議程。一般會員大會得報請團體主管機關派員列席；議程涉及目的事業時也得報請目的事業主管機關派員。理事會、監事會必要時得準用。':' 依施行細則第26、30條，會員大會、理事會或監事會，應分別報請團體主管機關及目的事業主管機關派員指導或監選，發通知、報請派員時附議程；沒有選舉不等於可省掉報請指導。')+(s.election?' 有改選時把選舉議程、名冊及通知送達證明留存，另確認選務及當選異動文件；不能以是否實際有人列席推斷選舉效力。':''));
  if(s.roster)add(name+'｜會前名冊與會員代表改派',com?'每年大會一個月前辦會籍總清查並書面通知會員；會員應於大會二十日前書面聲明是否改派，逾期不聲明視為續派。大會十五日前將會員及會員代表名冊報主管機關備查。平時改派仍按適用程序辦理，即使不改選，年度清查也不要省略。':'年度大會一個月前辦會籍清查、書面通知會員；會員於大會二十日前書面聲明是否續派或改派，未聲明視為放棄續派或改派的權利。大會十五日前把會員及會員代表名冊報主管機關核備；平時改派也應書面告知公會。');
  add(name+'｜會後分送全體各會員並報兩種主管機關','會員（代表）大會、理事會、監事會，即使同一天開，也要各自製作紀錄。分別在各會議後'+(com?'十五日內（15 日）':'七日內（7 日）')+'分送各會員，不只寄當天出席的代表；並報團體主管機關及目的事業主管機關'+(com?'備查':'')+'。'+site+(com?' 其他會議的決議若影響會員權益，另通知相關會員。':' 依法須核辦或核備的決議，要另案辦理並於下次會議報告進度或結果。'));
  if(s.charter)add(name+'｜送紀錄不等於完成修章','修章需依'+(com?'商業':'工業')+'團體法第29條，由三分之二以上會員代表出席、出席代表三分之二以上同意。把修章決議、對照表及修正全文備妥，另向主管機關確認適用報件期限、程序和表件；不要把一般紀錄寄出當成修章已經備查或核可。');
 };
 if(s.orgs.includes('c'))clause('c');
 if(s.orgs.includes('i'))clause('i');
 if(s.orgs.includes('p')){
  refs.push(people,common);
  const n=s.named==='nurse',d=s.named==='doctor';
  if(n)refs.push(nurse);if(d)refs.push(doctor);
  add(n?'護理人員公會先看護理人員法及章程':d?'醫師公會先看醫師法及章程':'自由職業公會先確認專業別與特別法','不適用工業同業公會的會後七日或商業同業公會的會後十五日規定。'+(n?'依護理人員法第48、51、53條，會務由人民團體主管機關主管、專業另受衛生主管機關指導監督；章程應載各類會議規定。':d?'醫師公會有醫師法和章程要求，會務窗口與衛生目的事業窗口分開。':'不同專業有各自的法律；請補充是哪一種公會及立案層級，才確認例外或指定收件機關。')+'沒有其他優先特別規定時，依人民團體會務輔導辦法第12條，會員（代表）大會紀錄閉會後三十日內報主管機關備查；理事會、監事會及理監事聯席會議紀錄留存供會員查閱，依法需核辦或備查的決議另報，不等於一律寄全體會員。');
 }
 const multi=s.orgs.length>1;
 const type=s.orgs[0];
 const title=multi?'先分公會類型，再各自辦理紀錄':type==='c'?'商業同業公會：會後十五日內送紀錄':type==='i'?'工業同業公會：會後七日內送紀錄':'自由職業公會的紀錄先看專業別，不套工商公會期限';
 const summary=multi?(s.orgs.filter(k=>k!=='p').map(k=>k==='c'?'商業同業公會是會後十五日':'工業同業公會是會後七日').join('；')+(s.orgs.includes('p')?'；自由職業公會要看其行業法及章程':'')+'。不把會前通知、名冊和會後紀錄當成同一件事。'):type==='p'?'先辨明是會員大會或理事會、監事會，並核對專業法。工業同業公會的七日不能套用。':'這裡的期限從每一場會議結束後算。紀錄要分送各會員，也要報團體主管機關與目的事業主管機關；不是只寄出席者，也不是只報縣府。';
 return out(title,summary);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedGuildMeetingRecords=route;
})(typeof window==='object'?window:globalThis);
