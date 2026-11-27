(function(root){
'use strict';
const base={title:'社會團體財務處理辦法第4、11、12條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'};
const annex1={title:'附件一：會計報告格式及說明（官方 PDF）',source:'https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000329071&lan=C'};
const annex2={title:'附件二：決算報告表及說明（官方 PDF）',source:'https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000329072&lan=C'};
const ordinary=['附件一：資產負債表和財產目錄不能互相替代','一般年度會計報告包含收支決算表、資產負債表、財產目錄及基金收支表。資產負債表是財務總況，財產目錄列個別財產；有前者不等於已附後者。有財產的社會團體也應依第4條置財產登記簿。'];
const small=['附件二：總收入在300萬元以下，可用簡式表報送','第12條以年度決算總收入在新臺幣300萬元以下為門檻，不是看資產總額或預算；恰為300萬元也包含在內。附件二列總收入、總支出、餘絀和資產總額；可以按此格式報送，不是只交資產負債表。也不表示可省略團體內部的財產登記簿或有法律依據的個別補件。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||!/協會|社會團體|人民團體/.test(t)||!/財產目錄|資產負債表/.test(t)||!/決算|年報|會計報告|報送|報縣府|表格|下載|還要交|可以不交|可不可以不附|簡式|附件/.test(t)||/合作社|公會|工會|農會|漁會|公務人員協會|財團法人|基金會|解散|清算|補助核銷|報稅|折舊|遺產/.test(t))return null;
 const a=/(?:總收入|決算收入)(?:確定|確實|已經|已|是|為)?(?:超過|高於|大於|逾)(?:300|三百)萬|依法必須用附件一/.test(t)&&!/是否|不確定|不知道/.test(t);
 const b=/(?:總收入|決算收入)(?:確定|確實|已經|已|是|為)?(?:(?:不到|低於|不超過|未達)(?:300|三百)萬|(?:正好|剛好|恰好)?(?:300|三百)萬(?!(?:元)?(?:以上|起|出頭|多))(?:(?:元)?(?:以下|整))?)/.test(t)&&!/不知道|不確定|是否/.test(t);
 const useA=a&&!b,useB=b&&!a;
 return {direct:true,category:'人民團體財務｜決算表件與下載',title:'決算用哪一種格式，先看年度總收入',
  summary:useA?'用一般格式時，資產負債表不能取代財產目錄。':useB?'年度決算總收入在300萬元以下可用附件二，不是把資產負債表當成整份決算，也不是不用管財產登記。':'一般格式不能用資產負債表取代財產目錄；但年度決算總收入在300萬元以下，有附件二簡式可以選。先看你這年度的決算總收入。',
  steps:[...(useA?[ordinary]:useB?[small]:[ordinary,small]),['表格怎麼找','一般 Excel 範本可從本站「書表下載」→「協會／人民團體」→「常年會」→「6項財務報表.xlsx」。附件一與符合門檻者可用的附件二亦可直接從下方下載官方表式。縣府個案另有合法要求時，先核對後再送。']],
  refs:[base,annex1,annex2],actions:[{label:'開啟常年會財務書表',view:'forms',sub:'常年會'}],questionState:{focus:'compound'},...(!useA&&!useB?{choiceHeading:'年度決算總收入是多少？',choices:[{label:'超過300萬元',question:'協會年度決算總收入超過300萬元，資產負債表可取代財產目錄嗎？哪裡下載？'},{label:'300萬元以下（含300萬）',question:'協會年度決算總收入不超過300萬元，只有資產負債表能提交嗎？哪裡下載財產目錄和附件二？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationFinanceInventoryDownload=route;
})(typeof window!=='undefined'?window:globalThis);
