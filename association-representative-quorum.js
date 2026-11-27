(function(root){
'use strict';
const ref=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>ref('人民團體法','D0050091',n),g=n=>ref('人民團體會務輔導辦法','D0020094',n);
const general={direct:true,category:'協會會務｜會員或代表出席門檻',questionState:{focus:'compound'}};
const basis=['先確定是誰有資格參加這場大會','一般協會依法召開會員代表大會時，以審定具資格、應出席的會員代表計算過半，不用全體會員當分母；若開的是全體會員大會，則用審定具應出席資格的會員。過半不是剛好一半。先核對章程、合法的代表產生程序、會議通知及審定名冊。'];
const formats=[{label:'會員代表大會',question:'一般協會依法召開會員代表大會，成會是算會員代表幾人？'},{label:'全體會員大會',question:'一般協會確定開全體會員大會，不是代表大會，成會是算誰過半？'}];
function read(t,pattern){const v=t.match(pattern);return v?Number(v[1]):null;}
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>235||!/協會|社會團體|人民團體/.test(t)||/合作社|社員|公會|工會|農會|漁會|股東|基金會|管委會|社團法人|法人登記|成立大會|改選|選舉|罷免|除名|臨時大會|監事會/.test(t))return null;
 const literalRep=/會員代表大會/.test(t);
 const topics=/成會|過半|應出席|應到|出席人數|幾(?:個)?人.{0,5}(?:開會|成會)|算誰/.test(t);
 if(!topics||(!literalRep&&!/會員代表/.test(t)&&!/(?:全體會員大會|正式會員大會).{0,12}代表大會/.test(t)))return null;
 const all=/全體會員大會[，,]?不是代表大會|確定開全體會員大會|開全體會員大會而非代表大會/.test(t);
 const both=!all&&/全體會員.{0,5}(?:過半|算)|全體會員還是|全體會員或|會員過半還是/.test(t)&&/會員代表/.test(t);
 const gross=/全體會員.+(?:名冊未審|人數沒確定)/.test(t)?null:read(t,/(?:應到|應出席(?:人數)?(?:為|有)?)\s*(\d{1,4})(?:位|人|名)/);
 const physical=read(t,/(?:實到|親自出席(?:人數)?(?:為|有)?|本人到場)\s*(\d{1,4})(?:位|人|名)/);
 const proxy=read(t,/(\d{1,4})(?:張|份|位|人)(?:合法|有效|依法)委託/);
 const partial=/離席|退場|開到一半|先走/.test(t);
 const amend=/修章|修(?:正|改)章程|改章程/.test(t);
 const actualAfter=read(t,/(?:正式清查後確認(?:含有效代理)?(?:應計的)?出席(?:為|有)?|清查結果確認(?:含有效代理)?(?:應計的)?出席(?:為|有)?)\s*(\d{1,4})(?:位|人|名)/);
 const noCheck=/沒有正式清查|沒有提出清查|沒有清查出席|未經正式清查/.test(t);
 if(literalRep&&partial&&amend){
  const minimum=gross&&Math.floor(gross/2)+1;
  const startCount=minimum&&physical!==null&&proxy!==null&&proxy<=physical&&physical+proxy<=gross?physical+proxy:null;
  const current=minimum&&actualAfter!==null&&actualAfter<=gross?actualAfter:null;
  const number=startCount===null?'先核對審定名冊、會議開始時實際簽到及合法委託，不能把重複代理或未報到的人算進去。':('應到'+gross+'位，開會門檻至少'+minimum+'位。若'+physical+'位親自出席，另有'+proxy+'份有效代理且對應不同缺席代表，開會時可算'+startCount+'位，'+(startCount>=minimum?'達到成會門檻。':'未達成會門檻。'));
  const state=current!==null?(current<minimum?'依您說的正式清查結果，有效出席'+current+'位，少於'+minimum+'位，主席應立即宣布散會，不能再表決修章。':'若開始時已合法成會，且正式清查後有效出席為'+current+'位，仍達'+minimum+'位門檻；依人民團體法第27條，修章須當時出席者三分之二以上同意，這組數字至少'+Math.ceil(current*2/3)+'票。'):noCheck?'尚無依法確認的清查結果，先核對當時出席、代理有無變動及會議紀錄；不能只憑離席一詞斷言整場無效，也不能用開會時數字保證之後的修章表決有效。':'已知有人離席，但沒有正式清查結果，不能只用開會當下的人數保證仍可表決。先查是否有清查動議及有效出席數。';
  const choices=current===null&&!noCheck&&raw.length<175?[{label:'沒有正式清查',question:'沒有正式清查。'+raw},{label:'已清查，還沒提供人數',question:'已提出清查動議並依規定清查，未提供有效人數。'+raw}]:[];
  if(/未提供有效人數/.test(t))choices.length=0;
  return {...general,title:'成會看應出席代表過半；有人離席後，修章另看清查及票數',summary:number+' '+state,steps:[basis,['合法委託與成會人數要核對','依人民團體法第42條，具資格的代表可以書面委託其他代表，每位只能代理一人；確認有效、受託人實際出席，避免重複計算。'],['有人離席，依會務輔導辦法第16條處理','出席起初按簽到或報到。有人提出清查動議，主席須交現場表決，較多數同意後才清點；低於應出席代表過半即宣布散會。'+(/未提供有效人數/.test(t)?'請補上正式清查後確認的有效出席（含仍有效的代理）人數，不要提供姓名。可回答：「協會會員代表大會應到'+(gross??'幾')+'位，有人離席，正式清查後確認含有效代理出席為幾位，能修章嗎？」':'' )],['修章同意票與成會是兩道門檻','會議依法成會後，依第27條須有出席人數三分之二以上同意；不能只看普通議案過半，也不把這個數字套到另有規定的法人或其他團體。']],refs:[p(27),p(42),g(10),g(16)],...(choices.length?{choiceHeading:'當時有沒有依法清查出席人數？',choices}:{})};
 }
 const unknown=!all&&(!literalRep||both);
 const summary=all?'全體會員大會，依審定名冊上應出席的會員計算，須過半出席。':unknown?'若是合法召開的會員代表大會，算應出席的會員代表過半；若是全體會員大會，則算應出席的會員過半。':'合法召開會員代表大會，應以審定名冊上應出席的會員代表計算過半，不以全體會員算。'+(gross?'應到'+gross+'位，至少要'+(Math.floor(gross/2)+1)+'位有效出席。':'');
 return {...general,title:unknown?'算會員還是會員代表？先確認大會形式':all?'全體會員大會：以應出席會員過半成會':'會員代表大會：以應出席代表過半成會',summary,steps:[basis],refs:[p(27),p(28),g(10),g(16)],...(unknown?{choiceHeading:'請選這次大會的形式',choices:formats}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationRepresentativeQuorum=route;
})(typeof window!=='undefined'?window:globalThis);
