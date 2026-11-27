(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const org=law('人民團體法','D0050091',12),biz=law('商業團體法','D0050100',12),industry=law('工業團體法','D0050103',13),doctor=law('醫師法','L0020001',9);
const social=['一般協會：先查現行章程，不只看戶籍','有些協會依章程看戶籍、實際居住、服務範圍或會員類別，並不是每個協會都要求設籍屏東。人民團體法第12條要求章程載明組織區域及入會規則；不要把「非屏東人」自動等同不符條件。社區發展協會另核對該會的社區範圍與會員類別。'];
const business=['商業同業公會：會員通常是同業公司或行號','依商業團體法第12條，先按公司或行號的業別、登記或營業地與適用組織區域核對；公司或行號另派會員代表。負責人的私人戶籍不等於公司的所在地，也不把一般協會個人入會方式套進去。'];
const factory=['工業同業公會：以法定資格的會員工廠為主','依工業團體法第13條，先看工廠登記、業別與公會組織區域；以工廠入會，另派會員代表，不以代表人的戶籍作為工廠所在區域。個案有無跨區例外另核法規。'];
const licensed=['專業職業公會：查該職業的專法及所在地','例如醫師執業依《醫師法》第9條加入所在地醫師公會，先看執業所在地和法定資格，不用一般協會戶籍判斷。其他職業不一律照醫師法；請確認職業、公會全名及執業地。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/協會|社會團體/.test(t)||!/公會/.test(t)||!/外縣市|不是屏東人|非屏東人|屏東人|非本地|在外縣|不住|沒住|居住|住在|戶籍|設籍/.test(t)||!/入會|加入|當會員|會員資格/.test(t)||/合作社|工會|聯合會|罷免|除名|欠費|退會|退費|雙廠|監票|收款/.test(t))return null;
 const kinds=[/商業同業公會|商業公會|商會/.test(t),/工業同業公會|工業公會|工業會/.test(t),/醫師公會|專業公會|職業公會|自由職業公會|專業職業公會/.test(t)];
 const kind=kinds.filter(Boolean).length===1?kinds.findIndex(Boolean):-1;
 const choices=[{label:'商業同業公會',question:'我不是屏東人，加入協會或商業同業公會的資格一樣嗎？'},{label:'工業同業公會',question:'我戶籍不在屏東，加入協會和工業同業公會的資格一樣嗎？'},{label:'自由職業／專業公會',question:'我戶籍不在屏東，加入協會和專業職業公會的資格一樣嗎？'}];
 const s=kind===0?'商業同業公會看公司或行號的業別及所在區域，不直接按負責人戶籍判定。':kind===1?'工業同業公會看工廠登記、業別及區域，不直接按工廠代表的戶籍判定。':kind===2?'專業公會要看該職業的專法與執業地，不能把醫師等單一專法套到所有職業。':'公會要先辨類別：商業、工業或專業職業公會，不能直接套協會規定。';
 return {direct:true,category:'人民團體｜協會與公會入會資格',title:'戶籍在外縣市：先分協會與公會的入會資格',summary:'一般協會先核對章程與實際情況，不是只看是否為屏東人。 '+s,steps:kind<0?[social]:[social,[business,factory,licensed][kind]],refs:kind<0?[org]:[org,[biz,industry,doctor][kind]],questionState:{focus:'compound'},...(kind<0?{choiceHeading:'您想問哪一類公會？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationGuildJoinLocation=route;
})(typeof window!=='undefined'?window:globalThis);
