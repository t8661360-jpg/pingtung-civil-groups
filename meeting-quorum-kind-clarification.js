(function(root){
'use strict';
const p=n=>({title:'人民團體法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno='+n});
const h=n=>({title:'人民團體會務輔導辦法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno='+n});
const c=n=>({title:'合作社法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050112&flno='+n});
const boardSource={title:'內政部：人民團體法第29條出席基準函釋',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256686&sms=12360'};
const names={assembly:'會員大會',board:'理事會',audit:'監事會',joint:'理監事聯席會議',coopAssembly:'社員大會',coopJoint:'社務會',coopBoard:'理事會',coopAudit:'監事會'};
const electionAttendance={title:'人民團體選舉罷免辦法第20條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050093&flno=20'};
function attendanceMethod(t){
 const question=/法定人數|開會.{0,5}算|人數.{0,8}(?:算|夠|過半)|現場.{0,6}人數|在場.{0,5}人數|出席.{0,6}(?:人數|算)|算.{0,6}出席|成會/.test(t);
 const sign=/簽到|簽名|報到/.test(t),live=/現場|當時|在場|還在|離席|中途離開|退席|離開|走了|清點|清查/.test(t);
 if(!question||!sign||!live||/合作社|社員|工會|公會|農會|漁會|管委會|公寓大廈|董事會|股東|財團法人|政黨|選舉人名冊|名冊.{0,7}(?:可看|影印)|停權|退會|除名|委託|代理|假簽到|代簽|沒有簽到|預算|通知|重開|已通過.{0,8}效力|決議.{0,6}(?:有效|撤銷)|只剩[0-9]|應到[0-9]|實到[0-9]/.test(t))return null;
 const election=/改選|選舉|罷免|投選票/.test(t);
 const steps=[['開始先看合資格的簽到或報到','依'+(election?'人民團體選舉罷免辦法第20條':'人民團體會務輔導辦法第16條')+'，出席人數以簽到或報到計算。應出席名冊是分母，簽到或報到是出席紀錄；不是所有在場來賓都算。要算最低幾人，還要知道會議是哪一種及應出席人數。'],
  ['如有人離席，可提出清查動議','由出席人員提出清查，主席交付現場出席者表決，通過後清點仍在場的出席者。'+(election?'選舉或罷免依第20條，須經現場出席人員多數表決通過才清點。':'一般會議依第16條，以表決人數較多數同意後清點。')+'清查後達不到法定成會人數，主席應即宣布散會。簽到不代表離場者在後面的議案已投票。']];
 if(!election)steps.push(['如果問的是選舉或罷免','另依人民團體選舉罷免辦法第20條；同樣以簽到或報到計出席，清查動議交由現場出席人員多數表決，通過才清點；清查不足法定人數要散會。其他類型團體則另看適用法規。']);
 return {direct:true,category:'人民團體會務｜簽到與現場清查',title:'開會先按簽到或報到；依法清查時數現場出席者',
  summary:(election?'一般人民團體的選舉或罷免：':'以一般人民團體會議為例，')+'開始以簽到或報到算出席。若提出清查動議並依程序通過，改清點現場出席者；清查不足即散會。',steps,refs:election?[electionAttendance]:[h(16),electionAttendance],questionState:{focus:'compound'}};
}
function scope(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 const method=t.length<=190?attendanceMethod(t):null;
 if(method)return method;
 if(!t||t.length>190||!/開會|大會|議會|會議|理事會|監事會|社務會/.test(t)||!/多少人|幾個人|幾人|要幾位|出席.{0,7}(?:門檻|才|數)|(?:才|能不能).{0,5}(?:開會|成會)|成會門檻|出席門檻|法定人數|人數.{0,5}(?:一樣|不同|怎麼算|怎樣算)/.test(t))return null;
 // "理事長一人能不能決定開會" asks authority, not how many attendees.
 if(/理事長|會長|監事會召集人|常務監事/.test(t)&&/決定|說了算|想開才開|拒絕|不肯|不願|不想|擅自/.test(t)&&!/多少人|幾個人|幾人|要幾位|人數|應到|實到|出席|成會門檻/.test(t))return null;
 if(/農會|漁會|工商|同業公會|工會|職業團體|財團法人|信用合作社|公寓大廈|管委會|選舉|改選|罷免|補選|除名|欠繳|流會|清查|走了|退席|離席|缺額|出缺|辭職|職權|只剩|剩下|預算|報表|財報|財務報告/.test(t))return null;
 const coop=/合作社|社員大會|社務會/.test(t);
 const crossJoint=coop&&/社務會/.test(t)&&/(?:協會|人民團體|社會團體)/.test(t)&&/理監事(?:會)?聯席|理事會、監事會聯席/.test(t)&&/一樣|不同|分別|各要|差別|差在哪|比較/.test(t);
 const social=/一般協會|社會團體|社區發展協會|協會|社團/.test(t);
 if(coop&&social&&!crossJoint)return null; // Do not infer which organization owns an unqualified board or count.
 const one=(rule)=>{const hits=[...t.matchAll(rule)];return hits.length===1?Number(hits[0][1]):null;};
 const total=one(/(?:應到|應出席|應出席人數(?:是|為)?)([0-9]{1,5})(?:個)?(?:人|位|名)/g);
 const actual=one(/(?:實到|實際出席(?:人數(?:是|為)?)?|已到)([0-9]{1,5})(?:個)?(?:人|位|名)/g);
 const values=total>0&&actual!==null&&actual<=total?{total,actual}:null;
 const unclear=/分不清|不知道|不確定|是不是|搞不清楚|還是|或是|要選哪|哪種/.test(t);
 const separate=/分別|各要|各自|兩種都|兩個都|三種都|有哪些差別|有什麼不同|差在哪|比較/.test(t);
 const body=t.replace(/(?:理事會、監事會)?聯席會議|理監事(?:會)?聯席(?:會議)?/g,'聯席').replace(/理監事會議|理監事會/g,'理監並稱');
 const kinds=[];
 if(/會員(?:代表)?大會/.test(body))kinds.push('assembly');
 if(!kinds.length&&!coop&&/(?:解散|臨時|定期|常年|年度)大會/.test(body))kinds.push('assembly'); // 第237輪：「解散大會」就是會員大會
 if(/社員(?:代表)?大會/.test(body))kinds.push('coopAssembly');
 if(/社務會/.test(body))kinds.push('coopJoint');
 if(/(?:理事會|理監並稱)/.test(body))kinds.push(coop?'coopBoard':'board');
 if(/(?:監事會|理監並稱)/.test(body))kinds.push(coop?'coopAudit':'audit');
 if(/聯席/.test(body))kinds.push('joint');
 if(/會員代表大會|社員代表大會/.test(t)&&/社團法人/.test(t))return null;
 const compare=crossJoint||separate&&kinds.length>1&&(coop||social);
 const choose=!compare&&(unclear||!kinds.length||/理監並稱/.test(body));
 if(!choose&&!compare&&!/^(?:一般協會|合作社)的(?:會員大會|社員大會|理事會|監事會|理監事聯席會議|社務會)至少要多少人出席才成會/.test(t))return null;
 const talk=()=>({direct:true,category:'會務｜出席門檻分流',questionState:{focus:'compound'}});
 const numbers=values?'已提供應到'+total+'人、實到'+actual+'人；選定會議後，如這兩個數字確實是該會議的合資格人數，可直接試算。':'要算實際人數，再補應到與實到。';
 const suffix=(k)=>!values||k==='joint'?'':'本次若應到'+total+'人、實到'+actual+'人，是否達到一般出席門檻？';
 const kindChoice=(k)=>({label:names[k],question:(k.startsWith('coop')?'合作社':'一般協會')+'的'+names[k]+'至少要多少人出席才成會？'+suffix(k)});
 if(choose){
  const list=coop?['coopAssembly','coopBoard','coopAudit','coopJoint']:['assembly','board','audit','joint'];
  return {...talk(),title:'先確認會議是哪一種，再算出席人數',summary:coop?'社員大會、理事會、監事會和社務會的「應出席人員」不是同一批人。請先看開會通知的會議名稱。':'會員大會算會員（或會員代表）；理事會算理事；監事會算監事。幾個人能開會要先看是哪種會議，不能把理事、監事和會員混在一起算。',steps:[['怎麼辨認','看正式通知、議程或查應出席名冊。寫「理監事會」不一定是聯席，請確認是各自開會或正式理監事聯席。選好後即可看門檻。'+numbers+'不用先提供開會日期或姓名。']],refs:coop?[c(48),c(52),c(53),c(54)]:[p(27),p(29),h(10),h(11),h(16)],choiceHeading:coop?'合作社要開的是哪一種會議？':'請先選會議類型（下列為一般協會）',choices:[...list.map(kindChoice),...(!coop&&!social?[{label:'我是合作社',question:'合作社開會要多少人出席？我不確定是哪種會議。'+suffix('coopAssembly')}]:[]) ]};
 }
 const facts={
  assembly:[['會員（或會員代表）大會：以具應出席資格者為分母','依第27條，須有應出席會員或會員代表過半數出席。一般決議由出席人數過半數或較多數同意，修章等重大事項一般是出席人數三分之二以上同意。普通社會團體第42條的書面代理限大會，每人最多代理一人，不可套用到理事會或監事會。另有特別規定時從其規定。'],[p(27),p(42),h(10),h(16)]],
  board:[['理事會：只算理事','依第29條，須理事過半數出席，決議以出席理事過半數或較多數同意。候補理事可受邀列席，尚未遞補不能當理事出席或投票；監事及一般會員出席也不列入理事人數。'],[p(29),h(11),h(16),boardSource]],
  audit:[['監事會：只算監事','依第29條，須監事過半數出席，決議以出席監事過半數或較多數同意。候補監事可受邀列席，尚未遞補不能當監事出席或投票；理事及一般會員出席也不列入監事人數。'],[p(29),h(11),h(16),boardSource]],
  joint:[['理監事聯席會議：兩邊分開，各要過半','依會務輔導辦法第11條，理事與監事各過半數出席；決議也分組看。不能把兩組出席人數加起來才過半，也不能以一邊的人數彌補另一邊不足。'],[h(11),h(16)]],
  coopAssembly:[['合作社社員大會：算全體社員','合作社法第48條，一般事項須有全體社員過半數出席、出席社員過半數同意。解散或合併等特別事項另有更高門檻，不能套普通協會第27條。'],[c(48),c(55)]],
  coopBoard:[['合作社理事會：只算理事','合作社法第53條，須有理事過半數出席，決議須出席理事過半數同意。不是監事到場就能湊人數。'],[c(53)]],
  coopAudit:[['合作社監事會：只算監事','合作社法第54條準用第53條，須有監事過半數出席，並由出席監事過半數同意。'],[c(53),c(54)]],
  coopJoint:[['合作社社務會：全體理事和監事合計','合作社法第52條，須有全體理事、監事三分之二出席，出席理事、監事過半數同意。這不是一般協會的理監事聯席會議，後者理事、監事各自計算。'],[c(52),h(11)]]
 };
 const chosen=crossJoint?['joint','coopJoint']:kinds.filter(k=>facts[k]);if(!chosen.length)return null;
 const k=chosen[0];
 const n=k==='coopJoint'?Math.ceil(total*2/3):Math.floor(total/2)+1;
 const count=!compare&&values&&k!=='joint'?['依你提供的人數試算','若應到'+total+'人、實到'+actual+'人都是這場'+names[k]+'依法應計的人數，通常至少'+n+'人才達出席門檻；實到'+actual+'人'+(actual>=n?'已達':'未達')+'一般出席門檻。這是出席人數的試算，不代表選舉、特別決議或召集程序已合法。']:null;
 return {...talk(),title:compare?'各種會議出席門檻分開看':facts[k][0][0],summary:compare?'您問到不同會議，分別列出出席基準與決議門檻。':facts[k][0][1],steps:compare?[...chosen.map(k=>facts[k][0]),...(crossJoint&&/場地|公所|轉借/.test(t)?[['場地能否轉借是另一件事','會議人數達標並不代表可以把場地轉借。請先看公所原核准的使用對象、用途和場地管理規定；未確認同意前，不要假定可以轉借。']]:[])]:count?[count]:[],notes:['要算實際最低出席數，請提供該種會議的應出席人數。理監事聯席請把理事、監事人數分開；不用提供姓名。'],refs:[...new Map(chosen.flatMap(k=>facts[k][1]).map(x=>[x.source,x])).values()]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={scope};return;}
root.verifiedMeetingQuorumKind=scope;
})(typeof window!=='undefined'?window:globalThis);
