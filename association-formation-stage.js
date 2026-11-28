(function(root){
'use strict';
const refs=[
 {title:'人民團體法第9至11條、第55條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'},
 {title:'內政部｜社會團體籌組程序及表單',source:'https://www.moi.gov.tw/group-dl.htm'},
 {title:'司法院｜如何辦理社團法人登記',source:'https://www.judicial.gov.tw/tw/cp-1303-2734-9a89f-1.html'},
 {title:'中華郵政｜非營利團體開戶',source:'https://www.post.gov.tw/post/internet/Templates/faq_templates.jsp?PreRowDatas=10&faq_kind_sn=7&lang=CHINESE&topage=1'},
 {title:'財政部南區國稅局｜非營利事業扣繳單位統一編號編配',source:'https://www.ntbsa.gov.tw/multiplehtml/96f3ebafa58345d994d504e83789210b'}
];
const labels={prep:'只有准予籌組，還沒開成立大會',held:'已開成立大會，等縣府立案',filed:'已有縣府立案證書，還沒辦法人登記'};
const summaries={
 prep:'准予籌組不是核准立案。一般社會團體先在許可後6個月內完成籌組並召開成立大會；來不及須報經主管機關核准，最多延長3個月，提出申請不等於展延已獲准。',
 held:'成立大會開完、選出理監事，不等於已立案。依人民團體法第10條，成立大會後30日內把法定資料送主管機關申請立案，不是要在籌組的6個月期限內一併送件。',
 filed:'已有縣府立案證書，就已立案。法院社團法人登記是另一步，通常不是強制；如果要辦，應由聲請人全體理事簽名或蓋章，不是只由理事長一人簽。沒有單因要辦法人登記就必須重開成立大會的規定。',
 unknown:'准予籌組、開完成立大會、縣府核准立案、法院完成法人登記，是不同階段。先看手上的文件，不用貼公文或任何個資。'
};
function route(q,prior){
 const raw=String(q||'').normalize('NFKC').replace(/\s/g,'');
 const reset=/^(?:換題|新題|另問)(?=$|[,。:;!?、])/;
 const t=raw.replace(/^(?:換題|新題|另問)(?=$|[,。:;!?、])[,。:;!?、]*/,'');
 if(reset.test(raw))prior=null;
 if(!t||t.length>475||/合作社|公會|工會|社區發展協會|正式駁回|訴願|撤銷立案/.test(t))return null;
 const chosen=t.match(/^櫃檯立案階段:([a-z]+)$/)?.[1];
 if(chosen&&(!prior||!labels[chosen]))return null;
 const prep=/准予籌組|許可籌組|籌組許可|許可後|籌組.{0,7}(?:半年|六個月|6個月|展延)|(?:未|還沒|尚未)開成立大會/.test(t);
 const held=/成立大會.{0,10}(?:已|完|開了|後|結束)|(?:開完|已開|已召開|開了)成立大會|理監事.{0,3}(?:都選|選好)|(?:還沒|尚未|未)核發立案/.test(t);
 const filed=/(?:已有|已拿到|已收到|找到|拿到|領到|已領|有)(?:縣府)?(?:核准)?立案證書|(?:已經|已)(?:縣府)?(?:核准)?立案|縣府(?:已|已經)立案/.test(t);
 const noFiled=/(?:尚未|未|還沒|沒有|沒)(?:收到|拿到|領到|核發|取得|發下來)?(?:縣府)?(?:核准)?立案(?:證(?:書)?)?/.test(t)&&!/(?:不是|並非)(?:還沒|尚未|沒有)立案/.test(t);
 const unknown=/不確定|不知道|分不清|哪個階段/.test(t)&&!/(?:不確定|不知道).{0,8}(?:延長|展延|簽|申請|准不准)/.test(t);
 const follow=prior&&/^(?:我?更正|我?補充|所以|那|其實)/.test(t)&&/立案|成立大會|籌組|法人登記|法院|統編|開戶/.test(t);
 const topics=/多久|期限|幾天|30日|半年|六個月|6個月|展延|延長|法人登記|法院|立案嗎|算立案|統編|統一編號|開戶|帳戶|私人戶頭|會址租約|簽租約/.test(t);
 const stageSignal=/准予籌組|許可籌組|籌組許可|成立大會|立案證(?:書)?|尚未立案|還沒立案|已(?:縣府)?立案|籌組.{0,6}立案/.test(t);
 if(!chosen&&!follow&&!(stageSignal&&topics&&(prep||held||filed||unknown)))return null;
 const stage=chosen||(unknown&&!filed&&!held?'unknown':filed&&!noFiled?'filed':held&&(!prep||noFiled)?'held':prep?'prep':follow?prior.stage:'unknown');
 const funds=/統編|統一編號|開戶|帳戶|戶頭|收錢|籌備款/.test(t)||((follow||chosen)&&prior.funds);
 const extra=/租約|簽約|補助|捐款|募款|電話|個資|聘|雇/.test(t)||((follow||chosen)&&prior.extra);
 const steps=[];
 if(/審查多久|審查時間|審查期限/.test(t)&&stage==='prep')steps.push(['籌組申請審查與籌組期限不同','屏東縣籌組申請資料的審查期限依縣府申請須知為2個月；取得許可後，才進入籌組期限。若收到補正或展延公文，請另核對該公文的期限。']);
 if(stage==='unknown'||stage==='prep')steps.push(['先核對許可函上的日期及展延','若改期可能跨過期限，先查縣府有沒有核准延長，不要用自行加的「一個月」來算。成立大會原則上應於15日前通知會員，並依屏東縣籌組流程通知縣府。']);
 if(stage!=='filed')steps.push(['立案送件另外計算','成立大會後30日內，向主管機關送章程、會員名冊及選任職員簡歷冊等；屏東案件再依縣府清單附大會與首次理監事會議紀錄及其他資料。先開會與後送件，是兩個期限。']);
 steps.push(['法院法人登記是立案後的另一項手續','以主事務所所在地地方法院辦理。司法院指引要求聲請書由聲請人全體理事簽名或蓋章，並加蓋法人印信。完成登記後30日內，將法院登記證書影本送主管機關備查。']);
 if(funds||stage==='unknown')steps.push(['統編與團體帳戶不要拿私戶代替',stage==='filed'?'備立案證明，依國稅局清單辦統一編號。中華郵政可辦非法人非營利團體戶，負責人姓名與團體名稱同列戶名；這不是理事長自己的私人戶頭。其他銀行依各自清單審核。':'准予籌組函或會議紀錄不等於立案證書，不能保證可以拿來開戶或編配統編。先向國稅局或往來金融機構核對有無受理籌備戶及應備文件，不要把團體款混進個人帳戶。']);
 if(extra)steps.push(['租約、補助或對外收款，不由這張證書一併決定','未立案就要先簽約時，先釐清契約當事人、誰有授權、誰負責及是否約定立案後承接，不要假稱已立案。補助依各計畫資格及截止日；不確定時不要先承諾、以公益名義對不特定人收款，或公開會員電話。']);
 return {direct:true,category:'社會團體｜籌組、立案及法人登記',title:{prep:'准予籌組後，成立大會與立案送件分開算',held:'成立大會開完，還要向縣府申請立案',filed:'已有立案證書：法院登記是下一個選項',unknown:'先確認社會團體現在在哪個階段'}[stage],summary:summaries[stage],steps,refs:funds||stage==='unknown'?refs:refs.slice(0,3),questionState:{focus:'cross-formation-stage'},formationStageContext:{stage,funds,extra},...(stage==='unknown'?{choiceHeading:'請選手上已有的文件或已完成的事項',choices:Object.entries(labels).map(([key,label])=>({label,question:'櫃檯立案階段:'+key}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedAssociationFormationStage=route;
})(typeof window==='object'?window:globalThis);
