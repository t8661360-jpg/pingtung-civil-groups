(function(root){
'use strict';
const people=(n)=>({title:'人民團體法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050091&flno='+n});
const ancestral=(n)=>({title:'祭祀公業條例第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020063&flno='+n});
const surname={title:'內政部台內團字第1040041526號：宗親會本姓或配偶資格依章程',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256711'};
const union={title:'內政部台內社字第8623908號：單姓宗親會與聯宗會',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220312'};
const land={title:'內政部台內團字第1040048138號：宗親會、祭祀財團法人與公業土地分流',source:'https://www.moi.gov.tw/News_Content.aspx?n=15255&s=216345'};
const localDirectory={title:'屏東縣社會處與民政處團體業務官方窗口',source:'https://xca.nat.gov.tw/web2/apply06r.html'};
const nationalApplication={title:'政府入口網：全國性社會團體立案申請',source:'https://www.gov.tw/News_Content_2_416165'};
const local=['屏東地方性宗親會：屏東縣政府社會處','組織區域在屏東縣或縣內一個鄉鎮市，宗親聯誼等社團立案、章程或會員資格疑義，可洽屏東縣政府社會處人民團體業務，總機 08-732-0415。不是因為「祭祖」兩個字就歸民政。'];
const national=['全國性宗親會：內政部','全國性社會團體向內政部合作及人民團體司申請。跨縣市的活動本身不等於已取得全國性資格，應按章程擬定的組織區域與全國性立案條件確認。'];
const eligibility=['單姓宗親會可在章程訂同姓資格；配偶不必然符合或不符合','依《人民團體法》第12條，會員入會資格應寫入章程。單姓宗親會可依其性質訂定同姓資格；若規定是否包括該姓會員的配偶，按該會章程認定，不因配偶不同姓就一律拒絕，也不因結婚就自動入會。對現行規定有疑義或想修正，會員可依第27條提會員大會議決。'];
const ordinary=['一般協會不是宗親會：不能直接照搬同姓限制','會員資格應訂在章程，但一般協會、社區發展協會不能只因為宗親會有同姓條件，就推定自己也可限制。應把實際條款、團體宗旨與適用的特別規定一起核對；屏東立案團體可請縣府社會處核對。擬修章應提會員大會，不能只由理事會自行決定；沒有看到條文和適用規定前，不直接判定合法或違法。'];
const coexist=['同地已有聯宗會，不當然阻止另組單姓宗親會','內政部函釋區分單姓宗親會與兩個以上姓氏合組的聯宗會，原則上可分別申請。依《人民團體法》第7條，同一組織區域成立同級同類團體，不得與已許可團體同名，也不能使用易使人誤認與政府或營利團體有關，或有歧視、仇恨的名稱；仍應符合其他成立條件並由主管機關審查，不是自動核准。'];
const estate=['祖產及派下員不能靠宗親會立案直接取得','既有祭祀公業的派下員認定、派下證明變更及公業土地權利，依《祭祀公業條例》另行處理。在屏東，既有公業申報及派下事項洽有管轄的鄉（鎮、市）公所；祭祀公業法人登記洽屏東縣政府，後續土地登記再洽地政事務所。宗親會會員資格不等於派下權，宗親會立案不會自動取得或移轉祖產。'];
const foundation=['新設以捐助財產祭祀：先問民政','依《祭祀公業條例》第59條，新設以人為組織基礎的祭祀團體與以捐助財產為基礎的祭祀財團法人不同。前者按團體型態洽社政、依法辦理相關法人程序；後者按財團法人相關規定，先洽民政單位查詢許可條件。這不是既有公業的申報或土地登記。'];
function clanScope(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220)return null;
 const clan=/宗親會|聯宗會|聯姓宗親|宗族(?:協會|團體)/.test(t);
 const property=/祖產|派下|祭祀公業|族產|祭祀財團|祖塔|公廳|公業土地/.test(t);
 const estateRoute=clan&&property||/祭祀財團法人/.test(t)&&/成立|設立|分流|主管|哪|誰|找|申請/.test(t);
 const elig=/姓氏|同姓|單姓|不同姓|外姓|本姓|配偶|夫妻|入會|會員資格|收哪些|能加入|能不能加入|會員一定/.test(t);
 const ordinaryQuestion=/一般(?:性)?(?:的)?(?:協會|社團|社會團體)|社區發展協會|不是宗親會|非宗親會|普通協會|我們是(?:一個)?(?:協會|社團)/.test(t);
 const comparesGeneral=clan&&elig&&/(?:^|[。?!,，；;])(?:協會|社團|社會團體)(?:的)?章程.{0,60}[?。!；;].{0,20}(?:宗親會|聯宗會)/.test(t);
 const ordinarySurname=!clan&&/協會|社團|社會團體/.test(t)&&/姓氏|同姓|外姓|不同姓/.test(t)&&/章程|入會|會員|收人|加入|資格/.test(t);
 const gov=/歸誰管|誰管|找誰|哪個|哪裡|哪辦|哪邊|哪處|哪一|哪家|主管|社會處|內政部|找民政|找社政|向誰|去哪|管嗎|分流|誰受理/.test(t);
 const form=/成立|籌組|設立|立案|新組|組成|申請|創辦/.test(t);
 const canCoexist=/已有|已經有|同(?:地|區|一地|一區)|重複|分開|另(?:行|成立|組|立)|再(?:組|立|成立)/.test(t)&&/聯宗|單姓|同姓/.test(t)&&form;
 const reg=/全國(?:性)?|全臺|全台|中央/.test(t)?'national':/屏東|縣內|地方性|鄉級|鎮級|縣級/.test(t)?'local':'';
 if(!ordinarySurname&&!estateRoute&&!(clan&&(elig||gov||form)))return null;
 if(ordinarySurname||clan&&ordinaryQuestion&&elig&&!estateRoute&&!canCoexist&&!reg&&!gov){
  return {direct:true,category:'會員資格與章程',title:'一般協會的入會資格不能直接比照宗親會',summary:'章程可以訂會員資格，但一般協會能否限制同姓，要核對團體類型、宗旨與適用規定，不能只拿宗親會當理由。',steps:[ordinary],refs:[people(12),people(27),people(39),localDirectory],questionState:{focus:'compound'}};
 }
 const scopeAsked=gov||form||!elig;
 const unclear=clan&&scopeAsked&&!reg&&!canCoexist&&!estateRoute;
 const isFoundation=estateRoute&&/財團法人/.test(t)&&!/祖產|派下|既有|公業土地/.test(t);
 const steps=[],refs=new Set();
 const add=(blocks,cites)=>{steps.push(...blocks);for(const c of cites)refs.add(c);};
 if(elig&&!canCoexist&&clan)add([eligibility],[surname,people(12),people(27)]);
 if(canCoexist)add([coexist],[union,people(7)]);
 if(estateRoute)add(isFoundation?[foundation]:[estate,foundation],[land,ancestral(2),ancestral(59),localDirectory]);
 if(clan&&elig&&(ordinaryQuestion||comparesGeneral))add([ordinary],[people(12),people(27),people(39),localDirectory]);
 if((!estateRoute&&(!canCoexist||gov||reg)&&scopeAsked)||(estateRoute&&clan&&(gov||form)&&!isFoundation)){
   if(reg!=='national')add([local],[people(3),localDirectory]);
   if(reg!=='local')add([national],[people(3),nationalApplication]);
 }
 if(clan&&form&&reg&&!estateRoute)add([['要立案：先申請許可籌組，再報請立案','依《人民團體法》第8至10條，先由符合法定資格的30位以上成年發起人備妥申請書、章程草案及發起人名冊；許可後辦籌備與成立大會，再於成立大會後30日內檢送章程、會員名冊及職員簡歷冊報請立案。申請前以主管機關公告表單為準。']],[people(8),people(9),people(10)]);
 const summary=estateRoute?(isFoundation?'若是捐助財產新設祭祀財團法人，先洽民政；不是宗親會社團立案。':'宗親會立案與既有祭祀公業是不同程序，不能直接取得派下資格或辦祖產過戶。')
  :canCoexist?'可以另提申請。同地已有聯宗會，不會自動擋掉名稱不同、符合資格的單姓宗親會。'
  :elig&&scopeAsked?'單姓宗親會可在章程訂會員資格，配偶能否加入看該會章程；主管機關按組織區域分流。'
  :elig?'單姓宗親會可訂同姓資格；配偶能否入會，須看該宗親會的章程。'
  :reg==='local'?'組織區域只在屏東，宗親會社團業務請洽屏東縣政府社會處。'
  :reg==='national'?'全國性宗親會向內政部申請。':'宗親聯誼社團按組織區域分流；若是祭祀財產，不走同一程序。';
 const title=estateRoute?'宗親會與祭祀公業、財團法人要分開辦':canCoexist?'已有聯宗會，仍可另申請單姓宗親會':'宗親會：會員姓氏、章程與主管機關';
 const choices=unclear?[
  {label:'屏東地方性宗親會',question:elig?'屏東地方性宗親會哪些姓氏會員可以加入，配偶可以嗎？找哪個主管機關？':'屏東地方性宗親會應找哪個主管機關？'},
  {label:'全國性宗親會',question:elig?'全國性宗親會哪些姓氏會員可以加入，配偶可以嗎？找哪個主管機關？':'全國性宗親會應找哪個主管機關？'},
  {label:'祖產、派下或祭祀財團法人',question:'宗親會與祭祀公業派下、祖產或祭祀財團法人該找誰處理？'}
 ]:[];
 return {direct:true,category:'社會團體｜宗親會業務分流',title,summary,steps,refs:[...refs],questionState:{focus:'compound'},...(unclear?{choiceHeading:'您想查哪一類？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={clanScope};return;}
root.verifiedClanAssociationScope=clanScope;
})(typeof window!=='undefined'?window:globalThis);
