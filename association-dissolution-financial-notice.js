(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n), g=n=>law('人民團體會務輔導辦法','D0020094',n), c=n=>law('民法','B0000001',n);
const example={title:'內政部：全國性社會團體申辦解散示例',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&_CSN=1633&n=8361&page=5&sms=9015'};
const annual=['以前年度的預算、決算：與清算財報不同','依《人民團體法》第34條，年度預決算須經會員（會員代表）大會通過並報主管機關核備，決算先送監事會審核及併報審核結果。若催的是解散前一個年度，不能只因後來解散、或另送清算財報，就當作以前年度的申報已免除。找出當年資料及已報核備收件證明；還缺審議或找不到資料時，在期限內問原承辦補正方法，不要倒填會議紀錄。'];
const clearing=['解散或清算的資料：先確認要的是哪個階段','清算財報是處理解散時的債權、債務及剩餘財產，不等於去年全年決算。由清算人或有權代表依來文、解散函及實際進度準備；若未完成，先據實說明。內政部全國性團體書件只是示例，屏東地方團體以原承辦對這份公文確認的書件為準。'];
const before=['只有大會決議，還未報主管機關','先把大會解散紀錄及相關書件依原主管機關受理方式報送。依《人民團體會務輔導辦法》第12條，會員（會員代表）大會紀錄應於閉會後30日內報備查；這不是「全部清算程序有30天」或「可以不理舊財報催報」。已經收到催報，另就公文要求的年度及期限回覆，不把兩件混成一份。'];
const legal=['已辦法院法人登記：清算必要範圍內視為存續','除法律另有規定外，依民法辦理；清算終結前僅在清算必要範圍內視為存續（第40條），由法院監督（第42條）。主管機關的解散函不等於法院清算完結，更不等於全部舊義務消失。保留清算人資料及法院、主管機關各自的收件或結案文件。'];
const unregistered=['沒有法院法人登記：看章程、大會決議和清算人','依《人民團體會務輔導辦法》第27條，先依章程或大會決議辦理；章程未規定或大會無法召開時，由理事長或章程所定代理人擔任清算人；仍無法產生清算人時，由主管機關選任，並準用民法清算規定。'];
const action=['先回覆發文機關，不要只看到了「解散」就擱置','在來文期限內備妥發文字號、要求的報表名稱、年度、解散函或收件證明、已報財務文件及清算進度，向發文承辦確認是前一年度財報、解散／清算書件，還是登錄資料尚未更新。若不及備齊，先說明並詢問是否可延長；沒有回覆前不要視為已同意延長。不要把完整公文或個人資料貼在聊天框。'];
function dissolutionNotice(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 const explicitCross=t.length<=210&&/合作社/.test(t)&&/協會|社會團體/.test(t)&&!/信用合作社|保險合作社|農會|工會|公會/.test(t)&&/解散|清算/.test(t)&&/財報|財務報表|決算|帳表/.test(t)&&/一樣|不同|差別|比較|分別/.test(t);
 if(explicitCross){
   const coop=n=>law('合作社法','D0050112',n);
   return {direct:true,category:'社會團體｜跨組織清算業務分流',title:'合作社清算財報與協會年度決算不能互相套用',summary:'不一樣。合作社依《合作社法》辦清算，縣府可要求清算人報告；一般協會的年度財報是另一套規定。',steps:[
    ['合作社：清算人依合作社法辦理','依第63條，清算人就任即編資產負債表及財產目錄，提社員大會承認；流會得呈主管機關備案。第63條之1允許主管機關命清算人報告及檢查。清算事務終了後，依第65條二十日內造報告書報主管機關、分送各社員；由法院選派者另向法院呈報。縣府現在催報，先讓清算人確認它要求哪個階段的報表，不必把未完結說成已完結。'],
    annual,action
   ],refs:[coop(63),coop('63-1'),coop(65),p(34)],questionState:{focus:'compound'}};
 }
 if(!t||t.length>210||!/協會|人民團體|社會團體|社團法人/.test(t)||/合作社|農會|漁會|工會|公會|財團法人/.test(t))return null;
 if(!/解散|清算/.test(t)||!/財報|財務報表|預算|決算|清算表|收支表|帳目|帳表|決算書/.test(t)||!/催|公文|來文|來函|收到|要求.{0,7}繳|要求.{0,7}交/.test(t))return null;
 if(/國稅局|營業稅|所得稅|報稅/.test(t)&&!/縣府|主管機關/.test(t))return null;
 const pending=/還沒報|未報|還沒有報|未送出|沒報縣府|才大會決定|僅大會通過/.test(t);
 const done=/清算(?:已|也已)?(?:完成|完結|結束|終結)|法院.{0,8}完結/.test(t)&&!/清算(?:還|尚)?(?:沒|未|沒.*?有)/.test(t);
 const y=/去年|前一年|前幾年|以前年度|上年度|前一年度|解散前.{0,8}(?:財報|決算)/.test(t);
 const unknown=/沒(?:有)?寫(?:年度|是以前年度)|年度(?:不明|不清楚)|不確定.{0,12}(?:年度|報表|哪種)|只寫財報|不知道.{0,10}哪份/.test(t);
 const askedClear=/索取清算|要.{0,3}清算表|催.{0,3}清算|要求.{0,4}清算/.test(t);
 const indeterminate=unknown||!y&&!askedClear;
 const explicitlyNonregistered=/沒有法院|未辦法院|未(?:在法院|經法人)登記|沒有法人登記/.test(t);
 const registered=/社團法人|法院法人登記|已依法院|已經法院/.test(t)&&!explicitlyNonregistered;
 const filed=/有送|已送|已(?:經)?報過|以前有報|曾(?:送|報)|已繳|報過|有收件證明/.test(t)&&!/沒有送|未曾送|沒報過/.test(t);
 const note=done?'即使清算已終結，也不要逕把公文當作誤寄；備妥完結證明和原申報收件核對。':'';
 const summary=unknown?'不能把清算表自行當去年決算。來文沒寫年度時，先看報表名稱並於期限內向發文承辦確認。':pending?(y?'兩件分開：大會決議解散但尚未報送，不影響去年財報催報要期限內回覆；大會解散紀錄另依程序報送。':'兩件分開：大會決議解散但尚未報送，解散紀錄要另報；催報仍按公文的種類和期限回覆。'):y?(filed?'先用原送件收件證明核對年度和報表，不要只因再收到公文就重複補送。如果原承辦確認缺件，再依其指示補正。':'先確認及回覆去年度決算催報。後來收到解散函或正在清算，不會自動免除前一年度的報告，也不能用清算表替代。')+note:askedClear?'來文既然要求清算財報，先按清算承辦的階段與指定書件處理，不拿往年決算直接替代。'+note:'先別忽略公文。解散函、大會同意解散及清算完成是不同階段；催報也可能是以前年度決算或解散／清算書件，要分開確認。'+note;
 return {direct:true,category:'社會團體｜解散後財務催報',title:'協會解散後收到財務催報：按年度與清算階段分開處理',summary,
 steps:[...(pending?[before]:[]),annual,clearing,...(registered?[legal]:explicitlyNonregistered?[unregistered]:[unregistered,legal]),action],refs:[p(34),g(12),g(27),c(40),c(42),example],questionState:{focus:'compound'},
 ...(indeterminate?{choiceHeading:'公文要的是哪一種報表？',choices:[
  {label:'解散前的年度預決算',question:(pending?'協會只有大會決議解散還沒報；':'協會解散後收到縣府公文；')+'公文催去年的決算，要交什麼？'},
  {label:'解散或清算財報',question:(pending?'協會大會決議解散但還沒報；':'協會解散後，')+'縣府公文要求清算財務報表，現在應怎麼處理？'}
 ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={dissolutionNotice};return;}
root.verifiedAssociationDissolutionNotice=dissolutionNotice;
})(typeof window!=='undefined'?window:globalThis);
