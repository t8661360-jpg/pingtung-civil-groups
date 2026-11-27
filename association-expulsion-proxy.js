(function(root){
'use strict';
const act=(title,pcode,flno)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+flno});
const rules=[
 act('人民團體法第14、15、16、27、42條：除名、會員權利與委託','D0050091',14),
 act('人民團體會務輔導辦法第10條：會員名冊與大會出席','D0020094',10),
 act('民法第52條第4項：社團法人會員的利害迴避','B0000001',52)
];
rules[0].source='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091';
const trial=['先分清楚是已除名，還是只提案或口頭宣布','人民團體法第14及27條：有違反法令、章程或大會決議並嚴重危害團體的情形，仍須由大會依法成會、出席者三分之二以上同意才得除名。理事長或理事會單獨宣布，不等於大會已有效除名。'];
const after=['除名依法生效後，原委託書不能當作仍可代投的依據','依人民團體法第15及16條，依法決議除名者出會，已不具會員的表決權；第42條的委託不會讓已失去的權利繼續存在。不論先前有無簽委託書，不能以原會員名義自行投票或由人代投。'];
const before=['尚未生效時，先核對大會當天的會員資格和議案','仍是合法會員，且該議案有表決權時，因故不能到場可依第42條書面委託同團體其他會員（代表），每人限代理一人。依會務輔導辦法第10條查審定名冊與權利限制；不能只憑有人要提案就把會員一律排除。'];
const otherBefore=['仍是會員時：另一項修章案可依規定書面委託','另一項章程議案不是本人除名案。如果投該案時仍是會員且沒有適用的表決權限制，不能只因理事長說要除名就禁止。本人因故不能到場時，依人民團體法第42條可以書面委託同一協會另一位有資格的會員（代表），每人限代理一人。'];
const otherAfter=['如果議案順序變了：看輪到修章表決時的資格','不能只看開會前何時簽了委託書。若先由大會依法決議除名且已生效，等到修章表決時已失去會員資格，就不能用之前簽的委託書代投。若除名效力仍有爭議，先保留會議紀錄及委託書並核對，不自行推定有效、失效或重算票數。'];
const noticeRefs=[rules[0],rules[1],act('人民團體法第26條：大會召集通知','D0050091',26)];
const notice=['大會召集通知，不是除名結果通知','一般會員大會依人民團體法第26條十五日前通知應出席的會員。若該會員仍在依法審定的應出席名冊，不因只是被提案就逕行不通知。章程有通知、陳述意見或送達規定，依其適用內容辦理。'];
const resultNotice=['決議後，建議讓當事人收到書面結果','人民團體法第14、27條規範除名事由和決議，但沒有在這兩條指定一律用某種文書或郵寄方式通知結果。建議在會前說明事由與可陳述方式，會後將決議以書面通知本人並留存送達紀錄。依法有其他規定或章程有要求的，不能省略。'];
const ownVote=['如果就是在表決當事人自己的除名案，不要逕算他的票','代理人不能取得委託人本來就不能行使的權利。若是已辦理法人登記的協會，依民法第52條第4項，會員自身利害可能損害社團利益時，該會員不得表決，也不得代理他人表決。還要查章程、議案與實際資格；本答覆不自行判定個案該不該算票或定票數。'];
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>275||!/除名|開除會籍|取消會員資格/.test(t)||/合作社|信合社|工會|公會|農會|漁會|管委會|董監事|罷免|法院已|會員欠費退費/.test(t))return null;
 const proxy=/委託|代理|代.{0,6}(?:投票|表決|出席|開會)|替.{0,6}(?:投票|表決|出席)/.test(t);
 if(!proxy&&/(?:通知|告知|知會|寄).{0,6}(?:本人|當事人|被除名|會員)|(?:除名|本人|當事人).{0,10}(?:要通知|要告知|知會|寄通知|通知嗎|書面通知)/.test(t)&&!/縣府|主管機關|改章程/.test(t)){
  return {direct:true,category:'協會會務｜除名通知',title:'大會召集通知和除名結果通知要分開',summary:'若是一般協會，尚在應出席名冊上的會員，不能只因被提案除名就不發大會通知。會後應另按章程或適用規定通知決議。',steps:[notice,trial,resultNotice],refs:noticeRefs,questionState:{focus:'compound'}};
 }
 if(!proxy||!/大會|投票|表決|投(?:當天|另一)|代理投|委託票|先投/.test(t)||!/協會|社會團體|社區發展/.test(t))return null;
 const another=/另(?:一)?(?:個|項)?案.{0,12}(?:修章|修改章程|改章程|章程)|(?:修章|修改章程|改章程).{0,8}(?:另(?:一)?案|是另一件)|另一案.{0,8}表決/.test(t);
 const subject=/修章|修改章程|改章程|章程案/.test(t);
 if(subject&&!another)return null;
 if(another&&subject){
  const askOwn=/自己.{0,6}除名案|本人的除名案|除名案本來|除名案也能|除名案.*代理/.test(t);
  return {direct:true,category:'協會會務｜除名、修章與委託',title:'同場不同議案：先看輪到表決時他是不是會員',summary:'若修章案表決時他仍是會員且有該案表決權，可以依規定書面委託；若修章前除名已依法生效，原委託書不能再代投。',steps:[trial,otherBefore,otherAfter,...(askOwn?[ownVote]:[])],refs:askOwn?rules:rules.slice(0,2),questionState:{focus:'compound'}};
 }
 const undecided=/沒被除名|尚未.{0,6}(?:除名|決議|通過)|還沒.{0,6}(?:除名|決議|通過|表決)|(?:尚未|沒有|還沒)生效|單方面|理事長先.{0,6}(?:說|宣布)|只是提案|下次(?:要|才要).{0,5}(?:表決|處理).{0,5}除名|還沒開會/.test(t);
 const explicit=/(?:除名|開除會籍).{0,4}(?:已(?:經)?生效|確定生效)|依法.{0,8}決議.{0,6}除名|大會決議除名.{0,8}(?:已生效|已經生效|已出會)|已確定除名/.test(t);
 const disputed=/不確定|是否.{0,7}生效|撤銷除名|除名有爭議|對除名.{0,6}(?:異議|申訴)/.test(t);
 const known=explicit&&!undecided&&!disputed, pending=undecided&&!explicit&&!disputed;
 const own=/除名案|表決.{0,4}除名|除名.{0,5}(?:議案|決議前)|自己.{0,5}除名|本人的.{0,5}票/.test(t);
 const summary=known?'如果除名已依法生效，就不能再以會員身分投票；以前簽的委託書也不能代投。':pending?'只提案或理事長單方面宣布，不等於會員已被除名。能否委託，要看大會當天資格及這一個議案有沒有表決權。':'先確認除名是否已由大會依法決議且生效。已生效不能再委託代投；如果還沒生效，先核對會員資格與議案。';
 return {direct:true,category:'協會會務｜除名、表決與委託',title:'除名已生效，不能靠委託書繼續投票',summary,steps:[trial,...(known?[after]:pending?[before]:[after,before]),...(own&&!known?[ownVote]:[])],refs:own&&!known?rules:rules.slice(0,2),questionState:{focus:'compound'},...(!known&&!pending&&!disputed?{
 choiceHeading:'這位會員目前是哪一種情況？',choices:[
  {label:'大會已依法決議，除名已生效',question:raw+' 這位會員已由大會依法決議除名，而且除名已經生效。'},
  {label:'尚未決議除名',question:raw+' 目前只有提案，尚未決議除名。'}
 ]}: {})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationExpulsionProxy=route;
})(typeof window!=='undefined'?window:globalThis);
