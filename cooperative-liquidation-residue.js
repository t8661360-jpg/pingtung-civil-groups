(function(root){
'use strict';
const act=(title,pcode,flno)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+flno});
const coop={title:'合作社法第23、57、59–65條：解散、清算與公益金',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const civil=act('民法第44條：清償債務後餘產的歸屬','B0000001',44);
const justice={title:'法務部（79）法律字第11671號：合作社適用民法第44條',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE076090&media=print&type=e'};
const deposit={title:'法務部（81）法律決字第15549號：合作社應退股金、民法第326及327條',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?etype=etype5&id=FE076744&keyword=&type=E'};
const opinions={title:'內政部合作社清算函釋：章程、普通公積及補助設備',source:'https://ws.yunlin.gov.tw/Download.ashx?n=5ZCI5L2c56S%2B6Kej5pWj5riF566X55u46Zec6Kej6YeL5Luk56%2BA6YyELnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvNDE0L3JlbGZpbGUvOTM0MC8yNjczNTEvODVlYTA3NjMtODFhYS00NTRiLWIwYTMtZjAwNmU5MTk0OGFmLnBkZg%3D%3D#page=9'};
const wage={title:'勞動基準法第28條：特定勞工債權的清償順位',source:'https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?flno=28&id=FL014930'};
const who=['先確認清算人和要處理的帳','依法原則由理事充任，但章程另有規定或社員大會另選時從其規定；不能照前述方式確定時可依法由法院選任。清算人要結束業務、收回社方債權、清償債務並處理清償後剩餘財產。'];
const payWages=['員工不是等社員分完才領','合作社還欠薪、供應商貨款或有其他債務，須先交清算人列帳清償。勞動基準法第28條對歇業、清算或破產時特定欠薪、退休金及資遣費有特別順位；不是所有欠薪都同順位，也不由社員先分款。員工可備勞動契約、薪資及欠款證明，向清算人申報，並向勞工主管機關洽詢。'];
const nonMember=act('合作社業務提供非社員使用辦法第8條：解散後受限制款項','D0050200',8);
const reg=['社員大會決議解散：一個月內聲請登記','依合作社法第57條，決議解散後一個月內向主管機關聲請解散登記，說明事由並附社員大會會議紀錄。主管機關命令解散不是同一種起算，依命令及適用規定辦理。'];
const dissolCred=['解散或合併的債權人通知：不要和清算公告混用','合作社法第59條要求解散或合併時於一個月內個別通知各債權人並公告，另留至少一個月提出異議。這是合作社自己的通知義務，不是下方清算人就任後的申報期間。'];
const appointed=['清算人就任後15日內另辦就任備查','依合作社法第60條，由清算人將姓名、住所或居所及就任日期報主管機關備查。由法院選任者，另報法院；這項備查不取代公告。依第63條，就任後也應即盤點資產與財產目錄，依法提社員大會承認，流會可呈主管機關備案。'];
const publicNotice=['清算人就任後15日內公告，已知債權人還要個別通知','依合作社法第64條公告催請債權人申報，所給的申報期間不得少於15日；已知債權人還要分別通知。個別通知不能代替公告，不能用公告代替已知人通知。公告載體和送件證明按適用規定及承辦要求，不自行指定報紙。'];
const finish=['清算事務終結後20日內交報告','依合作社法第65條，自清算事務終結後20日內造具報告，呈報主管機關並分送各社員。法院選派清算人的，另呈報法院。這不是從就任、解散決議或公告日算起。'];
const owed=['確認應退的股金是債權，不是可平分的餘產','已確認合作社欠某位社員的應退股金，要在清償階段處理；不能因聯絡不上就把它當剩餘財產分掉。依（81）法律決字第15549號，若有受領遲延，或確實不能確定誰有權領取而難給付，可依民法第326、327條向有管轄權的法院提存所確認清償提存。先核對資格、金額及聯絡紀錄，不假定每個人都應退全額，單憑找不到人也不等於符合提存要件。'];
const restricted=['公益金和特定來源公積不能按股金分','合作社法第23條第4項的公益金，解散後仍只用於法定用途。若只知道帳上寫「公共基金」，請先核對科目、來源與原用途，不能直接假定它就是公益金或普通餘產。若是提供非社員使用的業務收益所提公積金與公益金，依相關辦法第8條，解散後也不得分給社員，優先捐贈合作事業發展基金。普通公積在合作社存續時社員不得請求分配；清算後若依法屬普通餘產之一，才按民法第44條處理。先分辨資金來源，不把所有公積都同一類。'];
const granted=['縣府或其他公部門補助設備先查原核定條件','內政部台(89)內中社字第8905055號函說明：合作社被命令解散時，政府補助的固定資產是否繳回及如何辦理，須看資產類型、用途或使用年限及原補助計畫、補助機關規定。先獨立列冊向原核定補助機關確認，不假定一律可分或一律繳回。'];
function ordinary(known){
 const detail=known==='none'?'你已說沒有章程規定，也沒有有效大會決議。若沒有其他專法規定，該合作社住所所在地的地方自治團體承受一般餘產。':known==='local'?'你已說有效章程訂歸所在地自治團體。依法核對並由清算人按章程辦理，不用大會臨時平分來取代章程。':known==='charter'?'已有適用章程，就先核章程條文及生效資料。大會臨時表決平分不能拿來逕行排除既有合法章程。':known==='resolution'?'若章程沒有適用條款，已有合法有效大會決議，還要先核決議可否依法適用。不能只看有人投票就認定可分。':'先核專法、適用章程及有效社員大會決議；三項都沒有，一般餘產歸合作社住所所在地的地方自治團體，而不是直接按出資或人頭分。';
 return ['債清了才確認普通剩餘財產的去處','合作社法第61條規定清算人分派剩餘財產的職務，不是股金比例的分配公式；第62條也不是分配依據。專法無其他規定時，依民法第44條和法務部、內政部函釋處理。'+detail+' 若該法人以公益為目的，還受第44條不得歸自然人或營利團體的限制。'];
}
const credit={title:'信用合作社法第4、5、8、12-1、23、28、35條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380058'};
function creditCase(t){
 if(!/信用合作社|信合社/.test(t)||!/解散|清算/.test(t)||!/公益金|公積金|股金|餘產|剩餘|一樣|比照|核准/.test(t))return null;
 return {direct:true,category:'信用合作社｜解散核准與清算',title:'信用合作社先依專法，不能直接套用一般合作社的清算分派',summary:'不應把公益金與未退股金一起視為可分的餘款。先確認信用合作社的解散事由、核准資料與各筆權利的性質。',steps:[
 ['信用合作社決議解散要報中央主管機關核准','依信用合作社法第28條，應附解散事由、社員大會會議紀錄、清償債務計畫等，報金融監督管理委員會核准。依第35條，除合併或破產外，解散後應行清算。第4條允許其他法律在專法未規定時補充，不是直接整套照搬。'],
 ['公益金、應退股金及真正餘款分開核對','依信用合作社法第8條及第23條，先檢查章程與公益金來源、用途；未退款先核對是否已是應付債權，不一律算入可分配餘款。一般退社退股依第12條之1，不等於解散時人人都能按面額受償。個案先查核准的清償債務計畫與適用規則，向信合社清算人或金管會確認，不自行斷定誰可以分得。']
 ],refs:[credit],questionState:{focus:'compound'}};
}
const noLiquidation=typeof module!=='undefined'&&module.exports?require('./cooperative-stock-exit.js').underDiscussion:root.cooperativeNoLiquidation;
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(noLiquidation?.(t))return null;
 const c=creditCase(t);if(c&&t.length<=330)return c;
 if(!t||t.length>330||!/合作社/.test(t)||!/解散|清算|清償債務|債都清了/.test(t)||/信用合作社|信合社|保險合作社|聯合社|股東|股份有限公司|破產|農會|漁會|公會|工會|財團法人/.test(t))return null;
 const registration=/解散登記|解散.{0,6}(?:向誰|多久|幾天).{0,6}登記|先決議解散|決議解散.{0,9}申請/.test(t);
 const appointment=/清算人.{0,8}(?:報到|陳報|就任備查|報備)|報就任|報到.{0,7}(?:期限|縣府)|就任.{0,6}(?:備查|報到|應報)/.test(t);
 const announce=/債權人|債主|公告|催告|個別通知/.test(t);
 const report=/(?:清算|終結|結束|報告).{0,15}(?:終結|結束|完畢|報告|報誰|送誰|要送|報給)|報告書|結清.{0,5}(?:報|送)/.test(t);
 const claim=/(?:欠|應|該|還沒|有權|待|未|須).{0,10}(?:還|收|領|退|付).{0,4}股金|股金.{0,10}(?:應退|未退|領不到|找不到|不能給付)|(?:應退股金|欠社員股金)/.test(t);
 const fund=/公積金|公益金|公共基金|非社員(?:使用|業務|收益)/.test(t);
 const subsidy=/補助.{0,12}(?:資產|設備|財產)|設備.{0,8}補助/.test(t);
 const assets=/餘產|(?:剩餘|賸餘|剩下的?|剩的)(?:普通)?(?:財產|資產|錢|款)|(?:財產|資產).{0,5}(?:歸誰|分配|怎麼分)|普通餘款|一般餘款|餘款|其他餘額|按(?:各自的)?(?:股金|出資|人頭)分|平分|一人一份/.test(t);
 const residue=assets||fund||subsidy;
 const asksWho=/誰.{0,5}(?:管|負責|辦|當).{0,4}清算|清算人.{0,7}(?:誰|怎麼選)|理事.{0,7}(?:管|辦)清算/.test(t);
 const labor=/欠薪|工資|薪水|資遣|勞工.{0,8}(?:薪|債|受償)|員工.{0,5}(?:等|薪|債)/.test(t);
 if(!registration&&!appointment&&!announce&&!report&&!claim&&!residue&&!asksWho&&!labor)return null;
 const forced=/被命令解散|命令解散|主管機關命令/.test(t);
 const noC=/章程.{0,7}(?:沒(?:有)?(?:寫|規定)|未(?:規定|訂)|沒有相關|沒訂)|(?:無|沒有)章程規定/.test(t);
 const noR=/社員大會.{0,9}(?:沒有|沒|無|尚未).{0,4}(?:有效決議|決議)|(?:也)?沒(?:有)?有效決議|並無合法決議/.test(t);
 const local=/章程.{0,18}(?:已訂|明訂|規定).{0,17}(?:自治團體|縣市政府)|章程.{0,15}(?:寫|載明).{0,12}自治團體/.test(t)&&!noC;
 const yesC=local||(!noC&&/章程.{0,9}(?:已有|已規定|已載明|已訂|已明訂|明文有|明定|寫了)/.test(t));
 const yesR=!noR&&/已有有效決議|已有合法.{0,4}決議|依有效決議|另有有效決議|有有效大會決議/.test(t);
 const state=local?'local':yesC?'charter':noC&&yesR?'resolution':noC&&noR?'none':null;
 const qAsksDestination=residue&&/歸|分|去哪|去處/.test(t);
 const needChoice=qAsksDestination&&!state&&raw.length<=244&&!forced;
 const options=[
  ...(!noC?[{label:'章程已有規定',question:raw+'；確認章程已有規定。'}]:[]),
  {label:'章程沒規定，但有有效決議',question:raw+'；確認章程沒有規定，另外已有有效決議。'},
  {label:'章程與有效決議都沒有',question:raw+'；章程沒有規定，社員大會也沒有有效決議。'}
 ];
 const summary=state==='none'?'在沒有其他專法規定的情況下，清債後的一般餘產歸合作社住所所在地的地方自治團體；限制款和債權另處理。':residue?'不能把餘產直接視為按股金或人頭分配。先清債、分清受限制財產，一般餘產再依有效章程、合法決議或民法第44條處理。':claim?'已確定應退的股金是一筆債，不列為可分派的財產；找不到人先核對是否符合依法提存。':'解散決議、清算人就任、債權公告和清算終結是不同的起算點。';
 return {direct:true,category:'一般合作社｜解散清算',title:residue?'清償、限制款與普通餘產：不能一概平分':'合作社解散到清算終結：期限分開算',summary,steps:[
  ...(registration&&!forced?[reg]:[]),...(asksWho?[who,appointed]:[]),...(announce?[dissolCred]:[]),...(appointment&&!asksWho?[appointed]:[]),...(announce?[publicNotice]:[]),
  ...(labor?[payWages]:[]),...(claim?[owed]:[]),...(fund||residue?[restricted]:[]),...((claim&&/非社員(?:使用|業務|收益)/.test(t))?[['受限制的公積，不能自行挪去退股','先釐清是依法清償確定的欠款，或是把受限制的公積直接分給社員。第8條不是特定公積可自行用來補退股金的依據；清算人應按來源和會計紀錄向主管機關確認，不先從這筆受限款支付。']]:[]),...(subsidy?[granted]:[]),...(residue?[ordinary(state)]:[]),...(report?[finish]:[])
 ],refs:[coop,...(labor?[wage]:[]),...(residue?[civil,justice,opinions,nonMember]:[]),...(claim?[deposit]:[])],questionState:{focus:'compound'},...(needChoice?{choiceHeading:'目前知道章程或大會有沒有規定餘產去處嗎？',choices:options}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeLiquidationResidue=route;
})(typeof window!=='undefined'?window:globalThis);
