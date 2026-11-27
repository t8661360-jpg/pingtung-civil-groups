(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n),c=n=>law('民法','B0000001',n);
const faq={title:'內政部合作及人民團體常見問答：一般修章與法人登記後程序',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=200&_CSN=1633&n=8361&page=1&sms=9015'};
const counsel={title:'法務部法律字第11103502450號：社團法人會員代表制修章',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?etype=etype1&id=FE357325&type=E'};
const court={title:'司法院法人登記公告查詢',source:'https://www.judicial.gov.tw/tw/lp-144-1.html'};
const form={title:'司法院法人登記聲請書（含變更登記）',source:'https://www.judicial.gov.tw/tw/cp-1365-57442-44b2f-1.html'};
const officer=['章程另定選任職員的職稱或選任、解任：先等核准','《人民團體法》第41條允許另定選任職員的職稱、選任及解任事項，但須經主管機關核准。還沒核准，不要依這項新制度改選；如果原會期必須辦理，應先確認現在仍有效的章程、選舉程序與主管機關認定。一般章程異動報核備，與這裡需要核准的項目不同。'];
const publish=['選舉結果先確認合法程序，再依規定公告與報備','若已按未核准的制度辦了改選，先留存議程、出席、票數、開票及公告紀錄，不把結果當作已確認有效或補報即可生效。向原立案主管機關確認這場選舉是否須更正或重辦。若是依現行合法程序辦的選舉，按適用的公告與報備規定辦理，不因另一件修章送審而一律停掉。'];
const old=['先判斷新規定是否已施行、是否為強制規定','比較現行條文、施行日和有沒有過渡條款，也確認它真的適用你們這一類團體。已生效且確實適用的強制規定，不會因協會尚未修章或縣府還沒收到資料就暫停適用；牴觸的舊條文不可繼續作為開會或表決依據。其餘不牴觸的章程依然可用。若新規定還沒施行或有明定過渡期，按該法的日期及條件判斷。'];
const meeting=['已排會或已依舊章開會怎麼辦','還沒開會，就把規定的召集、通知、出席及表決門檻先核對；如果現有通知和安排不符，不要先表決再補。已開過，保留正式通知、出席資料與紀錄，分辨是召集程序、表決方法或決議內容違規，再向原主管機關查應補正或重開；不是只補送章程就當然有效，也不先判定整場無效。就衝突條文提出修章，由適用的大會程序表決，並依團體身分辦理核備、必要的核准或法院變更登記。依人民團體法第58條，主管機關依法得警告、撤銷決議或命改善等。'];
const stand=['只有主管機關立案：一般按人民團體法第27條','由會員（會員代表）大會審議修正，須有過半數出席、出席者三分之二以上同意。章程異動後依第54條於30日內報原立案主管機關核備，備妥大會紀錄、修正對照表與修正後章程；選任職員職稱或選任與解任若在章程另定，另看第41條核准，不是所有情形只作一般核備。'];
const legal=['已在法院登記、採全體會員大會：另核民法第53條','按內政部一般作法，採全體會員決議的社團法人修章，依民法第53條：全體會員過半數出席，出席者四分之三以上同意；或有全體會員三分之二以上書面同意。章程異動依人民團體法第54條於30日內報原主管機關核備。特殊團體如有特別規定另核。受設立許可社團另依第53條第2項辦理主管機關許可；並向原登記法院確認變更登記所需文件，向縣府核備不等於法院已登記。'];
const reps=['已登記又採會員代表制：先確認適用門檻','法務部法律字第11103502450號說明，民法沒有會員代表制的專門規定，涉及人民團體法第28條和兩法如何適用，請原立案主管機關確認；若須辦變更登記，亦先向原登記法院核對。不要自行把全體會員的法定門檻換算成代表席數，也別逕以出席三分之二通過。'];
const lookup=['查有沒有法院法人登記','縣府或內政部的團體立案證書不是法院法人登記證書。先翻查法院證書或用正式團體名稱查司法院法人登記公告；查不到不等於未登記，可能是舊案或曾更名，必要時洽原登記法院或原立案主管機關。請不要在對話貼證書上個人資料。'];
function charterApplicability(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||!/協會|社團法人|社會團體|人民團體/.test(t)||/合作社|農會|漁會|同業公會|工會|財團法人|管委會|會址|登記地址|遷址|搬辦公室/.test(t))return null;
 const conflict=/章程|會章/.test(t)&&/牴觸|抵觸|衝突|相反|不一致|矛盾|不同|不符|不合/.test(t)&&/新(?:修|法|規|條)|法律|法令|強制|現行法|法規|現行規定/.test(t);
 const amend=/修章|修(?:正|訂|改)章程|改章程|變更章程|章程.{0,8}(?:改|修訂|修正|變更)/.test(t);
 const explicitLegal=/社團法人|法人身分|法人資格|法人登記|在法院登記|有沒有法人/.test(t)&&!/法人登記已撤銷/.test(t);
 const officerPending=/章程|修章/.test(t)&&/選任職員|新職稱|改職稱|選任.{0,5}解任|理監事.{0,5}(?:改稱|改叫)|理監事.{0,5}新制/.test(t)&&/等.{0,7}核准|尚未.{0,6}核准|還沒.{0,6}核准|未經.{0,6}核准/.test(t)&&/公告|改選|選舉|先.{0,6}(?:用|照|辦|採)|生效/.test(t);
 if(officerPending)return {direct:true,category:'社會團體｜章程適用與法人登記',title:'第41條職員新制度還沒核准，不可先依新制改選',summary:'先確認縣府或原立案主管機關已核准，才用章程另定的職稱或選任、解任程序。不能先依尚未核准的新規則改選，再用公告把結果算成有效。',steps:[officer,publish],refs:[p(27),p(41),p(54),p(58),{title:'內政部：修訂章程變更理監事職稱函釋',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256708&sms=12360'}],questionState:{focus:'compound'}};
 if(!conflict&&!(amend&&explicitLegal))return null;
 const unknown=/(?:不確定|不知道|不清楚|查不到).{0,14}(?:有沒有|是否|登記|法人證書)|(?:有沒有|是否有|是不是).{0,6}(?:法院|登記|社團法人|法人資格)/.test(t);
 const neg=/尚未.{0,8}(?:登記|法人)|未(?:辦|向|在).{0,7}(?:登記|法人)|還沒.{0,9}(?:登記|法人)|沒有.{0,5}(?:法人登記|法院登記)|只有.{0,9}立案/.test(t);
 const affirmative=/已(?:完成|經|在|經在|向|辦|做|取得|經辦).{0,8}(?:登記|社團法人)|已法人化|法院登記證書|是社團法人/.test(t)||/社團法人/.test(t)&&!unknown;
 const rep=/會員代表(?:大會|制|席次|名額)|代表大會/.test(t);
 const group=neg&&!unknown?'stand':affirmative&&!unknown?'legal':'';
 const choose=!group&&amend&&explicitLegal;
 const current=group==='legal'?(rep?[reps]:[legal]):group==='stand'?[stand]:choose?[lookup,stand,legal]:[];
 const steps=[...(conflict?[old,meeting]:[]),...current];
 const pastEffective=/還沒施行|尚未施行|還未施行|未生效|還沒生效/.test(t);
 const summary=conflict?(pastEffective?'若新規定尚未生效，不必提前套用；先核對施行日和過渡條款，依目前有效規定開會。':'不能用牴觸已生效強制法規的舊章程開會。先核實適用對象、施行日期和過渡條款，再排修章與報備。'):choose?'立案不等於法院法人登記，先確認有沒有法院法人登記證書。兩種修章程序和表決門檻不同。':group==='stand'?'僅有主管機關立案，普通社會團體修章通常須大會過半數出席，出席者三分之二以上同意，再於30日內報核備。':rep?'已有法人登記且用會員代表制，請先核對主管機關認定與法院登記要求，不要把全體會員門檻直接改按代表計。':'已辦法院法人登記，要另看民法第53條的一般門檻及法院變更登記，不可只用普通立案社團的規則。';
 const refs=[...(conflict?[c(71),p(26),p(27),p(58)]:[]),...(current.includes(stand)?[p(27),p(41),p(54)]:[]),...(current.includes(legal)||current.includes(reps)?[c(53),p(11),p(28),p(54),faq,form]:[]),...(current.includes(reps)?[counsel]:[]),...(choose?[court]:[])];
 if(!steps.length)return null;
 return {direct:true,category:'社會團體｜章程適用與法人登記',title:conflict?'舊章程與現行強制規定衝突：先按有效法規':'修章先確認：團體立案或法院法人登記',summary,steps,refs:[...new Map(refs.map(x=>[x.source,x])).values()],questionState:{focus:'compound'},...(choose?{choiceHeading:'你們的協會已完成法院法人登記嗎？',choices:[
 {label:'只有主管機關立案',question:(conflict?'協會章程和新法衝突且只有縣府立案，還沒有法院法人登記，該怎麼修章？':'協會只有主管機關立案，未辦法院法人登記，要怎麼修章？')},
 {label:'已登記，採全體會員大會',question:(conflict?'已在法院登記為社團法人，協會舊章程與新法衝突，採全體會員大會要怎麼修章？':'協會已在法院登記為社團法人，採全體會員大會，如何修章？')},
 {label:'已登記，採會員代表大會',question:(conflict?'協會已完成法院法人登記，採會員代表大會，舊章程與新法衝突，要怎麼修章？':'協會已完成法院法人登記，採會員代表大會，如何修章？')}
 ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={charterApplicability};return;}
root.verifiedAssociationCharterApplicability=charterApplicability;
})(typeof window!=='undefined'?window:globalThis);
