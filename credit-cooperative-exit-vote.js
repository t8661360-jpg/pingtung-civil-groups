(function(root){
'use strict';
const act=(title,pcode,flno)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+flno});
const rules=[
 act('信用合作社法第12條之1：退社及股金','G0380058','12-1'),
 act('信用合作社法第13條：社員代表大會','G0380058',13),
 act('信用合作社法第14條：社員選舉權','G0380058',14),
 act('信用合作社選聘辦法第46條：代表任內資格','G0380069',46)
];
const body=[
 ['先看是社員選代表，還是代表在代表大會表決','依信用合作社法第13、14條，社員可依法參與選出社員代表，但一般社員身分不等於當選代表；代表大會由仍具資格的代表行使大會職權。已退社者不會因股金還沒領就保有原社員的選舉權。若原是代表，請信合社核對退社生效日、代表資格和名冊，必要時依選聘辦法第3、46條處理解任及註銷；不要只憑舊名冊算票。'],
 ['股金返還與投票是兩件事','依信用合作社法第12條之1，已出社可按章程請求退還股金。每股原則以營業年度終了且經社員代表大會決議通過的決算淨值除以股數計算，上限是每股面額；自該決議通過後三個月內退還，不是從遞交退社申請日算。']
];
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(t.length>235||!/信用合作社|信合社/.test(t)||!/退社|出社|不再是社員|不是社員/.test(t)||!/投票|表決|選舉權|投一票|算.{0,7}票/.test(t)||/還沒入社|罷免|死亡|繼承|除名|清算|公會|協會/.test(t))return null;
 const pending=/只(?:有|是)?(?:填|交|提出|送)|還沒生效|尚未生效|還沒到年底|還沒正式退社/.test(t.replace(/不是只.{0,12}(?:申請|提件)/g,''));
 const accepted=/確定(?:已(?:經)?)?(?:退社|出社)|已(?:經)?(?:退社|出社|不是社員)|(?:退社|出社).{0,5}(?:已(?:經)?生效|確定生效)|不再是社員/.test(t);
 const unsure=/是否已|不確定|不知.{0,9}(?:退社|生效)/.test(t);
 const known=accepted&&!pending&&!unsure, left=pending&&!accepted&&!unsure;
 const intent=/社員代表大會/.test(t)?'在社員代表大會':/選(?:社員)?代表|社員代表選舉/.test(t)?'選社員代表時':/社員大會/.test(t)?'在社員大會':'開會時';
 const summary=known?'退社已生效，就不能靠原社員資格再投票；股金尚未退還不會保留投票權。':left?'只交退社申請不等於已退社。若投票日仍是社員，也要看是在選代表，還是在代表大會表決；兩種身分不一樣。':'投票看當日的社員或代表資格，不看股金是否到帳。若退社已生效，就不能靠原資格投票。';
 return {direct:true,category:'信用合作社｜退社與社員代表',title:'信合社退社後的投票資格，和退股金分開看',summary,
  steps:[...(known?[]:[['先核對退社是否生效','信用合作社法第12條之1以營業年度終了自請退社為原則，通常須於三個月前提出書面請求，章程依法得延長預告期間。只交申請而未生效，請核投票日的社員資格；在社員代表大會還須是具資格的代表，不因仍是一般社員就能投。']]),...body],refs:rules,questionState:{focus:'compound'},...(!known&&!left?{choiceHeading:'大會當天的退社狀態是哪一種？',choices:[
  {label:'退社已生效',question:'信用合作社社員已經退社，股金尚未收到，'+intent+'還能投票嗎？'},
  {label:'只提出申請，尚未生效',question:'信用合作社社員只提出退社申請，尚未生效，股金尚未收到，'+intent+'還能投票嗎？'}
 ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCreditCooperativeExitVote=route;
})(typeof window!=='undefined'?window:globalThis);
