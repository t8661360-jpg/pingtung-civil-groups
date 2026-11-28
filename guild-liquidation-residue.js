(function(root){
'use strict';
const ref=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const industrial=ref('工業團體法第2、29、39、40、41條','D0050103');
const details=ref('工業團體法施行細則第38條','D0050104');
const trade=ref('商業團體法第39、40條','D0050100');
const civil=ref('民法第40、44條：先清債務、賸餘歸屬與公益限制','B0000001');
const clean=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const unrelated=/合作社|信用社|協會|基金會|財團法人|農會|漁會|公司解散|工會|公寓|股份有限公司|員工遣散/;
const removeNeg=/(?:不是|並非)(?:指|問|在問)?(?:一般|這間|本地)?(?:工業(?:同業)?公會|商業(?:同業)?公會|公會聯合會|職業公會|協會|合作社)(?=[，,；;。]|$)/g;
const select=/公會性質確認:(工業同業|商業同業|其他或不確定)(?=[。；;]|$)/;
function route(q){
 const raw=String(q??'').trim(),t=clean(raw);
 if(!t||t.length>710)return null;
 const z=t.replace(removeNeg,'');
 if(unrelated.test(z))return null;
 const idx=z.match(select)?.[1];
 const i=/工業(?:同業)?公會/.test(z), c=/商業(?:同業)?公會/.test(z);
 const generic=/公會/.test(z)&&!/公會聯合會|公會全國聯合會|商業會|工業會|醫師公會|護理師公會|會計師公會|建築師公會|律師公會|職業公會|牙醫師公會|技師公會/.test(z);
 if(!generic&&!i&&!c||/公會聯合會|公會全國聯合會/.test(z))return null;
 const compare=i&&c&&/比較|差別|不一樣|差在哪|一樣嗎|分別|有何不同|怎麼不一樣|跟.{0,9}不同/.test(z);
 if(i&&c&&!compare)return null;
 const ownsBusiness=/(?:興辦|經營|附設|另設|名下).{0,10}(?:事業|業務|營業|中心)|事業.{0,12}(?:停止|要停|收掉|停辦|結束|清算)/.test(z);
 const stop=/停止|要停|停辦|收掉|結束|不辦了|終止/.test(z);
 const noDissolve=/(?:不是|並非)(?:要|問)?(?:整個)?(?:公會)?解散|公會(?:本身)?(?:不解散|繼續存在|還會繼續)/.test(z);
 const businessOnly=ownsBusiness&&stop&&(noDissolve||!/(?:公會|我們).{0,8}(?:要|將|想)解散|公會解散|公會清算/.test(z));
 const winding=/解散|清算|打算結束|要結束|會員(?:不足|不夠|低於|少於|不滿)|不做了/.test(z);
 const residue=/財產|資產|剩(?:下|餘|錢)|賸餘|分(?:錢|掉|配|給)|還債|債務|設備|財物|結餘|退款/.test(z);
 if(!(businessOnly||winding&&(residue||/要怎麼辦|如何辦|清算人/.test(z))))return null;
 const type=idx==='工業同業'?'i':idx==='商業同業'?'c':i?'i':c?'c':'';
 const certainDebt=/沒還|沒清|未清|未還|待還|欠租|債務還沒|債還沒|先.{0,5}分.{0,8}再還|沒付完|還有租金/.test(z);
 const short=/因.{0,15}(?:會員|家數).{0,12}(?:不足|不夠|低於|少於|不滿)|會員.{0,7}(?:不足|不夠|低於|少於|不滿).{0,6}(?:法定|最低|家|人|數額)/.test(z);
 const conditional=['債務沒清完，不是可分的賸餘','先由清算人清點公會的資產、收回債權、清償債務，再判斷有無賸餘。不能先按會費分錢再還債；繳多少會費不會自動變成個人的分配比例。'];
 const property=['借用設備與用途受限的款項，先釐清','借用或代管的設備先查所有權和契約，不列為公會自己可分的財產。指定補助或捐款則先看核定文件、契約與清算安排，向原補助機關確認繳回、移交或結案要求，不當作一般公會現金發出去。保留清冊、憑證和處理紀錄。'];
 const industryCall=['工業團體法第40條：先選清算人，選不出來才聲請法院','工業同業公會依工業團體法第2條是法人。清算決議及清算人選派，第29條須會員代表三分之二以上出席，出席代表三分之二以上同意；不能選派時，公會或利害關係人可向公會事務所所在地地方法院聲請指定。施行細則第38條要求依有關民事法規清算。'];
 const industryPay=['工業同業公會：清債後才看民法第44條','如無特別法另定，先看章程或會員大會的有效決議。若屬以公益為目的的法人，賸餘不得歸自然人或以營利為目的的團體。不能只憑名稱認定公會是不是公益法人，也不能直接分給會員工廠；如無法律、章程規定或有效大會決議，賸餘歸法人住所所在地的地方自治團體。'];
 const tradePay=['商業同業公會：第39條明定賸餘歸屬','由會員大會決議選派清算人；不能選派時，可由公會、利害關係人或其主管機關，向管轄的地方法院聲請指定。清算後的賸餘發給重行組織的商業同業公會；如果因會員不足法定數額而解散，賸餘歸它所加入的直轄市或縣（市）商業會，不分給各會員公司。'];
 const activity=['停止公會興辦的事業，不是整個公會解散',type==='i'?'依工業團體法第41條，只清算所屬事業的財產，清算人由會員大會選任。第39條要求興辦事業另立會計；先依項目分出事業自有、向公會借用、向別人借用及用途受限的財產。':'依商業團體法第40條，停止興辦事業須經會員大會決議，停止後權利義務由該公會承擔。公會未解散，不能拿公會解散的第39條當成停止事業就要分設備的依據。'];
 const actions=[{label:'聯絡承辦',view:'contact',sub:''}];
 if(compare)return {direct:true,category:'工商公會｜解散清算比較',title:'工業同業公會與商業同業公會，清算後歸屬不同',summary:'兩者都先清償債務。工業同業公會要查特別法、章程或有效決議及民法公益限制；商業同業公會的賸餘歸屬由商業團體法第39條明定。',steps:[conditional,industryPay,tradePay,property],refs:[industrial,details,civil,trade],actions,questionState:{focus:'compound'}};
 if(!type){
  const summary='先不要分。清償債務後，才知道有沒有可處理的賸餘；歸屬要看公會種類與實際清算原因。';
  return {direct:true,category:'公會清算｜先確認種類',title:'先釐清是什麼公會，再判斷賸餘歸屬',summary,steps:[conditional,['先看立案名稱和發生的是哪件事','工業、商業同業公會有不同規則，只有公會的一項事業停止，也不等於公會解散。可先核對立案證書上的種類；不需要把具名清冊、銀行資料傳給小屏。']],refs:[civil],actions,questionState:{focus:idx?'compound':'clarify'},...(!idx?{choiceHeading:'您說的是哪一類公會？',choices:[['工業同業公會','工業同業'],['商業同業公會','商業同業'],['其他或不確定','其他或不確定']].map(([label,key])=>({label,question:raw+'；公會性質確認：'+key+'。'}))}:{})};
 }
 if(businessOnly)return {direct:true,category:'公會清算｜只停止興辦事業',title:'只停止公會興辦的事業，不直接分掉設備',summary:type==='i'?'仍營運的公會不是整個解散；由會員大會選任清算人，查清這項事業的財產、債務與用途限制，再依法清算。':'仍營運的商業同業公會不是整個解散。停辦事業須經會員大會決議，原事業的權利和義務由公會承擔，不能直接分設備。',steps:type==='i'?[activity,property,conditional]:[activity,property],refs:type==='i'?[industrial,details,civil]:[trade,civil],actions,questionState:{focus:'compound'}};
 if(type==='c')return {direct:true,category:'商業同業公會｜清算賸餘',title:'商業同業公會解散：賸餘依法定對象處理',summary:(certainDebt?'債務未清，不可以先分。':'先清償債務，再看清算賸餘。')+(short?'若確因會員不足法定數額而解散，歸它所加入的直轄市或縣（市）商業會。':'一般情形歸重行組織的商業同業公會；因會員數不足而解散則有不同歸屬。'),steps:[conditional,tradePay,property],refs:[trade,civil],actions,questionState:{focus:'compound'}};
 return {direct:true,category:'工業同業公會｜解散清算與剩餘財產',title:'工業同業公會解散，先還債，不直接按會費分配',summary:certainDebt?'債務未清，不能先照會費分錢。先由清算人清點財產和債權債務，借用設備、指定補助也要分開查。':'清算後不一定能分給會員工廠。先清債務，再依民法第44條看特別法、章程或有效大會決議；若屬公益法人，不能分給營利團體或自然人。',steps:[conditional,industryPay,industryCall,property],refs:[industrial,details,civil],actions,questionState:{focus:'compound'}};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedGuildLiquidationResidue=route;
})(typeof window==='object'?window:globalThis);
