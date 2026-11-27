(function(root){
'use strict';
const law=(title,code)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+code});
const coopRefs=[law('合作社法第23、34、52、53條：公益金用途與會議門檻','D0050112'),law('合作社選舉罷免辦法：理事名額與出缺遞補或補選','D0050022')];
const assocRefs=[law('個人資料保護法第5、19、20條：目的、必要範圍與利用依據','I0050021'),{title:'個人資料保護法舊法規內容（現行第27條）',source:'https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=I0050021'}];
const coopSummary='只說剩兩位，還不能判定能否動用公益金。先確認章程應有理事名額、是缺額還是這次只來兩人，以及這項用途由哪一種會議決定。';
const assocSummary='協會可以照會務需要管理公用電腦借用，但沒有合法依據和必要性，不要公告借用人的電話。可以公開借用辦法或不含可識別資料的使用統計。';
const quorum=['合作社理事會｜分清總席次、缺額和出席人數','合作社法第53條要理事過半數出席、出席理事過半數同意。若依章程計算應有3席，兩人都出席，出席門檻是2；應有5席，門檻是3，兩人不夠。有正式出缺先依章程、合作社選舉罷免辦法確認遞補或補選，不自行把缺席者或全部空缺從分母扣掉。若實際是社務會，依第52條由全體理事、監事按三分之二出席、出席者過半數同意。'];
const purpose=['合作社公益金｜用途和決議權兩項都要通過','第23條限定供社會福利、公益事業或合作事業教育訓練與宣導，並非通用預算。第34條要求依法律、章程及社員大會決議執行。先核文件用途、有無既定授權及是哪個機關有權決定；未確認權限及門檻前不要先動支。出席足額也不表示任何用途都能支出。'];
const borrowing=['協會借用登記｜內部最少必要，不公告私人電話','指定保管人，把借還日期、資產編碼、狀態，以及必要的內部聯繫方式限制給有會務權限者；依保存需要管理，無必要不長留。要公開時，優先公布器材編號、時段、團體窗口或不識別個人的統計。理事會同意借用，不代表已取得公開私人電話的合法依據。'];
function coopFundAsset(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||/信用合作社|信合社|保險合作社|基金會|社區生產建設基金/.test(t))return null;
 const parts=t.split(/[；;。？！?!]+|另外|也想問|順便|[，,](?=(?:一般)?(?:合作社|協會))/).filter(Boolean);
 if(parts.length!==2)return null;
 const c=parts.findIndex(x=>/合作社/.test(x)&&/理事會|社務會/.test(x)&&/公益金/.test(x)&&/動用|表決|決議|支出/.test(x)&&/剩|出席|缺額|幾位|幾人/.test(x));
 const a=parts.findIndex(x=>/協會|社會團體/.test(x)&&/公用電腦|公用設備|器材|團體電腦/.test(x)&&/借用|外借|領用/.test(x)&&/公(?:告|開|布)|貼出|公開表/.test(x)&&/電話|姓名|聯繫方式|聯絡方式|名冊/.test(x));
 if(c<0||a<0||c===a)return null;
 return {direct:true,category:'跨類團體｜公益金與設備管理',title:'合作社公益金和協會設備借用個資，應分開看',summary:c<a?coopSummary+' '+assocSummary:assocSummary+' '+coopSummary,steps:c<a?[quorum,purpose,borrowing]:[borrowing,quorum,purpose],refs:[...coopRefs,...assocRefs],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={coopFundAsset};return;}
root.verifiedCooperativeFundAndBorrowing=coopFundAsset;
})(typeof window!=='undefined'?window:globalThis);
