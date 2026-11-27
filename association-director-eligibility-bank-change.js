(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const peoples=n=>law('人民團體法','D0050091',n), civil=n=>law('民法','B0000001',n);
const election=law('人民團體選舉罷免辦法','D0050093',5);
const mo={title:'內政部函釋：會員為理監事選舉基本資格',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256699&sms=12360'};
const neverStep=['一開始就不是會員：先查當時的選任資格','人民團體法第17條原則要求理、監事自會員（會員代表）中選出；依選罷辦法第5條核對當時名冊、資格審定及選舉紀錄，也要查他是否屬團體會員依法推派的代表。日後補入會不能回填原選任時的資格。先向主管機關確認該席選務瑕疵如何處理，再依法辦理補正、補選或重選，不先判整場大會一律無效。'];
const laterStep=['當選時具資格、後來才出會：依喪失資格處理','此情形依人民團體法第23條處理，後來喪失會員資格者，應即解任，再按候補遞補等規定辦理。這和一開始不具資格不同，不能用補入會回頭補齊、也不逕判此前的會議或行為全部無效。'];
const bankPending=['還未辦印鑑、帳戶或簽署權變更','先不要用尚未確認的職務或簽署權送件。核對章程、有效決議、現有登記及銀行留存的代表人、授權和印鑑，再向原開戶銀行確認須用哪一份有效文件。'];
const bankSent=['有送件或已簽署：先和原開戶銀行核對狀態','由具權限的人透過銀行正式窗口查明是否已受理、已生效，請銀行說明補件、更正或撤回方式，不承諾銀行一定能撤件。看該理事是否為代表人或代理人、是否有有效授權；不只憑理事名冊有瑕疵就判印鑑或對外行為無效。民法第103、169、170條分別涉及有權代理、表見代理及無權代理效力，仍須依事證判斷。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||!/協會|社會團體|人民團體|(?:章程.*大會|大會.*章程)/.test(t)||!/理事|監事/.test(t)||!/銀行|印鑑|帳戶/.test(t)||!/更換|變更|改印鑑|撤回|換銀行|補件|簽出去|送件/.test(t)||!/不是會員|從未入會|沒入會|資格.{0,5}喪失|喪失會員|不是正式會員|沒具會員資格|非會員|後來.{0,4}(?:退會|被除名)|退會了/.test(t)||/合作社|信用|公會|工會|股東|公司|基金會/.test(t))return null;
 const never=/從未入會|沒入會|(?:原本|起初|當選時|選舉時|本來|一開始).{0,8}(?:不是|沒具|非|不具).{0,4}會員|補入會|先入會/.test(t)&&!/不確定|還不知道/.test(t);
 const later=/後來.{0,8}(?:退會|喪失|被除名)|已喪失會員資格|退會了/.test(t)&&!never&&!/不確定|還不知道/.test(t);
 const sent=/簽出去|已(?:經)?送件|已(?:經)?受理|想撤回|能撤回|撤回/.test(t)&&!/還沒送件|尚未送件/.test(t);
 const caption=sent?'銀行端先查已收件或已生效，不能當然撤回。':'銀行端先核對授權與應備文件，資格未釐清不要先送件。';
 const choices=[{label:'當選時就不是會員',question:'協會理事當選時不是會員，'+(sent?'銀行變更印鑑已送件，能撤回嗎？':'還沒送件，銀行要變更印鑑怎麼辦？')},{label:'當選後才退會或喪失資格',question:'協會理事當選後來退會了，'+(sent?'銀行變更印鑑已送件，能撤回嗎？':'還沒送件，銀行要變更印鑑怎麼辦？')}];
 return {direct:true,category:'社會團體｜理監事資格與銀行異動',title:'當選資格與銀行異動，分開確認',summary:(/協會|社會團體|人民團體/.test(t)?'':'如果是一般協會，')+(never?'不要先靠補入會追認舊選任。':later?'任職後喪失會員資格，與從未具資格不同。':'先分清是當選當時就沒有會員資格，還是任職後才喪失。')+' '+caption,steps:[...(never?[neverStep]:later?[laterStep]:[neverStep,laterStep]),sent?bankSent:bankPending],refs:[peoples(17),peoples(23),election,mo,...(sent?[civil(103),civil(169),civil(170)]:[])],questionState:{focus:'compound'},...(!never&&!later?{choiceHeading:'那位理監事是哪種情況？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationDirectorBankChange=route;
})(typeof window!=='undefined'?window:globalThis);
