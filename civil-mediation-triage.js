/* Civil court v. township mediation; choices retain only non-identifying route facts. */
(function(root){
'use strict';
const ref=(title,source)=>({title,source,cat:'官方來源'});
const court=ref('民事訴訟法第68至70、380、416條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0010001');
const local=ref('鄉鎮市調解條例第25至30條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0020003');
const localProxy=ref('法務部：鄉鎮市調解委任書與代理權審查','https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE285848&media=print&type=e');
const civil=ref('民法第27、48、531至534條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001');
const coop=ref('合作社法第34條：互推對外代表','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050112&flno=34');
const execution=ref('強制執行法第4條：執行名義','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010004&flno=4');
const courtGuide=ref('司法院：民事調解與程序','https://www.judicial.gov.tw/tw/cp-1448-56928-185b3-1.html');
const chooseItems=[['court','地方法院（法院民事調解）'],['town','鄉鎮市公所（調解委員會）'],['unknown','還不確定，看通知抬頭']];
function build(title,summary,steps,refs,state,extra={}){
 return {category:'民事調解｜代為出席與簽署',title,summary,steps,refs,notes:['不要上傳完整通知、案號、證號、簽章或地址；預備的文件只交承辦單位。'],questionState:{domain:'civil-mediation',focus:'cross-civil-mediation'},civilMediationContext:state,...extra};
}
function route(q,previous){
 const raw=String(q??'').normalize('NFKC').trim();
 const t=raw.replace(/\s+/g,'');
 const choice=t.match(/^櫃檯確認民事調解:(court|town|unknown)$/);
 if(choice&&!previous)return null;
 const plain=t.replace(/(?:並?不是|也非|並非|不屬於|不問|不談|不涉及)(?:收到|在問|要問)?(?:勞資(?:爭議)?(?:調解)?|勞動調解|欠薪|支付命令|協會|合作社|工會|刑事案件|(?:鄉|鎮|市|區)公所|公所|地方法院|地院|法院)(?!還是)/g,'');
 const excluded=/勞資|勞動調解|欠薪|薪資爭議|刑事|家事|消費爭議|車禍|支付命令/.test(plain);
 const townMarker=/(?:鄉|鎮|市|區)(?:公所|調解委員會)|公所調解|(?<!法院)調解委員會/.test(plain);
 const courtMarker=/地方法院|地院|簡易庭|法院(?:寄|發|的|民事|調解)|民事庭|書記官/.test(plain);
 const civilMarker=/民事調解|租金|房租|租約|押金|房東|租賃|場地費|買賣|契約/.test(plain);
 const group=/協會|人民團體|社團法人|社會團體|合作社|總幹事|理事長|秘書長/.test(plain);
 const focus=/代為|代去|代出席|代到場|代理|委任|總幹事|理事長|簽(?:字|署|和解)|簽成|核定|不成立|沒成立|可(?:以)?執行|強制執行|未付|不付|要報縣府|出席/.test(plain);
 const follow=!!previous&&t.length<80&&/^(?:那|所以|如果|若|更正|是公所|是法院|是地院)/.test(t)&&!excluded&&!/換題|另外一題|薪資|選舉|會員大會|保險/.test(plain)&&/核定|不成立|不付|執行|調解|委任|簽字/.test(plain);
 if(!choice&&!follow&&(!/調解/.test(plain)||!group||!focus||!(civilMarker||townMarker||courtMarker)||excluded))return null;
 const unclear=/不確定.{0,14}(?:法院|地院|公所)|不知道.{0,12}(?:法院|地院|公所)|法院還是.{0,5}公所|公所還是.{0,4}法院/.test(plain);
 const id=choice?.[1]||(unclear?'unknown':townMarker?'town':courtMarker?'court':follow?previous.kind:'unknown');
 const org=/合作社/.test(plain)?'coop':/協會|社團法人|社會團體|人民團體/.test(plain)?'association':(choice||follow)?previous.org:'group';
 const state={kind:id,org};
 const rep=org==='coop'?['合作社由誰對外代表','先查登記、章程、社員大會決議與理事互推的代表。合作社法第34條規定由理事互推一人或數人對外代表，職員不能只靠職稱或拿公章就下決定。']:
 ['團體由誰授權','查看最新登記或立案資料、章程和內部決議，確認有權代表的人。總幹事不是因為職稱就能簽，也不能只拿普通出席委任就同意條件。'];
 const authority=['出席與簽成分開','由有代表權的人，依章程及必要決議，書面列明案件、可否同意調解或和解、可談的金額及權限。沒有明確授權就只說明或把方案帶回，不承諾金額、不先簽字。'];
 const report=['是否報縣府','沒有因這類調解通知一律報縣府的規定。另有主管機關要求、章程、補助或核定條件時，依該案規定核對。'];
 if(id==='town')return build('公所調解：可詢問委任，簽成要有明確授權','請先看通知上的鄉鎮市調解委員會。不能親自到場，可先確認由誰帶委任書代理；單純代為到場不等於能替團體承諾付款或簽和解。',[rep,authority,['調解成立後是法院核定，不是社會處','調解委員會作成調解書，公所自調解成立日起10日內送法院審核，不是當事人自己在10日內報縣府。經法院核定的民事調解與確定判決同效；約定給付到期不履行，可持具執行力的文件向法院聲請。'],['談不成或還沒核定','不成立可以向調解委員會申請證明，應於聲請後7日內發給。原由法院移付的案子由公所送回法院，不能把未核定的公所調解書當成已可執行。'],report],[local,localProxy,civil,...(org==='coop'?[coop]:[]),execution],state);
 if(id==='court')return build('法院民事調解：代出席不等於代簽和解','不要以一般出席委任代簽。先問通知上的法院書記官可否由代理人出席及要帶哪些文件；如要代理和解，須有民事訴訟法第70條的特別委任。',[rep,authority,['法院調解成立後','依法成立的法院調解與訴訟上和解同效；如約定清楚且已到期卻未履行，可持調解筆錄等向法院聲請強制執行。這不是公所調解，所以不走公所送法院核定流程。'],report],[court,courtGuide,execution,...(org==='coop'?[coop]:[civil])],state);
 return build('先看通知抬頭：法院或公所調解委員會','兩種程序都不宜靠「只代出席」的委任去簽和解。總幹事可否代理先問通知單位；若對方未照約履行，還要看是法院調解筆錄，或公所調解書已經法院核定。',[rep,authority,['怎麼分','看抬頭、通知機關或聯絡窗口，不用提供姓名、案號。如果仍看不出，可直接問發通知的單位。']],[court,local,civil],state,choice?{}:{choiceHeading:'通知抬頭是哪一個單位？',choices:chooseItems.map(([id,label])=>({label,question:'櫃檯確認民事調解:'+id}))});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return}
root.verifiedCivilMediationTriage=route;
})(typeof window!=='undefined'?window:globalThis);
