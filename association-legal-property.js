(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const law=(title,pcode,n)=>ref(title+'第'+n+'條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n);
const p=n=>law('人民團體法','D0050091',n), m=n=>law('民法','B0000001',n), l=n=>law('土地登記規則','D0060003',n), g=n=>law('人民團體會務輔導辦法','D0020094',n);
const non=ref('非訟事件法第82、84、85、86條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0010008');
const reg=ref('法人及夫妻財產制契約登記規則第18、21、22、28條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0010017');
const court=ref('司法院：社團法人設立及變更登記書狀','https://www.judicial.gov.tw/tw/cp-1387-4097-a0467-1.html');
const notices=ref('司法院：法院辦理社團法人登記注意事項','https://www.judicial.gov.tw/tw/cp-1455-56991-6310c-1.html');
const taxRef=ref('政府服務：非營利事業扣繳單位設立、變更登記','https://www.gov.tw/News_Content_2_513443');
const moi=ref('內政部：人民團體申辦不動產登記','https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220203');
const base={direct:true,questionState:{focus:'compound',domain:'association-legal-property'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
function route(input){
 const raw=String(input??'').trim(),q=raw.normalize('NFKC').replace(/\s/g,'');
 if(!q||q.length>760||/信用合作社|信合社|商業公會|工會|農會|漁會|財團法人|寺廟|遺產分割|公益勸募|政府採購法|選舉名冊.{0,12}下載/.test(q))return null;
 const coop=/合作社|社員出資/.test(q)&&!/不是(?:一般)?合作社/.test(q);
 if(coop&&/法人格|法人登記|立案證書/.test(q)&&/社員出資|股金/.test(q))return {...base,category:'合作社｜法人及社員出資',title:'合作社法人、社員股金與協會立案證書不同',summary:'依法設立的合作社本身是法人，向所在地主管機關辦合作社登記，不是拿協會立案證書當法人證明。社員出資是入股，不是法人或立案證書。',steps:[['先核對證書種類','請核對合作社登記及章程；協會依人民團體法立案，若需社團法人地位則另依規定向法院登記，不能互用。']],refs:[law('合作社法','D0050112',2),law('合作社法','D0050112',6),p(11)]};
 if(coop)return null;
 const assoc=/協會|社團法人|社會團體|人民團體/.test(q);
 const filing=/法人登記|法人證書|設立法人|法院|專用於.{0,8}取得財產|法人.{0,4}謄本/.test(q);
 const land=/不動產|地政|房屋|房子|買屋|捐房|過戶|謄本.{0,12}(?:籌備|名字)|權利人/.test(q);
 const tax=/統編|統一編號|扣繳/.test(q);
 const bank=/銀行|印鑑|留印|重開戶|戶名|存摺/.test(q);
 const officer=/理事長|負責人|現任理事|理監事|簽法院/.test(q);
 const address=/會址|主事務所|地址|搬到/.test(q);
 const amendment=/修章|變更章程/.test(q);
 const county=/縣府|社會處|備查|核備/.test(q);
 const stage=/專用於.{0,10}取得財產|專用.{0,8}取得財產|法院.{0,10}取得財產的謄本/.test(q);
 const knownPrivate=/舊理事長.{0,12}(?:名字|名下)|理事長.{0,10}私人|普通私人登記/.test(q)&&!/不是(?:單純)?(?:私人|理事長個人)/.test(q);
 const prep=/籌備(?:處|人|代表).{0,27}(?:註記|協議|名下|名義)|註記.{0,16}籌備代表/.test(q);
 if(!(assoc||stage||(land&&filing&&bank)||(land&&officer&&tax))||!(stage||prep||(land&&(filing||tax||bank)&&(/變更|登記|過戶|名下|更名|剛買屋|補資料|逕改|改成/.test(q)))||(filing&&(officer||amendment)&&(/變更|同一天換|改好|已登|已領|法院的負責人/.test(q)))||(bank&&officer&&filing&&county)))return null;
 const selected=/登記確認:([^。；]+)/.exec(q)?.[1]??'';
 const typed=raw.split(/；補充[：:]/).at(-1);
 const revised=raw.includes('；補充')&&/找到.*(?:法院|地方法院).*法人登記證書/.test(typed);
 const has=!stage&&(selected==='已領法人證書'||revised||/原本有社團法人登記|已做社團法人登記|已領到社團法人登記證書|已拿到法人登記證書|已登記在(?:社團)?法人|登記在社團法人本身|法院法人變更已登好|本來就登記在社團法人/.test(q));
 const only=!stage&&!has&&(selected==='只有立案尚未登記'||/目前只有縣府立案證書|只有立案.{0,8}未.{0,6}法人登記|沒有(?:向)?法院.{0,6}法人登記|還沒完成法院法人登記/.test(q));
 const uncertain=!stage&&!has&&!only&&(/不知道.{0,10}(?:法院|有沒有登記)|尚不確定|手上只有立案證書影本|找不到法人登記證書/.test(q)||selected==='不確定');
 const realOwner=/法人(?:本身|名下)|房屋已登記在協會名下|地政權利人沒改/.test(q)&&!/權利人.{0,5}(?:是|為)舊理事長/.test(q);
 const refs=[p(11),m(30),non,reg,court],steps=[];
 if(stage){
  steps.push(['專用登記簿謄本不是最終的法人登記證書','這份謄本在法院登記後發給聲請人，用於辦理法人取得財產；不能把它當作正式登記證書，也不能只憑它斷定登記是否仍有效。先核對發文的法院通知、案號及指定期限。依非訟事件法第86條，繳驗法人確已取得財產目錄所載財產的證明後，法院才發給法人登記證書。逾指定期限未完成依法會被撤銷設立登記。']);
  steps.push(['地政辦妥後，把取得財產證明送回法院登記處','若已有合規的籌備代表名義登記，先持專用謄本及地政要求文件確認第150條更名。已完成更名，就向原登記法院繳驗新權利書狀或謄本等符合通知的證明，及財產目錄中其他尚應證明項目。法院指定期限與縣府期限不同；依法完成初次法人登記後，另依人民團體法第11條於三十日內送登記證書影本給原主管機關，不能等縣府代報。']);
 } else if(only||uncertain){
  steps.push(['先找法院的法人登記證書或核對登記簿','縣府立案證書證明人民團體獲准立案，扣繳統編是稅務資料，兩者不等於取得社團法人資格。先查法院證書、法院登記簿謄本或公告，再核對土地建物謄本所列權利人。僅立案、未完成法院登記的一般協會，通常不能直接以協會自己的法人名義受登記；先依法辦法院設立，完成後三十日內向原主管機關送證書影本。']);
 } else if(has)steps.push(['已登記社團法人：不重做設立登記','縣府備查會議紀錄，不會讓法院的對外代表、章程或主事務所自動更新。即使原先先拿縣府立案證書，現在既確認已領法院法人登記證書，就不用重新成立或重新申辦設立。已有法院法人登記時，核對原登記簿；如原登載事項變了，到管轄地方法院登記處另辦變更。民法第31條規定未依法登記變更的事項不得對抗第三人，不等於內部決議當然無效。']);
 if((county||officer||address||amendment)&&(!only||officer||address)){
  refs.push(p(54),g(8),g(12));
  steps.push(['縣府：會議紀錄、負責人與會址分別處理','會員大會紀錄於閉會後三十日內報原主管機關備查；章程、選任職員簡歷冊或負責人名冊異動，按人民團體法第54條於異動三十日內報核備。會址異動先經理事會決議後報備查；章程文字也要變更時，仍須依適用的修章程序，不能只改地址資料。']);
 }
 if((officer||address||amendment)&&!only){
  refs.push(m(31),m(48),notices);
  steps.push(['法院變更：不能只靠新理事長一人簽','法人變更聲請書由現任理事半數以上簽名或蓋章，並加蓋法人圖記；初次設立則由全體理事聲請。附實際的變更內容、決議或選任文件、主管機關文件和法院要求的資料；如涉章程，另核民法第53條及主管機關程序。'+(stage?'持專用謄本時先按原法院通知補齊取得財產證明，再依登記處確認的程序辦負責人或會址變更，不把兩案和期限混在一起。':'')]);
 }
 if(land){
  refs.push(l(34),l(104),l(149),l(150),l(151),moi,law('社會團體財務處理辦法','D0050097',13));
  if(has&&realOwner)steps.push(['房屋原屬同一法人：不過戶給新理事長','房屋登記在社團法人自己名下，換理事長不會改變所有權，不必過戶給新理事長。若土地建物登記的法人名稱或住址實際異動，向不動產所在地地政事務所確認更名或住址變更登記，不是所有權移轉。']);
  if(prep||knownPrivate||only||uncertain||stage||!realOwner)steps.push(['地政先核對權利人及有沒有籌備註記','依法以籌備代表登記並有註記與協議者，未取得法人資格前要換代表，依第104條由全體籌備人出具新協議辦理；取得法人資格後依第150條申請更名為法人。若純粹是舊理事長私人名義且無該註記或協議，不能只靠理事長改選或縣府立案逕行更名，須由地政按權利證明核對實際移轉或爭議。已簽買賣或捐贈文件先核對契約及補正期限，不自行重簽。買賣、轉讓或設定他項權利等按章程及第13條核對大會決議；依實際交易請地政、稅務窗口核對證明。']);
 }
 if(tax||bank){
  if(tax){refs.push(taxRef);steps.push(['國稅局：先核對舊扣繳統編的變更','同一扣繳單位僅換代表人或地址，通常是向所屬國稅局更新原有登記資料，不是當然申請新號。若由原非法人團體新取得法人資格或主體有異動，帶原編配及登記文件確認如何銜接，不自行另取統編。']);}
  if(bank)steps.push(['銀行：原戶名不變，也要核對代表及印鑑異動','先問原往來銀行如何更新既有戶的代表、印鑑及授權資料；同一法人不表示必須重開戶。可備法院或縣府證明、決議、代表身分和新舊印鑑資料，依銀行實際要求辦，不在小屏上傳證件。']);
 }
 const need=(uncertain&&!selected)||knownPrivate;
 return {...base,category:'協會｜法人登記、地政與資料異動',title:stage?'法院的財產專用謄本，不是正式法人登記證書':has?'同一協會換人、遷址：縣府、法院及財產各自核對':knownPrivate?'先核對房屋登記權利人，不逕改到新理事長名下':'先分縣府立案、法院法人登記和國稅局統編',
 summary:stage?'先看法院指定期限。用專用謄本辦適用的財產登記，再把取得財產證明交回法院，和縣府的三十日不是同一件事。':has?'縣府備查不等於法院變更；同一法人持有的房屋也不會因換理事長而移轉。':knownPrivate?'先釐清房屋是私人所有，還是依法登記在籌備代表名下；立案證書及統編都不能代替權利證明。': '縣府立案證書和扣繳統編，不能取代法院法人登記證明。先核對法院及地政的文件，再決定下一步。',
 steps,refs:[...new Map(refs.map(r=>[r.title,r])).values()],needsLegalFacts:need,
 ...(uncertain&&!selected?{choiceHeading:'目前能確認哪一種法院法人登記狀態？',choices:[
 {label:'已領法院法人證書',question:raw+'；登記確認：已領法人證書。'},
 {label:'只有縣府立案，尚未法院登記',question:raw+'；登記確認：只有立案尚未登記。'},
 {label:'還不確定是否法院登記',question:raw+'；登記確認：不確定。'}
 ]}:{})};
}
function follow(q){const s=String(q??'');return s.length<280&&!/另問|換(?:一|新)題|新問題/.test(s)&&/^\s*補充[：:]/.test(s)&&/法院|地政|籌備處|權利人|房屋|印鑑/.test(s);}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedAssociationLegalProperty=route;
root.isAssociationLegalPropertyFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
