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
 const one=/只剩(?:下)?(?:一|1|壹)(?:位|名|個|人)?監事|監事(?:會)?(?:辭職|請辭)?(?:只|僅)?剩(?:下)?(?:一|1|壹)(?:位|名|個|人)|(?:一|1|壹)(?:位|名|個)監事.{0,7}(?:單獨|自己)/.test(t);
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
 if(t.length>155||/社員|合作社|工會|公會|農會|漁會|公司|基金會|管委會|里民大會|視訊|投開票所|籌備|成立大會|議程改了/.test(t)||negatesMeetingVenue(t))return null;
 if(/(?:改|變更|更換).{0,2}(?:登記|立案|章程).{0,2}(?:會址|地址)/.test(t)&&!negatesRegisteredAddress(t))return null;
 const assembly=/會員(?:[(]?代表[)]?)?大會|協會大會/.test(t);
 const board=/理事會|監事會|理監事(?:聯席)?會/.test(t);
 if(!assembly&&!board&&!/會議|開會/.test(t))return null;
 if(!/(?:場地|會場|會議地點|開會地點|會議室|地點|地址)(?:有)?(?:改|換|異動|變更)|(?:換|更換|改|更改|變更)(?:了|個)?(?:會員大會|理事會|監事會)?(?:場地|會場|會議地點|開會地點|會議室|地點|地址)|(?:換|移|挪|改)(?:到|去|至)[^，,。？?；;]{0,20}(?:會議室|會場|活動中心|禮堂|樓)/.test(t))return null;
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
function familyAssemblyProxy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const trade=/商業同業公會/.test(t);
 if(t.length>145||/合作社|工會|農會|漁會|基金會|管委會|里民大會|理事會|監事會|理監事會|通訊選舉|出席門檻|委託書格式|選票怎麼填/.test(t))return null;
 if(!trade&&(!/協會|社會團體/.test(t)||/公會|職業團體/.test(t)))return null;
 const explicitAssembly=/會員(?:[(]?代表[)]?)?大會|(?:協會|公會)大會|出席大會/.test(t);
 const relatives=/太太|先生|妻子|丈夫|老公|老婆|配偶|夫妻|家屬|家人|親友|朋友|女兒|兒子/.test(t);
 const representative=trade||/會員代表大會/.test(t);
 const negative=representative?/(?<!是)不是(?:本會|同一公會的?)?會員代表|非會員代表|沒有會員代表資格/.test(t):
  /(?<!是)不是(?:本會|該協會的?)?會員(?!代表)|非會員(?!代表)|沒有會員資格|不是同一(?:個)?協會的會員/.test(t);
 const both=/夫妻.{0,9}(?:同是|都是|皆是|均為|同為).{0,9}會員|兩人.{0,7}(?:同是|都是|皆是|均為).{0,9}會員/.test(t)&&!representative
  || representative&&/夫妻.{0,9}(?:同是|都是|皆是|均為|同為).{0,9}會員代表/.test(t);
 if(!explicitAssembly&&!(both&&/投票|選舉|表決/.test(t)))return null;
 if((!relatives&&!negative)||!/委託|代理|代為|代替|代.{0,8}(?:出席|投票|表決|簽到)|代簽|代投|旁聽/.test(t))return null;
 const observe=/旁聽|只列席|只想列席/.test(t);
 const role=representative?'會員代表':'會員';
 const group=trade?'同一商業同業公會':'同一協會';
 const refs=[trade?law('商業團體法','D0050100',19):association(42)];
 const steps=[['合法的代理方式','不能親自出席時，可書面委託'+group+'的其他'+role+'代理；每位受託人只能代理一人。'+(trade?'商業同業公會的代理總人數還不得超過親自出席人數的二分之一。':'有同一團體的有效身分才符合這項資格，夫妻或親友關係本身不能代替資格。')]];
 if(!trade&&/投票|選舉|改選|罷免/.test(t)){
  steps.push(['選舉或罷免','若是會員大會的選舉或罷免，也須書面委託同一團體有資格的人；若會員或會員代表有類別限制，應委託同一類別。']);
  refs.push(law('人民團體選舉罷免辦法','D0050093',7));
 }
 if(observe)steps.push(['旁聽不是代理出席','能不能以訪客身分旁聽，請看協會會議規則或詢問主辦單位；代理出席的規定並未授予訪客旁聽權。即使准許，旁聽也不算代理出席，不能代簽到、計入出席名額或表決。']);
 if(/簽到|代簽/.test(t))steps.push(['簽到須反映實際到場與委託','不要把非會員簽到當作會員本人或有效代理出席。']);
 return {direct:true,category:trade?'職業團體':'人民團體會務說明',title:observe?'親友旁聽不等於代理出席':negative?'非'+role+'不能代理出席會員大會':'配偶或親友能不能代理，要看是否為同一團體的'+role,
  summary:observe?'只去旁聽要先問主辦單位；即使准許旁聽，也不能替會員簽到或投票。':negative?'不可以。未具這場大會所需的'+role+'資格的人不能代理；配偶或親友關係及委託書都不能代替資格。':both?'可以。兩人都是'+group+'具資格的'+role+'時，可用書面委託；每個人至多代理一人。':'先確認受託人是不是'+group+'有資格的'+role+'；不是就不能代理，是才可用書面委託。',steps,refs};
}
function dualBoardVacancies(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/協會|社會團體/.test(t)||/合作社|公會|工會|農會|漁會|公司|基金會|管委會|財報|決算|清算/.test(t))return null;
 if(!/理監事/.test(t)&&!(/理事(?!長|會)/.test(t)&&/監事(?!會)/.test(t))&&!(/理事會/.test(t)&&/監事會/.test(t)))return null;
 if(!/剩|出缺|缺額|空缺|辭職|請辭|辭光|遞補|缺席|請假|沒人|沒有理事/.test(t))return null;
 if(!/補選|召集|開會|指定|縣府|主管機關|遞補|缺額/.test(t))return null;
 const end=/都辭光|全體.{0,6}(?:請辭|辭職|解任)|全部.{0,7}(?:請辭|辭職|解任)|沒(?:有)?人召集|無人召集|沒有現任理事/.test(t);
 const leave=/請假|因病|因故缺席/.test(t)&&!/辭職|出缺|已解任|視同辭職/.test(t);
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const refs=[association(29),association(31)];
 const legalVacancies=['先確認是不是已經出缺','理事、監事辭職原則上須以書面提出，分別經理事會或監事會決議准辭才解任。只請假或當次未出席，不等於出缺。要先對照章程員額、現任人數、辭職是否生效以及候補名單。'];
 const replacement=['理事和監事分開遞補、分開計算','先由候補理事遞補理事，候補監事遞補監事。各組遞補後若仍未達各自章程名額的三分之二，該組應補選足額。不能把兩組人數加在一起，也不能只發函就取代遞補、召集或選舉。'];
 const convening=['依法召集不等於代替補選或作決議','會員（代表）大會或理事會不能依法召開時，主管機關得指定一名理事召集；監事會不能依法召開時，得指定一名監事召集。指定的是召集人，不是直接指定當選者。開會及選舉仍須符合法定及章程程序。'];
 const noOfficers=['沒有可指定的現任理事時','不能只憑會員自行召集就完成補選。若全體確已解任、又沒有候補可遞補，主管機關無法依第32條指定理事召集時，得依法限期整理。請把辭職決議、現任及候補名單和章程提供承辦，由主管機關依個案判斷，不是函報就會自動核准。'];
 const attendance=['請假只影響實際出席','請假不會直接空出理事或監事席次，不可因此辦遞補或補選。理事會及監事會應分別核對應出席人數和法定成會門檻；不能只因各剩一人到場，就讓他們代兩會作決議。'];
 if(leave)return {direct:true,category:'人民團體會務說明',title:'只剩一人出席，不等於理事或監事出缺',summary:'不可以把請假當成缺額補選。先分別確認兩個會議有沒有達到開會門檻。',steps:[attendance],refs:[...refs,guide(16)]};
 refs.push(guide(9),law('人民團體選舉罷免辦法','D0050093',17),law('人民團體選舉罷免辦法','D0050093',27),association(32));
 if(end)refs.push(association(58),guide(21),guide(22),{title:'內政部函釋：全體理監事確已解任且候補不遞補',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220206'});
 const steps=[legalVacancies,replacement,convening,...(end?[noOfficers]:[])];
 if(/理事長.{0,8}(?:辭職|請辭|出缺)/.test(t))steps.push(['理事長職務另外處理','理事長職務出缺，原則上自出缺日起一個月內補選；剩餘任期不足六個月時，依選罷辦法第17條得依章程或由有權者互推代理人。處理理事長出缺不能取代理事及監事缺額程序。']);
 return {direct:true,category:'人民團體會務說明',title:'理事和監事同時出缺：分開遞補，不是只報縣府就補選',
  summary:end?'不能由會員自行補選。先確認是否已解任、能否遞補；全體確已解任又無人可召集時，由主管機關依法判斷。':'不可以只報縣府就補選。先確認確實出缺，再分別處理理事、監事的候補遞補與補選。',
  steps,refs,actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopBoardVacancies(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/合作社/.test(t)||/信用合作社|協會|工會|公會|農會|漁會|銀行|公司|聯合社|社員代表出缺|清算|罷免|財報|決算/.test(t))return null;
 if(!/理事|監事|理監事/.test(t)||!/出缺|缺額|辭職|請辭|遞補|各剩|只剩|請假|缺席/.test(t)||!/補選|遞補|召集|指定|開會|縣府|主管機關|選主席|選新主席|另外選/.test(t))return null;
 const rule=n=>law('合作社選舉罷免辦法','D0050022',n);
 const chair=/理事(?:會)?主席|監事(?:會)?主席/.test(t);
 const absent=/請假|因病|因故缺席|未出席/.test(t)&&!/辭職|已出缺|確定出缺|解任/.test(t);
 const dual=/理監事/.test(t)||/理事(?!會主席)/.test(t)&&/監事(?!會主席)/.test(t);
 const filing=/報|縣府|主管機關/.test(t);
 const detail=/補選|遞補/.test(t);
 if(!absent&&!chair&&!dual&&!(filing&&detail))return null;
 if(absent)return {direct:true,category:'合作社會務',title:'合作社理事或監事請假，不等於出缺',summary:'不可以把一次請假當成正式出缺，也不能因此辦補選。',steps:[
   ['出席不足和席次空缺分開','合作社理事會、監事會必須分別達到應有理事或監事過半數出席，才可開會。單純請假是當次出席問題；如有正式空缺，才按選罷辦法遞補或補選。']
 ],refs:[coop(53),coop(54),rule(7)]};
 const remaining=/未滿六|不足六|不到半年|剩(?:下|餘)?(?:不滿|不到)?(?:[1-5一二兩三四五])個?月/.test(t);
 const seat=['一般理事、監事出缺：先分別遞補','候補理事和候補監事各依次遞補。遞補後，只要有一組仍未達該組章程規定名額的半數，就應召開社員大會或依法設置的社員代表大會辦理該組補選。不要把兩組人數相加，也不能套用一般協會的三分之二。'];
 const effective=['書面送達社址就生效','理事、監事或主席請辭須以書面提出；辭職書送達合作社社址所在地時即生效，不必等理事會或監事會批准。應完成交接，辭職和遞補情形應在會議提出報告。'];
 const meeting=['報備不等於完成補選','仍應按規定召集、通知並辦理選舉。若現任人數太少、候補無法遞補或無法依法召集，請先備妥章程、現任和候補名單與相關紀錄，向合作社的主管機關確認可行程序；不要把函報當成已通過。'];
 const chairStep=['主席職務出缺另看任期','理事會主席或監事會主席出缺，原則上自出缺日起一個月內，分別召開理事會或監事會補選；所遺任期未滿六個月時，得各由理事或監事互推一人代理。這與一般理監事席次的半數門檻不是同一件事。'];
 return {direct:true,category:'合作社會務',title:chair&&!dual?'合作社主席出缺：補選或代理，看剩餘任期':'合作社理監事出缺：分別遞補，未達半數才補選',
 summary:chair&&!dual?(remaining?'剩餘任期未滿六個月時，不是一定要立即補選，可以先由同一會的理事或監事互推一人代理。':'主席出缺原則一個月內由同一會補選；剩餘任期未滿六個月時，也可以互推一人代理。'):/(?:理事會|監事會)(?:批准|准辭|同意)|書面.{0,9}社址/.test(t)?'不必等理事會或監事會批准。書面辭職送達社址即生效，確有缺額後要先遞補，再看是否需要補選。':filing?'不能只報縣府就補選。先分別遞補，遞補後各自低於章程名額半數的組別才須補選。':'先由候補依序遞補，各組遞補後仍未達章程名額半數，才須補選。',
 steps:[...(chair?[chairStep]:[]),...(dual||!chair?[seat]:[]),effective,...(filing||dual?[meeting]:[])],
 refs:[rule(7),rule(8),...(filing||dual?[coop(46),coop(48),rule(18),rule(29)]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function creditCooperativeVacancy(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/信用合作社/.test(t)||/這和一般合作社|和一般合作社|跟一般合作社|協會|工會|公會|股金|股息|改選結果|徵求候選|登記候選|新當選|就任前|主席|經理人|請假|請公假/.test(t))return null;
 if(!/理事|監事|理監事/.test(t)||!/出缺|缺額|只剩|僅剩|剩下|各剩|夠不夠|未達|無人|沒(?:有)?監事|補選|遞補/.test(t))return null;
 if(!/指派|指定|代行|補足|補人|補選|遞補|成會|派人/.test(t))return null;
 const central=/指派|指定|代行|補足|補人|派人/.test(t);
 const directorsWorking=/理事會(?:還能|仍能|可以正常|照常|正常|沒有問題)(?:開|開會|運作|成會)?/.test(t);
 const onlySupervisor=/監事.{0,3}(?:只|僅)?剩(?:下)?(?:一|1)(?:個|位|名|人)|只剩(?:一|1)(?:位|個|名|人)監事/.test(t);
 const empty=/監事無人|監事(?:全)?沒(?:有)?人|沒有(?:任何)?監事|監事全部出缺/.test(t);
 const summary=central?(directorsWorking&&onlySupervisor&&!empty?'不會只因還有一位監事就由金管會派人。只剩一位，不等於監事無人。':'理事未達三人且不能成會，或監事無人時，金管會可以依法指派，但不是一定會派。'):'先看候補遞補，再以章程名額判斷補選；不能只報縣府就視為補選完成。';
 const delegation=['中央指派是暫代，不是補選','理事未達三人且無法成會，或已沒有任何監事時，中央主管機關是金融監督管理委員會（金管會），得指派必要人員暫代職權，期限到補選完成為止。只剩一名監事不等於監事無人；即使符合任一條件，也不是自動指派。'];
 const replace=['缺額及補選怎麼算','設有候補者依次遞補；專業理事缺額須由有同項資格的候補理事遞補，並按規定報地方主管機關備查。一般理事或監事遞補後若仍未達各自章程規定名額的一半，應自出缺日起二個月內舉行補選；涉及辦法第9條資格的缺額，須另外計算並依第39條辦理。'];
 return {direct:true,category:'信用合作社',title:'信用合作社理監事出缺：遞補、補選與金管會暫代',
  summary,steps:central?[delegation,replace]:[replace,delegation],
  refs:[law('信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法','G0380069',44),law('信用合作社法','G0380058',5)]};
}
function schoolParentFiling(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/家長會|家長委員會/.test(t)||!/改選|換人|換了|改任|接任|異動|更換|補選|改聘/.test(t)
    ||!/報|送哪|寄給|寄哪|交給|交哪|哪個單位|哪個窗口|找哪/.test(t))return null;
 if(/家長協會|另(?:外|行)?立案|人民團體法|幼兒園|托兒所|基金會|台北|臺北|新北|高雄|台南|臺南|台中|臺中|桃園|花蓮/.test(t))return null;
 const ministryRef={title:'教育部主管之高級中等學校學生家長會設置辦法第2條與第28條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0000136'};
 const schoolLaw={title:'國民教育法第48條',source:'https://edu.law.moe.gov.tw/LawContent.aspx?id=FL008927'};
 const roster={title:'屏東縣政府教育處組織職掌：國民中小學家長會業務',source:'https://portal.ptc.edu.tw/personnel/rss2.php?ty=charge'};
 const national=/教育部主管.{0,16}(?:學校|高級中等|高中|高工|高職)|國立.{0,15}(?:高級中等|高中|高職|高工|家商|女中)|屏東女中/.test(t);
 const countyBasic=/(?:屏東縣立|屏東縣|屏東|縣立).{0,14}(?:國小|國中|國民中學|國民小學)|縣立國中小/.test(t);
 const countySenior=/(?:縣立|縣府主管).{0,14}(?:高中|高職|高級中等)/.test(t);
 const midterm=/任期中|學期中|中途|接任|辭職|只換會長|會長換人|換了會長/.test(t);
 if(national&&!countySenior)return {direct:true,category:'教育業務分流',title:'教育部主管高中：由學校報國教署備查',
  summary:'以國立屏東女中這類教育部主管高中為例，由學校報教育部國民及學前教育署（國教署），不是報屏東縣府社會處。',
  steps:[['第一次會員代表大會後','每屆第一次會員代表大會開會後一個月內，由學校送會議紀錄及會長、副會長、家長委員與會務人員名冊，報國教署備查。'],['會長在任期中異動','第28條也適用會長異動。請先交本校家長會承辦人確認異動紀錄、名冊與報送時點，由學校報國教署。']],
  refs:[ministryRef]};
 if(countyBasic&&!national)return {direct:true,category:'教育業務分流',title:'屏東縣主管國中小：找學校或縣府教育處',
  summary:'若是由屏東縣主管的國中或國小，請先找學校的家長會承辦人，也可向縣府教育處 08-7320415 轉 3621 詢問。',
  steps:[[midterm?'任期中換會長':'本學年度改選',midterm?'請先確認這次是否只是會長異動，提供相關會議紀錄、更新後名冊向學校或教育處確認應附資料與送件期限；不直接套整屆改選規定。':'可先準備會議紀錄與改選後名冊，交學校承辦確認適用自治法規、報備文件及期限。不要用人民團體改選書表。']],refs:[schoolLaw,roster]};
 if(countySenior&&!national)return {direct:true,category:'教育業務分流',title:'屏東縣立高中：先找校方及縣府教育處',
  summary:'請找校方的家長會承辦人，或撥 08-7320415 請總機轉教育處的高中職業務。縣立高中不直接套用國立高中報國教署的程序。',
  steps:[['確認本次異動','告知學校是年度改選、補選或任期中會長異動，確認主管機關、報備文件和期限。']],refs:[{title:'屏東縣政府教育處組織職掌',source:roster.source}]};
 return {direct:true,category:'教育業務分流',title:'家長會改選報哪裡？先選學校主管機關',
  summary:'學校家長會不是向社會處立案的協會。國立和縣立的學校，報備窗口可能不同。若不確定，由學校的家長會承辦人先確認主管機關。',
  choiceHeading:'請選擇學校或團體類型',choices:[
   {label:'屏東縣立國中小',question:'屏東縣立國小或國中家長會改選，要報哪裡？'},
   {label:'屏東縣立高中',question:'屏東縣立高中家長會改選，要報哪裡？'},
   {label:'教育部主管高中',question:'教育部主管高中家長會改選，要報哪裡？'},
   {label:'另外立案的家長協會',question:'我們是另外立案的家長協會，理事長改選要報誰？'}
  ],refs:[schoolLaw,ministryRef]};
}
function negatesRegisteredAddress(t){
 return /(?:沒(?:有)?要?|不用|不必|不會|並非要|不是要|不是)(?:異動|改|更換|變更)?(?:登記|立案)?(?:會址|登記地址)|(?:登記|立案)會址(?:不變|沒改|不改)/.test(t);
}
function negatesMeetingVenue(t){
 return /(?:不是|沒有要|不用|並非)(?:改|換|變更|更換|異動)?(?:會議室|開會地點|會議地點|會場|開會場地)/.test(t);
}
function associationRegisteredAddress(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/協會|社會團體/.test(t)||/合作社|工會|公會|公司|基金會|財團法人|農會|漁會|政黨|銀行|稅籍|跨縣|外縣市|不同縣市/.test(t)||negatesRegisteredAddress(t))return null;
 const registered=/登記會址|立案會址|登記地址|立案地址|遷地址|遷址|遷會址|換會址|改會址|搬.{0,7}會址|搬辦公室|會址.{0,4}(?:變更|異動)/.test(t);
 if(!registered||!/改|換|異動|搬|遷|變更/.test(t)||!/怎麼|如何|要不要|需要|要|能|可否|須|嗎|報備|備查|核備/.test(t))return null;
 if(/選舉地點|改期|視訊|原日期|日期不變/.test(t)&&!negatesMeetingVenue(t))return null;
 const newChair=/換理事長|理事長換人|理事長.{0,5}(?:異動|改選|變更)|(?:改選|補選)理事長/.test(t);
 const exact=/完整(?:的)?門牌|章程.{0,10}(?:全址|完整地址)|章程.{0,10}寫(?:了|有)?門牌/.test(t);
 const nationwide=/全國性|全國級|立案主管機關.{0,3}內政部/.test(t);
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const office=['登記會址異動：先決議，再備查','先由理事會決議，將變更後會址報原立案主管機關備查。可先準備載明新址的理事會議紀錄及新址使用證明；如向屏東縣府辦理，實際書表及附件請由承辦確認。這不是臨時更換開會場地。'];
 const amended=['是否也要修改章程','對照現行章程：若條文寫明舊門牌，或搬遷會改到條文明載的區域，就要另外辦理修章；不能只靠理事會決議改章程。若新址仍符合現行條文且不需改章程，不因換門牌就另開會員大會。章程異動應於三十日內報主管機關核備；已登記為社團法人者，修章另須核對民法第53條並辦理法院登記事項變更。'];
 const chair=['理事長變更：與會址分開核對','理事長須依章程和選舉程序產生。選任職員簡歷冊或負責人名冊異動，應於三十日內報主管機關核備；如有會員（代表）大會紀錄，大會閉會後三十日內另須送備查。不要因等待會址資料而錯過理事長異動的期限。'];
 const combined=['可否同一份公文送件',nationwide?'全國性團體可參考內政部改選申報指引：同時需變更會址時，加附新會址使用同意書；仍需備齊會址決議及改選資料。':'兩項可以一併準備，但法律上的備查和核備各有要件。是否可同一份公文併送，請向原立案主管機關確認；未確認不要假定一件會自動辦完兩項。'];
 const refs=[guide(8),association(12),association(27),association(54),law('民法','B0000001',53)];
 if(newChair)refs.push(guide(12));
 if(newChair&&nationwide)refs.push({title:'內政部：全國及省級社會團體改選申報',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=200&_CSN=1633&n=8361&page=1&sms=9015'});
 return {direct:true,category:'人民團體會務說明',title:newChair?'遷會址與理事長異動：先分清兩項程序':'變更協會登記會址：理事會決議後報備查',
  summary:newChair?'會址變更和理事長異動是兩項程序，可以一併準備，不能用一項取代另一項。':exact?'章程寫的是舊門牌，搬家就涉及修章；除了理事會辦會址異動，也要走修章程序。':'您問的是協會的登記會址，不是開會通知。先經理事會決議通過，再報原立案主管機關備查。',
  steps:[office,...(newChair?[chair,combined]:[]),amended],refs,actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function inspectAndPublishBoardMinutes(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/協會|社會團體/.test(t)||/合作社|工會|公會|農會|漁會|基金會|開放政府|法院|勸募|選舉結果|董事會|管委會/.test(t))return null;
 if(!/理事會.{0,6}(?:紀錄|記錄|議事錄|記要)|理事會的?會議.{0,6}(?:紀錄|記錄)/.test(t)||!/查閱|調閱|翻閱|查理事會|看理事會|看.{0,6}(?:紀錄|議事錄)|要求看/.test(t))return null;
 if(!/監事|會員/.test(t)||!/公開|公布|公告|上網|網站|官網|貼.{0,6}網路|讓大家看/.test(t))return null;
 if(/不要公開|不公開|沒有要公開|不打算公開|並非要公開/.test(t))return null;
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const audit=/監事/.test(t);
 const steps=[
  ['依法在協會內部查閱','理事會紀錄應由團體自行留存，提供會員或會員代表查閱。'+(audit?'監事具有會員或會員代表身分時，也可依法查閱；屬監事會監察的經費收支或工作執行情形，理事會要送監事會監察。這跟一名監事自行對外公開資料不同。':'團體應安排查閱方式，原始紀錄不必因此上網。')],
  ['查閱、報備和公開是三件事','理事會紀錄不是一律要報縣府或上網。理事會決議依法須報主管機關核辦時，才按規定送件；會員（代表）大會紀錄閉會後三十日內報備，是另一項義務。'],
  ['上網前先確認個資使用依據','查閱權不等於可以轉傳或上網。可辨識的姓名、簽名、電話或個人發言等資料，須核對原蒐集目的、必要範圍及是否有目的外利用的合法事由；未確認前不公開。只想對外說明決議，可另製作無法辨識個人的摘要，原始紀錄仍要留存。']
 ];
 return {direct:true,category:'人民團體會務說明',title:'理事會紀錄：內部查閱與對外公開是兩件事',
  summary:'可依規定在會內查閱，不代表可以把未遮蔽的理事會紀錄、簽到或名單貼上官網。',
  steps,refs:[guide(12),...(audit?[guide(17)]:[]),law('個人資料保護法','I0050021',5),law('個人資料保護法','I0050021',20)]};
}
function temporaryMeetingNotice(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(t.length>145||/合作社|社員大會|工會|公會|農會|漁會|管委會|公司|基金會|家長會|改選|選舉|罷免|成立|籌備|議程|收支|財報|決算|章程|委託|視訊/.test(t))return null;
 if(!/臨時|緊急事故|緊急會議/.test(t)||!/通知|送達|寄出|寄開會|發函/.test(t)
    ||!/最晚|多久|幾天|幾日|前一(?:天|日)|提前|什麼時候|哪一天|改期|來不及|昨晚|當天/.test(t))return null;
 if(!/協會|社會團體|人民團體|理事|監事|會員大會|會員代表大會|臨時會議/.test(t))return null;
 const assembly=/會員(?:[(]?代表[)]?)?大會|協會大會/.test(t);
 const combined=/理監事(?:聯席)?會議?/.test(t);
 const director=/理事會/.test(t),supervisor=/監事會/.test(t),board=combined||director||supervisor;
 const deferred=/改期|延期|延後|挪日|換日期/.test(t);
 const notEmergency=/沒有緊急|並非緊急|不是緊急|不是因為緊急|只是.{0,12}(?:排不出|改期|延後|喬時間)/.test(t);
 const associationRef=association(26);
 const guideRef=law('人民團體會務輔導辦法','D0020094',11);
 if(!assembly&&!board){
  return {direct:true,category:'會議召集',title:'臨時會議通知：請先選會議種類',
   summary:'會員大會和理事會、監事會的通知期限不同。即使叫做臨時會議，能否在開會前一日送達，要看是不是因緊急事故召集。',
   choices:['會員大會','理事會','監事會'].map(label=>({label,question:'協會'+label+'：'+raw})),
   refs:[associationRef,guideRef]};
 }
 const boardName=combined?'理監事聯席會議':director&&supervisor?'理事會、監事會':director?'理事會':'監事會';
 const steps=[
  ...(assembly?[['會員（代表）大會','一般應在開會十五日前通知應出席的會員或會員代表，並報請主管機關派員列席；一般臨時會員大會也是如此。']]:[]),
  ...(board?[[boardName,'一般應在開會七日前，將會議種類、時間、地點和議程通知各應出席人員；沒有緊急事故的臨時會議也不例外。']]:[]),
  ['緊急事故才有例外','因緊急事故召集臨時會議，通知須於開會前一日送達；只在前一天寄出、沒有送達，不算符合例外。排程來不及或單純改期，不當然是緊急事故。']
 ];
 if(deferred)steps.push(['日期已經改了','請依會議種類，以新會議日期安排通知，不能只因延期就改用前一日。'+(assembly?'若會員大會已報主管機關列席，請更新日期。':'')+'若情形是否符合緊急例外不明，向主管機關確認。']);
 return {direct:true,category:'會議召集',title:assembly&&board?'會員大會與理監事會：分開看通知期限':'臨時'+(assembly?'會員大會':boardName)+'：不是一律前一天通知',
 summary:notEmergency?'沒有緊急事故，不能用前一日送達的例外，應遵守原有的通知期限。':'一般臨時會議仍適用原通知期限；因緊急事故召集，才有前一日送達的例外。',
 steps,refs:[...(assembly?[associationRef]:[]),...(board?[guideRef]:[]),...(deferred&&assembly?[{title:'內政部函釋：會員大會延期與通知',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220065&sms=12360'}]:[])]};
}
function withdrawalAndAssemblyRoll(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/協會|社會團體/.test(t)||/合作社|社員大會|工會|公會|農會|漁會|公司|基金會|財團法人|董事|理事會.{0,6}出席|退費|開除|除名|欠會費|欠費|停權/.test(t))return null;
 if(!/大會/.test(t)||!/退會|退出|不當會員|退社/.test(t)
    ||!/人數|人頭|應出席|名冊|出席資格|還要算|還算|扣掉|扣除|成會/.test(t))return null;
 const noWithdrawal=/沒有退會|未申請退會|沒退會/.test(t);
 if(noWithdrawal&&!/請假|缺席/.test(t))return null;
 const pending=/還沒生效|還未生效|尚未生效|未生效|只是.{0,5}(?:提出|送出)|才.{0,4}(?:提出|送出)/.test(t);
 const effective=!pending&&!/(?:不確定|不知道|不清楚).{0,10}生效|是否已(?:經)?生效/.test(t)&&/已(?:經)?生效|確定生效|退會生效後|已經退會|已完成退會/.test(t);
 const rosterFixed=/名冊.{0,7}(?:已|審定完|早就)|審定後|審完名冊|名冊定案/.test(t);
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const first=['先確認退會何時生效','收到申請不等於已退會。先查章程的退會方式、送達與生效日。若是已登記的社團法人，民法第54條原則上得退社，但章程可以約定事務年度終了或預告期，預告期最長六個月。'];
 const roll=['應出席名冊怎麼處理','理事會通常須在大會十五日前審定應出席資格，會籍仍應隨時更新。退會若在審定前已生效，就不列作當時有資格的會員；若在審定後才生效，請保留原審定名冊、退會生效及會籍異動紀錄，會前請承辦確認應出席名冊如何處理，不要自行從原名冊扣人。'];
 const attendance=['應出席人數和實際出席人數不同','一般會員（代表）大會以應出席人員為基準，要過半數出席；實際出席以簽到或報到計算。已審定具資格的會員若只是請假，或退會仍未生效，不能只因這些原因就從應出席人數扣掉。'];
 if(noWithdrawal)return {direct:true,category:'人民團體會務說明',title:'會員只是請假，不會從應出席人數扣掉',
  summary:'要算。仍具資格且在審定名冊上的會員，即使請假也要計入應出席人數；沒到場不算實際出席，依法委託出席的另依規定計算。',
  steps:[attendance],refs:[guide(10),guide(16),association(27),association(42)]};
 return {direct:true,category:'人民團體會務說明',title:'退會是否生效，與會員大會怎麼算應出席人數',
  summary:pending?'如果退會還沒生效，且原本具有出席資格，不能只因收到申請就把人扣掉。':effective?(rosterFixed?'請先核對退會生效日與名冊審定日。若審定後才生效，先更新會籍並確認名冊作法，不要直接扣人。':'退會在審定名冊前已生效者，不列入當時有資格的會員；名冊已審定才生效則要另確認。'):'只收到退會申請，不能直接把會員從應出席人數扣掉。先確認退會是否已生效。',
  steps:[first,roll,attendance],
  ...(!pending&&!effective?{choiceHeading:'確認退會狀態',choices:[
   {label:'退會已生效',question:'協會會員退會已生效，會員大會應出席人數怎麼算？'},
   {label:'只提出、還沒生效',question:'協會會員退會還沒生效，會員大會應出席人數怎麼算？'}
  ]}:{}),
  refs:[guide(10),guide(16),association(27),law('民法','B0000001',54)],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function memberMeetingExpenseFunding(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>155||!/協會|社會團體/.test(t)||/合作社|工會|公會|農會|漁會|基金會|公司|家長會|管委會|國外/.test(t))return null;
 if(!/會員(?:[(]?代表[)]?)?大會|協會大會/.test(t)||!/出席費|紀念品|禮品|會議費|場地費|場租/.test(t))return null;
 if(/高雄市|臺南市|台南市|新北市|臺北市|台北市|臺中市|台中市|桃園市|嘉義縣|花蓮縣|臺東縣|台東縣/.test(t)&&!/屏東縣/.test(t))return null;
 if(/可以收|要繳|再繳|向會員收|收會員/.test(t)&&!/發給|發會員|發出席費|發紀念品|發禮品/.test(t))return null;
 if(!/發|補助|核銷|可否|可以|能不能|可不可以/.test(t))return null;
 const own=/不用.{0,10}補助|不含.{0,10}補助|自有經費|自有資金|自籌款|協會自己的|用會費/.test(t);
 const county=/(?:屏東縣|屏東縣府|縣府|本縣).{0,13}補助|屏東縣政府對民間團體補助經費作業要點/.test(t)&&!/不用.{0,10}補助|不含.{0,10}補助|沒有.{0,10}補助/.test(t);
 const special=/專案|成果活動|同一天|同天|同日|另外核定|個別核定|計畫書/.test(t);
 if(!own&&!county&&/中央補助|教育部補助|文化部補助|國教署補助|其他縣市/.test(t))return null;
 const grantRefs=[{title:'屏東縣政府對民間團體補助經費作業要點第3點、第5點第2款第6目',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'},{title:'屏東縣政府教育處115年度民間團體補助公告及附件',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'}];
 const finance=[law('社會團體財務處理辦法','D0050097',11),law('社會團體財務處理辦法','D0050097',19),association(34)];
 const grant=['屏東縣的一般補助','一般要點把會員大會、理事會／監事會議與例行會議列為不予補助項目。會員大會本身的出席費、紀念品或場地費，不要用這項一般補助核銷。'];
 const plan=['有專案核定或同一天另辦活動','第3點保留其他法令及相關審查規範。先對照專案核定函、核定經費表和核銷規定。若另有已核定成果活動與大會同日，應分開核對活動內容、費用和憑證；同一天辦理或改列品名，不代表大會的支出就可核銷。'];
 const ownFunds=['協會自己的經費','縣府補助的排除規定不直接決定自有經費可不可支用。先核對章程、會務用途、預算及有權機關的決議；有預算也不代表任何項目都可以發。規定或個案不清時，支出前請向主管機關確認。'];
 const article=['一般會員和執行職務的理監事不同','財務處理辦法第19條講的是理事、監事因執行職務所需的支給，不能當作向一般會員發放出席費的依據，也沒有規定會員一律只能領紀念品。'];
 const actions=[{label:'聯絡承辦',view:'contact',sub:''}];
 if(!own&&!county)return {direct:true,category:'人民團體財務',title:'會員大會要發出席費或紀念品？先看經費來源',
  summary:'先分清協會是要支出發給會員，還是要向會員收費；這是兩件事。若是要發給會員，再分縣府補助款和協會自己的經費。',
  choiceHeading:'選擇支出的經費來源',choices:[
   {label:'屏東縣府補助款',question:'協會要用屏東縣補助款發會員大會的出席費或紀念品，可以核銷嗎？'},
   {label:'協會自有經費',question:'協會會員大會想發出席費或紀念品，只用協會自己的錢，可以嗎？'}
  ],steps:[article],refs:finance,actions};
 return {direct:true,category:'人民團體財務',title:county?'會員大會費用：屏東縣一般補助不予核銷':'會員大會用自有經費：先確認有沒有支出依據',
  summary:county?(special?'一般補助不核銷會員大會本身的支出。若另有核定專案，請分開看並核對專案核定項目。':'不能把會員大會的出席費或紀念品列入屏東縣一般補助核銷。'):'若是協會自己的錢，不能直接套用縣府補助規定，也不能逕自認為出席費或紀念品一定可以發。',
  steps:[...(county?[grant,plan]:[]),...(own?[ownFunds]:[]),article],refs:[...(county?grantRefs:[]),...finance],actions};
}
function missedSupervisorNotice(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/協會|社會團體/.test(t)||/合作社|公會|工會|農會|漁會|公司|基金會|董事會|罷免|股東/.test(t))return null;
 if(!/理事會|理監事聯席/.test(t)||!/監事/.test(t)||!/沒(?:有)?通知|未通知|漏通知|不通知|沒(?:有)?邀請|沒有收到通知|只通知理事|沒通知到/.test(t)
    ||!/列席|出席|決議|有效|無效|算數|通過|決算|直接送|送縣府/.test(t))return null;
 if(/指定召集|召集人出缺|理事長請辭/.test(t))return null;
 const joint=/理監事聯席|理事監事聯席/.test(t);
 const yearEnd=/年度決算|決算報告|審決算|工作會計報告/.test(t);
 const charter=/章程.{0,9}(?:要求|規定|寫|載明|應|須)/.test(t);
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const board=['單獨理事會：先看誰應通知','會務輔導辦法第11條要求通知應出席人員。不能把監事一律當成理事會的有表決權成員；是否有應通知監事列席的要求，應查現行章程、適用規則或有效的團體決議。若章程載明應通知而確實漏發，就要處理這項程序瑕疵；不能只因漏通知即斷定決議一律有效或無效。'];
 const jointStep=['理監事聯席會議：兩邊要分別計算','聯席會議須經理事長及監事會召集人分別同意後召集，並通知應出席的理事及監事。理事、監事各要過半數出席；決議也要分別依兩邊出席人員的同意門檻判斷。若監事出席未過半，不能只靠理事一方表決通過。'];
 const recheck=['此案怎麼查','先保留通知及送達紀錄、簽到資料、會議紀錄與適用章程，核對會議種類、應列席身分、出席與議案；再向原立案主管機關確認是否應補正或重新召集。'];
 const review=['年度決算的審查不能跳過','年度決算應先送監事會審核，再連同審核結果提會員（代表）大會通過後報主管機關。因故未能如期開大會時，可依財務處理辦法第11條經理事會及監事會或理監事聯席會議通過，再提大會追認。只由理事會通過或漏送監事會，不能當作監事會已審核。'];
 return {direct:true,category:'人民團體會務說明',title:yearEnd?'理事會不能跳過監事會審核年度決算':joint?'聯席會議只通知理事，不足以完成兩邊的程序':'理事會漏通知監事列席，不能直接判定決議效力',
 summary:yearEnd?'不可以把未經監事會審核的年度決算當作已審核直接送縣府。':joint?'聯席會議須通知應出席的理事與監事。若監事未達法定出席門檻，不能只靠理事通過。':charter?'如章程要求監事列席而確有漏通知，須查明程序瑕疵；不能單憑漏通知就判定決議失效。':'要先確認是單獨理事會或聯席會，以及章程是否要求監事列席。不能一概說決議有效或無效。',
 steps:[...(yearEnd?[review]:[]),...(joint?[jointStep]:[board,jointStep]),recheck],
 refs:[guide(11),association(29),...(yearEnd?[association(34),law('社會團體財務處理辦法','D0050097',11)]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function duesAndAssemblyRights(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||!/協會|社會團體/.test(t)||/合作社|工會|公會|農會|漁會|公司|財團法人|基金會|管委會|公開|貼上網|退款|退費|補差額|調漲會費|可以.{0,5}除名|要如何除名/.test(t))return null;
 if(!/大會/.test(t)||!/欠費|欠.{0,9}會費|沒繳.{0,5}會費|未繳.{0,5}會費|會費.{0,5}(?:還沒繳|沒繳|未繳|逾期)/.test(t)
  ||!/進場|出席|投票|表決|名冊|扣掉|刪掉|除去|人數|人頭|資格|停權/.test(t))return null;
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const election=/投票|改選|選舉|罷免/.test(t);
 const refs=[association(12),association(14),association(16),association(27),guide(10),guide(16)];
 if(election)refs.push(law('人民團體選舉罷免辦法','D0050093',5));
 const steps=[
  ['先查是否仍有會員身分','人民團體法沒有一律規定欠繳會費就退會或失去權利。先向協會查現行章程與適用規定、欠費時間、催繳或相關紀錄、及所主張的效果。章程如有明文，也要看是否符合法令和個案要件，不能臨時加一條或把欠費直接當作已退會、已除名。'],
  ['進場出席和投票分開','請理事會審定並留存應出席名冊。會員原本具出席資格，沒有依法限制出席的依據時，不因欠費而不能進場或從應出席人數扣掉。限制投票也不等於不准出席；如依法有特定權利限制，要在審定名冊上記明，不能用臨時刪名取代。'],
  ['名冊審定後才有爭議','保留原審定名冊、通知、繳費或補繳證明及會籍異動依據。若臨近開會仍有爭議，請在會前請承辦核對，別在開會當天只依口頭指示刪名。']
 ];
 if(election)steps.push(['選舉名冊另有註記','辦理規範所列選舉或罷免時，名冊上若有人依法沒有選舉權、被選舉權或罷免權，依選罷辦法第5條註明；不是因為要選舉，就可以把欠費的會員全部刪掉。']);
 return {direct:true,category:'人民團體會務說明',title:'欠繳會費，不等於從會員大會名冊刪除',
  summary:'不能只因欠會費就刪名、拒絕出席或禁止投票。要分別查會員身分、出席資格及投票權有沒有依法受限。',
  steps,refs,actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function coopWithdrawalAndAssembly(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>160||!/合作社/.test(t)||/信用合作社|保險合作社|合作社聯合社|社員代表大會|準社員|協會|公會|工會|股東|農會|漁會/.test(t))return null;
 if(!/退社|出社/.test(t)||!/社員大會|大會|沒到場|沒來開會|缺席/.test(t)
  ||!/算|計|扣|名簿|名冊|人數|門檻|成會/.test(t))return null;
 const absent=/(?:沒(?:有)?到場|沒(?:有)?出席|不出席|沒來|缺席|請假).{0,22}(?:當.{0,5}退社|視為退社|扣|剔除|刪掉|當作出社)/.test(t);
 const pending=/尚未生效|還沒生效|未生效|還沒到年底|還沒到年度終了|只提出|只送了?|剛(?:送|交|提出)|申請(?:已)?送了|已(?:經)?提(?:出|交).{0,8}(?:退社|申請)/.test(t);
 const effective=!pending&&/(?:退社|出社)(?:確定)?(?:已)?生效|(?:已經|已).{0,9}退社|退社(?:後|之後)已/.test(t);
 const refund=/股金|退股/.test(t);
 const steps=[
  ['開會門檻怎麼算','一般合作社的社員大會須有全體社員過半數出席，才可開會。例如符合資格的社員共20人，至少要11人出席。這是成會門檻，不是表決門檻；一般決議另外看出席社員是否過半數同意。'],
  ['先核對退社生效日與社員名簿','在這次大會前已生效、確定不再具社員身分的人，不列入這次大會的全體社員人數。只交申請、到開會時還未生效的，若仍具社員身分，原則上仍列入；即使不來，也不是實際出席。請核對第35條社員名簿、書面申請及送達、營業年度與章程，留存異動依據。'],
  ['自請退社何時生效','依第27條，自請退社原則上於年度終了時辦理，須提前三個月提出書面請求。章程可延長提前期間：自然人最長六個月，法人社員最長一年。先確認該社營業年度的終了日，不把送申請當天當作退社日。']
 ];
 if(absent)steps.unshift(['缺席不是退社','單純沒到場或請假，不屬第26條的出社事由。若主張依章程事由除名，還須依法經社務會出席理事、監事四分之三以上議決、書面通知當事人並報告社員大會；不能把缺席直接等同於已退社。']);
 if(refund)steps.push(['退股金與成會是兩件事','已出社者可依章程請求退還部分或全部股金；第30條原則依營業年度終了時的財產計算，章程另有規定從其規定。不要拿是否已領股金，代替確認退社是否生效。']);
 return {direct:true,category:'合作社會務',title:'合作社退社：先確認生效，再算社員大會出席門檻',
  summary:absent?'不能因為社員沒到場就當他退社、直接扣人。要先確認社員身分是否仍有效。':
   pending?'只送退社申請，開會時尚未生效且仍是社員，仍列入全體社員人數。':
   effective?'若退社已在這次社員大會前生效，不再列入這次大會的全體社員人數。':
   '先看退社在開會前是否已生效。已生效不列入；還未生效且仍有社員身分，則列入。',
  ...(!absent&&!pending&&!effective?{choiceHeading:'請確認開會當天的退社狀態',choices:[
   {label:'開會前已生效',question:'合作社社員退社已生效，這次社員大會還要算進全體人數嗎？'},
   {label:'僅申請、還未生效',question:'合作社社員只提出退社申請、還沒生效，這次社員大會還要算進全體人數嗎？'}
  ]}:{}),steps,refs:[coop(26),coop(27),...(absent?[coop(28)]:[]),coop(35),coop(48),...(refund?[coop(30)]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function answerMixed(q){
 const coopWithdrawal=coopWithdrawalAndAssembly(q);if(coopWithdrawal)return coopWithdrawal;
 const duesRights=duesAndAssemblyRights(q);if(duesRights)return duesRights;
 const missed=missedSupervisorNotice(q);if(missed)return missed;
 const expenses=memberMeetingExpenseFunding(q);if(expenses)return expenses;
 const withdrawal=withdrawalAndAssemblyRoll(q);if(withdrawal)return withdrawal;
 const boardMinutes=inspectAndPublishBoardMinutes(q);if(boardMinutes)return boardMinutes;
 const address=associationRegisteredAddress(q);if(address)return address;
 const parent=schoolParentFiling(q);if(parent)return parent;
 const creditVacancy=creditCooperativeVacancy(q);if(creditVacancy)return creditVacancy;
 const coopVacancy=coopBoardVacancies(q);if(coopVacancy)return coopVacancy;
 const dual=dualBoardVacancies(q);if(dual)return dual;
 const familyProxy=familyAssemblyProxy(q);if(familyProxy)return familyProxy;
 const venue=changedMeetingVenue(q);if(venue)return venue;
 const temporary=temporaryMeetingNotice(q);if(temporary)return temporary;
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
if(typeof module!=='undefined'&&module.exports){module.exports={identify,answerMixed,dissolutionAndGrant,chairVacancy,monthsRemaining,assemblyCommunications,assemblyPrivacy,coopRegistryPrivacy,yearEndAuditVacancy,overdueFundraising,publishDocumentPrivacy,fundraisingDisclosure,changedAssociationDues,resignationAndMeeting,formerMemberArrearsPrivacy,changedMeetingVenue,familyAssemblyProxy,dualBoardVacancies,coopBoardVacancies,creditCooperativeVacancy,schoolParentFiling,associationRegisteredAddress,inspectAndPublishBoardMinutes,temporaryMeetingNotice,withdrawalAndAssemblyRoll,memberMeetingExpenseFunding,missedSupervisorNotice,duesAndAssemblyRights,coopWithdrawalAndAssembly};return;}
root.verifiedMixedQuestionAnswer=answerMixed;
})(typeof window!=='undefined'?window:globalThis);
