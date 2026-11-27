(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function coopShareAssociationFees(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>205||!/合作社/.test(t)||!/協會|社會團體/.test(t)||/信用合作社|信合社|保險合作社|聯合社|工會|公會|強制執行|抵債|股金扣抵|股金抵債|退費救濟/.test(t))return null;
 const shares=/(?:合作社|社員).{0,20}(?:退社|退股|出社|退出).{0,15}(?:股金|社股)|(?:退還|退|領回).{0,4}(?:股金|社股)/.test(t);
 const fee=/(?:協會|社會團體|會員).{0,20}(?:退會|出會|退出).{0,20}(?:會費|入會費|年費)|(?:會費|入會費|年費).{0,8}(?:能退|要退|可以退|怎麼退)/.test(t);
 if(!shares||!fee)return null;
 const comp=['合作社退社：按章程處理社股與股金','自請退社原則於營業年度終了，依第27條應於三個月前提出書面請求，章程可在法定限度內延長預告。出社社員依第30條及章程可請求退還部分或全部股金，原則以營業年度終了財產計算；章程另有規定從其規定。退社生效不以已領到股金為前提，也不是一退社就保證原額全退。'];
 const assoc=['協會退會：會費要不要退，看章程及退費原則','依社會團體財務處理辦法第14條，入會費、常年會費及繳納方式訂入章程；如需退費，由理事會擬退費原則，經會員（代表）大會通過後辦理。沒有一律全退或一律不退，不套合作社股金計算。核對繳款期、退會日及該會已通過的原則。'];
 const first=t.indexOf('合作社')<t.search(/協會|社會團體/);
 return {direct:true,category:'合作社與協會｜退社股金和退會費',title:'合作社退股金與協會會費，分開辦理',summary:'合作社股金與協會會費不是同一種款項。股金依合作社法及章程計算；協會會費查章程及大會通過的退費原則，不能互套。',steps:first?[comp,assoc]:[assoc,comp],refs:[law('合作社法','D0050112',27),law('合作社法','D0050112',30),law('社會團體財務處理辦法','D0050097',14)],questionState:{focus:'compound'}};
}
function withdrawalElection(q){
 const compound=coopShareAssociationFees(q);if(compound)return compound;
 const raw=String(q||'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(t.length>195||/信用合作社|信合社|工會|農會|漁會|公會|基金會|公司|股東|開除|除名|解散|罷免|欠會費/.test(t))return null;
 const fee=/(?:會費|年費|入會費|已繳的費用).{0,14}(?:退|返還|拿回)|(?:退|拿回|返還).{0,8}(?:會費|年費|入會費)/.test(t);
 const election=/推選理事長|互選理事長|選理事長|理事長.{0,9}(?:選舉|投票|表決)|投票選理事長|表決選理事長/.test(t);
 const memberLeaves=/退會|退社|不當會員|已(?:經)?(?:不是會員|喪失會籍)|退出.{0,8}(?:協會|社團)/.test(t);
 const financial=law('社會團體財務處理辦法','D0050097',14);
 const feeStep=['協會會費要不要退，另查退費原則','社會團體財務處理辦法第14條：入會費、常年會費的標準及繳納方式應訂在章程。如有退費的需要，由理事會訂定退費原則、提會員（代表）大會通過後辦理。沒有一律全退或一律不退，先查已通過的退費原則是否適用本筆年費及期間。'];
 if(/合作社|社員/.test(t)){
  if(!fee||!/合作社/.test(t)||!/協會/.test(t)||!/股金|社股|入股|股款/.test(t))return null;
  return {direct:true,category:'合作社及協會財務',questionState:{focus:'compound'},title:'合作社股金、社員年費與協會會費，不適用同一條',
   summary:'先把合作社股金與年費分開。退還股金有合作社法規定；另繳的年費不能直接跟股金一起算。一般協會的會費則依另一套規則。',
   steps:[['一般合作社：股金是出資，不是年費','依合作社法第30條，出社社員可依章程請求退還部分或全部股金，股金按營業年度終結時的財產計算，章程另有規定則依其規定。這不表示另外收取的社員年費也會一併退還；應核對收據科目、收費依據和章程的退費約定。不是信用合作社的一律三個月說法。'],feeStep],
   refs:[law('合作社法','D0050112',30),financial]};
 }
 if(!memberLeaves||!election)return null;
 const director=/現任理事|原理事|原本是(?:協會)?理事|(?:他是|她是|我是)理事|(?:^|[，,。；;])理事(?:說|想|還|才|已|在)|理事.{0,5}(?:說想|想|提出|申請|已(?:經)?)退會/.test(t);
 const plain=/一般會員|普通會員|不是理事|沒當理事|非理事/.test(t);
 const uncertain=/尚未生效|未生效|還沒生效|只有口頭|只(?:是)?說|說想|何時生效|還不知道|不確定|章程沒說/.test(t);
 const effective=!uncertain&&/已(?:經)?(?:生效|退會|喪失會籍|不是會員)|退會(?:已完成|已生效|生效後)|正式退會後|辦完退會/.test(t);
 const p=n=>law('人民團體法','D0050091',n);
 const eligibility=['誰能選理事長，先看理事身分','會員（代表）大會選出理事；依人民團體法第17條，由理事選理事長。有設常務理事，由理事在常務理事中選出一人；沒設常務理事，則由理事互選。一般會員本來不直接投票選理事長，也不能只憑會員身分被選為理事長。'];
 const change=['如果退會已生效，原理事就不能再投票或參選','理事、監事喪失會員（代表）資格，依人民團體法第23條應即解任，缺額由候補依次遞補；因此已退會生效的原理事不能再以理事身分投票選理事長，也不能當候選人。單純辭去理事職務的程序與退會不同。'];
 const check=['如果只是說想退會，先查是否真的生效','人民團體法第12條要求章程載明出會規則，但沒有替每個協會統一定退會日。只表示想退出、或送件尚未生效，不等於已喪失會籍；投票前核對章程、退會意思與送達紀錄、會籍和在任理事名冊。已依法登記的社團法人，另參照民法第54條：原則可退社，但章程可限定事務年度終了或預告，預告最長六個月。不能把這一規定一概套到未登記團體；章程沒說清楚，先向主管機關確認。'];
 const tail=fee?'會費則依章程和大會通過的退費原則，不是退會就一律退。':'';
 const summary=plain?'一般會員本來不直接投票選理事長。'+tail:effective?'若您說的原理事已退會生效，就不再有理事資格，不能投票選理事長或參選。'+tail:director?'先確認退會是否生效。若仍具在任理事身分且權利未受限制，依適用規定參與互選；生效喪失會籍後則不能。'+tail:'投票選理事長須具在任理事身分；一般會員不能直接投票，退會已生效的原理事也不能投。'+tail;
 const choices=director&&!effective&&uncertain&&!/退會是否已生效的處理/.test(t)?[
  {label:'退會確定已生效',question:'協會現任理事已經退會生效，還能投票選理事長嗎？'+(fee?'年費能退嗎？':'')},
  {label:'只是想退會／尚未生效',question:'協會現任理事只是說想退會，退會是否已生效的處理未確認，還能投票選理事長嗎？'+(fee?'年費能退嗎？':'')}
 ]:[];
 return {direct:true,category:'人民團體資格與會費',questionState:{focus:'compound'},title:'退會、理事長互選'+(fee?'與會費退還':'')+'是不同問題',summary,
  steps:[eligibility,...(effective?[change,check]:[check,change]),...(fee?[feeStep]:[])],
  refs:[p(12),p(17),p(23),law('民法','B0000001',54),law('人民團體會務輔導辦法','D0020094',10),...(fee?[financial]:[])],...(choices.length?{choiceHeading:'這位理事的退會是否已生效？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={withdrawalElection,coopShareAssociationFees};return;}
root.verifiedWithdrawalElection=withdrawalElection;
root.verifiedCoopShareAssociationFees=coopShareAssociationFees;
})(typeof window!=='undefined'?window:globalThis);
