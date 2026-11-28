(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n), e=n=>law('人民團體選舉罷免辦法','D0050093',n), c=n=>law('合作社選舉罷免辦法','D0050022',n);
const interpretation={title:'內政部：團體會員指派代表與當選理監事的身分',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256747'};
const charter={title:'司法院釋字第733號理由：社會團體章程得另定職員選任方式',source:'https://cons.judicial.gov.tw/docdata.aspx?fid=100&id=310914'};
const rootDeath=/過世|去世|身故|死亡|往生|逝世|死了|不在了/;
function route(q){
 const raw=String(q??'').trim(), t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>435||!rootDeath.test(t)||/信用合作社|信合社|保險合作社|工業公會|商業公會|商業同業公會|職業公會|工會|農會|漁會|祭祀公業|神明會/.test(t))return null;
 const negCoop=/不是(?:一般)?合作社|非合作社/.test(t);
 const coop=!negCoop&&/合作社/.test(t)&&!/協會|社會團體/.test(t);
 if(coop){
  if(!/理事(?:會)?主席|監事(?:會)?主席/.test(t)||!/補選|改選|重選|誰選|當選|社員大會|社員代表大會|出缺|一個月/.test(t))return null;
  return {direct:true,category:'一般合作社｜主席出缺及補選',title:/監事(?:會)?主席/.test(t)&&!/理事(?:會)?主席/.test(t)?'合作社監事會主席出缺：由監事會補選，不是社員大會':'合作社理事會主席出缺：由理事會補選，不是社員大會',summary:'一般合作社要用自己的合作社選舉罷免辦法。主席出缺原則上也是一個月內補選，但不是套用人民團體理事長的補選規定。',steps:[
    ['誰補選','依合作社選舉罷免辦法第6、7條，理事會主席由理事互選，監事會主席由監事互選。主席出缺，自出缺日起一個月內分別召開理事會或監事會補選；所遺任期未滿六個月，得由相應理事或監事互推一人代理。'],
    ['主席與一般席次要分開','若同時少了一名理事或監事，席次應先由各自候補依序遞補，未達章程名額半數才召開社員大會或社員代表大會補選，與主席互選是兩件事。信用合作社另有規定。']
   ],refs:[c(6),c(7)],questionState:{focus:'compound',domain:'member-death-election'}};
 }
 const hadOrg=/協會|社會團體|社團法人/.test(t), roleMember=/會員|會籍|社員|代表/.test(t), roleBoard=/理事|監事/.test(t);
 const hasElect=/投票|選票|選理事|選舉|代投|投理事|代表.{0,6}投|出席|分母|名冊|委託書/.test(t);
 const fees=/會費|墊款|欠.{0,4}費|借款|收據|債務|債權/.test(t);
 const corporate=/團體會員|(?:公司|法人|行號).{0,10}(?:推|指|派|是會員)|(?:會員|原會員).{0,8}是公司|公司派|團體.{0,7}指派代表/.test(t);
 const explicitPerson=/個人會員|自然人會員|老會員|爸爸|父親|母親/.test(t);
 const vacancy=roleBoard&&/出缺|缺額|候補|遞補|補選|接席次|理事席次|選理事長|重選理事長|再改選|已沒有候補/.test(t);
 if((!hadOrg&&!roleMember&&!roleBoard)||(!hasElect&&!fees&&!vacancy)||(!hadOrg&&!explicitPerson&&!corporate&&!vacancy))return null;
 if(!negCoop&&/合作社/.test(t)&&hadOrg)return null;
 const force=/；身分確認：/.test(raw);
 const unsure=!force&&(/分不清|不確定|不知道|還不知道|還是公司|還是團體|哪一種|不清楚/.test(t));
 const memberCompare=unsure&&roleMember&&/個人會員|公司派|團體會員|會籍/.test(t)&&!vacancy;
 const chairUnknown=vacancy&&/不知道是不是理事長|不確定是不是理事長|不知道有沒有兼理事長|只是理事還是理事長/.test(t)&&!/；職位確認：/.test(raw);
 const knownChair=/職位確認:理事長也出缺|(?:原|原任|原本的|本會)(?:理事長|會長).{0,12}(?:過世|去世|身故|死亡)|理事長(?:本人|也)?(?:過世|去世|身故|死亡)|理事長(?:已|也)出缺|理事長同時是理事/.test(t);
 const notChair=/職位確認:只缺一般理事|普通理事|一般理事|理事長仍|理事長還在|不是理事長/.test(t)&&!knownChair;
 const linkedCorporate=force?/身分確認:團體會員指派代表/.test(t):corporate&&!memberCompare;
 const knownPerson=force?/身分確認:個人會員/.test(t):!linkedCorporate&&!memberCompare;
 const lateRoster=/明天|明日|後天|今天才|未(?:在|列)|十五天前|15天前|十五日前|舊名冊|名冊.{0,7}(?:舊|已寄)|新.{0,3}人.{0,8}名冊/.test(t);
 const halfYear=/剛好六個月|正好六個月|剛好半年|正好半年|剛好6個月/.test(t);
 const noAlternate=/候補(?:已|都)?(?:用完|沒有|空了)|沒有候補|無候補|候補已補齊|候補遞補後/.test(t);
 const steps=[], refs=[p(12),p(13),p(15),p(16)];
 if(knownPerson||memberCompare)steps.push(['個人會員過世：出會，不是把名冊換成家屬','依人民團體法第15條，死亡即出會，不必投票除名。繼承人不能接會籍、理事席次或票，想入會應依章程另行申請。舊委託書不能替已出會者投票；家人若原本就是合法會員，可以行使本人的權利，不是多一票。']);
 if(linkedCorporate||memberCompare){steps.push(['團體會員還在：公司可依法改派，不是親屬接替','若會員本身是公司，原代表過世不等於公司出會，公司可依章程正式改派、交付合法改派文件。親屬不能繼承代表權；新代表即使取得公司會員的代表權，也不會自動接替已當選的理事、監事席次。']);refs.push(interpretation);}
 if(hasElect){
  const timing=linkedCorporate||memberCompare?('若辦理理監事或會員代表之選舉、罷免，依選舉罷免辦法第5條，要在會議十五日前審定身分並造具名冊；若只是一般議事，仍按章程確認合法代表。'+(lateRoster?'你提到已臨時改派或名冊是舊的，先保留原名冊及改派證明、請協會選務與原主管機關核對。不能保證新代表這次可投，也不能拿原代表名義發票。':'')):'先核對死亡時點、原名冊與選務資格。若在會員大會前已出會，不再把其列為有效會員或計入應出席人數分母。保留原名冊和更正依據，不把原人名直接換成家屬；若早已投票或正在爭議，不自行回填或改票，先核對主管機關。';
  steps.push(['名冊與選票：區分正式改派和舊名義',timing]);refs.push(e(5),e(6),p(27));}
 if(fees){steps.push(['會費與墊款：一筆可能是債務，一筆可能是債權','先依章程、會費決議和繳款紀錄，確認過世前是否已發生會費債務；不要把後來會費算給家屬。墊款應核對支出是否經授權、收據與金流，辨別確實的墊款債權和捐贈。財產上的權利義務依法進遺產，繼承人就其債務以所得遺產為限清償，不能因親屬身分逕要求代付，也不能拿錢換會籍或選票。']);refs.push(law('民法','B0000001',1148));}
 if(vacancy){
  steps.push(['一般席次空缺：候補遞補後再計人數', (noAlternate?'你提到候補已用完或無候補可用時，直接用仍在任人數核對章程名額。':'先由候補理事、候補監事在各自職別依序遞補。')+'依人民團體法第23條與選舉罷免辦法第17條，未達章定三分之二才須補選足額。例如章定9席剩6席，六席正好達到，不需因這一條補到9席，也不須全面改選。']);
  if(notChair)steps.push(['只空出一般理事，不重選在任的理事長','理事長仍在任時，普通理事出缺不等於理事長出缺；不因此重選理事長。']);
  else steps.push(['是否另補理事長？看原職是否確有出缺',(knownChair?'既然理事長職務也出缺，這和理事席次要分開辦。':'如果只是普通理事過世，理事長仍在任，就不因此重選；若理事長也出缺才有下一步。')+' 原則自出缺日起一個月內補選。所遺任期不足六個月才可依章程或由常務理事互推代理；未設常務理事時由理事互推。'+(halfYear?'剛好六個月不是「不足」，不能直接適用這個代理例外。':'')+' 由誰投票要查章程：一般社會團體可依人民團體法第41條另訂選任；章程未另定才按第17條的通常程序，不當然在會員大會直接選。']);
  refs.push(p(17),p(23),p(41),e(17),charter);}
 const summary=linkedCorporate?'公司才是會員，家屬不會繼承原代表的權利。先查公司是否正式改派，再確認這場會議的名冊與選務期限。':notChair?'一般理事去世不等於理事長出缺。先核對候補及剩餘席次；過世者的票與職位不能交給家屬。':knownChair?'理事席次、理事長補選、會員名冊要分別處理；不能由家屬繼承職務或選票。':memberCompare?'要先分清過世者是個人會員，還是公司指派的代表；原本的選票不能直接交給家屬。':'協會個人會員過世即出會。家屬不能用舊委託書代投；若有會費、墊款或職位出缺，要分開處理。';
 const choices=memberCompare?[
  {label:'過世的是個人會員',question:raw+'；身分確認：個人會員。'},
  {label:'過世的是團體會員指派代表',question:raw+'；身分確認：團體會員指派代表。'}
 ]:chairUnknown?[
  {label:'只缺一般理事',question:raw+'；職位確認：只缺一般理事。'},
  {label:'理事長也出缺',question:raw+'；職位確認：理事長也出缺。'}
 ]:null;
 return {direct:true,category:'協會｜會員死亡、選票與職務出缺',title:linkedCorporate?'公司團體會員的代表過世：改派、名冊和投票資格分開查':'協會會員過世：會籍、選票與出缺職務分開處理',summary,steps,refs,questionState:{focus:'compound',domain:'member-death-election'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices?{choiceHeading:memberCompare?'過世者在協會裡原本是什麼身分？':'去世者是否也擔任理事長？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedMemberDeathElectionContinuity=route;
})(typeof window!=='undefined'?window:globalThis);
