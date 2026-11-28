(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const aTransfer=law('人民團體會務輔導辦法第17、18條','D0020094');
const aBooks=law('社會團體財務處理辦法第5、20–22條','D0050097');
const aAct=law('人民團體法第54條','D0050091');
const cAct=law('合作社法第35、36、39條','D0050112');
const cBooks=law('合作社財務報表及經費處理準則','D0050114');
const county={title:'屏東縣政府對民間團體補助經費作業要點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const norm=q=>String(q||'').normalize('NFKC').replace(/\s+/g,'');
const typeA=/協會|社會團體|人民團體|社團法人/;
const typeC=/合作社|社員大會/;
const transfer=/交接|移交|點交|監交|接手|接任|新(?:一屆|任|理事長|理事會)|前(?:一屆|任|理事長|理事)|上(?:一屆|一任)|換屆|改選後/;
const finance=/財務|帳(?:簿|款|目|戶|本|冊|上|面|跟|與|和|對|有|不|差)|餘額|銀行|存摺|存折|收據|發票|請款|暫墊|墊付|墊款|核銷|憑證|差額|缺帳|錢不對|金額不對/;
const negative=/不平|不符|不對|對不起來|對不上|不能對|未對|差一筆|差幾筆|有差額|差額|短少|說不清楚|沒(?:有)?交|沒(?:有)?給|沒(?:有)?寫|找不到|沒找到|不見|缺(?:件|漏|了|失)|漏(?:了|列|設備)|沒了|不齊|少了一|未交|還沒交|未點交|沒點交|沒簽|不在/;
const excluded=/信用合作社|信合社|工會|公會|財團法人|農會|漁會|解散|清算|罷免選票|刑事提告|偽造文書|洗錢|公司併購|銀行貸款/;
const kind={
 a:['一般協會／社會團體','確認一般協會財務交接'],
 c:['一般合作社','確認一般合作社財務交接']
};
function parse(q,prev){
 const raw=norm(q);
 if(!raw||raw.length>560||/^新題/.test(raw)||excluded.test(raw))return null;
 const pick=Object.keys(kind).find(k=>kind[k][1]===raw);
 if(pick)return {...prev,org:pick};
 const correction=!!prev&&/^(?:更正|其實|補充|剛才說錯)/.test(raw)&&finance.test(raw);
 const t=raw.replace(/(?:不是|並非|不問|不談)(?:一般|普通)?(?:協會|合作社|社會團體|人民團體|縣府補助)/g,'');
 const c=typeC.test(t),a=typeA.test(t);
 if(c&&a)return null;
 const org=c?'c':a?'a':correction?prev.org:undefined;
 if(!(finance.test(t)&&(negative.test(t)||/實際收到|只簽|都對得上|能否先簽|自掏|補上/.test(t))&&(transfer.test(t)||correction)))return null;
 const match=/都(?:對得上|相符)|(?:銀行|餘額).{0,7}(?:對得上|無差異|一致)|沒有.{0,4}(?:差額|差異)/.test(t);
 const diff=!match&&/不平|不符|不對|對不起來|對不上|差(?:一|幾)筆|差額|有落差|短少|帳上沒寫去向/.test(t);
 const grant=/補助|核銷/.test(t)&&!/沒有補助|未涉及補助|沒補助|不涉及補助/.test(t);
 const missing=/缺|不見|找不到|沒找到|沒了|不在|沒(?:有)?寫去向|沒(?:有)?給|未交|沒(?:有)?交|未點交|還沒點交|未拿到|不齊/.test(t);
 const thing=/圖記|印章|存摺|存折|清冊|名冊|憑證|帳簿|帳本|沒交接/.test(t);
 const sig=/簽收|簽字|簽名|簽交接|只簽|先簽|交接表|交接完成|全部齊/.test(t);
 const advance=/暫墊|先付|墊(?:付|款)|請款|付給他|還給他|還他錢|向前任|報支/.test(t);
 const due=/到期|截止|只剩|剩一天|兩週|15天|十五天|15日|十五日|期限|催/.test(t);
 const assets=/設備|財產|公所借|借用/.test(t);
 const books=/帳簿|帳本|帳冊|收據|憑證|發票|紀錄|資料|證據/.test(t);
 return {org,community:/社區發展協會|社區協會/.test(t),match,diff,grant,missing,thing,sig,advance,due,assets,books,correction};
}
function route(q,prior){
 const x=parse(q,prior);if(!x)return null;
 const result=(title,summary,steps,refs,keys)=>({direct:true,category:'財務交接與憑證',title,summary,steps,refs,handoverFinanceContext:x,questionState:{focus:keys?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(keys?{choiceHeading:'是哪一種團體？',choices:keys.map(k=>({label:kind[k][0],question:kind[k][1]}))}:{})});
 const ack=['只簽實際收到的項目，不簽「全部交接完成、帳款無誤」','可請交接雙方與負責監交者逐項點清，清冊註明已收、缺件、未核、差額及後續負責人和補件時間。若表格只有「全部無誤」，先改用註明保留的清冊或另附說明，不在空白或內容不實的清冊上簽。'];
 if(!x.org)return result('先分開「簽收」與「同意帳款無誤」','先註明實際收到哪些資料，不用先承認帳款全部對上，也不要只因自己新接任就拿私人款補差。交接期限和查核窗口依團體類型不同。',[ack],[],['a','c']);
 const coop=x.org==='c';
 const steps=[];
 const refs=coop?[cAct,cBooks]:[aTransfer,aBooks,aAct];
 if(x.sig||x.thing||x.missing)steps.push(ack);
 if(!coop){
  steps.push(['屆期改選，新任理事長會同監交人在就任後十五日內接收',''+(x.community?'屏東縣立案的社區發展協會也應把新舊任資料列在本會清冊，與公所代管或借用物品分開。':'')+'依人民團體會務輔導辦法第18條，改選前將圖記、立案證書、未完案件及財務等造清冊。監交人由新任監事會召集人（常務監事）或新任監事互推一人擔任。屆期未完成要如實保留紀錄、向原主管機關說明；第18條有報請註銷舊證書及重新發給的處理，不能自行當作原證已註銷，也不是每件帳差都得換證。改選後名冊異動依人民團體法第54條在三十日內報核備，與財務尚未對清是兩回事。']);
 }else steps.push(['合作社由理事會接管、監事按職權監查','理事會負責備置社務資料和財務文件，監事監查財產、理事執行及書類（合作社法第35、36、39條）。依該社章程、決議和會計交接程序辦理，不直接套協會「就任後十五日」規則。']);
 if(x.diff||!x.match&&!x.books)steps.push(['先按同一天對帳，把差額列出，不先拿錢補齊','由掌管財務者比銀行對帳單、存摺、現金、總帳、傳票、未兌現支票或時間差，逐筆留證。保留原帳，不倒填、不擅自改數字；交監事按職權核對，必要時請專業人士協助。新任有查明、保存與處理職責，但只因接任不會自動承擔舊差額的個人賠償；是否須追究前任或他人要看原因、證據、職務行為及適用法律。']);
 if(x.match)steps.push(['銀行和帳都相符，不代表缺的憑證已核過','這一筆若只是收據找不到，先列「缺憑證／待查」。不要再當成現金短少，也不用承接上一屆其他未核對的假設。']);
 if(x.missing||x.advance)steps.push(['原始憑證不見，不用其他收據替代，也不要補造','找原開票或收款單位取得符合規定的副本或交易證明，留原付款紀錄、合約、用途、核決及缺件說明。若無法補到原件，先按團體的會計制度及適用的核銷要求確認能否用其他真實佐證，不保證可接受。'+(x.advance?'前任說已墊款，不等於團體已查明負有還款義務；先驗實際付款人、團體所需支出、核准與是否付過，經有權人按規定審核後處理。沒有查清不先報支或還款。':'')]);
 if(x.assets)steps.push(['設備與名冊也逐項確認，不把借用物當自有','把財產卡、缺件、位置和管理權核對。向公所或他方借用的設備另列權屬、保管及返還條件，不把清冊點收當成所有權轉移。團體名冊在授權範圍內交接，勿把會員個資貼進公文附件以外的公開管道。']);
 if(x.grant){
  steps.push(['補助快到期就先向原補助窗口說明，別等全部都對完','對照核定函及當期規則，說明實際執行、缺件、款項和查核進度，請確認是否能先送已核實部分、補件或申請展延。期限不會因換屆或已詢問就自動往後。補助、團體自籌、待核的前任墊款依證據分開，不拿其他補助或不相干的支出憑證來填平；需要繳回或更正依原核定處理。']);
  refs.push(county);
 }
 if(!coop)steps.push(['交接問題和監事查帳，各有窗口','理事會先彙整清冊、差額與補件進度，由監事會依財務處理辦法第22條查核，必要時臨時查核。若期限到仍未交、涉及可能短少或恐影響既有申報，循原主管機關窗口反映；正常名冊核備、交接缺失與補助核銷不要混為同一報件。']);
 return result(coop?'一般合作社：先核對帳款及付款證明':'新舊任財務交接：先點收、查帳，不先承認帳款無誤',x.match?'帳與銀行相符，可把缺單據的那筆單獨列出查證；不要直接認定可以請款，也不要用別筆收據補。':'已收到的可以逐項簽收，未收到、未核對或有差額的要寫清楚。新任不因接任就要先用私款補差；補助快到期也應據實說明。',steps,refs);
}
if(typeof module==='object'&&module.exports)module.exports={route};else root.verifiedFinancialHandover=route;
})(typeof window==='object'?window:globalThis);
