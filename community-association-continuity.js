(function(root){
'use strict';
const guide={title:'衛福部社區發展工作要點第4、17點：組織區域和會務事項',source:'https://www.mohw.gov.tw/dl-95691-ae093933-e48d-4251-9512-22e9d33885a8.html'};
const law={title:'人民團體法第5、6、8至12、27條：區域、設立、章程及決議',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const address={title:'內政部：社會團體依法報送會址變更，屬備查事項',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256701'};
const labels={same:'想保留原團體',new:'打算另成立新協會',address:'只是換會址'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'');
function route(q,prior){
 let raw=String(q??'').trim();
 let t=norm(raw);
 if(!t||t.length>350||/^(?:新題|另問)|合作社|社員|公會|工會|基金會|股份公司|管委會/.test(t))return null;
 let choose=t.match(/;處理方式:(same|new|address)$/)?.[1];
 if(!choose&&prior&&/^(?:我們|我|本會|這次)?(?:是|要|想|只想|打算|就是|決定)?(?:保留原團體|另成立新協會|另外成立新協會|另設新協會|只是換會址|只換會址|換會址)[。.!！]?$/.test(t)){
  choose=/另/.test(t)?'new':/會址/.test(t)?'address':'same';
  raw=prior.raw;
 }
 const b=norm(raw).replace(/;處理方式:[a-z]+$/,'');
 const community=/社區發展協會|社區協會/.test(b);
 const transition=/轉型|改制|(?:改|變|轉)(?:成|為)(?:一般|普通)(?:協會|社會團體)|另(?:行|外)?(?:成立|設立|申請|設)新?(?:一般|普通)?協會/.test(b);
 const scope=/組織區域|服務區|行政區域|跨(?:鄉|鎮|村|里)|別的(?:鄉|鎮|村|里)|其他(?:鄉|鎮|村|里)|擴大範圍/.test(b);
 const charter=/修章|章程|宗旨|改名|名稱/.test(b);
 const inherit=/另(?:行|外)?(?:成立|設立|申請|設)新?(?:一般|普通)?協會|不想解散|不願解散|保留原|沿用|承接|原會員|舊會員|會員.{0,4}重(?:入|新)|立案證書|會員不重入/.test(b);
 const pureAddress=/(?:只|僅|只是|只要|只想|就)是?(?:同一個社區發展協會)?(?:換|改|遷|變更)(?:正式)?(?:會址|地址)|換會址.{0,8}會籍不變/.test(b)&&!/跨縣市|跨鄉|改宗旨|別的鄉/.test(b);
 const selected=choose||(pureAddress?'address':/如果只能另|確定.{0,6}另|決定.{0,6}另|打算.{0,6}另/.test(b)?'new':/不想解散|不願解散|保留原|會員不重入/.test(b)?'same':null);
 const neg=/不轉型|不是要轉型|沒有要轉型|不改成一般/.test(b);
 if(!choose&&!(community&&(transition&&!neg||scope&&charter&&inherit||pureAddress&&!scope&&/(?:更正|不轉型|不是要轉型|會籍不變)/.test(b))||scope&&charter&&inherit&&/會員/.test(b)&&/立案證書/.test(b)))return null;
 const out=(title,summary,steps,refs,extra={})=>({direct:true,category:'社區發展協會｜改章、會籍與另設',title,summary,steps,refs,actions:[{label:'聯絡承辦',view:'contact',sub:''}],...extra});
 if(selected==='address')return out('只改同一協會的會址，不等於換團體','單純變更會址不會使原會員一律重新入會；先依章程與原立案機關的會址異動程序辦理，不把遷址當轉型或重新立案。',[
  ['確認新址與章程','依貴會章程辦理決議，準備新址使用證明，向原立案機關核對會址備查文件。若原章程寫明完整舊地址而需改條文，另辦章程變更；若新址跨主管機關區域，先核對是否須核准。']
 ],[law,address,guide]);
 if(!community&&selected==='same'&&!choose)return out('先分清只是改名稱、會址，還是改團體的組織區域','您已說要保留會籍與立案，並打算調整名稱、區域和會址。名稱、區域、會址不是同一件事；只換地址不能解決組織區域。若原本是社區發展協會，還須先看社區組織區域，不能先假設可以沿用同一立案。',[
  ['先補一項：原立案團體類型','是社區發展協會，還是一般社會團體？不用貼立案證書或會員名冊。確認後，再看原團體的章程、主管機關和會員資格。']
 ],[law,guide],{choiceHeading:'原立案團體是哪一類？',choices:[{label:'原本是社區發展協會',question:raw+'；原本是社區發展協會；處理方式:same'},{label:'原本是一般社會團體',question:raw+'；原本是一般社會團體；處理方式:same'}]});
 if(!selected)return out('先確認保留原團體，還是另外成立新協會','社區發展協會本來就屬社會團體，另有社區組織區域規範。能不能在保留同一立案的情況下改名稱、宗旨或區域，不能只靠修章決議判定；也不能先斷定原會員都要重入。',[
  ['先選您想走的方式','看是否希望保持原本的團體身分，或新舊兩個團體各自存在。只有地址異動的話，另走會址備查。']
 ],[guide,law],{choiceHeading:'您想怎麼辦？',choices:Object.entries(labels).map(([key,label])=>({label,question:raw+'；處理方式:'+key})),continuityContext:{raw}});
 if(selected==='new')return out('另設新協會，會員和舊團體的財物不會自動搬過去','如果另外成立新協會，它和原社區發展協會是不同團體。原會員不會自動加入、舊立案證書也不能沿用；不用因為要成立新協會就先解散舊會。',[
  ['新協會依新章程辦理','按人民團體法走發起、申請許可、成立大會和報立案。依法及新章程確認誰願意參加、入會條件、會籍及代表權；舊章程可以參考，不是直接移轉。未經確認不把舊會員名冊直接當新會名冊。'],
  ['舊帳戶與補助器材逐項清點','新會依自身立案資料辦帳戶，不直接接用舊會帳戶。原款項、借用物及補助器材分別查所有權、資金限制、核定用途及返還或移轉條件；先向原補助機關確認。有解散或清算安排另照其程序，不先處分。']
 ],[guide,law]);
 return out('想保留原團體：先確認區域、章程與會員資格',community?'可以先把擬改內容整理給所在地公所及原立案機關確認。社區發展工作要點第4點的組織區域以村里為單位、原則不超出一個鄉鎮市；跨鄉或改宗旨不能只靠一場修章就認定能轉型。':'如果原本就是一般社會團體，不直接套用社區發展協會的區域規範；是否仍是同一團體、組織區域和主管機關有沒有變動，要由原立案機關依具體變更確認。',[
  ['先釐清保留同一立案能改哪些項目','列出原名稱、宗旨、組織區域、會址與擬變更內容。若是社區發展協會，先向所在地公所及原立案機關確認能否維持原立案、是否需另設。不要只因負責人相同就推定仍是同一團體。'],
  ['可走修章時，再依大會程序','人民團體法第27條：章程變更一般要會員（代表）過半數出席，且出席者三分之二以上同意；再依原立案機關辦理。若牽涉名稱或立案身分，要另核對是否換證與所需文件。'],
  ['會籍不直接歸零，也不保證全數沿用','同一團體的單純更名或遷址不是全體重新入會。若會員資格或組織區域因變更受到影響，依原／新章程、過渡安排與主管機關確認，再更新名冊。若改走另設，會員不會轉入新協會。']
 ],[law,guide]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCommunityAssociationContinuity=route;
})(typeof window!=='undefined'?window:globalThis);
