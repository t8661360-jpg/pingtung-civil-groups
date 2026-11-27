(function(root){
'use strict';
const art=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>art('人民團體法','D0050091',n),g=n=>art('人民團體會務輔導辦法','D0020094',n);
const moi={title:'內政部台內社字第8735076號函：大會延期、委託書與代表變更',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>210||!/協會|社會團體|人民團體/.test(t)||!/大會/.test(t)||!/延期|延後|改期|挪到|改到|延到|改成.{0,8}月/.test(t)||/合作社|社員|公會|工會|農會|漁會|公司|股東|管委會|財團法人|選票|罷免|除名|改選|監事會|成立大會|不動產/.test(t))return null;
 const proxy=/委託書|代理人|委託出席/.test(t),roster=/名冊|代表.{0,7}(?:換|異動|變更)|重審/.test(t);
 if(!proxy||(!roster&&!/照用|有效|能用|沿用|重簽|只限|撤回|取消委託/.test(t)))return null;
 const limited=/委託書.{0,12}(?:寫|限|載明|註明).{0,11}(?:原(?:來|本|訂)?日期|當天|當日|指定日期)|只限.{0,8}(?:原(?:來|本|訂)?日期|當天|當日)|(?:已經?|已書面|已)(?:取消委託|終止委託|撤回委託|取消代理)/.test(t);
 const changed=/代表.{0,10}(?:已經換|已換|換人|異動|被改派|改派了)|另(?:一位|位)代表.{0,6}換人/.test(t)&&!/代表.{0,8}(?:一個都沒換|一個也沒換|沒有變更|沒換|不變|未異動|都沒變)/.test(t);
 const stays=/代表.{0,8}(?:一個都沒換|一個也沒換|沒有變更|沒換|不變|未異動|都沒變)|名冊(?:也)?(?:都)?(?:沒變|未異動)/.test(t);
 const proxyStep=['先看原委託書的限制，再判斷能否沿用',limited?'委託書已寫只限原會議日期，或委託已終止，就不能用原件在新日期代理。仍要委託時，請依規定另作書面委託。':'內政部函釋說明，原委託書不因大會延期就自動失效；但若委託書限定原日期或另設限制、委託人已終止，或任一方已不具資格，就不能視為當然仍有效。依人民團體法第42條，社會團體會員（代表）可書面委託其他具資格者，每位只得代理一人。'];
 const rosterStep=['代表更換與名冊：是另一件事',changed?'會員代表既然已換人，先核對新代表是依法及章程產生，不是由他人代坐。依函釋及現行會務輔導辦法第10條，最遲於新會議15日前由理事會重新審定有變動的代表資格並造具名冊。確認與本次委託有沒有重疊；舊名冊不能忽略已知的變動。':stays?'代表若確實沒有變動，函釋並未要求只因延期就重審一次；仍要核對會籍與應出席資格、表決和代理資料。如果查到代表更換，再依法處理。':'先查代表有無更換或資格有無變動；如有更換，最遲於新會議15日前重新審定。若沒有變動，不能只因延期就一律認定必須重審。'];
 const reminder=['重新通知不是沿用委託書的一部分','原定期大會改期，不因延期就成為緊急臨時會。依第26條，按新會議日期15日前通知應出席人員，另處理報請主管機關列席。原通知已發出就更正。通知、委託出席、代表名冊是三件事。'];
 return {direct:true,category:'協會會務｜大會延期、委託與名冊',title:'大會延期：委託書、代表名冊和新通知分開看',summary:(limited?'原委託書明定只限原日期或委託已終止，就不能直接在新會期使用。':'大會改期本身不使所有原委託書失效；先看是否限定原日期、已終止，並核對雙方資格。')+(changed?' 另一位代表若已依法更換，要另審定新代表資格。':' 大會通知仍要依新日期處理。'),steps:[proxyStep,rosterStep,reminder],refs:[moi,p(26),p(42),g(10)],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationPostponedProxy=route;
})(typeof window!=='undefined'?window:globalThis);
