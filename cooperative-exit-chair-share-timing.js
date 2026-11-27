(function(root){
'use strict';
const rules={title:'合作社法第26、27、30、32、34、35條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
const jobs={title:'合作社選舉罷免辦法第7、8條：出缺、辭職與交接',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050022'};
const member=['出社生效看退社原因、章程與日期，不看錢有沒有到帳','依合作社法第26、27條，自請退社原則在年度終了辦理，須三個月前提出書面請求；章程可延長，自然人最長六個月、法人社員最長一年。只提出退社，不等於當天已生效。核對章程、送達紀錄、年度終了日與社員名簿。'];
const capital=['股金依出社後的另一套程序計算','依第30條，出社社員可按章程請求部分或全部股金；以營業年度終了時財產為原則，章程另定從之。不要把「哪天出社」改成「哪天收到股金」，也不先承諾原額全退或指定到款日。'];
const office=['若是理事會主席，還要另查職務與交接','依合作社法第32、34條，理事由社員中選任，由理事依法代表；不能只看股金沒領就繼續以社員或主席名義行使權限。如另有書面辭去主席或理事職務，選舉罷免辦法第8條是送達合作社社址時生效；確有出缺，依第7條及章程辦理遞補或補選、交接。勿把退社日、辭職日、股金到款日混成同一天。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>240||!/合作社|社員/.test(t)||!/退社|出社|退社員/.test(t)||!/股金|股款|社股/.test(t)||!/沒領|未領|未退|還沒.{0,4}(?:領|到帳|退)|才算|才生效|先等|哪天生效|影響.{0,5}生效/.test(t)||/信用合作社|信合社|互助社|協會|公會|工會|除名|清算|死亡/.test(t))return null;
 const isOffice=/主席|理事|監事/.test(t);
 const pending=/只.{0,5}(?:交|送|提交|提出)|尚未生效|還沒生效|還沒到年度終了|還沒到年底|剛(?:送|交|提出)/.test(t);
 const effective=!pending&&!/是否已生效|不確定.{0,8}生效/.test(t)&&/(?:退社|出社).{0,5}(?:已生效|確定生效)|已(?:經)?生效|退社已經完成/.test(t);
 const ans=pending?'如果只送書面請求、法定或章程的退社時間還沒到，不能先當成已退社；原因不是股金沒領。':effective?'如果退社已依法生效，不用等股金到帳才出社；股金請求另按章程。':'不用等領股金才算出社。要先核對退社何時依法生效，股金返還另外按章程及第30條辦。';
 const choices=[
  {label:'只有提出，還沒生效',question:'合作社'+(isOffice?'理事會主席':'社員')+'只提出退社、還沒生效，股金未領要等到何時才算出社？'},
  {label:'退社已經生效',question:'合作社'+(isOffice?'理事會主席':'社員')+'退社已生效，股金未領還要等到帳才算出社嗎？'}
 ];
 return {direct:true,category:'合作事業｜出社、股金與職務',title:'合作社退社生效，與股金何時到帳不同',summary:ans,steps:[member,capital,...(isOffice?[office]:[])],refs:isOffice?[rules,jobs]:[rules],questionState:{focus:'compound'},...(!pending&&!effective?{choiceHeading:'目前退社到哪一步？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeExitShareTiming=route;
})(typeof window!=='undefined'?window:globalThis);
