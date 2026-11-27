(function(root){
'use strict';
const official={title:'社會團體財務處理辦法第15、16、17條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'};
const seals=['實際提用存款：不是理事長一個人蓋章','依第17條，由團體負責人、秘書長或總幹事、財務人員在領款憑證共同蓋章。辦理到期、提前解約、存單有質權或開戶印鑑未完成變更等情況，仍要依原銀行的存款約定、留存印鑑及所需文件辦理。'];
const reserve=['準備基金連本息應專戶存儲，動支要理事會通過','依第15條，若錢是協會提列的準備基金或其孳息，要拿去買設備等實際用途，先經理事會通過，再依預算、財務規定及共同用印支用。先從定存轉到同一協會活存，不能取代理事會決議，也不能因此混入一般帳戶。留存決議與匯轉憑證。'];
const ordinary=['一般定存：章程、預算及開戶約定另查','財務處理辦法沒有寫每一筆一般定存到期、解約或換存都必須新作一次理事會決議。依章程、內部財務授權、既有決議及銀行契約核對；涉及提款則仍須共同蓋章，涉及支出須核對合法用途與預算，不存入個人戶。'];
const rollover=['到期續存和把錢花掉不同','若只是到期續存、沒有提用或改變用途，先核對是否有自動續存、經辦人授權及銀行留存印鑑；若屬準備基金應保持專戶用途。轉出、解約後動支等操作不能直接視為只是續存。提前解約對利息或擔保的影響，以存款契約為準。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||!/協會|社會團體/.test(t)||!/定存|定期存款|存單/.test(t)||!/解約|續存|動支|提用|提領|提款|轉到.{0,8}活存|到期.{0,4}轉/.test(t)||!/理事會|決議|蓋章|用印|印鑑|可以|能辦|誰|準備基金|換存/.test(t)||/(?<!信用)合作社的定存|合作社理事會|合作社社員|信合社自己的|工會|公會|公司|基金會|股金|開戶資格/.test(t))return null;
 const ask=/不確定|沒確認|還不知道|未確認|不清楚/.test(t)&&/準備基金|款項|存款用途/.test(t);
 const plain=!ask&&/一般營運款|一般團體存款|不是準備基金|不是提列的準備基金|非準備基金/.test(t);
 const res=/準備基金/.test(t)&&!plain&&!ask;
 const renewed=/續存/.test(t)&&!/提前解約|動支|買設備|拿去.{0,4}買|領出/.test(t);
 const move=/買設備|支出|動支|支付|拿去.{0,4}買/.test(t);
 const useSeal=renewed?'若涉及提用存款而不是單純到期續存，才回到第17條的共同蓋章。':'若是解約後提用存款，依第17條由負責人、秘書長或總幹事、財務人員共同蓋章，不是理事長蓋章就可以。';
 const summary=res?(renewed?'準備基金續存要維持專戶；若要拿出去用，須先經理事會通過。':'若是準備基金或利息要動支，先經理事會通過，單靠理事長或先轉到活存都不能取代。')+' '+useSeal:plain?(renewed?'一般定存單純續存，先看銀行約定及團體授權。':useSeal+' 是否另須理事會決議，視章程、授權及開戶約定。'):(ask?'先查帳冊或原提列決議，確認是否為準備基金。':'先分是一般存款或準備基金。')+' '+useSeal+(renewed?'':' 準備基金動支另須理事會通過。');
 const text=renewed?'只想把定存到期續存，誰能辦？':move?'定存提前解約後想拿去買設備，可以嗎？':'定存要解約並提用，需要理事會決議還是理事長蓋章？';
 const choices=[{label:'一般團體存款',question:'協會是一般團體存款，不是準備基金。'+text},{label:'提列的準備基金',question:'協會確認是提列的準備基金。'+text}];
 return {direct:true,category:'人民團體財務｜定存、基金與用印',title:renewed?'定存續存、提用與準備基金，不是同一件事':'協會定存解約：分清理事會決議和共同用印',summary,steps:res?[reserve,...(renewed?[rollover]:[]),seals]:plain?[...(renewed?[rollover,ordinary]:[seals,ordinary])]:[...(renewed?[rollover]:[seals]),reserve,ordinary,...(renewed?[seals]:[])],refs:[official],questionState:{focus:'compound'},...(!res&&!plain?{choiceHeading:'這筆錢是哪一類？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationTermDeposit=route;
})(typeof window!=='undefined'?window:globalThis);
