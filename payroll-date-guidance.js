(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const mol=ref('勞動部：歷年最低工資及生效日期','https://www.mol.gov.tw/1607/28162/28166/28180/99861/28184/29016/');
const minLaw=ref('最低工資法第5條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030028&flno=5');
const nhi=ref('健保署：個人與投保單位補充保險費計算方式','https://www.nhi.gov.tw/ch/cp-4516-74b0f-2613-1.html');
const labor=ref('勞保局：2027 年勞保、災保分級表公告','https://www.bli.gov.tw/0110324.html');
const ans=(title,summary,statutes)=>({direct:true,category:'勞健保與勞資',title,summary,statutes,notes:[],actions:[]});
function payrollDateGuidance(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!/(協會|社團|人民團體|本會|團體|工讀|兼職|職員|員工|受僱)/.test(t)||/(公司|商號|合作社|工會|商業公會|職業公會|農會|漁會|政黨)/.test(t))return null;
 if(/補充保費|補充保險費|二代健保/.test(t)){
  if(/扣稅|所得稅|執行業務|講師|鐘點費|租金|股利|利息|獎金|免扣身分/.test(t))return null;
  if(/自己負擔|雇主(自己|負擔|應繳)|投保單位(自己|負擔|應繳)|協會(自己|負擔|應繳)|薪資(總額|差額)/.test(t))
   return ans('協會自己負擔的補充保費：看每月薪資總額與投保金額總額的差額','協會作為投保單位，自付的補充保費不是用單筆最低工資判斷。當月實際給付的薪資所得總額，大於受僱者當月健保投保金額總額時，就正差額乘補充保險費率；沒有正差額，就沒有這筆。\n\n這和從個人兼職薪資扣的補充保費是兩件事，也不是所得稅扣繳。',[nhi]);
  if(/兼職|工讀|部分工時|非所屬投保單位/.test(t)&&/薪|工資|門檻|多少|起扣|單筆|單次|有差/.test(t))
   return ans('兼職薪資的個人補充保費：看給付日與單次金額','如果協會不是這名員工所屬的健保投保單位，且該筆是符合計費規定的兼職薪資，單次給付達給付日適用的每月最低工資（含等於）才要扣；未達就不用扣。另有法定免扣情形，先依健保署規定確認身分。\n\n2026 年（民國 115 年）門檻是 29,500 元；2027 年（民國 116 年）1 月 1 日起是 30,900 元。以同一筆 30,000 元為例，在 2026 年 12 月給付達門檻，原則上要扣；在 2027 年 1 月給付未達門檻，這筆不用扣。達門檻時按應計費金額計算，不是只計算超過門檻的部分。\n\n這和協會自己負擔的補充保費、所得稅扣繳是不同的計算。',[nhi,mol]);
  return null;
 }
 if(/勞保|勞工保險|災保|職業災害保險/.test(t)&&/投保薪資|薪資分級|第[1一]級|最低級/.test(t)&&!/保費|給付|理賠|退休金|健保級距/.test(t))
  return ans('勞保、災保一般分級表：2027 年第 1 級為 30,900 元','一般分級表的第 1 級，2026 年（民國 115 年）為 29,500 元；2027 年（民國 116 年）1 月 1 日起調為 30,900 元，原 30,300 元級距刪除。\n\n不是每名員工都報第 1 級：按實際月薪資總額及身分類別，查適用日期的分級表與備註。部分工時等情況可能適用不同規定；健保投保金額和勞退月提繳工資也有各自的表。',[labor,ref('勞保局：2026 年分級表調整','https://events.bli.gov.tw/Activities/202601_01/'),ref('勞保局：2027 年勞退月提繳分級表','https://www.bli.gov.tw/Files/26719')]);
 if(/最低工資|基本工資|最低時薪|基本時薪|最低月薪|最低薪資|最低薪水|時薪.{0,4}最低/.test(t)&&!/補助|核銷|扣繳|所得稅|保費|投保|加班|資遣|講師|鐘點費|志工|出席費|勞退/.test(t))
  return ans('協會聘人：最低工資按生效日區分','適用最低工資法的勞雇關係，約定工資不能低於最低工資。\n• 2026 年（民國 115 年）：每月 29,500 元，每小時 196 元。\n• 2027 年（民國 116 年）1 月 1 日起：每月 30,900 元，每小時 205 元。\n\n以時薪聘用工讀生，看每小時的標準；正常工時以外的加班費另計。其他年度請查勞動部公告。',[minLaw,mol]);
 return null;
}
if(typeof module!=='undefined'&&module.exports){module.exports=payrollDateGuidance;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return payrollDateGuidance(q)||previous.call(this,q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
