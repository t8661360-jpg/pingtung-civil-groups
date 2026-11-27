(function(root){
'use strict';
const association=n=>law('人民團體法','D0050091',n);
const coop=n=>law('合作社法','D0050112',n);
function law(title,code,n){return {title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n};}
const shareInterest=/股息|社股(?:的)?(?:年)?息|股金(?:的)?(?:年)?利息/;
const stockCompany=/股份有限公司|股份公司/;
const companyRef=n=>law('公司法','J0080001',n);
const topics={
 companyInterest:{hit:t=>stockCompany.test(t)&&/股息|股利|紅利/.test(t)&&/上限|多少|最高|有沒有限制|限制|幾%|幾成/.test(t),
  line:['股份有限公司股息','不適用合作社的社股年息上限。依公司法的一般盈餘分派規則，公司應先彌補虧損並依法提列法定盈餘公積；通常按股東持股比例分派。法律另有規定或涉及特別股時須另核對，不能套用合作社的固定上限。'],laws:[companyRef(232),companyRef(235)]},
 creditor:{hit:t=>/清算/.test(t)&&/就任|上任|到任/.test(t)&&/公告|催報|催告/.test(t)&&/債權/.test(t)&&/多久|幾天|幾日|何時|期限|什麼時候/.test(t),
  line:['清算人就任後的債權公告','清算人應在就任後十五日內公告催告債權人申報；債權申報期限不得少於十五日。已知的債權人另須分別通知。這不是清算終結的報告期限。'],laws:[coop(64)]},
 report:{hit:t=>/清算/.test(t)&&/多久|幾天|幾日|何時|期限|什麼時候/.test(t)
  && !/就任|上任|到任|報明債權|催告債權人|聲請解散登記/.test(t)
  && (/報告|呈報|報送/.test(t)||(/完成清算|清算(?:事務)?(?:完成|結束|終了|終結|完畢|完結)|清算完了/.test(t)&&/報(?:縣府|主管機關)|主管機關.{0,6}備查/.test(t))),
  line:['清算終結報告','清算事務終了後，清算人應於20日內造具報告書，呈報主管機關並分送各社員；由法院選派者，另須呈報法院。'],laws:[coop(65)]},
 interest:{hit:t=>shareInterest.test(t)&&/上限|多少|最高|有沒有限制|限制|幾%|幾成/.test(t),
  line:['社股年息','有上限：一般合作社的社股年息不得超過百分之十，沒有結餘就不能發息。這是一般年度股息規則，不是清算剩餘財產的分配比例。'],laws:[coop(22)]},
 admission:{hit:t=>/入會|加入|(?:當|成為)[^，,？?。；;]{0,9}會員/.test(t)&&/不住|沒住|不是屏東人|非屏東人|外縣市|外地|外鄉|外村|外里|不是里民|戶籍|設籍|居住|住在/.test(t),
  line:['外地居民能否入會','不住屏東不一定不能加入。一般社會團體要對照該會現行章程的入會資格，看是否要求特定戶籍、居住地或其他條件；不是屏東人、未設籍、未居住是不同情形，不能混為一談；社區發展協會還要核對章程的組織區域與會員類別。'],laws:[association(12)]},
 expulsion:{hit:t=>/踢掉|踢出|開除|除名/.test(t)&&/理事長|會長|理事會|會員大會|誰/.test(t),
  line:['誰能決定除名','理事長或理事會不能自行決定。若會員違反法令、章程或不遵守大會決議，致危害團體情節重大，須由會員（代表）大會決議，並經出席人數三分之二以上同意。若問題是遷出後是否喪失資格，這是第15條的出會事由，與懲戒除名不同；先核對現行章程及資格事實，不宜只因不是里民就當成已除名。'],laws:[association(14),association(15),association(27)]}
};
function identify(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>130||/信用合作社|儲蓄互助社|農會|漁會|工會|公會|商業團體|職業團體|財團法人|管委會|信用部/.test(t))return null;
 const chunks=t.split(/[?？。；;！!]|[,，](?=(?:那|還|另|以及|而|同時|另外|又))|另外|還想問/).filter(x=>x.length>2);
 const c=/合作社/.test(t),a=/協會|社會團體|人民團體/.test(t);
 const financeExclusion=/清算(?:剩餘|賸餘)財產|遺產|股息扣繳|課稅|欠稅|銀行|貸款|借款|存款/;
 if(/公司/.test(t)){
  if(a||financeExclusion.test(t)||/特別股|資本公積|開業前|解散分配/.test(t))return null;
  if(!c&&chunks.length===1&&topics.companyInterest.hit(chunks[0]))return ['companyInterest'];
  if(c&&chunks.length===2){
   const legs=chunks.map(x=>topics.companyInterest.hit(x)&&!/合作社/.test(x)?'companyInterest':/合作社/.test(x)&&!/公司/.test(x)&&topics.report.hit(x)?'report':null);
   if(legs.includes('companyInterest')&&legs.includes('report'))return legs;
  }
  return null;
 }
 if(c&&!a&&chunks.length===2&&!financeExclusion.test(t)){
  const legs=chunks.map(x=>topics.creditor.hit(x)?'creditor':topics.report.hit(x)?'report':null);
  if(legs.includes('creditor')&&legs.includes('report'))return legs;
 }
 if(c===a)return null;
 if(c&&/清算(?:剩餘|賸餘)財產|遺產|股息扣繳|課稅|欠稅|銀行|貸款|借款|存款/.test(t))return null;
 if(a&&/基金退還|退費|自願退會|章程要怎麼改/.test(t))return null;
 const keys=c?['report','interest']:['admission','expulsion'];
 if(chunks.length>2)return null;
 if(chunks.length===2&&chunks.some(x=>!keys.some(k=>topics[k].hit(x))))return null;
 if(!keys.every(k=>topics[k].hit(t)))return null;
 const rank=k=>t.search(({report:/清算/,interest:shareInterest,admission:/入會|加入|(?:當|成為).{0,9}會員/,expulsion:/踢掉|踢出|開除|除名/})[k]);
 return keys.sort((x,y)=>rank(x)-rank(y));
}
function verifiedComparison(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>140)return null;
 if(/信用合作社/.test(t)&&/合作社/.test(t.replace(/信用合作社/g,''))&&/股息|股利|社股(?:年)?息/.test(t)&&/結餘|盈餘|上限|一樣|相同|差別|不同|多少|發不發|能發/.test(t)&&!/公司|存款|銀行利息|貸款|借款|扣繳|清算|退股|保險合作社/.test(t)){
  const b1=['一般合作社','合作社法第22條規定，沒有結餘不能發息；社股年息不得超過百分之十。這不是保證給付。'];
  const b2=['信用合作社','依信用合作社法第23條，當年度沒有盈餘也不得分配社股股息；有稅後盈餘時，先彌補累積虧損，再依規定提列法定盈餘公積，才能分配股息。第24條是公積提撥的例外。第23、24條沒有另寫股息百分比上限，其他法規的適用須依合作社法第3條之1及相關規定核對，不能從這兩條推論沒有上限。'];
  return {direct:true,category:'合作社財務',title:'一般合作社與信用合作社的股息，分開看',summary:'沒有結餘或盈餘時，兩者都不能發社股股息；有盈餘時，適用的分配順序不同。',steps:t.indexOf('信用合作社')===t.indexOf('合作社')-2?[b2,b1]:[b1,b2],refs:[coop(22),law('合作社法','D0050112','3-1'),law('信用合作社法','G0380058',23),law('信用合作社法','G0380058',24)]};
 }
 if(/協會|社會團體/.test(t)&&/會員(?:[（(]?代表[）)]?)?大會|會員.{0,9}大會/.test(t)&&/理事會|監事會/.test(t)&&/委託|代理|代.{0,3}出席/.test(t)&&!/職業團體|合作社|工會|公會|公司|董事|投票|選舉|罷免|法人代表/.test(t)){
  const a1=['會員（代表）大會','一般社會團體會員不能親自出席時，可以書面委託其他會員（會員代表）代理，每位受託人最多代理一人。非會員家人不能只憑親屬關係代理。'];
  const a2=['理事會或監事會','理事、監事要親自出席各自的理事會或監事會，不得委託他人代理。即使是另一位理事或監事，也不能代為出席。'];
  return {direct:true,category:'人民團體會務說明',title:'會員大會可書面委託，理事會與監事會不能比照',summary:'要先看是會員身分出席大會，還是以理事、監事身分出席各自的會議。',steps:t.search(/理事會|監事會/)<t.search(/大會/)?[a2,a1]:[a1,a2],refs:[association(42),association(31)]};
 }
 return null;
}
function dissolutionAndGrant(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const dissolve=/解散|清算|(?:結束|收掉)(?:協會|社團)|(?:協會|社團)(?:不做了|要收掉)/;
 if(t.length>150||!dissolve.test(t)||!/(?:補助|補貼)(?:款|經費)?/.test(t))return null;
 if(!/協會|社團|社會團體|人民團體/.test(t)||!/核銷|撥款|撥[了過]|已撥|未撥|沒撥|沒領|領到|領了|結案|繳回|剩餘|還沒用完|活動.{0,7}(?:未辦|沒辦|取消)/.test(t))return null;
 if(/合作社|公會|工會|基金會|財團法人|公司|政黨|商業團體|職業團體/.test(t))return null;
 const otherGrant=/(?:臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|基隆|新竹|苗栗|彰化|南投|雲林|嘉義|宜蘭|花蓮|臺東|台東|澎湖|金門|連江)(?:市|縣|市府|縣府|市政府|縣政府)|(?:中央|內政部|文化部|教育部|衛福部)(?:的|核定的|核發的)?補助/.test(t);
 const countyTitle='屏東縣政府對民間團體補助經費作業要點';
 const countyURL='https://ptc.familyedu.moe.gov.tw/fileRename.aspx?fid=40994&kid=2&site_id=19&uid=3454';
 const yes=['已撥款或已執行','盤點已收款、實際支出、原始憑證和剩餘款；依核定文件確認申報及繳回方式。'+(otherGrant?'各補助機關規則不同，不套用屏東縣的核銷期限。':'若適用屏東縣這份要點，計畫執行完竣後需於20日內辦理核銷，逾當年度未辦將註銷且不保留；第8點之一明定剩餘補助經費應繳回。')];
 const no=['未撥款且活動未辦','先拿核定公文向原補助單位確認是否辦理撤案或結案、應備文件。不要為了核銷填列沒有發生的支出。若活動已辦但還未撥款，另確認是否仍可請款及期限。'];
 const noFirst=/(?:尚未|未|還沒|沒|沒有)(?:撥款|撥|領到|領)|沒收到(?:補助|款)/.test(t);
 return {direct:true,category:'會務與補助',title:'協會解散與補助核銷，要分別處理',summary:otherGrant?'補助沒核銷，不代表解散後就不用處理。先確認原補助機關的規定和核定文件；不能用屏東縣的規則替其他機關判定。':'屏東縣公開補助要點沒有寫一律要先核銷才能辦解散，也不能據此認定可以直接先解散。請先看核定公文，向補助承辦及會務承辦確認這一案的處理順序。',
  steps:[...(noFirst?[no,yes]:[yes,no]),
   ['解散與清算','自願解散應依法由會員（代表）大會決議，不是理事長單方決定。已登記為社團法人者，另看民法第57條；按第40條，清算人負責了結現務、收取債權和清償債務，但不能憑此推定清算人就能代辦該筆補助核銷。'],
   ['確認下一步','備妥核定公文、是否已撥款與是否已執行的資料，向原補助承辦確認核銷、繳回或撤案的期限與經手人，再向團體主管機關確認解散送件。'+(otherGrant?'':'屏東縣府總機 08-7320415，可請轉相關承辦。')]],
  refs:[...(otherGrant?[]:[{title:countyTitle+'第3點、第8點及第8點之一',source:countyURL}]),association(27),association(59),law('民法','B0000001',57),law('民法','B0000001',40)]};
}
function monthsRemaining(s){
 const number='([0-9]{1,2}|十[一二三四五六七八九]?|[一二兩三四五六七八九])';
 const matches=[...s.matchAll(new RegExp('(?:只剩|還剩|還有|剩下|僅剩|剩餘|剩|所遺|還餘|僅餘|尚餘|餘|任期剩下?|任期尚有)'+number+'個?月','g'))];
 const text='零一二三四五六七八九';
 const read=x=>/^\d+$/.test(x)?Number(x):x==='兩'?2:x.startsWith('十')?10+(x.length>1?text.indexOf(x[1]):0):text.indexOf(x);
 const isHalf=/還剩半年|只剩半年|還有半年|剩下半年|剩半年|任期半年/.test(s);
 const ambiguous=/大約|約有|左右|多個月|多月|近半年|將近|差不多|個半月/.test(s)||/個?月[至到或、／-][0-9一二兩三四五六七八九十]/.test(s);
 if(ambiguous||matches.length>1||(isHalf&&matches.length))return null;
 if(isHalf)return 6;
 if(matches.length===1)return read(matches[0][1]);
 return null;
}
function chairVacancy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>135||!/任期|幾個月|剩|至少六個月|未滿半年|不足半年/.test(t))return null;
 if(!/過世|死亡|往生|去世|病逝|離世|死了/.test(t)||!/補選|改選|怎麼辦|怎麼處理|代理/.test(t))return null;
 if(/遞補上來|補上來|補選的人|補選上來|候補|繼承|股金|存摺|印鑑|清算|開戶|銀行|津貼|喪葬|信用合作社|保險合作社/.test(t))return null;
 const coopOrg=/合作社/.test(t);
 const comm=/商業同業公會|商業會|商業團體/.test(t);
 const foreign=/工會|農會|漁會|基金會|公司|管委會|政黨|寺廟/.test(t)||(!comm&&/公會|職業團體|工業會/.test(t));
 if(foreign||(coopOrg&&/協會|公會|人民團體|社會團體|職業團體/.test(t)))return null;
 const role=coopOrg?(/監事會主席/.test(t)?'監事會主席':/理事會主席/.test(t)?'理事會主席':''):(/理事長/.test(t)?'理事長':'');
 if(!role||/監事會主席.*理事會主席|理事會主席.*監事會主席/.test(t))return null;
 const months=monthsRemaining(t);
 const shortExplicit=/不足(?:六|6)個?月|未滿(?:六|6)個?月|(?:不足|未滿)半年/.test(t);
 const longExplicit=/至少(?:六|6)個?月|(?:六|6)個?月以上|至少半年|半年以上/.test(t);
 const stage=months!==null&&months>0?months<6?'short':'long':shortExplicit!==longExplicit?shortExplicit?'short':'long':'unknown';
 const kind=coopOrg?'合作社':comm?'商業同業公會':'一般協會';
 const byElection=coopOrg?'原則上，自出缺之日起一個月內召開'+role.slice(0,3)+'議補選。':'原則上，自出缺之日起一個月內補選。';
 const acting=coopOrg?'未滿六個月時，可以由'+role.slice(0,2)+'互推一人代理，不必一定補選。':'不足六個月時，可以在出缺之日起一個月內，依章程規定或由常務理事互推一人代理；沒有設常務理事的，由理事互推一人代理，不必一定補選。';
 const threshold=coopOrg?'未滿六個月':'不足六個月';
 const known=months!==null&&months>0?'按您說的剩餘任期 '+months+' 個月，':'按您說的剩餘任期，';
 const summary=stage==='short'?known+'符合'+threshold+'的例外，可依法安排代理，不必一定補選。':stage==='long'?known+'不適用'+threshold+'的例外。'+byElection:'要看出缺當日離任期屆滿還有多久。'+byElection;
 if(!summary)return null;
 const lifeline=kind+role+'過世，任期';
 const steps=stage==='short'?[['如何代理',acting]]:stage==='long'?[['補選還是代理','剛好六個月或更久，不適用短任期的代理例外。'+byElection]]:[['剩餘任期'+threshold,acting],['剛好六個月或更久',byElection]];
 if(comm)steps.push(['適用法規','商業同業公會先適用商業團體法及其施行細則；依施行細則第45條，選舉罷免事項並依人民團體選舉罷免辦法。']);
 return {direct:true,category:coopOrg?'合作社會務':'選舉與改選',title:kind+role+'出缺：依剩餘任期決定補選或代理',summary,steps,
  related:stage==='unknown'?[lifeline+'不足六個月，要補選嗎？',lifeline+'至少六個月，要補選嗎？']:[],
  refs:coopOrg?[law('合作社選舉罷免辦法','D0050022',7)]:[...(comm?[law('商業團體法施行細則','D0050101',45),{title:'內政部函釋：商業同業公會理事長的補選與代理',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=219798'}]:[]),law('人民團體選舉罷免辦法','D0050093',17)]};
}
function meetingMinutesStep(board){
 return ['閉會後：保存、查閱及報備',board?'理事會、監事會和理監事聯席會議紀錄由團體自行留存，提供會員（會員代表）查閱。依法須向主管機關或目的事業主管機關核辦的決議，另檢附文件送件，不套用大會紀錄通用的三十日期限。':'會員（代表）大會紀錄，須在閉會後三十日內報請主管機關備查；團體仍要自行留存並提供會員（會員代表）查閱。一般規定沒有要求逐一寄給每位會員；章程、其他適用規定另有要求時仍應遵守。'];
}
function assemblyCommunications(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/協會|社團|人民團體|社會團體|商業同業公會/.test(t))return null;
 const trade=/商業同業公會/.test(t);
 if(/合作社|工會|農會|漁會|財團法人|基金會|公司|管委會|里民大會|選舉|改選|補選|罷免|籌備|成立大會|違法|改地點|改期|委託|視訊|會址|公告出席|出席名單|名冊公開|個資|補助|核銷|財報|決算|預算|財務報表|收支報告/.test(t)||(!trade&&/公會|職業團體/.test(t)))return null;
 const assembly=/會員(?:[（(]?代表[）)]?)?大會|會員代表會議|會員代表會|協會(?:的)?大會|(?:這次|開)大會/.test(t);
 const subBoard=/理事會|監事會|理監事聯席/.test(t);
 if(!assembly&&!subBoard)return null;
 const records=/(?:會議|大會|會)紀[錄录]|(?:會議|大會|會)記[錄录]|(?:決議|會後(?:的)?)紀錄/.test(t);
 const notices=/(會前|開會|開大會|大會|會議|議程)(?:的)?通知|通知單|通知書|通知誰|通知(?:全體|每個|各|會員|代表|要)|議程.{0,6}(?:通知|寄發)/.test(t)
   ||!records&&/會員代表(?:會議|會|大會)/.test(t)&&/寄給|寄送|只寄|公告/.test(t);
 const generic=!notices&&!records&&/(開會|大會|會議)(?:的)?資料/.test(t)&&/寄給|寄誰|送誰|報縣府|多久|幾天/.test(t);
 if(!generic&&!/寄|送|通知|公告|報|備查|前|多久|幾天|期限|(?:要|能|可不可以|可否)(?:看的?|查閱)|留存/.test(t))return null;
 if(!generic&&!notices&&!records)return null;
 if(generic&&!assembly)return null;
 if(trade&&!records)return null;
 if(trade&&notices)return null;
 if(!trade&&subBoard&&notices)return null;
 if(!trade&&assembly&&subBoard&&records)return null;
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 if(trade)return {direct:true,category:'商業同業公會會務',title:'商業同業公會：會議紀錄分送各會員，並報主管機關',summary:'是分送各會員，不是只寄出席的會員代表。',steps:[['期限與對象','會員大會、理事會或監事會的會議紀錄，應於會議後十五日內分送各會員，同時報主管機關及目的事業主管機關備查。其他會議的決議涉及會員權益時，則通知相關會員。']],refs:[law('商業團體法施行細則','D0050101',25)]};
 const noticePeople=/會員代表|代表[）)]?大會/.test(t)?'若貴會依法採會員代表制，通知理事會審定、應出席的各會員代表，不是通知全體一般會員。':'一般會員大會要通知應出席的各會員；若依法採會員代表制，則通知審定應出席的各會員代表。';
 const pre=['開會前：通知與議程',noticePeople+' 原則上於開會十五日前通知，內容包含會議種類、時間、地點和議程，並報請主管機關派員列席。這些規定沒有一律要求另貼公告；章程或特別規定另有要求時應遵守，公告不能取代個別通知。僅緊急事故召集臨時會議且開會前一日已送達，才有期限例外。'];
 const post=meetingMinutesStep(subBoard);
 const steps=[...(notices?[pre]:[]),...(records?[post]:[])];
 if(generic)steps.push(pre,post);
 const refs=[...(notices||generic?[association(26),guide(10)]:[]),...(records||generic?[guide(12),{title:'內政部函釋：會議紀錄的留存與調閱',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256756'}]:[])];
 return {direct:true,category:'人民團體會務說明',title:generic?'先分清開會通知，還是會後會議紀錄':notices&&records?'大會通知與會議紀錄：時間及對象分開看':notices?'會員大會通知：依應出席會員或會員代表名冊':'會議紀錄：給會員查閱，大會紀錄另報備查',
  summary:generic?'兩者的對象和期限不一樣。可以先看通則，再點選您要辦的項目。':notices&&records?'開會前通知應出席人；閉會後留存紀錄，大會紀錄另報備查。':notices?'要通知應出席的人；個別通知和公告不是同一件事。':'提供會員查閱和向主管機關報備，是不同的義務，不是二選一。',steps,refs,
  related:generic?['協會會員大會通知要寄給誰？','協會會員大會會議紀錄要寄給誰、多久要報備？']:[]};
}
function assemblyPrivacy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>170||!/協會|社會團體|人民團體/.test(t)||/合作社|工會|公會|農會|漁會|基金會|公司|管委會|成立大會|籌備|罷免書|答辯書|慈善勸募|補助核銷/.test(t))return null;
 const assembly=/會員(?:[（(]?代表[）)]?)?大會|會員代表會議|開大會|大會結束/.test(t);
 const board=/理事會|監事會|理監事會/.test(t);
 if(assembly&&board)return null;
 const data=/出席名單|簽到(?:簿|表)|會員名冊|會員資料|會籍名冊|會員清冊|聯絡資料|名冊/.test(t);
 const publicUse=/公開|公布|對外|(?:上傳|貼到|張貼|放上).{0,8}(?:社群|官網|網站|網路)|(?:公告|張貼).{0,8}(?:出席|簽到|名冊)/.test(t);
 const privacy=data&&publicUse;
 const record=/出席名單|簽到(?:簿|表)/.test(t);
 const agenda=assembly&&/議程/.test(t)&&/公告|公布|通知/.test(t);
 const online=/視訊|線上|網路|通訊軟體|電子|LINE/i.test(t);
 const proxy=online&&/委託|代理/.test(t)&&(assembly||board);
 if(!privacy&&!proxy)return null;
 const steps=[],refs=[];
 const add=(label,body,...basis)=>{steps.push([label,body]);refs.push(...basis);};
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 if(agenda)add('會前議程','大會議程應連同會議種類、時間及地點，原則於會前十五日通知應出席的人。通知不是對外公告；一般規定沒有要求把議程另外公開，也不能用貼公告代替通知。章程或特別規定另有要求時應遵守。',association(26),guide(10));
 if(proxy){
  if(board)add('理事會或監事會','依法應親自出席，不能委託他人代理，即使全程視訊亦然。章程如果訂明可以視訊開會，理事或監事本人依規定參與是親自出席，不是委託代理。',association(29),association(31));
  else {
   const ordered='一般社會團體會員不能親自出席時，可以書面委託其他會員（會員代表），每位受託人最多代理一人。電子形式可用於適用電子簽章法且符合要件的書面委託：內容完整、可留存查驗，有相對人時也需符合其已同意或事前依法告知並給予反對機會等規定。先向協會確認章程及收件方式，不能只憑一句聊天訊息就認定有效。';
   add('會員大會的電子委託',ordered,association(42),law('電子簽章法','J0080037',5));
   if(/視訊|線上開|網路開|遠端開/.test(t))add('能否視訊開大會','須先看章程是否載明可以視訊開會。涉及選舉、補選或罷免時，不能以一般視訊會議方式取代選務程序；應依選舉罷免辦法及主管機關規定辦理。',association(25),{title:'內政部：人民團體視訊會議的辦理方式',source:'https://www.moi.gov.tw/News_Content.aspx?n=9&s=279373'});
  }
 }
 if(privacy){
  if(record)add('出席名單或簽到表','會議紀錄應記載出缺席狀況並留存供會員（會員代表）查閱，這不等於要把完整簽到表或出席名單對外公布。',guide(12));
  else add('會員名冊','理事會審定大會出席資格所造的會員（代表）名冊，應提供會員閱覽。供會員閱覽，不等於可以拍照、轉傳，或張貼在任何人都看得到的地方。',guide(10));
  add('對外公開的個資界線','姓名、電話、地址等可識別資料涉及個資。無法確認有合法依據前，不要貼到公開網站或社群；如果只是要說明出席情形，可提供無法識別個人的人數摘要。',law('個人資料保護法','I0050021',20));
 }
 const filing=privacy&&(assembly||board)&&t.split(/[?!。；;]/).some(part=>/(?:會議|大會|會)紀錄|(?:會議|大會|會)記錄/.test(part)&&/報(?:送|縣府|主管機關|備)|備查|(?:寄|送|交)(?:給|到)?(?:縣府|主管機關|會員|代表)|逐一寄/.test(part));
 if(filing){
  const [label,value]=meetingMinutesStep(board);
  const filingAt=t.search(/(?:會議|大會|會)紀錄|(?:會議|大會|會)記錄/);
  const privacyAt=t.search(/出席名單|簽到(?:簿|表)|會員名冊|會員資料|會籍名冊|會員清冊|聯絡資料|名冊/);
  if(filingAt<privacyAt)steps.unshift([label,value]);else steps.push([label,value]);
  refs.push(guide(12));
 }
 const summary=filing?'要分開看：會議紀錄的報備／查閱，和名單能否對外公開，是兩件事。':agenda&&privacy?'會前要通知議程，不等於要公開公告；會後也不必依法一律公開出席名單。':proxy&&privacy?'電子委託和公開名冊是兩件事，要各自看適用條件。':privacy?'給會員查閱不等於可以公開；先分清名冊種類和使用目的。':'視訊參與和委託出席不是同一件事。';
 return {direct:true,category:'人民團體會務說明',title:filing?'會議紀錄要不要報備，和名單能不能公開，分開看':agenda&&privacy?'大會議程通知與出席名單公開，分開看':proxy&&privacy?'視訊大會的電子委託與名冊公開，分開看':privacy?'會員查閱名冊，不等於對外公開':'線上開會與委託出席',summary,steps,refs:[...new Map(refs.map(x=>[x.source,x])).values()]};
}
function coopRegistryPrivacy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>140||!/合作社/.test(t)||!/社員(?:名冊|名簿)|社籍名冊/.test(t)||!/閱覽|查閱|調閱|公開|公布|拍照|貼|轉傳|上傳|對外/.test(t))return null;
 if(/信用合作社|保險合作社|協會|人民團體|社會團體|工會|公會|選舉|改選|罷免|候選|名冊公告|準社員|強制執行|討債/.test(t))return null;
 return {direct:true,category:'合作社會務',title:'合作社社員和債權人可查閱社員名簿，不等於可以公開',summary:'一般合作社依法備置社員名簿；社員及合作社債權人可查閱。單純外人不能主張這條的查閱權。',
  steps:[['如何查閱','可以向合作社提出查閱；合作社應備置社員名簿、章程、社員大會紀錄及規定的簿冊。查閱不等於有權取得可任意散布的整份副本。'],['電話或其他個資能否貼社群','不要把可識別個人資料貼上公開網站或轉傳給無權取得的人。向不特定人公開與原本查閱是兩回事；須另核對是否有合法依據。要說明人數，可用無法識別個人的統計。']],
  refs:[coop(35),coop(37),law('個人資料保護法','I0050021',20)]};
}
function yearEndAuditVacancy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>165||!/協會|社會團體/.test(t)||!/決算|年度會計報告/.test(t)||!/監事/.test(t)
   ||/合作社|公會|工會|基金會|公司|政黨|外國|監察人|補助|核銷|報稅|勸募|成立大會/.test(t))return null;
 const one=/只剩(?:下)?(?:一|1|壹)(?:位|名|個|人)?監事|監事(?:會)?(?:只|僅)?剩(?:下)?(?:一|1|壹)(?:位|名|個|人)|(?:一|1|壹)(?:位|名|個)監事.{0,7}(?:單獨|自己)/.test(t);
 const leave=/請假|請公假|因公|因病/.test(t)&&/簽|代審|先審|能審|可以審/.test(t);
 const early=/監事會(?:議)?(?:都|也|則|一直|目前|至今)*(?:還沒開|尚未開|沒開|未開|沒召開|來不及召開|開不了)/.test(t)&&/先.{0,8}(?:送|報)|逕.{0,5}(?:送|報)|直接.{0,5}(?:送|報)/.test(t);
 if(!one&&!leave&&!early)return null;
 const review=['年度決算的程序','理事會編造年度工作及會計報告；決算須先送監事會審核，連同審核結果提會員（代表）大會，通過後報主管機關。因故未能如期開大會時，可先由理事會及監事會，或理監事聯席會議通過，之後仍須提大會追認，再報主管機關備查。不能把尚未完成審核的決算直接當作已通過的決算送件。'];
 const seats=['只有一名監事，怎麼處理','一般社會團體法定至少三名監事，監事會決議須有應出席監事過半數出席，不能把一名監事的簽章當作監事會審核。先確認辭職是否經監事會決議生效；確有缺額，由候補監事依次遞補。遞補後仍未達章程所訂名額三分之二時，應補選足額。若監事會不能依法召開，可向主管機關說明，依法由主管機關指定監事一人召集；指定召集不等於授權一人代作決議。'];
 const absence=['有人請公假或病假','請假仍不是出缺，不能直接扣除請假人數、交由個人代簽。依法成會且依程序同意，才是監事會的審核。若實際有缺額，先處理遞補、補選或依法指定召集，不能把兩種情形混為一談。'];
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 return {direct:true,category:'人民團體財務',title:one?'只剩一名監事，不能以個人簽章代替年度決算審核':leave?'監事請假和出缺不同，決算仍要依法審核':'年度決算未經審核，不能當作已完成直接送件',
  summary:one?'不能由一名監事單獨代替監事會審年度決算。':leave?'決算仍要經監事會；請假不能當成缺額，也不能只讓剩下的人先簽。':'先完成應有的決算審核程序，不能跳過監事會直接把決算送縣府備查。',
  steps:[...(one?[seats]:[]),...(leave?[absence]:[]),review],
  refs:[association(34),law('社會團體財務處理辦法','D0050097',11),law('社會團體財務處理辦法','D0050097',22),...(one||leave?[association(29),guide(9),law('人民團體選舉罷免辦法','D0050093',17)]:[]),...(one?[association(32)]:[]),...(leave?[{title:'內政部函釋：理監事會出席人數與請假',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256686&sms=12360'}]:[])]};
}
function overdueFundraising(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>160||!/公益勸募|勸募(?:活動|案|許可)|許可.{0,6}勸募/.test(t))return null;
 if(!/逾期|期限過|期滿|到期|已過期|期間結束|許可截止|超過許可|活動結束|結束後|延期/.test(t))return null;
 if(!/退款|返還|退還|負責|繳交|轉捐|找不到|聯絡不上|繼續(?:募|收)|剩餘|賸餘|沒發完|沒用完|收款|收到|怎麼處理/.test(t))return null;
 if(/政府補助|縣府補助|補助核銷|政治獻金|退會費|退股金|退訂|會員會費|扣繳|所得稅/.test(t))return null;
 const article=n=>law('公益勸募條例','D0050138',n);
 const compare=/許可期間(?:內)?(?:收|募|捐)|剩餘|賸餘|沒發完|沒用完|一起退/.test(t);
 const paidLate=/逾期.{0,6}(?:收到|收入|募得|收款)|到期後.{0,4}(?:收到|募得)|找不到|轉捐|返還|退款|退還/.test(t);
 const late=['許可屆滿後或逾期勸募','活動延期不會自動延長勸募許可。原許可到期後，不能繼續以該案向公眾勸募。若已因逾期勸募收受財物，由勸募團體處理返還捐贈人，不是由捐款人或單一工作人員自行承擔；只匯入而未繼續對外勸募的個案，先查明事實並請原許可機關認定，不要逕行動支。'];
 const notFound=['找不到捐款人','不要自行轉捐。返還有困難時，先報原主管機關認定；認定後將該財物繳交主管機關，由其依原計畫或相關目的處理。建議留存款項明細、日期和聯繫紀錄供核對。'];
 const legal=['原許可期間合法收的財物','勸募期滿不等於使用計畫已完成，也不是所有合法捐款都要退。依原許可的財物使用計畫執行；計畫執行完竣後仍有餘款，可以在三個月內依同類目的擬使用計畫，經主管機關同意才動支，再執行不得逾三年。團體解散或未依第19條處理的賸餘，按第22條辦理返還；不能把這筆錢混同逾期勸募取得的款項。'];
 const steps=[...(compare?[legal]:[]),late,notFound];
 if(!compare&&!paidLate)steps.push(['還要繼續辦','開放再募前，先持原許可函和新活動時程聯絡原許可機關確認應辦程序；在取得有效許可前先停止對外勸募。']);
 return {direct:true,category:'公益勸募',title:compare?'許可期間內和逾期募得的財物，分開處理':'公益勸募許可到期：停止勸募，逾期所得由勸募團體處理返還',
  summary:compare?'不要把兩種款項混在一起退款或動支。分別核對實際勸募時間、許可與財物使用計畫。':'不能因活動延期就沿用已到期的許可。逾期勸募所得須返還；無法返還時先報主管機關，不可自行轉捐。',
  steps,refs:[article(7),article(12),article(22),...(compare?[article(19)]:[])]};
}
function publishDocumentPrivacy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/協會|社會團體|人民團體/.test(t))return null;
 if(/合作社|公會|工會|農會|漁會|基金會|公司|管委會|選舉|罷免|公開徵信|勸募許可|公益勸募|所得稅|補助核銷/.test(t))return null;
 const publicUse=/公告|公布|公開|張貼|貼(?:在|到)|上網|放到|上傳|群組|轉傳|對外/.test(t);
 if(!publicUse)return null;
 const finance=/收支|財務|決算|收費明細|會費|繳費/.test(t)&&/會員姓名|每(?:位|個|一位|一個)會員|會員個人|逐筆.{0,5}(?:列|姓名)|欠費名單|未繳.{0,6}名單|繳費名單/.test(t);
 const signature=/(?:會議|大會|會)紀錄|(?:會議|大會|會)記錄/.test(t)&&/簽名|簽章|簽字|簽署|印章/.test(t);
 if(!finance&&!signature)return null;
 const assembly=/會員(?:[（(]?代表[）)]?)?大會|會員代表會議|協會大會/.test(t);
 const board=/理事會|監事會|理監事聯席/.test(t);
 if(signature&&assembly&&board)return null;
 const steps=[],refs=[];
 if(finance){
  steps.push(['財務收支仍須公告','協會要定期公告真實的財務收支，但可以公布收支分類、會費合計及決算摘要，不必列出每位會員姓名、個別繳費金額或欠費名單。']);
  steps.push(['有疑問可個別通知','如果只是提醒繳費或核對帳款，可個別通知相關會員。會員群組不是可以任意散布個別欠費、繳費資料的場合；仍須核對使用目的和必要範圍。']);
  refs.push(law('社會團體財務處理辦法','D0050097',20));
 }
 if(signature){
  const guide=law('人民團體會務輔導辦法','D0020094',12);
  steps.push(['原始會議紀錄','團體應保存原本並供會員（會員代表）查閱。這不等於須把可辨識個人的簽名、印章或完整附件公開到網站；如只為公告會務，可另做不含可識別個資的摘要。']);
  if(assembly||board)steps.push(meetingMinutesStep(board));
  else steps.push(['是否需要報備','若是會員（代表）大會紀錄，閉會後三十日內另報主管機關備查；理事會、監事會或聯席會議的決議，依法須送件時才按規定辦理。']);
  refs.push(guide);
 }
 steps.push(['個資使用界線','即使章程或會議決議允許公告，也不等於符合個資法。應核對資料是否為原蒐集目的所必要；超出時須另有法定事由。未確認前不要公開姓名、個別繳費或簽名。']);
 refs.push(law('個人資料保護法','I0050021',5),law('個人資料保護法','I0050021',20));
 return {direct:true,category:'人民團體會務說明',title:finance?'公告協會收支，不必公開每位會員的繳費資料':'公開會議紀錄，不等於公開簽名與個資',
  summary:finance?'公布年度收支和揭露每名會員的繳費資料，是兩件事。':'一般規定沒有要求上網公開會議紀錄的簽名。供會員查閱與依法送主管機關，是不同的義務。',steps,refs};
}
function fundraisingDisclosure(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/公益勸募|徵信|勸募許可/.test(t))return null;
 if(!/捐(?:贈|助|款)(?:者|人)?/.test(t)||!/(?:不(?:想|要|願|同意|希望)|反對|拒絕).{0,8}(?:全名|姓名|具名|揭露|公開)|匿名|不具名|不公開(?:姓名|全名)/.test(t))return null;
 if(/財團法人|政府專戶|政府機關|政治獻金|選舉|退費|退款|返還|冒名|別人名義|不實|逾期.{0,6}收到/.test(t))return null;
 const passive=/被動|主動捐贈|主動送來|外界主動|不曾對外募集/.test(t)&&!/已有許可|有公益勸募許可|已許可/.test(t);
 const fund=n=>law('公益勸募條例','D0050138',n), rule=n=>law('公益勸募條例施行細則','D0050146',n);
 const release=['公開版可以怎麼做','勸募團體辦理公開徵信時，若捐贈者已表示反對刊登姓名，依施行細則第6條附件二，可以不揭示全名。建議留存反對紀錄，公開版只處理姓名的揭示，不是把整筆捐款刪除，也不是免除公告與公開徵信。'];
 const records=['收據、備查和公開是三件事','捐贈者反對網站具名，不等於可以省掉依法開立的收據或留存、備查資料。應依法處理收據；若屬許可勸募，依施行細則第14條送主管機關備查的捐贈資料還須載明收據編號。若對方未提供身分、或報送欄位格式不明，請先向主管機關確認，不冒填姓名。'];
 const course=passive?['被動受贈仍可能有徵信義務','依法屬勸募團體而接受民眾主動捐贈時，依條例第6條仍須辦理公開徵信。一般至少每六個月一次；其他勸募團體並應在年度終了後五個月內函報辦理情形及收支決算，公立學校為兩個月。重大災害或國際人道救援的徵信頻率另有規範。若是一般協會而非法定勸募團體，不直接套第6條，仍依法辦理財務收支公告，且不是一律公開捐款人清冊。']:
  ['已有公益勸募許可','依條例第18條，許可勸募活動期滿的次日起三十日內，仍須公告、公開徵信並報主管機關備查。公告內容包括捐贈資料、勸募所得及收支報告。'];
 const explicit=/許可|期滿|活動/.test(t);
 const general=['先分勸募還是被動受贈','如果是已許可的對外勸募，活動期滿次日起三十日內辦理公告與備查。若是勸募團體被動受贈，按條例第6條定期公開徵信與年度函報，不能把前述三十日期限照套。'];
 return {direct:true,category:'公益勸募',title:'公益勸募徵信：捐贈者反對具名，可以不揭示全名',
  summary:passive?'如果依法屬於勸募團體，捐贈者反對具名仍須辦理徵信，但公開版可以不揭示全名。':'不必一律公開捐贈者全名，但仍要依法徵信、留存及送主管機關備查。',steps:passive?[course,release,records]:[release,explicit?course:general,records],
  refs:[{title:'公益勸募條例施行細則第6條附件二：勸募團體的捐贈清冊與徵信',source:'https://law.moj.gov.tw/LawClass/LawGetFile.ashx?FileId=0000257384&lan=C'},rule(6),rule(14),rule(9),fund(16),...(passive?[fund(6)]:explicit?[fund(18)]:[fund(6),fund(18)])]};
}
function changedAssociationDues(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/協會|社會團體/.test(t)||!/會費/.test(t))return null;
 if(/公會|工會|公司|合作社|農會|漁會|財團法人|除名|停權|捐款|退股|清算|公開|徵信|公告欠費|公布/.test(t))return null;
 if(!/漲|提高|調高|調整|更改|改了|修改|新費率|改會費|換費率/.test(t))return null;
 const difference=/差額|補繳|還要補|要補|追繳|追收|繳過|已繳|已經繳|繳了/.test(t);
 const withdraw=/退會|退出|不當會員/.test(t);
 const refund=/退費|退.{0,5}(?:剩下|剩餘|當年|金額|會費)|要回|按月退|比例退/.test(t);
 const before=/尚未|沒開|還沒|沒召開|沒經|未經|理事會|大會|核備|開始收/.test(t);
 const pending=/尚未|沒開|還沒|沒召開|沒經|未經|只(?:有|經)理事會/.test(t);
 if(!difference&&!withdraw&&!before&&!refund)return null;
 // 問的是「調會費要不要連章程一起修改」：交給既有的修章答案，不在這裡回答補差額、退會
 if(!difference&&!withdraw&&!refund&&/要不要修章|需不需要修章|一併修章|連章程|還是要.{0,8}章程|章程.{0,4}(?:一起|一併).{0,3}(?:修|改)|(?:修|改)章程嗎/.test(t))return null;
 const procedures=['先查新會費何時適用','入會費及常年會費的標準和繳納方式應訂入章程；會費數額及繳納方式須經會員（代表）大會通過、報主管機關核備後才可實施。理事會可以提案，但不能只憑理事會決議就開始按新費率收費。'];
 const arrears=['今年已繳，要不要補差額','不能只因費率提高，就認定先前已繳的會員一定要補。請看經核備的章程、決議所定生效日、適用年度及過渡規定。若寫明從下一年度起適用，就不應拿新費率追補本年度；若決議聲稱追補已結清期間而條件不清，請協會提供書面依據，再向主管機關確認。'];
 const exit=['不同意，可以自願退會','退會依章程的方式提出並保存送達紀錄，不是等協會把你除名。登記為社團法人者，另依民法第54條原則可退社，章程得約定事務年度末或設預告期，但預告最長六個月。不再具會員身分和退會前已發生的費用義務是兩回事，不能一概互相抵銷。'];
 const returnMoney=['已繳會費可否要求退回','不一定按剩餘月份退費。應看已由理事會擬訂、經會員（代表）大會通過的退費原則及章程；不要把退會當作已繳費用當然按比例退。'];
 const finance=law('社會團體財務處理辦法','D0050097',14);
 return {direct:true,category:'人民團體會務與財務',title:'調漲會費後是否補差額、可否退會，分開看',
  summary:pending&&!difference&&!withdraw&&!refund?'只有理事會通過，還不能開始收新的會費；要先完成大會通過和報主管機關核備。':difference?'已繳的會費不會因調漲就自動欠差額。先查新規定哪一天生效、從哪一期起算。':withdraw?'可以依章程提出自願退會；是否退費不是同一問題。':'先看大會決議、核備和適用年度；調整會費不等於一律追補或退費。',
  steps:[procedures,...(difference?[arrears]:[]),...(withdraw?[exit]:[]),...(refund?[returnMoney]:[])],
  refs:[association(12),association(33),finance,...(withdraw?[law('民法','B0000001',54)]:[])]};
}
function resignationAndMeeting(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>145||!/協會|社會團體/.test(t)||!/理事長/.test(t)||!/辭職|請辭|辭掉|不做了/.test(t))return null;
 if(/合作社|公會|工會|農會|漁會|公司|基金會|董事|過世|死亡|解散|銀行|印鑑|統編|撤回辭職|只剩.{0,5}(?:理事|監事)|各只剩/.test(t))return null;
 const assembly=/會員(?:[（(]?代表[）)]?)?大會|開大會|召集大會/.test(t);
 const board=/理事會/.test(t);
 const supervision=/監事會/.test(t);
 if(!assembly&&!board&&!supervision)return null;
 if(!/能開|能不能開|可以開|怎麼開|能召集|誰召集|誰來|主持|召集|主持人|代開|還能|還可不可以/.test(t))return null;
 if(!assembly&&!board&&supervision)return null;
 const oral=/口頭|只說|沒有書面|沒寫|還沒准|還沒通過|還沒決議/.test(t);
 const effective=/已生效|已經生效|已准辭|已經准辭|准辭後|決議通過.{0,6}辭職|已出缺|確定出缺/.test(t);
 const initial=['只口頭請辭，或未經決議','理事長辭職須書面提出，經理事會決議准辭，並於會員（代表）大會報告。只有口頭表示或尚未經理事會准辭，不能因此當作已出缺或換召集人。'];
 const vacancy=['已准辭並出缺','原則自出缺之日起一個月內補選。所遺任期不足六個月，得在出缺後一個月內依章程，或由常務理事互推一人代理；未設常務理事，由理事互推。不能只因有副理事長，就當然取得召集或主持權。'];
 const meeting=['理事會與會員大會能不能開','理事會與會員（代表）大會一般由理事長依法召集。已有合法補選者或有權的代理人時，由有權的人依各會議程序辦理；沒有合法召集人時，不能自行指定監事或認定副理事長可代開。依人民團體法第32條，這兩類會議不能依法召開時，得由主管機關指定理事一人召集。能召集不等於已符合開會門檻。'];
 const steps=[...(effective&&!oral?[vacancy]:oral&&!effective?[initial]:[initial,vacancy]),meeting];
 if(supervision)steps.push(['監事會另看召集人','監事會由監事會召集人依法召集。理事長辭職不會讓理事會自動取得監事會的召集權；監事會不能依法召開時，主管機關得指定監事一人召集。']);
 return {direct:true,category:'人民團體會務說明',title:'理事長請辭，會議能不能開要看合法召集人',
  summary:oral&&!effective?'口頭請辭不生效，監事不會因此取得理事會召集權。':effective&&!oral?'准辭後也不是一律不能開會，但副理事長不會因稱謂就當然能召集或主持。':'可以依法辦理，但要先確認理事長是尚未准辭，還是已經出缺，以及誰有權召集。',
  steps,refs:[law('人民團體選舉罷免辦法','D0050093',27),law('人民團體選舉罷免辦法','D0050093',17),association(25),association(32),law('人民團體會務輔導辦法','D0020094',10),law('人民團體會務輔導辦法','D0020094',11)]};
}
function formerMemberArrearsPrivacy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||/信用合作社|工會|公會|農會|漁會|基金會|公司|管委會|法院|判決|催告債權|租金|募款|捐款|清算/.test(t))return null;
 const social=/協會|社會團體/.test(t), cooperative=/合作社/.test(t);
 if(social===cooperative)return null;
 const share=/股金|股款|社股/.test(t);
 if(cooperative?(!share||!/社員|退社/.test(t)||/會費/.test(t)):(share||!/會費|會員.{0,12}欠繳|退會.{0,12}欠繳/.test(t)))return null;
 if(!/欠繳|欠費|未繳|沒繳|沒有繳|積欠/.test(t)||!/公開|公布|公告|張貼|貼(?:在|到)|上網|網路|官網|對外|群組/.test(t))return null;
 if(/可否除名|能否除名|怎麼除名|怎麼催收|時效|要不要退費|退費多少/.test(t))return null;
 const former=cooperative?/退社|前社員/.test(t):/退會|退出|前會員/.test(t);
 if(!former)return null;
 const steps=[['帳務追繳與對外公開是兩件事','能透過姓名、會員編號或其他資料認出是誰時，欠繳情形及金額屬於個人資料。使用不得超出原蒐集目的所必要範圍；超出原目的時須有法律規定的例外。未確認有合法依據，不要把可辨識的欠繳名單或金額貼到官網、社群或群組。']];
 steps.push(['已退出，不代表可以公開','退會或退社不會讓個資保護失效。退出之前是否確有欠款，應另核對當時適用的章程、資料或其他依據，不要把退出當成債務當然消滅，也不要把帳務追繳當作公開資料的理由。']);
 steps.push(cooperative?['合作社另依合作社法處理股金','合作社法第19條有就應得股息及結餘撥充欠繳股金的規定，並未授權上網公開社員資料。個別核對或通知，和對外揭露，是兩種不同的作法。']:
  ['協會仍須定期公告財務收支','財務收支公告不等於公布每人的欠費。可公布無法辨識個人的收支資料；有欠費疑義，宜向當事人個別通知並核對帳目。']);
 return {direct:true,category:cooperative?'合作社會務':'人民團體會務說明',
  title:cooperative?'合作社股金欠繳，不等於可以公開社員個資':'協會欠繳會費，不等於可以公開會員個資',
  summary:'即使已退'+(cooperative?'社':'會')+'，未確認合法依據前，不要公布可辨識個人的欠繳資料。',
  steps,refs:[law('個人資料保護法','I0050021',5),law('個人資料保護法','I0050021',20),cooperative?coop(19):law('社會團體財務處理辦法','D0050097',20)]};
}
function changedMeetingVenue(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||/社員|合作社|工會|公會|農會|漁會|公司|基金會|管委會|里民大會|視訊|投開票所|籌備|成立大會|議程改了|(?:改|變更|更換).{0,2}(?:登記|立案|章程).{0,2}(?:會址|地址)|不是開會地點/.test(t))return null;
 const assembly=/會員(?:[(]?代表[)]?)?大會|協會大會/.test(t);
 const board=/理事會|監事會|理監事(?:聯席)?會/.test(t);
 if(!assembly&&!board&&!/會議|開會/.test(t))return null;
 if(!/(?:場地|會場|會議地點|開會地點|會議室|地點|地址)(?:有)?(?:改|換|異動|變更)|(?:換|更換|改|更改|變更)(?:了|個)?(?:場地|會場|會議地點|開會地點|會議室|地點|地址)|(?:換|移|挪|改)(?:到|去|至)[^，,。？?；;]{0,20}(?:會議室|會場|活動中心|禮堂|樓)/.test(t))return null;
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const schedule=['只換地點：通知寫清楚','依章程或團體採用的通知方式，儘快把正確的新地點、原訂日期與時間，以及必要的議程或辨識資訊通知每一位應出席的人，並保留送達紀錄。若日期也變了，就不能當成只換地點處理。'];
 const short=['離開會日不到法定通知期間怎麼辦？','上述條文規定一般的會前通知期間，但未另定只換地點是否一律重新起算，也不能說原通知一定有效。若已很接近開會日，更新通知後，請向主管機關確認能否照原日召開或須另訂日期；不要把臨時換地點直接當作緊急臨時會議。'];
 const refs=[...(assembly||!board?[guide(10),association(26)]:[]),...(board||!assembly?[guide(11)]:[])];
 const actions=[{label:'聯絡承辦',view:'contact',sub:''}];
 if(!assembly&&!board) return {direct:true,category:'會議召集',title:'只換開會地點：請先選會議種類',
  summary:'先把新地點通知應出席的人。一般人民團體的會員大會和理監事會，通知期間、對象和縣府列席程序不同。',
  choices:['會員大會','理事會','監事會'].map(label=>({label,question:'協會'+label+'日期不變，只換地點，要怎麼通知？'})),
  refs,actions};
 const isSupervisor=/監事會/.test(t), isDirector=/理事會/.test(t);
 const boardKind=/聯席/.test(t)||isSupervisor&&isDirector?'理事會、監事會或理監事聯席會議':isSupervisor?'監事會':isDirector?'理事會':'理監事會議';
 const assemblyStep=['會員（代表）大會：通知應出席人員','一般應在開會十五日前通知應出席的會員或會員代表，並報請主管機關派員列席。若已報縣府，請更新新地點；只通知縣府，不能代替通知應出席人員。'];
 const boardStep=[boardKind+'：通知應出席人員','原則上要在開會七日前通知各應出席人員。若是今天改成另一間會議室，也應讓各應出席人員收到正確地點；不要套用會員大會報請縣府派員列席的規定。'];
 return {direct:true,category:'會議召集',title:'開會日期不變、只換地點：更新開會通知',
  summary:assembly?'要把新地點通知應出席的會員或會員代表，不能只跟縣府說。':'要把新地點通知各應出席人員。這是會議地點變動，不是協會登記會址變更。',
  steps:[schedule,...(assembly?[assemblyStep]:[]),...(board?[boardStep]:[]),short],refs,actions};
}
function answerMixed(q){
 const venue=changedMeetingVenue(q);if(venue)return venue;
 const arrears=formerMemberArrearsPrivacy(q);if(arrears)return arrears;
 const resign=resignationAndMeeting(q);if(resign)return resign;
 const dues=changedAssociationDues(q);if(dues)return dues;
 const donationDisclosure=fundraisingDisclosure(q);if(donationDisclosure)return donationDisclosure;
 const docs=publishDocumentPrivacy(q);if(docs)return docs;
 const fund=overdueFundraising(q);if(fund)return fund;
 const annual=yearEndAuditVacancy(q);if(annual)return annual;
 const coopRegistry=coopRegistryPrivacy(q);if(coopRegistry)return coopRegistry;
 const privacy=assemblyPrivacy(q);if(privacy)return privacy;
 const communications=assemblyCommunications(q);if(communications)return communications;
 const vacancy=chairVacancy(q);if(vacancy)return vacancy;
 const caseGrant=dissolutionAndGrant(q);if(caseGrant)return caseGrant;
 const comparison=verifiedComparison(q);if(comparison)return comparison;
 const keys=identify(q);if(!keys)return null;
 const isCoop=keys.includes('report');
 return {direct:true,category:isCoop?'合作社財務':'人民團體會務說明',
  title:keys.includes('companyInterest')?(isCoop?'股份有限公司股息與合作社清算報告，分開看':'股份有限公司股息依公司法，不是合作社社股年息'):
    keys.includes('creditor')?'合作社清算：就任後公告與終結報告，分別計算':isCoop?'合作社清算報告與股息上限，分開看':'協會入會資格與會員除名，分開看',
  summary:keys.length===1?topics[keys[0]].line[1]:'你問了兩件事，分別如下。',steps:keys.length>1?keys.map(k=>topics[k].line):[],refs:keys.flatMap(k=>topics[k].laws)};
}
if(typeof module!=='undefined'&&module.exports){module.exports={identify,answerMixed,dissolutionAndGrant,chairVacancy,monthsRemaining,assemblyCommunications,assemblyPrivacy,coopRegistryPrivacy,yearEndAuditVacancy,overdueFundraising,publishDocumentPrivacy,fundraisingDisclosure,changedAssociationDues,resignationAndMeeting,formerMemberArrearsPrivacy,changedMeetingVenue};return;}
root.verifiedMixedQuestionAnswer=answerMixed;
})(typeof window!=='undefined'?window:globalThis);
