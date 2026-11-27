(function(root){
'use strict';
const sources=[
 {title:'社會團體財務處理辦法第5、10至12、15條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097'},
 {title:'社會團體財務處理辦法第12條附件一：會計報告格式',source:'https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000329071&lan=C'},
 {title:'人民團體法第34條：預決算與監事會審核',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno=34'}
];
const county={title:'屏東縣政府對民間團體補助經費作業要點第8點、第8之1點',source:'https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454'};
const report=['上年度決算不能跳過理監事會務程序直接當已通過送縣府','依人民團體法第34條及財務處理辦法第11條，理事會編造報告，決算先送監事會審核，連同審核結果送會員（代表）大會通過，再報主管機關。若大會無法如期召開，得依第11條先由理事會及監事會或理監事聯席會議通過，事後仍須提大會追認，再報備。應機關催補時可先聯繫確認補件方式，不把未完成程序的文件稱作已通過。'];
const own=['自有結餘先核對決算、帳冊與資產負債表','財務處理辦法第5條把基金暨餘絀和收入支出分開。以前年度確定可用的自有結餘，先對前期決算、帳冊及資產負債表，不把原有結餘重複算成今年新收入。把今年要做的工作與預計支出列入今年預算，另註財源來自前期自有結餘，按章程及第11條的審議程序處理。帳上餘額不是可花額度，仍需先扣除限制用途或待付款項。'];
const reserve=['準備基金不是一般可用結餘','若已依法提列為準備基金，本息應專戶存儲，依第15條非經理事會通過不得動支；再依法核對撥用及預算流程。不能只看銀行有錢就把它改列普通結餘。'];
const grants=['補助或指定用途款要回看核定及用途，不能自行變成下年經費','屏東縣通案補助要點第8之1點規定補助經費有剩餘應繳回；其他專案或不同補助機關，要核對原核定函、是否准保留及核銷期限。指定用途捐款也不是無限制的自有結餘，依原約定辦。不能把尚未核銷的錢直接移到次年任意使用。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||!/協會|社會團體/.test(t)||!/預算|做預算|列預算|今年.{0,6}(?:支出|怎麼編)/.test(t)||!/前期|去年|上年度|去年度|以前年度|前一年度|前年度|累計/.test(t)||!/結餘|賸餘|餘款|剩餘|剩下|餘絀/.test(t)||/合作社|社員|基金會|公會|工會|股東|解散|補助用途變更|免納所得稅場次|修章|章程變更|除名|改選|罷免|法院|核退|審核已退|審過不通過/.test(t))return null;
 const needReport=/決算/.test(t)&&/監事會|理事會|送縣府|交縣府|直接報|先(?:送|交|報)|審核/.test(t);
 const concrete=/明確|確定|是一般|是自有|來自|就是|屬於|前期有/.test(t)&&!/不確定|未確認|不明確|不知道/.test(t);
 const candidates=[
  concrete&&/準備基金/.test(t)&&!/不是準備基金/.test(t),
  concrete&&/補助|指定用途款/.test(t)&&!/不是補助/.test(t),
  concrete&&/自有結餘|一般結餘|自有資金/.test(t)&&!/不是自有/.test(t)
 ];
 const single=candidates.filter(Boolean).length===1;
 const [res,subsidy,self]=single?candidates:[false,false,false];
 const tag=(x)=>'協會今年編預算，前一年度剩下的明確是'+x+'，可以怎麼編？'+(needReport?'監事會都還沒開，決算可先交縣府嗎？':'');
 const main=needReport?'決算還沒走完審議，不能當已通過直接報備。 ':'';
 const s=res?'準備基金先經理事會通過才可動支，不能當成一般結餘。':subsidy?'補助或指定用途款不能自行變成今年一般預算；先核對來源、核定函及原有用途。':self?'自有結餘不是今年新增收入。據帳冊核對可用餘額，將今年支出列入今年預算並說明財源。':'先分去年剩下的是自有結餘、準備基金，還是補助／指定用途款；三者不能合併當今年收入或直接拿來用。';
 return {direct:true,category:'人民團體財務｜決算與以前年度結餘',title:'前期結餘與今年預算分開看，再確認錢的來源',summary:main+s,steps:[...(needReport?[report]:[]),...(res?[reserve]:subsidy?[grants]:self?[own]:[own,reserve,grants])],refs:[...sources,...(!self&&!res?[county]:[])],questionState:{focus:'compound'},...(!res&&!subsidy&&!self?{choiceHeading:'去年剩下的是哪種錢？',choices:[{label:'團體自有結餘',question:tag('團體自有結餘')},{label:'已提列準備基金',question:tag('已提列準備基金')},{label:'補助或指定用途款',question:tag('補助或指定用途款')}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationPriorBalance=route;
})(typeof window!=='undefined'?window:globalThis);
