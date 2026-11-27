(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const refs=[
 law('公益勸募條例第19條：按許可計畫使用，不得移作他用','D0050138'),
 law('公益勸募許可辦法：使用計畫變更程序','D0050147'),
 law('民法第412條：附負擔贈與','B0000001'),
 law('合作社法第4、9-1、23、34、36條：社員責任、短絀及理事賠償','D0050112')
];
const gift=['協會指定捐款：不能只為填赤字就改用途','先看原捐贈指定用途、原收據／約定、有無公益勸募許可和核定計畫。不符合用途的，不要挪作一般短絀；受贈附負擔須按民法及約定處理。若屬依法許可的公益勸募，按公益勸募條例第19條專用，計畫要改需依法報主管機關許可等，不是理事會同意或單憑捐贈人同意就能另用。未確認前先保留分帳。'];
const coop=['一般合作社短絀：做短絀分擔案，不按理監事頭銜直接分帳','依法先核對合作社章程、社責任種類與年度書類。第36條由理事會作短絀分擔案，送監事會審核、提社員大會，承認後一個月內報備查；一般年度大會前至少十日送監事會。第9-1條要求章程載明短絀分擔；第23條另訂後續結餘應先處理累積短絀。'];
const scope=['社員責任和個別理監事的賠償責任分開','第4條有限、保證、無限責任合作社依社員責任不同。這與理監事是否有個人保證或違法致損等個別原因是不同問題；第34條理事違反職責而致合作社受損才有該條賠償問題。不能說理事監事見赤字一律自費，也不能說所有情況完全不用負責。'];
function designated(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>230||/信用合作社|信合社|公司|公會|基金會/.test(t))return null;
 const parts=t.split(/[；;。？！?!]+|另外|順便|再請問|[，,](?=(?:一般)?(?:合作社|協會))/).filter(Boolean);
 const a=parts.findIndex(p=>/協會|社會團體/.test(p)&&/指定.{0,8}(?:捐款|捐贈)|捐款.{0,8}指定|勸募款/.test(p)&&/短絀|赤字|虧損|缺口/.test(p));
 const c=parts.findIndex(p=>/合作社/.test(p)&&/短絀|赤字|虧損/.test(p)&&/理監事|理事|監事/.test(p)&&/負責|賠|出錢|負擔|要補/.test(p));
 if(parts.length!==2||a<0||c<0||a===c)return null;
 return {direct:true,category:'跨類團體｜指定資金與短絀責任',title:'協會指定款用途和合作社短絀責任應分開',summary:'協會指定捐款不能任意挪補一般赤字。合作社年度短絀要依法及章程處理，不因理監事職稱就當然要用個人款補足。',steps:a<c?[gift,coop,scope]:[coop,scope,gift],refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={designated};return;}
root.verifiedDesignatedDonationCoopDeficit=designated;
})(typeof window!=='undefined'?window:globalThis);
