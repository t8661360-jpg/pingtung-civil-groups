(function(root){
'use strict';
function law(name,code,n){return {title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
function associationAdmissionEquality(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||!/協會|社會團體|社團/.test(t)||/工會|合作社|基金會|政黨|校內社團|學生社團|聘僱|求職|性騷擾|刑事|申請籌組|發起人|直選/.test(t))return null;
 const profession=/公會|職業團體/.test(t);
 if(profession&&!/差別|比較|而(?:協會|社團)|(?:協會|社團).{0,35}(?:公會|職業團體)/.test(t))return null;
 const expression=/性別(?:表現|氣質|刻板印象)|男生.{0,16}(?:化妝|裙|穿搭|打扮)|男性.{0,16}(?:化妝|裙|穿搭|打扮)|女生.{0,14}(?:打扮陽剛|像男生)|(?:化妝|穿裙).{0,14}(?:性別|像女性|像女生)|娘娘腔/.test(t);
 const admit=/入會|加入|不讓我當會員|不收我|拒絕當會員/.test(t);
 const removal=/除名|退會|開除|踢出|取消會員資格/.test(t);
 if(!expression||(!admit&&!removal))return null;
 const saying=['章程自治不等於可用歧視條款','人民團體法第12條要求在章程載明入會、出會與除名。內政部合作及人民團體司的人權教材以「因外在性別表現拒絕社會團體入會」為例，指出不能只因化妝、穿著等外在性別表現拒絕，並建議主管機關輔導刪除歧視條款。章程寫了不等於可以這樣做，個案仍要看實際理由、資格與程序。'];
 const review=['一般社會團體的入會資格如何審查','通常由理事會依有效章程及法規審查。內政部台內社字第8708421號函指出，要求全體現任會員同意，和理事會審查權責不符，程序似有未合。這並不表示所有入會申請都應獲准，也不能以無關的性別表現當作審查理由。'];
 const expel=['已經是會員：理事長不能自己除名','人民團體法第14條所定除名須有違反法令、章程或大會決議，且危害團體情節重大；依第27條須由會員（會員代表）大會依法成會並經出席人數三分之二以上同意。理事長不能逕行除名，不能把門檻或決議程序當成歧視事由的依據。'];
 const region=/戶籍|設籍|居住地|住在|住本鄉|住外地|外地居民|本鄉居民/.test(t);
 const locality=['居住地條件和外在性別表現分開看','依內政部台內社字第1000198902號函，人民團體法沒有一律要求既有團體的會員設籍；發起人規則不同。個別協會是否可設居住、設籍或工作地條件，要核對合法章程、組織區域及地方規範，不能只因沒設籍就自行推定不合資格。'];
 const occupation=['如果另問職業團體','人民團體法第37條規定職業團體不得拒絕具有會員資格者入會；各類職業公會的專業資格再查其適用專法，不把一般社會團體的程序直接套過來。'];
 const next=['如果已被拒絕，先保留書面證明','可請團體以書面說明理由，保留申請、現行章程及拒絕通知，向該團體的主管機關反映並請求檢視資格或程序。涉及既有會員資格或決議爭議，可另外尋求法律諮詢。這不是對個案一定獲准入會或除名必然無效的保證。'];
 const ref=n=>law('人民團體法','D0050091',n);
 return {direct:true,category:'人民團體會務說明',questionState:{focus:'compound'},
 title:removal?'協會不能由理事長單獨除名，性別表現不是任意排除的理由':'一般協會不能只以外在性別表現拒絕入會',
 summary:removal?'理事長不能自己把會員除名。只因外在性別表現排除會員，也不能只靠章程一句話；請分開查事由和大會程序。':'不能只因外在性別表現拒絕入會。內政部的人權教材認為這樣會侵害基本權利，即使章程有寫，也不能把歧視條款當成合法理由。',
 steps:[saying,...(admit?[review]:[]),...(removal?[expel]:[]),...(region?[locality]:[]),...(profession?[occupation]:[]),next],
 refs:[ref(12),law('中華民國憲法','A0000001',7),law('中華民國憲法','A0000001',14),
  {title:'內政部114年人權教材：外在性別表現與入會（頁9–12）',source:'https://ws.moi.gov.tw/Download.ashx?icon=.pdf&n=5ZCI5ZyY5Y%2B4LTExNOS6uuasiuaVmeadkC5wZGY%3D&u=LzAwMS9VcGxvYWQvNDAwL3JlbGZpbGUvMC8yMjk0MC83NTE4OWM4ZS02MGExLTRmOTMtYTdmOC00OTA3ZTVjYmYzNTQucGRm'},
  ...(admit?[{title:'內政部8708421號函：理事會審查會員資格',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=219980'}]:[]),
  ...(removal?[ref(14),ref(27)]:[]),...(region?[{title:'內政部1000198902號函：會員設籍規範',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256678'}]:[]),...(profession?[ref(37)]:[])]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={associationAdmissionEquality};return;}
root.verifiedAssociationAdmissionAnswer=associationAdmissionEquality;
})(typeof window!=='undefined'?window:globalThis);
