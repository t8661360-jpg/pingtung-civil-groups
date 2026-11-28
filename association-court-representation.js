(function(root){
'use strict';
const civil={title:'民事訴訟法第40、52、68至70、76條：當事人、訴訟代理與輔佐',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0010001'};
const nonLawyer={title:'民事事件委任非律師為訴訟代理人許可準則第2條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010032&flno=2'};
const form={title:'司法院：民事委任狀（一般與特別委任）',source:'https://www.judicial.gov.tw/tw/cp-1361-3974-0f9f4-1.html'};
const mediation={title:'司法院：法院民事調解',source:'https://www.judicial.gov.tw/tw/cp-1448-56928-185b3-1.html'};
const postal={title:'中華郵政：郵務營業規章的招領及委託代領',source:'https://www.post.gov.tw/post/internet/Law/index.jsp?ch_class_id=27&law_ch_name=&law_ch_no=34&law_id=15'};
const service={title:'民事訴訟法第138條：寄存送達不是一般郵局招領',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010001&flno=138'};
const coopLaw={title:'合作社法第34條：對外代表',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050112&flno=34'};
const admin={title:'司法院：行政訴訟的強制律師代理事件及例外',source:'https://www.judicial.gov.tw/tw/cp-1303-902426-df0fa-1.html'};
const civilCode={title:'民法第27、31、48條：法人代表、登記與第三人',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'};
const labels={civil:'民事開庭／簽訴狀',mediation:'法院民事調解',mail:'只領法院信件',other:'行政、刑事或其他'};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
function route(q){
 const raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>430||/^(?:新題|另問)|管委會|管委|股東|工會|公會|農會|漁會/.test(t))return null;
 const ctx=t.match(/;所選程序:(civil|mediation|mail|other)$/)?.[1];
 const body=t.replace(/;所選程序:[a-z]+$/,'');
 const coop=/(?:合作社|社員)/.test(body.replace(/(?:不是|並非|非)合作社/g,''));
 const group=/協會|社團|人民團體|社會團體|總幹事|秘書長|理事長/.test(body)||coop;
 const court=/法院|法庭|庭期|出庭|開庭|民事事件|民事訴訟|訴狀|言詞辯論/.test(body);
 const authority=/代理|代替|代表|委託|委任|出庭|開庭|陪.{0,12}法庭|輔佐人|簽收|簽.{0,5}(?:字|起訴狀)|簽送|領.{0,8}(?:信|文|通知|文件)|收文件/.test(body);
 const mail=/郵局|招領|代領|領.{0,7}(?:法院信|法院通知|法院文書)|收發/.test(body);
 const bareUnknown=/法院.{0,12}通知|收到法院/.test(body)&&/不確定|不知道|不清楚|分不清/.test(body)&&/民事|調解|行政|何種|哪種|哪兩/.test(body);
 const med=/調解通知|調解.{0,10}(?:出席|到場|代理|委任)|法院.{0,15}調解|法院民事調解/.test(body);
 const pureMail=ctx==='mail'||(!ctx&&court&&mail&&(!/出庭|開庭|簽訴狀|簽和解|談和解|調解/.test(body)||/(?:只問|只想|只是|只是要|只要|只需|僅).{0,16}(?:領|郵局)|(?:不用|不會|不去)出庭.{0,20}(?:領|郵局)/.test(body)));
 const party=group&&/非法人|沒有法人|沒法人|沒.{0,5}法院法人登記|未.{0,6}法人登記|只有立案|尚未登記/.test(body)&&/當事人|起訴|訴狀|提告|出庭/.test(body);
 if(!ctx&&!bareUnknown&&!pureMail&&!(group&&((court&&authority)||(med&&authority)||party)))return null;
 const result=(title,summary,steps,refs,extra={})=>({direct:true,category:'團體會務｜法院通知與代表',title,summary,steps,refs,...extra});
 const mailSteps=[
  ['依招領通知單和信件種類','先核對收件人是協會還是理事長個人。一般國內掛號可由收件人委託代領：帶招領通知單及收件人委託書或印章；代領人出示自己的身分證明，並簽名或蓋章。團體用印與特殊件要求依通知單，請先向招領郵局確認。'],
  ['司法期限不等於郵局招領期限','法院文書可能已用其他方式合法送達，例如民事寄存送達。不要把實際領件日當成一定的起算日。留存信封及通知單，盡快向通知上的法院書記官確認送達日、開庭或補件期限。']
 ];
 if(pureMail)return result('只代領法院信件：與代協會出庭不同','總幹事若只是替協會領一般掛號，能否代領看收件人、委託資料及招領通知單，不是看職稱。領到信不等於有簽狀、出庭或和解的權限。',mailSteps,[postal,service]);
 const outside=ctx==='other'||(!ctx&&!bareUnknown&&/行政訴訟|行政法院|刑事|檢察官|勞資爭議調解|鄉鎮市調解|鄉公所調解|區公所調解|調解委員會.{0,4}通知|(?:區公所|公所).{0,5}調解/.test(body));
 if(outside)return result('先向通知上的機關確認代理方式與日期','行政訴訟、刑事案件、勞資爭議調解、公所調解的代理資格和到場規則不同，不能套用民事訴訟的規則。總幹事職稱不會自行取得代理權。',[
  ['先看通知的程序與身分','確認承辦機關、程序名稱、通知對象與應到場／補件期限；另外核對可否代為到場和須附的授權。請勿貼姓名、案號或完整通知。']
 ],[admin,mediation]);
 if(!ctx&&(bareUnknown||med&&!court))return result('先確認是哪一種法院通知','先看兩件事：① 發文機關及通知標題，是法院民事調解、民事開庭、行政／刑事，還是公所或其他機關？② 通知送給誰、要求何時做哪件事（到場、補件或只領信）？總幹事職稱或理事會決議，不等於每一種程序都有代理權。',[
  ['不要等到期日才確認','依通知上的書記官或發文機關核對，不用在這裡貼案號、姓名或完整通知。']
 ],[mediation],{choiceHeading:'通知上寫哪一種？',choices:Object.entries(labels).map(([key,label])=>({label,question:raw+'；所選程序:'+key}))});
 if(ctx==='mediation'||!ctx&&med&&!/民事事件|言詞辯論|起訴狀/.test(body))return result('法院民事調解：到場協助和代表簽成不一樣','總幹事帶章程和理事會決議，不等於自然有權代協會到場並簽成調解。應由有權的代表人處理，或先向書記官確認可否由代理人到場、接受何種委任及證明。',[
  ['先問代表與權限','查通知是否要求特定人到場。若要代為作成調解或在民事訴訟中簽和解，不宜用一張概括委託代替。把案件、可談範圍和可否簽成寫清楚，先由有權代表的人確認並向法院核對；調解成立可能與確定判決有同樣效力。'],
  ['理事長不在也不要擅自換人簽','備妥最新的代表權資料、章程、相關會議紀錄與委任文件，在期日前問書記官。公所或勞資調解另依其程序，不能直接套用。']
 ],[mediation,civil,form]);
 const steps=[];
 if(coop)steps.push(['先確認合作社的對外代表','合作社法第34條是由理事互推一人或數人對外代表。若有兩位，先看現行章程、代表推選決議及登記資料，核對本案須共同簽署或可分別代表，不以職稱或人數直接判斷。總幹事不能僅憑職稱自己簽起訴狀。']);
 if(party)steps.push(['未辦法人登記，也可能以協會名義作當事人','民事訴訟法第40條第3項：有代表人或管理人的非法人團體有當事人能力。只立案不代表一律可列或一律不能列，須核對協會是否符合條件，並由有代表權的人證明其身分；這和本案請求是否成立不同。']);
 if(!coop)steps.push(['先核對誰能代表協會','代表人依協會的組織、章程和現任代表權判定。法院要求補代表人資料時，按通知備妥現行章程、改選及代表產生紀錄、登記證明（已登記者）或可證明立案及代表的文件。不因銀行印鑑尚未更換就判定法院的代表權。']);
 steps.push(['出庭或具名簽訴狀','民事訴訟可由有權代表的人依法辦理；如委任訴訟代理人，原則委任律師。非律師須經審判長許可，例如受僱且實際從事法務工作並受委任者可依準則申請，總幹事並不當然適用。第一次為訴訟行為原則提出委任書；依法在法院以言詞委任且記明筆錄，才可以不另提。']);
 if(!coop||/和解|委任|收文件/.test(body)){
  steps.push(['普通委任、再委任、和解分開看','應由有權代表協會的人就本案委任；舊的多用途委託書先核對簽名權、案件、有效範圍及是否終止。訴訟代理人要再選任代理人或簽和解，須有特別委任；現場簽名要看簽的是簽到、收件、訴狀還是和解，效力不同。只陪同協助，與取得代理權不同，民事訴訟的輔佐人也須經法院許可。']);
  if(/領|收文件|簽收|送達|當事人|立案/.test(body))steps.push(['收件不等於簽委任或出庭',mailSteps[0][1]+mailSteps[1][1]]);
 }
 steps.push(['先確認本案期限','請依官方通知向受理法院書記官確認需誰出庭、如何補正及期限；如可能適用強制律師代理，先確認該程序要求。請勿在櫃檯貼全份通知或個資。']);
 return result(coop?'合作社簽起訴狀：先確認代表人和委任':'總幹事出庭、簽委任與簽收，權限不一樣',coop?'合作社不比照一般協會。總幹事不因受聘就能代表合作社簽狀、出庭；應先核對對外代表及本案委任。':'總幹事不能只憑職稱代表協會出庭。先分清楚是在問協會能否當事人、誰代表協會，或是否有本案的訴訟代理權。',steps,[civil,nonLawyer,form, ...(coop?[coopLaw]:[civilCode,postal,service])]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationCourtRepresentation=route;
})(typeof window!=='undefined'?window:globalThis);
