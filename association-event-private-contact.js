(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const refs=[law('個人資料保護法第2、5、8、19、20條：聯絡資料及其合法利用','I0050021'),{title:'全國法規資料庫：仍適用的個人資料保護法第27條',source:'https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=I0050021'}];
const coopRefs=[law('合作社法第42、48、49、50、51、55條：社員大會及表決','D0050112')];
const phoneSummary='沒有合法依據和必要性，不要把聯絡人或借用人的私人手機放到公開公告。合辦活動或管理場地，跟能否公開個人電話是兩件事。';
const phone=['私人號碼可辨識個人，不等於團體聯絡方式','收集聯絡資料用來辦場地或活動，不代表可以再公開上網、貼公告或轉交給另一方使用。用個資法第5、19、20條核對蒐集目的、必要範圍與合法依據；如要以同意為依據，應先清楚說明公開用途、渠道、範圍及使用期間並取得適當同意，不能用已填報名表或借用表推定同意。'];
const alternative=['公告用團體聯絡資訊，私人聯絡留內部','優先列團體電話、公務分機、單獨的活動專線或公務信箱。借用人的電話如果確有內部聯絡需要，限制給有業務權限的人；公告可以只載日期、使用時段及團體窗口。若已貼錯，先移除公開可見的私人號碼，通知主辦端核對範圍，並依法處理；不要在小屏貼號碼。'];
const coopSummary='一般合作社社員大會開到一半有人離席，先重新清點仍在場的有效出席；未達該議案門檻，不要再表決或把離席者算進同意。';
const coop=['合作社社員大會：先清點，再看普通或特別決議','合作社法第48條，普通議案以全體社員過半數出席、有效出席社員過半數同意為準，注意章程適用及有效代表或委託。譬如全體100人，至少51人出席；如果只剩50名有效出席，不要再作普通決議。若是罷免、解散、合併等有特別門檻的議案，應依第42、55條和適用規則另算，不可只從仍在場的人算過半數。'];
const minutes=['記錄離席時點與結果，未達門檻先不表決','把剩餘人數、離席時間、清點與處置寫入會議紀錄。若不足門檻，依法及章程處理後續召集，不把未決事項寫成通過。已依當時人數有效通過的議案，不因之後離席就當然無效；個別決議有爭議請核對當時計數、委託文件和會議紀錄。'];
function contact(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>260||!/公開|公告|貼上|貼出|公布|上網/.test(t)||!/活動|社區活動中心|借用|場地|協會/.test(t))return null;
 const personal=/私人(?:手機|電話|號碼)|個人(?:手機|電話|聯絡資料)|(?:聯絡人|借用人|借人|承辦人|負責人).{0,8}(?:的)?(?:手機|電話|私人號碼)/.test(t);
 if(!personal||/只(?:要)?公布團體電話|不(?:附|放|留)私人電話|已改用公務電話/.test(t))return null;
 const parts=t.split(/[；;。？！?!]+|另外|順便|再請問|[，,](?=(?:一般)?合作社)/).filter(Boolean);
 const ci=parts.findIndex(x=>/合作社/.test(x)&&!/信用合作社|信合社/.test(x)&&/大會/.test(x)&&/開到一半|中途|離席|只剩|走了/.test(x)&&/表決|票|人數/.test(x));
 const pi=parts.findIndex(x=>/公告|公開|公布|上網/.test(x)&&/電話|手機|號碼/.test(x));
 const mixed=ci>=0&&pi>=0&&ci!==pi;
 if(/合作社|社員大會|公會|工會/.test(t)&&!mixed)return null;
 const steps=mixed?(pi<ci?[phone,alternative,coop,minutes]:[coop,minutes,phone,alternative]):[phone,alternative];
 return {direct:true,category:'團體會務｜公告個資與會議表決',title:mixed?'活動公告個資和合作社表決須分開':'合辦活動公告不要直接放私人手機',summary:mixed?(pi<ci?phoneSummary+' '+coopSummary:coopSummary+' '+phoneSummary):phoneSummary,steps,refs:mixed?[...refs,...coopRefs]:refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={contact};return;}
root.verifiedAssociationEventPrivateContact=contact;
})(typeof window!=='undefined'?window:globalThis);
