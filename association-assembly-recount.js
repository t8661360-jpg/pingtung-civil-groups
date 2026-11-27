(function(root){
'use strict';
const act=(title,pcode,flno)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+flno});
const refs={
 meeting:act('人民團體會務輔導辦法第16條：會議成數與清查','D0020094',16),
 vote:act('人民團體法第27條：大會出席與特別決議','D0050091',27),
 election:act('人民團體選舉罷免辦法第20條：選務清查與散會','D0050093',20),
 succession:act('人民團體選舉罷免辦法第17條：遞補與補選','D0050093',17),
 minutes:act('人民團體會務輔導辦法第12條：大會紀錄備查','D0020094',12)
};
const num='[0-9零〇一二兩三四五六七八九十百千]{1,8}';
const digits={零:0,〇:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10,百:100,千:1000};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'').replace(/(?<=\d),(?=\d{3}(?!\d))/g,'');
function number(s){
 if(!s)return null;
 if(/^\d+$/.test(s)){const a=Number(s);return a>=0&&a<=1000000?a:null;}
 if(/[0-9]/.test(s))return null;
 if(/[百千][一二兩三四五六七八九]$/.test(s))return null; // colloquial shortcut: e.g. 一百二 may mean 102 or 120
 if(!/[十百千]/.test(s)){const a=Number([...s].map(ch=>digits[ch]).join(''));return a<=1000000?a:null;}
 let n=0,tail=null;
 for(const ch of s){
  const v=digits[ch]; if(v>=10){n+=(tail??1)*v;tail=null;}else{tail=v;}
 }
 return n+(tail??0);
}
function field(t,patterns){
 for(const p of patterns){const r=t.match(new RegExp(p.replaceAll('<n>','('+num+')')))?.[1];const a=number(r);if(a!==null)return a;}
 return null;
}
function rawCounts(t){
 const total=field(t,['(?:應出席|應到|應出席總人數|核定應到)(?:人數)?(?:是|為|有|共|[:：])?<n>(?:個|位|人|名)?','<n>(?:個|位|人|名)?(?:人)?(?:應出席|應到)']);
 const sign=field(t,['(?:原先|最早|開會時|本來)?簽到(?:人數)?(?:是|有|共|[:：])?<n>(?:個|位|人|名)?','報到(?:人數)?(?:是|有|共|[:：])?<n>(?:個|位|人|名)?','<n>(?:個|位|人|名)?(?:人)?簽到']);
 const now=field(t,['(?:依法)?(?:重新)?(?:清查|清點|重新點)(?:後)?(?:結果)?(?:在場|實到|只剩|剩下|剩|還有|為|是|有|共|[:：]){0,3}<n>(?:個|位|人|名)?','(?:後來|如今|重新)?(?:只剩|在場|實到|剩下)(?:只|僅|有|是|為|[:：])?<n>(?:個|位|人|名)?','<n>(?:個|位|人|名)在場']);
 return {total,sign,now};
}
function counts(t){
 return t.split('補充:').reduce((old,chunk)=>{
  const next=rawCounts(chunk);return {total:next.total??old.total,sign:next.sign??old.sign,now:next.now??old.now};
 },{total:null,sign:null,now:null});
}
const numericText=new RegExp('^(?:(?:補充|法定|現在|開會當時|原簽到|原本|有|是|為|共|正好|只|還|當場|重查|重新|已清查|清查|清點|後|結果|剩下|只剩|在場|簽到|應到|應出席|實到|人數|人|位|名|個|[，,；;、。:：])|'+num.replace("{1,8}","")+')+$');
function isCountReply(q){
 const t=norm(q);
 return t.length>0&&t.length<=63&&new RegExp(num).test(t)&&/應到|應出席|清點|清查|只剩|在場|實到|簽到/.test(t)&&numericText.test(t);
}
const general=['先分清應到名冊、簽到與合法清點','依會務輔導辦法第16條，應到人數按依法確定的名冊及資格，不因會中離席或請假就改少；開會的出席人數通常以簽到或報到計。出席者提出清查出席人數動議後，由主席交付現場表決，通過才清點在場人數；選舉或罷免另按人民團體選罷辦法第20條。'];
const notPassed=['若清查動議沒有通過','未通過清查動議，不能把口頭估計的剩餘在場人數直接當作依法清查結果，也不因有人離席就必然散會。依簽到或報到及合法委託先核開會基準與現場程序、把動議經過寫入紀錄；若成會或表決有爭議，記載異議並查證，不保證後續決議當然有效。下一次清查動議若依法通過，再按結果辦。'];
const short=['清查後不足，主席應立即宣布散會','這場不能再表決除名、修章或做補選，不能等幾位回來後在同一已應散會的會議補票；未完成事項須擇日依法召集。先前已依程序完成表決的議案，不因後來離席就一律自動無效，請分開審核涉及異議的案子。'];
const qualified=['仍成會時，除名和修章各算自己的同意票','依人民團體法第27條，除名和修章分別要依法計算的出席者三分之二以上同意；除名仍要符合事由及章程。不能把兩案合算，也不能把三分之二當作補選的當選門檻。'];
const filling=['補選之前先分遞補和選舉','理事、監事確有出缺，原則先按順序遞補具資格的候補；依選罷辦法第17條，遞補後未達章程所定名額三分之二，才依該條補選足額。實際補選依選務程序和議程，不用修章、除名的同意比例替代。'];
const recording=['紀錄如實寫下清查與未表決事項','記原始應到、簽到、清查動議及結果、主席何時宣布散會、哪些議案已處理或未表決。依會務輔導辦法第12條，大會紀錄閉會後30日內報主管機關備查並自行留存；不是補做簽到或把沒投的案子記成通過。'];
function route(q){
 const raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>340||!/協會|社會團體|人民團體/.test(t)||!/會員(?:[（(]?代表[）)]?)?大會|會員代表會議|協會.{0,6}大會/.test(t)||/不是會員大會|不是大會|理事會不是|合作社|信合社|公會|工會|農會|漁會|管委會|校務/.test(t))return null;
 if(!/先離席|離席|離場|清點|清查|重新點人|中途走/.test(t)||!/應到|人數|表決|投票|修章|除名|補選|紀錄|出席|候補|人數/.test(t))return null;
 const suffix=t.match(/清查狀態確認:(已依法通過並清點|尚未依法通過)/)?.[1];
 const denied=suffix==='尚未依法通過'||(!suffix&&/動議.{0,9}(?:沒有通過|沒過|沒通過|未通過|被否決)|尚未.{0,6}(?:通過清查|通過清點|清查表決)|沒(?:有)?通過.{0,7}(?:動議|清查)|沒有.{0,6}(?:清查|清點)動議/.test(t));
 const pass=suffix==='已依法通過並清點'||(!denied&&/依法(?:重新|再次|再|已經?|當場)?(?:清查|清點)(?:後|只剩|結果|剩下|在場)|已依法(?:清查|清點)|(?:清點|清查).{0,7}動議.{0,7}(?:已通過|有通過|通過了|通過後|通過並)|通過.{0,5}(?:清點|清查)動議|動議通過後.{0,5}(?:清點|清查)/.test(t));
 const c=counts(t);const valid=c.total!==null&&c.total>0&&c.now!==null&&c.now<=c.total;
 const min=c.total&&Math.floor(c.total/2)+1;
 const missing=pass&&!valid;
 const qShort=valid&&pass&&c.now<min;
 const amendments=/除名|修章|改章程|修改章程/.test(t), election=/補選|候補|遞補|選舉/.test(t), minutes=/紀錄|記錄|備查|報縣府/.test(t);
 const head=qShort?'依法清點後在場不足，這場大會要散會':valid&&pass?'依法清點後仍過半，才可依各議案規則往下辦':denied?'清查動議沒通過，不等於已重新計算':'先確認清查動議與出席人數，再決定是否繼續';
 const data=pass&&valid?['依你提供的清點結果','應到'+c.total+'人，過半至少'+min+'人；依法清查後有'+c.now+'人在場。'+(qShort?'未達成會人數。':'仍達成會門檻。'+(amendments?'若此次依法以'+c.now+'人計出席，除名及修章各至少需'+Math.ceil(c.now*2/3)+'票同意。':''))]:null;
 const summary=qShort?('清查後只剩'+c.now+'人，少於門檻'+min+'人，主席應宣布散會。這場不能再補票、表決除名或修章，也不能接著補選。'):valid&&pass?('清查後'+c.now+'人達'+min+'人的門檻；不同議案各照自己的表決或選務規則。'):denied?'未依法通過清查動議時，別把離席人數直接從應到名冊或法定成會基準扣掉。':'是否可繼續，要看是否已依法通過清查、清點後仍有多少人在場。';
 const choices=!pass&&!denied&&raw.length<=245?[
  {label:'已依法通過動議並清點',question:raw+'；清查狀態確認：已依法通過並清點。'},
  {label:'未通過清查動議',question:raw+'；清查狀態確認：尚未依法通過。'}
 ]:[];
 const need=missing?[['只補沒給的清查數字','請'+(c.total===null?'補核定應到人數':'保留已知的應到'+c.total+'人')+'，以及'+(c.now===null||(c.total!==null&&c.now>c.total)?'按合法程序清點後的在場人數':'已知清點後'+c.now+'人在場')+'。例如「應到100人，清查後49人」；如已提供其中一個，只補另一個即可。']]:[];
 return {direct:true,category:'協會大會｜離席、成會與各議案',title:head,summary,steps:[general,...(data?[data]:[]),...(qShort?[short]:[]),...(denied?[notPassed]:[]),...(!qShort&&amendments?[qualified]:[]),...(!qShort&&election?[filling]:[]),...(minutes?[recording]:[]),...need],
 refs:[refs.meeting,refs.vote,...(election?[refs.election,refs.succession]:[]),...(minutes?[refs.minutes]:[])],questionState:{focus:'compound'},followQuorumCounts:missing,...(choices.length?{choiceHeading:'清查出席人數的動議，有依法通過嗎？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route,counts,isCountReply};return;}
root.verifiedAssociationAssemblyRecount=route;
root.isAssemblyRecountReply=isCountReply;
})(typeof window!=='undefined'?window:globalThis);
