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
 const whoAuth=/主管機關/.test(t)&&/縣/.test(t);
 const authStep=['主管機關就是縣政府','合作社在縣的主管機關就是縣（市）政府（合作社法第2條之1），所以報屏東縣政府就可以，不是另外找一個機關。'];
 return {direct:true,category:'合作社會務',title:chair&&!dual?'合作社主席出缺：補選或代理，看剩餘任期':'合作社理監事出缺：分別遞補，未達半數才補選',
 summary:chair&&!dual?(remaining?'剩餘任期未滿六個月時，不是一定要立即補選，可以先由同一會的理事或監事互推一人代理。':'主席出缺原則一個月內由同一會補選；剩餘任期未滿六個月時，也可以互推一人代理。'):/(?:理事會|監事會)(?:批准|准辭|同意)|書面.{0,9}社址/.test(t)?'不必等理事會或監事會批准。書面辭職送達社址即生效，確有缺額後要先遞補，再看是否需要補選。':filing?'不能只報縣府就補選。先分別遞補，遞補後各自低於章程名額半數的組別才須補選。':'先由候補依序遞補，各組遞補後仍未達章程名額半數，才須補選。',
 steps:[...(whoAuth?[authStep]:[]),...(chair?[chairStep]:[]),...(dual||!chair?[seat]:[]),effective,...(filing||dual?[meeting]:[])],
 refs:[...(whoAuth?[coop('2-1')]:[]),rule(7),rule(8),...(filing||dual?[coop(46),coop(48),rule(18),rule(29)]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
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
    ||!/最晚|多久|幾天|幾日|前一(?:天|日)|提前|什麼時候|哪一天|改期|來不及|昨晚|當天|(?:[一七]|十五|1|7|15)(?:天|日)/.test(t))return null;
 if(!/協會|社會團體|人民團體|理事|監事|會員大會|會員代表大會|(?:開|召開)臨時會|臨時會議/.test(t))return null;
 const assembly=/會員(?:[(]?代表[)]?)?(?:臨時)?大會|協會(?:臨時)?大會/.test(t);
 const combined=/理監事(?:聯席)?會議?/.test(t);
 const director=/理事會/.test(t),supervisor=/監事會/.test(t),board=combined||director||supervisor;
 const deferred=/改期|延期|延後|挪日|換日期/.test(t);
 const notEmergency=/沒有緊急|並非緊急|不是緊急|不是因為緊急|非因緊急|非緊急|不緊急|不急|沒(?:有)?急事|只是.{0,12}(?:排不出|改期|延後|喬時間)|(?:忘了|忘記).{0,8}(?:發|寄|通知)/.test(t);
 const associationRef=association(26);
 const guideRef=law('人民團體會務輔導辦法','D0020094',11);
 if(!assembly&&!board){
  return {direct:true,category:'會議召集',questionState:{focus:'compound'},title:notEmergency?'不是緊急事故，不能只提前一天通知':'臨時會議通知：請先選會議種類',
   summary:notEmergency?'不可以。沒有緊急事故，不能用前一日送達的例外。若是一般人民團體，會員大會原則上十五日前通知；理事會、監事會和理監事聯席會議原則上七日前通知。':'臨時會不等於緊急事故。若是一般人民團體，會員大會原則上十五日前通知；理事會、監事會和理監事聯席會議原則上七日前通知。只有因緊急事故召集且開會前一日已送達，才適用例外。',
   choiceHeading:'請先選會議種類',
   choices:['會員大會','理事會','監事會','理監事聯席會議'].map(label=>({label,question:'協會'+label+'：'+raw})),
   refs:[associationRef,guideRef]};
 }
 const boardName=combined?'理監事聯席會議':director&&supervisor?'理事會、監事會':director?'理事會':'監事會';
 const steps=[
  ...(assembly?[['會員（代表）大會','一般應在開會十五日前通知應出席的會員或會員代表，並報請主管機關派員列席；一般臨時會員大會也是如此。']]:[]),
  ...(board?[[boardName,'一般應在開會七日前，將會議種類、時間、地點和議程通知各應出席人員；沒有緊急事故的臨時會議也不例外。']]:[]),
  ['緊急事故才有例外','因緊急事故召集臨時會議，通知須於開會前一日送達；只在前一天寄出、沒有送達，不算符合例外。排程來不及或單純改期，不當然是緊急事故。']
 ];
 if(deferred)steps.push(['日期已經改了','請依會議種類，以新會議日期安排通知，不能只因延期就改用前一日。'+(assembly?'若會員大會已報主管機關列席，請更新日期。':'')+'若情形是否符合緊急例外不明，向主管機關確認。']);
 return {direct:true,category:'會議召集',questionState:{focus:'compound'},title:assembly&&board?'會員大會與理監事會：分開看通知期限':'臨時'+(assembly?'會員大會':boardName)+'：不是一律前一天通知',
 summary:notEmergency?'不可以。沒有緊急事故，不能用前一日送達的例外，應遵守原有的通知期限。':'臨時會不等於緊急事故。一般臨時會議仍適用原通知期限；因緊急事故召集，才有前一日送達的例外。',
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
function designatedMeetingConvener(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>165||!/協會|社會團體|人民團體/.test(t)||/合作社|公會|工會|農會|漁會|董事會|公司|基金會|里長|鄉長|公所|補選|辭職|辭任|出缺|聯席/.test(t))return null;
 if(!/召集|開(?:會|理事會|監事會|大會)|流會/.test(t)
  ||!/(?:縣府|主管機關|社會處|縣政府|政府|承辦).{0,16}(?:指定|指派)|(?:指定|指派).{0,12}(?:召集|誰來開|誰開)|指定誰/.test(t))return null;
 const a=/會員(?:代表)?大會|臨時大會/.test(t);
 const b=/理事會/.test(t)&&!/先(?:開|召開)理事會/.test(t);
 const s=/監事會/.test(t)&&(!a||/(?:開|召集)(?:臨時)?監事會|監事會.{0,10}(?:未開|沒開|不能開|無法開|流會)|(?:大會|理事會).{0,4}(?:與|和|跟|及|、)監事會/.test(t));
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const joint=b&&s;
 const noKind=!a&&!b&&!s;
 const askFromSupervisor=/監事會.{0,24}(?:發函|書面|請|要求).{0,14}(?:會員大會|召開|開會)/.test(t);
 const roleA=['臨時會員（會員代表）大會｜指定理事','過半數理事或五分之一以上會員（會員代表）書面連署，或由監事會正式發函請求。理事長自收到連署或發函後三十日內應開完；屆期未完成，主管機關得指定一名理事召集。不能由個別監事自行召集，也不是監事會一發函就指定。應出席人員以最近一次經理事會審定的名冊為限。'];
 const roleB=['理事會｜指定理事','過半數理事書面連署召開臨時理事會，理事長於收到後十五日內應開完；無法親自召集時，依章程所定代理程序辦理，仍須在期限內開完。連續召集三次以上均未成會，或依法連署後未在十五日內開完，主管機關得指定一名理事召集。'];
 const roleS=['監事會｜指定監事','過半數監事書面連署召開臨時監事會，監事會召集人（常務監事）於收到後十五日內應開完；無法親自召集時，依章程所定代理程序辦理，仍須在期限內開完。連續召集三次以上均未成會，或依法連署後未在十五日內開完，主管機關得指定一名監事召集。不必先由理事會同意。'];
 const prep=['如何把程序說清楚','書面連署或監事會請求臨時大會的函件，應雙掛號寄給相應的召集人，取得掛號回執後報主管機關備查。若請求主管機關指定，保留章程、連署或函件、回執及歷次開會通知與流會紀錄，供核對。指定限於召集該場會議，不是任命理事長，也不取代法定出席和決議門檻。'];
 const refs=[association(32),...((b||s||noKind)?[guide(13),guide(14)]:[]),...((a||noKind)?[guide(15)]:[])];
 return {direct:true,category:'人民團體會務說明',title:noKind?'報請指定召集人：先選哪一種會議':'協會會議不能依法召開：由主管機關按會議種類指定召集人',
  summary:noKind?'不是一律先開理事會。請先選哪一種會議開不了：會員大會、理事會，或監事會。':
   joint?'理事會與監事會要各自判斷。理事會指定一名理事，監事會指定一名監事，不能用同一個指定取代兩邊的程序。':
   a&&!b&&!s?(askFromSupervisor?'監事會正式發函請求臨時會員大會，理事長收到後三十日內仍未開完，主管機關得指定一名理事召集；不是由監事自行召集。':'會員大會不能依法召開時，主管機關得指定一名理事；臨時大會的書面請求和三十日規則如下。'):
   s&&!b?'符合條件時，主管機關得指定一名監事召集監事會，沒有一律先開理事會的要求。':
   '符合法定條件時，主管機關得指定一名理事召集，並不是任命新的理事長。',
  ...(noKind?{choiceHeading:'選擇無法召開的會議',choices:[
   {label:'會員大會',question:'協會會員大會無法依法召開，要如何報請主管機關指定召集人？'},
   {label:'理事會',question:'協會理事會無法依法召開，要如何報請主管機關指定召集人？'},
   {label:'監事會',question:'協會監事會無法依法召開，要如何報請主管機關指定召集人？'}
  ]}:{}),
  steps:noKind?[]:[...(a?[roleA]:[]),...(b?[roleB]:[]),...(s?[roleS]:[]),prep],
  refs,actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function assemblyRepresentativeParticipation(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>165||/合作社|社員|公會|工會|農會|漁會|公司|股東|基金會|家長會|政黨|管委會|董事會|區分所有權|候補|代表名額|分區選舉|記錄查閱|看會議紀錄/.test(t))return null;
 if(!/大會/.test(t)||!/出席|參加|旁聽|列席|發言|提案|投票|表決|發問|進場|人數|成會|簽到/.test(t))return null;
 if(!/一般會員|普通會員|其他會員|不是代表|非代表|沒選上代表|未當選代表|不是會員代表|(?:協會|社會團體).{0,28}會員.*(?:會員大會|代表大會)|會員.*(?:會員大會|代表大會)|會員大會.*會員/.test(t))return null;
 const ordinary=/(?:不是|並非|不是開)(?:會員)?代表(?:制的)?大會|一般會員大會|普通會員大會|是會員大會.{0,10}(?:不是|而非)/.test(t);
 const rep=!ordinary&&/會員代表大會|代表制(?:的)?大會|代表大會/.test(t);
 const unclear=!ordinary&&!rep&&/代表.{0,5}(?:選出來|選出了?|改選完|選好)|(?:選出|選好|有了).{0,5}(?:會員)?代表/.test(t);
 if(!ordinary&&!rep&&!unclear)return null;
 if(rep&&!/(?:一般|普通|其他|非代表的)會員|不是(?:會員)?代表|非(?:會員)?代表|沒選上代表|未當選代表|只是(?:來)?列席|只(?:是|想|來)?旁聽|只(?:是|想|來)?列席/.test(t))return null;
 const proxy=/委託|受託|代投|代理/.test(t);
 if(proxy&&!/不是(?:會員)?代表|非(?:會員)?代表|沒選上代表|未當選代表|一般會員|普通會員/.test(t))return null;
 if(!proxy&&/非會員(?!代表)|不是會員(?!代表)/.test(t))return null;
 const guide=law('人民團體會務輔導辦法','D0020094',10);
 const repStep=['會員代表大會：正式出席和表決看代表名冊','依法召開的會員代表大會由有資格的代表行使大會職權。不是代表的一般會員仍是會員，但不因到場而成為這場大會的正式出席人，不計入法定出席人數，也不能以旁聽身分投票。'];
 const memberStep=['會員大會：有資格的會員可以正式出席','如果這一場是會員大會而非會員代表大會，經審定列在應出席名冊、具資格且未依法受限制的會員，可以正式出席及表決；發言與提案依章程和議事規則辦理。選出過代表，並不等於這場會議是代表大會。'];
 const observer=['旁聽、發言和正式提案要分開','一般會員能不能列席旁聽、被允許發言，以及能否直接提案，不能預設一律可或一律不可。請核對本會章程及議事規則；若議案須由有資格的代表提出，可先將建議交給代表轉提。允許旁聽或發言，不等於當場有表決權。'];
 const delegated=['受託和旁聽不同','在會員代表大會，書面委託應交由同一協會具該場代表資格的人，不能委託未具代表資格的一般會員代投；每名代表以代理一人為限。'];
 return {direct:true,category:'人民團體會務說明',
  title:unclear?'先確認是會員大會還是會員代表大會':rep?'會員代表大會：旁聽、發言與表決要分開':'會員大會：有資格的會員不是旁聽來賓',
  summary:unclear?'先看開會通知寫的是哪一種大會。選出代表，不表示每場都已改為代表大會。':
   ordinary?'如果這場開的是會員大會，列在應出席名冊的合格會員可以正式出席，發言與提案依議事規則辦理。':
   proxy?'不是代表的一般會員，不能拿代表的委託書到會員代表大會代理投票。':
   '一般會員若不是代表，就算獲准旁聽，也不計入正式出席人數，不能投票；能否列席、發言或提案，另看章程和議事規則。',
  ...(unclear?{choiceHeading:'這場開的是哪一種大會？',choices:[
   {label:'會員大會',question:'如果是協會的一般會員大會，不是代表大會，會員可以發言和提案嗎？'},
   {label:'會員代表大會',question:'協會的會員代表大會，一般會員不是代表，可以出席、發言或提案嗎？'}
  ]}:{}),
  steps:unclear?[memberStep,repStep,observer]:ordinary?[memberStep]:[...(proxy?[delegated]:[]),repStep,observer],
  refs:[guide,association(16),association(27),...(!ordinary?[association(13),association(28)]:[]),...(proxy?[association(42),{title:'內政部函釋：同團體會員或代表的書面委託',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256739'}]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function formerMemberGiftReturn(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>170||/合作社|退社|公益勸募|勸募許可|募款|公益彩券|補助款|稅|捐贈扣除|公會|工會|農會|漁會|基金會|公司|股東|借款|借錢/.test(t))return null;
 if(!/退會|退出(?:協會|團體)|不當會員|離開(?:協會|團體)|除名/.test(t)
  ||!/拿回|要回|取回|退回|退還|返還|撤回|撤銷|收回|索回|還我|還給我/.test(t))return null;
 const g=/捐|贈與|無償送給|送給.{0,6}(?:協會|團體)/.test(t);
 const l=/(?:只是|僅是|原本|先|無償)?借(?:給)?(?:協會|社會團體|團體).{0,14}(?:用|使用)|使用借貸|約好.{0,14}(?:用完.{0,4}還|借用)/.test(t);
 if(!g&&!l)return null;
 const fee=/會費|入會費/.test(t);
 const notYet=g&&/還沒交|還未交|尚未交|未交付|還沒(?:匯|過戶|移轉)|尚未移轉|答應.{0,18}還沒/.test(t);
 const burden=g&&/附負擔|附條件|約定.{0,8}(?:用在|用於|用途|必須|才捐)|說好.{0,12}(?:才捐|只能用|要用在)/.test(t);
 const done=g&&/已(?:經)?交|已(?:經)?捐|已(?:經)?給|無條件捐|已完成贈與|對方收到|已(?:經)?過戶/.test(t);
 const civil=n=>law('民法','B0000001',n);
 const given=['已完成的贈與','如果當初是無償贈與、對方已接受且權利已移轉，單憑退會，不能要求協會把這筆捐款或物品還回來。若另有有效返還約定或民法上的撤銷事由，才另外判斷；不要自行取走物品。'];
 const untransferred=['還沒移轉權利的捐贈承諾','依民法第408條，權利未移轉前原則上可以撤銷，已移轉一部分時只適用未移轉部分。但經公證或為履行道德上義務而為的贈與不適用。要查的是權利是否已移轉，不只看口頭答應或物品是否還在原處。'];
 const obligation=['約定負擔和單純希望用途不同','若捐贈時雙方確有約定對方須履行的負擔，且捐贈人已給付、對方卻不履行，依民法第412條可請求履行或撤銷；單方希望某種用途，不一定是雙方的約定。具備撤銷事由時，應向受贈人作出撤銷的意思表示；合法撤銷後，再依法請求返還。'];
 const loan=['只是借用，不是贈與','若約定讓協會無償使用、之後歸還，依民法第464、470條，有期限就在屆滿時返還；沒定期限，原則在約定用途使用完畢時返還，經過相當時間可推定已用完，也可請求。沒有期限且無法依用途定期限時，可以隨時請求返還。退會本身不等於借用期限已到。'];
 const dues=['入會費、常年會費另看退費原則','一般社會團體的入會費或常年會費不等於捐款，退會不代表一定退費。如有退費需要，社會團體財務處理辦法第14條要求理事會先訂退費原則、提會員（會員代表）大會通過，再依原則辦理。'];
 const follow=['先保存能分辨性質的資料','保留收據、匯款或交付紀錄、借用單及雙方約定。對物品歸屬或返還有爭議，可先書面核對是捐贈、借用還是另有約定，必要時找法律諮詢。'];
 const choices=[{label:'已捐贈並移轉',question:'我退會了，已經無條件捐給協會的物品可以拿回嗎？'},{label:'答應捐，但還沒交付',question:'我要退會，先前答應捐給協會的物品還沒交付，可以撤回嗎？'},{label:'只是借協會使用',question:'退會後，原本只是借協會用的投影機可以拿回嗎？'}];
 const unknown=g&&!done&&!notYet&&!burden&&!l;
 return {direct:true,category:'人民團體財務',title:fee?'退會後的捐贈和會費，要分開看':l&&!g?'退會後要拿回借用物：看約定期限及用途':'退會不會讓已完成的贈與自動返還',
  summary:fee?((!g&&l?'借用物依期限和用途請求返還':notYet?'還沒移轉權利的贈與，能否撤回要看民法第408條':burden?'附有約定負擔的贈與，要看對方有沒有履行':'已完成的無條件贈與，不能只因退會拿回')+'；會費能否退，要另外核對會員大會通過的退費原則。'):
   l&&!g?'若是借給協會而不是送給協會，可依借用期限和用途請求返還，不是看有沒有退會。':
   notYet?'還沒移轉權利，不同於已完成的贈與。符合民法第408條時可撤銷，仍須排除公證或履行道德義務的例外。':
   burden?'不是因退會就能拿回；如果協會確實未履行捐贈時約定的負擔，可以依民法第412條請求履行或撤銷。':
   '如果已無條件捐贈並移轉權利，不能只因退會拿回。尚未移轉、另有約定或只是借用，處理方式不同。',
  ...(unknown?{choiceHeading:'當初是怎麼把物品交給協會的？',choices}:{}),
  steps:[...(l?[loan]:[]),...(g?(notYet?[untransferred]:burden?[obligation,given]:unknown?[given,untransferred,obligation]:[given]):[]),...(fee?[dues]:[]),follow],
  refs:[...(g?[civil(406),...((notYet||unknown)?[civil(408)]:[]),...((burden||unknown)?[civil(412),civil(419)]:[])]:[]),...(l?[civil(464),civil(470)]:[]),...(fee?[law('社會團體財務處理辦法','D0050097',14)]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function preschoolParentFiling(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>165||!/幼兒園|附幼/.test(t)||!/家長會/.test(t)
  ||/家長協會|另(?:行|外)?立案|基金會|托嬰|課後照顧|會費|退費|補助|聘僱/.test(t))return null;
 if(!/改選|換(?:人|會長)|異動|當選|補選|報備|備查|送件|報(?:哪|縣|教育|社會)|查(?:哪|問)|報給|成立|設立|設置/.test(t))return null;
 const elsewhere=/臺北|台北|新北|桃園|基隆|新竹|苗栗|臺中|台中|彰化|南投|雲林|嘉義|臺南|台南|高雄|宜蘭|花蓮|臺東|台東|澎湖|金門|連江|外縣市/.test(t);
 const attached=/附幼|(?:國小|國中|國民小學|國民中學|國民中小學|國中小|學校).{0,12}(?:附設|附屬)(?:的)?(?:幼兒園|幼稚園)|附設幼兒園/.test(t)
  &&!/不是.{0,12}(?:附幼|附設幼兒園)/.test(t);
 const independent=!attached&&/獨立|私立幼兒園|鄉鎮市立幼兒園|鄉立幼兒園|鎮立幼兒園|不是.{0,12}(?:附幼|附設幼兒園)/.test(t);
 const founding=/成立|設置|設立/.test(t)&&!/改選|換(?:人|會長)|報備|送件/.test(t);
 const period=/幾天|多久|幾日|期限|時間內|日內/.test(t);
 const rule=law('幼兒教育及照顧法','H0070031',35);
 const education={title:'屏東縣政府教育處：特殊及學前教育科組織職掌',source:'https://portal.ptc.edu.tw/personnel/rss2.php?ty=charge'};
 const joined=['國民中、小學附設幼兒園','依第35條，家長會併入該校家長會辦理。改選時先找本校家長會承辦人，由學校按適用的學生家長會規定確認送件；不要另當成獨立幼兒園家長會，或套用社會處的人民團體改選表。'];
 const stand=['獨立幼兒園','幼兒園可成立家長會，但中央法律不是規定每一園都要成立。組織、運作和改選後是否及如何報送，依所在地縣市自治規範。'];
 const docs=['改選或換會長後怎麼準備','可先備妥改選或異動的會議紀錄和更新名冊，向園方及所在地縣市教育主管機關確認要不要正式備查、應附文件、送件方式及期限。不要把學校或其他縣市的期限當成適用於本案。'];
 const county=['屏東縣幼兒園的詢問窗口','請先找園方，也可撥屏東縣政府總機 08-7320415，請轉教育處特殊及學前教育科，說明是獨立幼兒園家長會改選或任期中異動。不是送社會處的人民團體改選。'];
 const choices=[
  {label:'國中小附設幼兒園',question:'屏東縣國小附設幼兒園的家長會長改選，另外要報教育處嗎？'},
  {label:'獨立幼兒園',question:'屏東縣的獨立幼兒園，家長會長換人要報備嗎？'}
 ];
 return {direct:true,category:'教育業務分流',
  title:attached?'國中小附幼家長會：依第35條併入該校家長會':founding?'幼兒園得成立家長會；國中小附設的併入學校':independent?'獨立幼兒園家長會改選：先找園方和教育主管機關':'幼兒園家長會改選：先分附設幼兒園和獨立園',
  summary:attached?'國小或國中附設幼兒園的家長會併入該校家長會，先由校方確認如何辦理，不另走獨立幼兒園的程序。':
   founding?'獨立幼兒園得成立家長會，不是每一園都必須成立。國民中、小學附設的併入該校家長會。':
   period?'改選送件期限要看所在地自治規範與這次異動的類型；不能把別種學校的期限套到幼兒園。':
   independent?(elsewhere?'獨立幼兒園有改選或換會長，先向園方與所在地縣市教育主管機關確認備查規定。':'屏東縣獨立幼兒園家長會改選，先請園方向縣府教育處特殊及學前教育科確認，不走社會處的人民團體改選。'):
   '先確認是國中小附設幼兒園，還是獨立幼兒園。兩者不同，不能用國民教育法的學校家長會規則一律回答。',
  ...(!founding&&!attached&&!independent&&!elsewhere?{choiceHeading:'先選幼兒園類型',choices}:{}),
  steps:[...(!attached?[stand]:[]),...(!independent?[joined]:[]),...(!attached&&!founding&&!elsewhere?[county]:[]),...(!attached&&!founding?[docs]:[])],
  refs:[rule,...(!elsewhere&&!attached&&!founding?[education]:[])]};
}
function associationVotingRollDisclosure(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>170||!/協會|社會團體/.test(t)||/合作社|公會|工會|農會|漁會|基金會|公司|管委會|股東|罷免|欠費/.test(t))return null;
 const roll=/投票(?:人|者)?(?:名冊|名單)|選舉人(?:名冊|名單)|選舉(?:名冊|名單)|(?:改選|理監事).{0,9}(?:名冊|名單)/.test(t);
 if(!roll)return null;
 const postal=/通訊(?:選舉|投票|表決)|郵寄|寄(?:送|紙本|出)?(?:選票|投票單)|寄.{0,8}表決/.test(t);
 const visible=/放上網|公開|公布|公告|張貼|貼.{0,5}(?:網站|官網|網路|臉書|社群)|哪.{0,4}(?:看|閱覽)|怎麼看|查閱|閱覽/.test(t);
 if(!postal&&!visible)return null;
 const results=/選出.{0,5}結果|當選(?:名單|結果)|選舉結果|改選結果/.test(t);
 const resultOnly=results&&/不上網|不公開|不放.{0,8}名冊|不公布|只(?:公布|公告|貼)/.test(t)&&!postal;
 const internal=!postal&&!resultOnly&&/會內|協會內|限定會員|只給會員|給會員閱覽/.test(t)&&!/上網|公開|官網|臉書/.test(t);
 const decision=/修章|章程(?:變更|修改)|議案|決算|預算|提案|解散/.test(t);
 const election=/理監事(?:通訊)?(?:選舉|改選|補選)|理事.{0,5}監事(?:通訊)?(?:選舉|改選|補選)|選(?:理監事|理事|監事)|(?:理監事|理事|監事).{0,8}(?:選舉|改選|補選)/.test(t);
 const elect=n=>law('人民團體選舉罷免辦法','D0050093',n);
 const privacy=[law('個人資料保護法','I0050021',5),law('個人資料保護法','I0050021',20)];
 const roster=['選舉人名冊供會員閱覽，不是公告給所有人','選罷辦法第5條所定的名冊包含姓名、聯絡電話、地址及必要註記，供會員核對資格。§23的通訊選舉名冊也依這些要求處理。沒有確認個資利用的合法依據前，不要把整份名冊貼到公開網站或社群。出席或選務的公開說明可用無法辨識個人的統計摘要。'];
 const regular=['普通選舉或大會的名冊','一般理事、監事或會員代表的選舉，理事會原則上在召開會議十五日前審定選舉人名冊，提供會員閱覽；大會的應出席名冊另依會務輔導辦法第10條辦理。請向協會確認受控的查閱方式。'];
 const mailing=['章程有規定才可採理監事紙本通訊選舉','開票日四十五日前，由理事會召開會議審定資格、造冊供會員閱覽；開票日三十日前依名冊印製並寄送紙本通訊選舉票。團體還須訂通訊選舉辦法，經理事會議通過、報主管機關備查。章程未訂明則不能直接用這項程序。'];
 const votes=['會員大會的一般議案不是理監事選舉','第23條不能用來寄選票取代大會的一般議案表決。例如修章，應依法召開會員（代表）大會，並經出席人數三分之二以上同意。章程依法訂明的視訊會議是另個概念，不等同通訊投票。'];
 const announce=['選舉結果和選舉人名冊是兩件事','按選務規則宣布理監事選舉結果，不須把全體選舉人名冊一起放上網。依第25條，投票截止後須當場開票並宣布結果；另作公開公告時，仍應核對公告目的、依據與必要欄位，不附個人電話、住址或其他非必要資料。'];
 const split=postal&&!decision&&!election;
 const choices=[{label:'選理事、監事',question:'協會想採理監事紙本通訊選舉，投票名冊能公開上網嗎？'},{label:'表決一般議案',question:'協會想用通訊投票表決大會一般議案，投票名冊能公開上網嗎？'}];
 return {direct:true,category:'人民團體會務說明',
  title:resultOnly?'可分開處理選舉結果與選舉人名冊':'選舉名冊不能直接公開，通訊投票要先分用途',
  summary:resultOnly?'宣布選舉結果，不等於公開全體選舉人名冊，也不必把兩者綁在一起。':
   internal?'會員可依規定向協會查閱審定的選舉人名冊；這和對外公開不同。':
   decision&&postal?'不能用理監事通訊選舉的規定代替大會議案表決；名冊供會員閱覽，不可當作公開名單。':
   !postal?'選舉人名冊供會員查閱，不等於能對外公開；未確認合法依據前，不要把含個人資料的名冊放到公開網站。':
   '提供會員閱覽，不等於能公開完整名冊。要辦通訊投票，得先分清是選理事、監事，還是表決一般議案。',
  ...(split?{choiceHeading:'這次通訊投票要辦什麼？',choices}:{}),
  steps:[...(resultOnly?[announce]:[]),roster,...(postal&&(election||split)?[mailing]:[]),...(postal&&(decision||split)?[votes]:[]),...(!postal&&!resultOnly?[regular]:[])],
  refs:[elect(5),...privacy,...(resultOnly?[elect(25)]:[]),...(postal?[elect(23)]:[]),...(postal&&(decision||split)?[association(25),association(27)]:[]),...(!postal&&!resultOnly?[law('人民團體會務輔導辦法','D0020094',10)]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function associationDirectorsQuorum(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>160||!/協會|社會團體/.test(t)||/合作社|工會|公會|農會|漁會|公司|自由職業團體|基金會|股東|聯席|監事會|兩個.{0,4}會議|補選|指定召集|出席費|會員大會|變更章程|修章/.test(t))return null;
 if(!/理事/.test(t)||!/能.{0,4}(?:決議|開)|可以.{0,4}(?:開|決議|扣)|過半|成會|開得成|出席門檻|夠.{0,4}開|算.{0,4}出席/.test(t))return null;
 const number='([0-9]{1,3}|[零〇一二兩三四五六七八九十]{1,4})';
 const first=ps=>{
  for(const p of ps){const raw=t.match(new RegExp(p.replace('{}',number)))?.[1];if(raw===undefined)continue;
   if(/^\d+$/.test(raw))return Number(raw);
   if(raw==='零'||raw==='〇')return 0;
   const digit='零一二三四五六七八九', val=c=>c==='兩'?2:digit.indexOf(c);
   if(raw.length===1)return raw==='十'?10:val(raw);
   const m=raw.match(/^([一二兩三四五六七八九])?十([一二三四五六七八九])?$/);
   if(m)return 10*(m[1]?val(m[1]):1)+(m[2]?val(m[2]):0);
  }return null;
 };
 const charter=first(['章程(?:上|原本|原先|目前|規定|就|寫|訂|是|有|列|設|定|載明|本來|總共有|理事|名額|員額|定額){0,8}{}(?:席|位|名|人|個)','(?:理事名額|理事員額|理事定額)(?:原本|規定|是|為|有|共|合計){0,5}{}(?:席|位|名|人|個)']);
 const current=first(['(?:只剩|剩下|現任|在任|現有|還有|實際剩)(?:有|下|僅|就|理事|共){0,5}{}(?:席|位|名|人|個)','{}(?:席|位|名|人|個)(?:理事)?(?:還|仍|尚)在任']);
 const present=first(['{}(?:名|個|位|席)?(?:人|理事)?(?:有|實際|親自)?(?:到場|到會|出席|簽到|報到|到了|到[，,。？?]|到(?=能|可|有|要))','(?:現場|實際)?(?:出席|到場|到會|簽到|報到)(?:只|了|有|共|為|是|僅){0,4}{}(?:席|位|名|人|個)']);
 const absence=/請(?:病|事|公)?假|因病|因公|臨時不能出席/.test(t);
 if(charter===null&&current===null&&present===null&&!absence)return null;
 const badCharter=charter!==null&&(charter<9||charter%2===0);
 const guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const half=n=>Math.floor(n/2)+1;
 const inconsistent=(charter!==null&&current!==null&&current>charter)||(current!==null&&present!==null&&present>current)||(charter!==null&&present!==null&&present>charter);
 const numbers=[charter!==null?'章程'+charter+'席':null,current!==null?'在任'+current+'人':null,present!==null?'到場'+present+'人':null].filter(Boolean).join('、');
 const quorum=['成會和表決是兩道門檻','依人民團體法第29條，理事會須有應出席理事過半數出席；成會後，再依出席理事過半數或較多數同意判斷決議。理事應親自出席，不能委託他人；列席旁聽或候補未正式遞補都不因此成為出席理事。'];
 const vacancy=['有真正出缺怎麼辦','先查辭職是否已依法生效、出缺紀錄及候補理事是否依序遞補。遞補後仍未達章程員額三分之二，應補選足額。剩餘在任人數不等於章程定額；若實際成會分母有爭議，請由原立案主管機關核對，不能靠擅自減少應出席人數通過決議。'];
 const leave=['請假不能直接扣掉','理事因公、因病或因事請假，並未因此出缺，不能直接扣出應出席人數；到場人數另依簽到或報到計算。'];
 const compared=charter!==null&&current!==null&&current<charter&&!absence&&!badCharter&&!inconsistent;
 const certainlyTooFew=compared&&present!==null&&present<half(current);
 const basedOnSeats=charter!==null&&!badCharter&&!inconsistent&&(absence||(current===charter));
 const groups=compared?['分開試算，不把數字混用','即使暫以'+current+'名在任理事為計算基準，也至少要'+half(current)+'人；以章程'+charter+'席為基準，則至少要'+half(charter)+'人。這是兩種試算，不表示出缺就自動適用較低門檻。']:null;
 const facts=['先核對三個數字',numbers?'您提供的是：'+numbers+'。章程定額、實際在任與到場，是不同數字。':'先確認章程定額、依法在任及實際到場人數。'];
 const need=[];if(charter===null)need.push('章程所定理事席次');
 if(!absence&&current===null)need.push('未到場者是請假、還是已正式出缺／遞補');
 if(present===null&&!absence)need.push('實際到場人數');
 const summary=inconsistent?'這幾個人數互相矛盾，請先核對章程席次、在任名冊及實際出席，不能用這組數字判定成會。':
  badCharter?'一般協會的理事定額應為奇數且至少9人。'+(numbers?'您提供的是'+numbers+'；':'')+'請先核對現行核備章程及適用規定，不能用這個席次直接判定成會。':
  certainlyTooFew?'不能成會。'+numbers+'；即使以'+current+'名在任理事試算也至少要'+half(current)+'人出席。':
  basedOnSeats?(absence?'請假不能從應出席人數扣掉。':'先用已確認的應出席人數計算。')+'若應出席為章程'+charter+'席，至少要'+half(charter)+'人出席。'+(present===null?'':'這次'+present+'人'+(present<half(charter)?'未達成會門檻。':'達到人數門檻；其他召集與表決程序仍要符合規定。')):
  compared?'已分清'+numbers+'。先處理出缺與遞補；若分母有爭議，不可只用較低試算逕作決議。':
  '先不要只拿「剩幾人」或「來幾人」判定。'+(numbers?'已知'+numbers+'；':'')+(need.length?'還要確認'+need.join('、')+'。':'請核對在任及是否出缺。');
 return {direct:true,category:'人民團體會務說明',title:'協會理事會：章程席次、在任、出席要分開算',
  summary,steps:[facts,...(groups?[groups]:[]),...(absence?[leave]:[]),quorum,...(!basedOnSeats?[vacancy]:[])],
  refs:[association(29),association(31),guide(9),guide(16),law('人民團體選舉罷免辦法','D0050093',17),...(absence?[{title:'內政部函釋：理事請假與出席基準',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256686&sms=12360'}]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function creditCoopDepositsAndDividends(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>165||!/信用合作社|信合社/.test(t)||/存款保險|倒閉|清算|股金退還|退股|貸款|借款|貸放|扣繳|所得稅|儲蓄互助社|一般合作社|農會|漁會/.test(t))return null;
 const account=/定期存款|定期儲蓄存款|定存|活存|活期存款|存款|存戶|存錢|存單/.test(t);
 const share=/股息|社股|股金|入股|認股|入社.{0,5}分紅|社員.{0,5}分紅/.test(t);
 const money=/利息|利率|計息|收益|賺|多少|發息|股息/.test(t);
 if(!account||(!share&&!money))return null;
 const nonMember=/非社員|不是社員|沒(?:有)?入社|沒(?:有)?入股|只(?:在|有|開|存).{0,15}(?:帳戶|存款|定存)/.test(t);
 const loss=/虧損|沒(?:有)?盈餘|無盈餘|沒(?:有)?賺|賠錢/.test(t);
 const ref=n=>law('信用合作社法','G0380058',n);
 const deposit=['存款利息依存款契約與產品條件','定存是存款，不是認購社股。利息依金額、存期、開立時約定的固定或機動利率、計息及付息方式計算；提前解約另依約定處理。請核對存單或開戶約定、該社利率表及適用日期，不能用股息比例算定存。'];
 const dividends=['社股股息來自可分配盈餘','依信用合作社法第23條，稅後盈餘先彌補累積虧損，再依法提列法定盈餘公積，之後才談分配社股股息。當年度無盈餘不得分配；第24條是符合法定條件時的公積提撥規則，不是存款利率。要查實際股息，請向該社核對該年度盈餘分配資料。'];
 const different=['同一人同時有兩種身分','一個人可以同時是存戶和持有社股的社員。沒有盈餘不發社股股息，不等於存款契約的利息也因當年未獲利就取消。未持有社股、只有存款，也不因開戶而取得社股股息。'];
 const contact=['要查利率或實收金額','請先確認是哪一家信用合作社、存款種類與期別，再直接核對該社牌告或存單條款；各社、各期間不一定一樣，不能以一般合作社的股息上限代替。'];
 return {direct:true,category:'信用合作社財務',title:share?'信用合作社的存款利息與社股股息不同':'信用合作社定存利息：看該社的存期與約定利率',
 summary:!share?'沒有通用的定存利率。先看是哪一家信用合作社、存款期別，以及開立時約定的利率與計息方式。':
  nonMember?'只開存款帳戶、沒有持有社股，不會因此分到社股股息；有息存款仍依存款契約計息。':
  loss?'兩者要分開。當年度無盈餘，不能發社股股息；存款利息仍依存款契約，不是用當年度盈餘決定。':
  '不一樣。存款利息依存款契約計算；社股股息是持有社股才可能分到的盈餘分配，當年度無盈餘不得分配。',
 steps:share?[deposit,dividends,different,contact]:[deposit,contact],
 refs:[ref(15),...(share?[ref(23),ref(24)]:[]),{title:'信用合作社的定期存款契約條款範例：花蓮第一信用合作社',source:'https://www.hua215.com.tw/public/deal/%E5%AE%9A%E6%9C%9F%E6%80%A7%E5%AD%98%E6%AC%BE%E7%B4%84%E5%AE%9A%E4%BA%8B%E9%A0%85.pdf'}]};
}
function associationElectionObjection(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||/合作社|公會|工會|農會|漁會|公司|社區管委會|股東|董事會|總統|里長|鄉長|股東會|國立|家長會|神明會|祭祀|直選理事長/.test(t))return null;
 const dispute=/選舉.{0,20}(?:異議|爭議)|異議書|選舉結果.{0,15}(?:異議|不服)/.test(t);
 const discrepancy=/(?:選票|票數|票匭|開(?:出)?票|選舉票).{0,20}(?:領票|票數不符|不符|對不上|多出|多[0-9一二三四五六七八九幾]|少[0-9一二三四五六七八九幾])|(?:領票|發票|發出|發了).{0,18}(?:開出|票匭|選票|票數)/.test(t);
 const social=/協會|社會團體|人民團體|會員大會|理監事/.test(t);
 if(!social||(!discrepancy&&!dispute)||(!discrepancy&&!/選舉|選票|重選|開票|領票/.test(t)))return null;
 if(!/異議|爭議|算不算|有效|無效|作廢|重選|決定|縣府|銷毀|保管|超過|沒回|退件|怎麼辦/.test(t))return null;
 const late=/逾期|沒(?:有)?回|未回|不回|不理|收.{0,5}異議書.{0,15}(?:15|十五)/.test(t);
 const now=/還沒宣布|未宣布|還未宣布|正在開票|當場|剛開到/.test(t);
 const keep=/銷毀|丟掉|保管|留下|包封/.test(t);
 const reg=n=>law('人民團體選舉罷免辦法','D0050093',n);
 const preserve=['先保存選票與核對紀錄','把配發、領票簽名或章、未使用票、票匭清點及開票紀錄分開核對，並記錄異常與當場異議。依第26條，紙本票開票宣布後須包封，封面由主席與監票員驗簽、交團體妥善保管；有爭議時先不要銷毀。無爭訟也要到任期屆滿且改選完畢後，才依規定銷毀。'];
 const how=['參加選舉的人，向誰提異議','如發現程序違反法令、章程或團體選舉規定，參加該次選舉的會員或會員代表，可當場向主席或主持人提出，請記入紀錄；也可以從選舉結果宣布之日起十五日內，書面向協會提出，保留送達證明。不要只向縣府反映而漏掉向團體提出的期限。'];
 const reply=['團體收件後另有十五日','協會收到異議書之日起十五日內，應查明並以書面回覆異議人。團體沒有按時回覆，或回覆後仍有爭議，可保留異議書、送達證明與選舉紀錄，找法律諮詢或向法院提起訴訟。'];
 const validity=['不要只看票數差額就判定有效或無效','選票數量不符要查原因與影響，不等於一定有效、一定無效或必須重選。縣府的會務監督與向團體提出選舉異議，是不同程序；不能只因票數有差或協會逾期未回，就認定縣府一定可直接宣布重選。'];
 return {direct:true,category:'選舉與改選',title:'協會選舉有爭議：先保全選票，再依期限向團體異議',
  summary:late?'協會收件後十五日內應查明並書面回覆。逾期沒回，不等於縣府可直接宣布重選；仍有爭議可向法院提起訴訟。':
   now?'還在現場時，參加選舉的會員或代表可先向主席或主持人提出異議、要求記錄，不必先去縣府。票數不符不等於自動無效。':
   keep?'不要銷毀有爭議的選票。紙本選票依第26條包封、驗簽並交團體妥善保管。':
   discrepancy?'票數對不上，不能直接判定選舉有效或無效。請先保全選票與紀錄；若已宣布結果，可在宣布之日起十五日內書面向團體提出異議。':
   '參加選舉的會員或代表，可當場向主席或主持人提出異議，或在結果宣布之日起十五日內書面向團體提出。',
  steps:late?[reply,validity,how,preserve]:now?[how,preserve,validity,reply]:keep?[preserve,how,reply,validity]:[validity,how,reply,preserve],
  refs:[reg(25),reg(26),{title:'內政部：人民團體選舉、罷免與團體自治',source:'https://www.moi.gov.tw/News_Content.aspx?n=15255&s=216275'}],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function associationDelegateReplacement(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>175||!/團體會員|法人會員/.test(t)||!/代表/.test(t)
  ||/合作社|公會|工會|農會|漁會|公司股東|董事會|上級團體|下級團體|聯合會/.test(t))return null;
 if(!/改派|改推|更替|更換|換人|換了|換掉|換成|變更|新代表|出缺|代表資格/.test(t)
  ||!/理事|監事|理監事/.test(t))return null;
 const pending=/未(?:正式)?改派|尚未.{0,9}(?:改派|生效)|還沒.{0,11}(?:改派|生效)|還沒有.{0,10}(?:改派|生效)|只(?:更換|換).{0,11}(?:負責人|理事長)|未收到.{0,7}(?:函|通知)/.test(t);
 const effective=!pending&&/(?:改派|換人|更換|變更).{0,12}(?:已生效|已經生效|正式生效)|已(?:經)?(?:正式)?改派|已(?:經)?喪失代表資格|改派生效/.test(t);
 const alternate=/候補|跳過|順位|遞補/.test(t);
 const qualifiedRole=/監事/.test(t)&&!/理事|理監事/.test(t)?'監事':/理事/.test(t)&&!/監事|理監事/.test(t)?'理事':'理事或監事';
 const same=['原代表的職務：先核對所憑的資格','若當初是以團體會員所派代表的身分當選，改派生效並使原代表喪失該資格時，依人民團體法第23條應即解任。受選任的是代表這位自然人，不是團體會員單位本身；新代表有代表資格，不表示同時取得選任職務。'];
 const succession=['由候補依序遞補，不是由新代表接班','理事缺額由候補理事、監事缺額由候補監事依序遞補。有章程或法令所定類別比例的選舉，缺額依同類候補順位處理。遞補後若該組仍未達章程定額三分之二，依法補選足額。新代表即使在候補名單上，也不能跳過原順位；須同時具備依法遞補的資格。'];
 const check=['僅換團體內部負責人，不一定是改派','先核對外部協會章程關於代表產生方式、團體會員的改派決定或通知、代表名冊與生效日期。章程可能規定由特定職務當然擔任，也可能需要另行推派。不能只看更換負責人或有無一封函就認定原代表資格已喪失，也不要逕行認定有別的會員身分即可保留原職。資格或生效日期有爭議時，請由原立案主管機關核對。'];
 return {direct:true,category:'選舉與改選',title:'團體會員改派代表，不會自動移轉理事或監事席次',
  summary:pending?'只換團體會員自己的負責人，不能直接認定原代表就卸任。要核對章程、是否已有效改派，及原代表資格是否確實喪失。':
   alternate?'不能跳過候補順位。產生缺額後，依原理事或監事的候補名單遞補，不因是新代表就優先。':
   effective?'若改派已生效，且原代表因而喪失當選時所憑的代表資格，原任'+qualifiedRole+'應即解任；新代表不能直接接任。':
   '不可以自動接任。若改派使原當選者喪失代表資格，原任理事或監事應即解任，由當屆候補依序遞補。',
  steps:pending?[check,same,succession]:[same,succession,check],
  refs:[association(13),association(17),association(23),law('人民團體選舉罷免辦法','D0050093',17),law('人民團體選舉罷免辦法','D0050093',19),{title:'內政部函釋：改派團體會員代表不得逕接理監事席次',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256716'},{title:'內政部函釋：當選者是代表本人，不是團體會員',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256747'}],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function commerceDelegateReplacement(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>170||!/商業同業公會/.test(t)||/聯合會|全國聯合|工業同業公會|職業公會|合作社|工會|上級|下級/.test(t))return null;
 if(!/代表/.test(t)||!/理事|監事|理監事/.test(t)
  ||!/改派|改推|更換|更替|換人|換.{0,8}負責人|新代表|舊代表|新人|派了.{0,5}代表|資格喪失|喪失.{0,5}資格/.test(t))return null;
 const pending=/未(?:正式)?改派|尚未.{0,8}(?:改派|派定)|還沒.{0,8}(?:改派|派定)|只有.{0,9}換負責人|只換.{0,9}負責人|尚未生效/.test(t);
 const rank=/候補|順位|跳過/.test(t);
 const outgoing=/舊代表|原派|原本|留任|卸任/.test(t);
 const officer=/監事/.test(t)&&!/理事|理監事/.test(t)?'監事':/理事/.test(t)&&!/監事|理監事/.test(t)?'理事':'理事或監事';
 const commerce=n=>law('商業團體法','D0050100',n);
 const replace=['公司改派的是會員代表','依商業團體法第16條，公司、行號因業務需要可改派代表。新會員代表派定後，原派代表喪失該代表資格。新代表仍須符合第16、17條的資格，並由公會依規定更新及審定。'];
 const elected=['公會理事、監事不是由公司換人接任','依商業團體法第20條，公會理事、監事是由會員代表在會員大會互選，不是會員公司的指派職務。原任理事或監事喪失會員代表資格時，依第25條第1款應即解任；理事缺額由候補理事、監事缺額由候補監事依次遞補。'];
 const alternate=['有候補也不能跳過順位','新代表若也依法具備該職候補資格，仍按當屆同職候補的原順序，不會因受改派而插隊。候補用盡或資格有爭議時，請公會核對名冊、章程及補選程序，必要時洽原主管機關。'];
 const change=['只換負責人時要核對什麼','負責人更換不等同於新代表已派定。先核對改派文件、實際派定日，以及原代表是否仍為該公司合資格的負責人、經理人或現任職員。若原代表已因離職或其他法定事由失去代表資格，不能只因尚未改派就認為一定可留任。'];
 return {direct:true,category:'商業團體會務',
  title:'商業同業公會：改派會員代表，不會同時接任理事或監事',
  summary:pending?'只換公司負責人，不能直接判定原代表已解任。先核對新代表是否已派定，以及原代表是否仍符合代表資格。':
   rank?'不能跳過原候補順位。新代表即使是候補，也不會因改派而優先遞補。':
   outgoing?'新代表派定後，原代表喪失代表資格，原任'+officer+'應即解任；缺額由候補依序遞補，不由新代表直接接班。':
   '不能直接接任。商業同業公會的理事、監事由會員代表互選，並非隨公司改派代表移轉；出缺由候補依次遞補。',
  steps:pending?[change,replace,elected,alternate]:[replace,elected,alternate,change],
  refs:[commerce(16),commerce(17),commerce(20),commerce(25),{title:'內政部函釋：商業團體代表改派與理監事資格',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219428'}],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function industryDelegateReplacement(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>170||!/工業同業公會/.test(t)||/工業會|商業同業公會|職業公會|合作社|工會|聯合會|上級|下級/.test(t))return null;
 if(!/代表/.test(t)||!/改派|改推|續派|更換|更替|換代表|換人|換.{0,8}負責人|新代表|舊代表|資格喪失/.test(t)
  ||!/理事|監事|理監事|出席|投票|選舉|會前|大會|順位|期限/.test(t))return null;
 const pending=/還沒.{0,8}(?:改派|派定)|尚未.{0,8}(?:改派|派定|生效)|未.{0,5}書面改派|只換.{0,9}負責人/.test(t);
 const assembly=/大會|會前|出席|投票/.test(t);
 const office=/理事|監事|理監事/.test(t);
 const rank=/候補|順位|跳過/.test(t);
 const replacing=law('工業團體法施行細則','D0050104',15);
 const act=n=>law('工業團體法','D0050103',n), rule=n=>law('工業團體法施行細則','D0050104',n);
 const change=['工廠改派要以書面通知工業同業公會','依工業團體法施行細則第15條，工廠指派或改派代表，應以書面通知公會。請核對書面改派及其生效情形，並確認原代表是否仍是合資格的負責人、經理人或現任職員。只更換工廠負責人，不等於代表已改派，也不能因此就認定原代表一定可留任或已解任。'];
 const congress=['這一次大會能不能出席、投票，先查核備名冊','依細則第14條，公會應於會員大會一個月前發書面通知，會員應在大會二十日前書面聲明續派或改派，未聲明視為放棄續派或改派的權利。依第16條，公會應在大會十五日前將會員及代表名冊報主管機關核備。例如只剩十天才提出，已晚於通常的前置時點；請公會核對之前是否有依限聲明、有效名冊及這次異動，不可只拿當日通知就認定新代表一定能投票。'];
 const limited=['公會理事、監事的缺額由候補依次遞補','依工業團體法第20條，理監事由會員代表在會員大會互選。原理事或監事如果喪失會員代表資格，依第25條第1款應即解任，理事缺額由候補理事、監事缺額由候補監事分別依次遞補。新代表不會自動接任；即使也在候補名單上，仍須依原順位及資格辦理。'];
 return {direct:true,category:'工業團體會務',title:'工業同業公會：改派代表、出席資格和理監事遞補分開',
  summary:pending?'只換工廠負責人，不能直接判定原代表已解任。先核對是否已書面改派，以及原代表是否仍符合資格。':
   rank?'不能跳過原候補順位。新代表不因改派而自動接任理事或監事。':
   assembly&&!office?'不能只憑工廠今天通知，就讓新代表直接出席投票。先核對公會的書面續派／改派期限、代表資格及該次大會核備名冊。':
   '原理事或監事因改派失去會員代表資格時，應即解任，由當屆候補理事或候補監事依次遞補，不由新代表直接接任。',
  steps:assembly&&!office?[congress,change]:[...(pending?[change,limited]:[limited,change]),...(assembly?[congress]:[])],
  refs:[act(16),act(17),replacing,...(assembly?[rule(14),rule(16),act(18)]:[]),...(office?[act(20),act(25)]:[])],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
function outsideCounterNoiseReferral(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>150||/協會|社會團體|理監事|理事會|監事會|會員大會|議事|主席|會場|選舉|公會|合作社|工會|噪音車|改裝車/.test(t))return null;
 if(!/噪音|吵|喧嘩|很大聲|低頻|聲響/.test(t)||!/檢舉|陳情|報警|要找|找誰|誰處理|怎麼辦|怎麼處理|哪.{0,5}(?:窗口|單位|部門)|跟誰/.test(t))return null;
 const home=/鄰居|住戶|樓上|樓下|隔壁|近鄰|社區住家|犬吠|狗叫|住家|我家/.test(t);
 const business=/工地|營建|施工|工廠|營業|商家|店家|餐廳|冷卻水塔|抽風機|排風機|空調機組|機具|機械/.test(t);
 if(!home&&!business)return null;
 const explicitHome=/鄰居|住戶|犬吠|狗叫|深夜.{0,8}(?:喧嘩|吵鬧)|半夜.{0,8}(?:喧嘩|吵鬧|唱歌)|敲打|跑跳/.test(t);
 const uncertain=!explicitHome&&!business;
 const nonCounty=/高雄|台南|臺南|台北|臺北|新北|花蓮|台東|臺東|台中|臺中|宜蘭|桃園|新竹|基隆|嘉義|苗栗|彰化|雲林|南投|澎湖|金門|連江/.test(t)&&!/屏東/.test(t);
 const police=['鄰居、樓上住戶或犬吠','人聲、跑跳、犬吠等不持續或不易量測、且妨害安寧的聲音，由警察依相關規定處理。噪音正在發生且需要員警到場，可撥110或洽轄區派出所。若是大樓，也可先請管委會協助溝通並記下時段，避免自行起衝突。'];
 const env=['工地、工廠或營業機具','持續、可量測的工地施工機具或營業場所噪音，可向所在地環保局或全國公害陳情專線 0800-066-666 反映，由權責機關依音源、時段和規定判斷。'+(nonCounty?'':'如果在屏東縣，環保局報案中心是 08-7351928。')];
 const docs=['向權責機關說明','可準備大概地點、發生日期、時段、音源及頻率；是否違規由權責機關判斷。不需把住址或他人個資輸入這個櫃檯。'];
 return {direct:true,category:'其他機關業務指引',title:'住家噪音去哪反映？先看是鄰居吵鬧還是施工營業',
  summary:uncertain?'這不是人民團體櫃檯受理的事項。若是鄰居吵鬧，找轄區派出所；若是工地、工廠或商家持續噪音，找環保局。先選最接近的音源。':
   business&&!explicitHome?'持續可量測的施工、工廠或營業機具噪音，請向所在地環保局或全國公害陳情專線反映。':
   explicitHome&&!business?'鄰居吵鬧等不易量測、影響安寧的聲音，請洽轄區派出所。若正在發生、需要員警到場，可撥110。':
   '兩種音源要分開：鄰居吵鬧找警察，持續可量測的工地或營業機具聲找環保局。',
  ...(uncertain?{choiceHeading:'這次是什麼音源？',choices:[
   {label:'鄰居吵鬧或犬吠',question:'樓上鄰居半夜吵鬧，現在要請哪個單位處理？'},
   {label:'工地、工廠或店家機具',question:nonCounty?'住家旁工地每天機具很吵，要向哪個單位陳情？':'住家旁工地每天機具很吵，屏東要向誰陳情？'}
  ]}:{}),
  steps:[...(explicitHome||uncertain?[police]:[]),...(business||uncertain?[env]:[]),docs],
  refs:[{title:'噪音管制法第6條與第9條',source:'https://oaout.moenv.gov.tw/Law/LawContent.aspx?id=FL015471'},{title:'環境部：近鄰噪音與環境噪音分流',source:'https://www.moenv.gov.tw/affairs/atmospheric-environment/noise-vibration-and-non-ionizing-radiation/noise-control-and-reporting-of-noisy-vehicles/1674.html'},...(business||uncertain?[{title:'環境部：各縣市環保報案中心電話',source:'https://ww3.moenv.gov.tw/Public/Tel_list.aspx'}]:[])]};
}
function deityAssociationManagerReferral(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>165||!/神明會/.test(t)||/不是神明會|並非神明會|祭祀公業法人|另.{0,9}人民團體法|另.{0,8}立案.{0,6}協會|分別.{0,7}怎麼|宗教財團法人/.test(t))return null;
 if(!/管理人|負責人|會員同意|信徒同意/.test(t)||!/改選|變更|選任|重選|換|過世|死亡|遞補|登記|報備|備查|誰|同意|門檻/.test(t))return null;
 const land=/土地登記|地政|謄本|地籍|不動產登記|土地.{0,7}(?:變更|更名|還掛)/.test(t);
 const internal=/只(?:想|問|辦|是).{0,10}(?:會內|內部|不改土地)|(?:不涉及|不會變更|不改)土地/.test(t);
 const explicitLand=land&&!internal;
 const votes=/多少人|幾人|過半|幾成|門檻|多少.{0,9}同意|幾.{0,8}同意/.test(t);
 const ready=/選好|已選|新管理人|管理人已/.test(t);
 const outside=/高雄|台南|臺南|台北|臺北|新北|花蓮|臺東|台東|台中|臺中|嘉義|南投|基隆|桃園|宜蘭|彰化|苗栗|雲林|澎湖|金門|連江/.test(t)&&!/屏東/.test(t);
 const county=!outside?'若在屏東縣，可撥縣府總機 08-7320415，請轉民政處宗教禮俗業務。':'請向所在地縣市政府民政局（處）確認，不套用屏東縣程序。';
 const selection=['會內怎麼選管理人','先確認確屬神明會，並核對有效規約、召集人、現會員或信徒資格及選任方式。不要直接套協會的理監事選舉門檻，也不能把地籍清理的土地申報或名冊更正同意比例當成管理人選任票數。可先備規約、既有名冊及選任會議紀錄或同意文件，讓主管機關確認。'];
 const landStep=['土地登記還記載舊管理人','如果確認是非法人神明會，要辦土地管理人變更，內政部函釋的辦理順序是先向民政主管機關備查，再向土地所在地地政事務所辦理。請先備選任證明、會議紀錄、既有規約與名冊及土地謄本供核對；土地登記名義已改為法人、或其實是寺廟、祭祀公業等，程序不同，請依實際登記查證。'];
 const arrange=['承辦窗口','神明會並非人民團體改選櫃檯受理的案件。先向所在地縣市民政局（處）查證團體型態、申報或名冊是否驗印及當地應備文件。'+county+'請不要把土地謄本、身分證或信徒名單貼在櫃檯。'];
 const unknown=!explicitLand&&!internal&&!votes&&!ready;
 return {direct:true,category:'民政業務分流',title:explicitLand?'神明會土地管理人變更：先找民政，再確認地政登記':'神明會管理人改選：先看規約與現任資格，洽民政單位',
  summary:explicitLand?'確認屬非法人神明會且要變更土地登記管理人時，先向民政主管機關備查，再辦土地登記。不要使用協會改選書表。':
   votes?'不能一律用過半數或照人民團體選舉規則計票。先查有效規約、現會員或信徒資格與選任方式，請民政主管機關確認。':
   '神明會管理人改選，不是協會理事長改選。先查規約和會員或信徒名冊，再找民政局（處）確認備查程序。',
  ...(unknown&&!outside?{choiceHeading:'您要辦哪一個步驟？',choices:[
   {label:'還在會內選任',question:'神明會只問會內管理人改選，需要多少會員同意？'},
   {label:'已選好，要改土地登記',question:'屏東的非法人神明會已選好管理人，土地登記還掛舊人，要辦變更嗎？'}
  ]}:{}),
  steps:explicitLand?[landStep,arrange,selection]:[selection,arrange],
  refs:[{title:'內政部：祭祀公業及神明會的區分',source:'https://www.moi.gov.tw/cp.aspx?n=160'},{title:'內政部：土地申報與民政窗口',source:'https://www.moi.gov.tw/News_Content.aspx?n=18683&s=207972&sms=9015'},...(explicitLand?[{title:'內政部祭祀公業及神明會法令彙編：非法人神明會土地管理人變更',source:'https://www.civil.taichung.gov.tw/media/640744/1090507-108%E5%B9%B4%E5%BA%A6%E7%89%88%E7%A5%AD%E7%A5%80%E5%85%AC%E6%A5%AD%E5%8F%8A%E7%A5%9E%E6%98%8E%E6%9C%83%E6%B3%95%E4%BB%A4%E5%BD%99%E7%B7%A8.pdf'}]:[])]};
}
function volunteerTravelMealTax(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||!/志工|志願服務者/.test(t)||!/報稅|所得|扣繳|扣稅|免稅|課稅|繳稅|列單|憑單|申報|稅務/.test(t))return null;
 if(/印花稅|營業稅|捐贈扣除|公益勸募|外籍|境外/.test(t))return null;
 const expenses=/誤餐|餐費|交通費|車資|車馬費/.test(t);
 const estimate=/每月固定|每個月固定|固定.{0,10}(?:津貼|補助|一筆|車馬|誤餐|交通費)|定額.{0,6}(?:津貼|補助)|不論.{0,8}(?:出勤|服務|次數)|包月|餐券|禮券/.test(t);
 const perService=/按次|按.{0,5}次數|依.{0,8}次數|實際.{0,8}次數|每次(?:服務|值勤|出勤)|有.{0,5}(?:服務|值勤|出勤).{0,7}(?:才|就)發/.test(t);
 const orgIncome=/(?:協會|團體|運用單位)(?:自己|本身)?(?:有)?(?:收到|收進|收的|領到|取得|收到的款)|(?:政府|縣府|公所|機關)(?:給|補助|撥給|支付)(?:我們)?(?:的)?(?:協會|團體)|委辦費|委託契約收入/.test(t);
 const person=/(?:發(?:給)?|給付給?|補助給|付給|發放給?)志工|志工(?:個人|本身|拿到|領到|領取|領的|要報|報稅)|我(?:是志工|領到)/.test(t);
 if(!expenses&&!estimate&&!orgIncome)return null;
 const relief=['志工個人的交通費或誤餐費','依志願服務法提供服務、按實際服務次數給付，且符合適用支給標準的交通費或誤餐費，依財政部台財稅字第09404548760號令，可免納個人所得稅，不用把這筆符合條件的費用列入個人綜合所得。志願服務法第16條允許運用單位視需要補助。'];
 const fixed=['固定津貼、餐券或禮券要另外看','與實際服務次數無關的固定津貼，或性質未明的餐券、禮券，不能直接套用按實際服務次數給付交通費或誤餐費的免稅規則。要看給付性質、發放條件及紀錄，不先判定必然免稅或一定是薪資。'];
 const organization=['協會自己的收入不是志工個人所得','政府補助或委辦款是協會收款時，不能套用志工個人的免稅規則。請先區分核定的補助與承接服務的契約對價，依核定函或契約、收款憑證與團體的申報條件判斷；不能因為拿來支付志工費用就認定免稅。'];
 const proof=['承辦會計要留什麼資料？','保存服務日期與次數、適用的支給標準、領款及付款憑證。若問的是協會要不要扣繳、列單或開憑單，應把個人所得與協會的申報義務分開，按實際給付資料向國稅局確認，可撥 0800-000-321。'];
 const orgOnly=orgIncome&&!person;
 const unknown=!orgIncome&&!perService&&!estimate;
 const rows=orgOnly?[organization,proof]:[relief,...(estimate||!perService?[fixed]:[]),...(orgIncome?[organization]:[]),proof];
 const choices=unknown?[
  {label:'按實際服務次數給交通費或誤餐費',question:'志工按實際服務次數領交通費或誤餐費，要報個人所得稅嗎？'},
  {label:'每月固定津貼／餐券，不按次給',question:'每月固定發給志工的津貼或餐券要報稅嗎？'},
  {label:'協會自己收到補助或委辦款',question:'縣府補助協會志工送餐經費，協會自己收到的款也免稅嗎？'}
 ]:undefined;
 return {direct:true,category:'稅務',title:orgOnly?'協會收款與志工個人免稅，不能混在一起':estimate&&!perService?'志工固定津貼不能直接套用免稅規則':'志工交通費和誤餐費：符合條件可免納個人所得稅',
 summary:orgOnly?'協會自己收到的款不能用志工個人的免稅函令判斷。需先區分補助或契約對價。':orgIncome?'兩種收款分開看。志工的交通費或誤餐費符合條件可免納個人所得稅；協會收到的款不因此免稅。':estimate&&!perService?'固定津貼若不按實際服務次數給付，不能只因叫作「志工津貼」就視為免稅。':unknown?'符合志願服務法、按實際服務次數且依適用標準給付的交通費或誤餐費，可免納個人所得稅。先確認您問的是哪一種給付。':'符合志願服務法，並按實際服務次數及適用標準發給的交通費或誤餐費，可免納個人所得稅。',
 steps:rows,refs:[{title:'財政部台財稅字第09404548760號令（志工交通費或誤餐費）',source:'https://law-out.mof.gov.tw/LawContent.aspx?id=GL006128'},law('志願服務法','D0050131',16),law('所得稅法','G0340003',14)],
 ...(choices?{choiceHeading:'這筆錢是付給誰、怎麼發放？',choices}:{})};
}

function associationStampDuty(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||!/印花|貼花/.test(t)||/漏繳|補繳|罰鍰|罰多少|行政救濟|合併契約|同一憑證/.test(t))return null;
 const lease=/租約|租賃|租房|房東|租金|押金|租辦公室|租場地/.test(t);
 const dues=/會費|入會費|年費/.test(t);
 const event=/報名費|課程費|活動費/.test(t);
 const purchase=/買東西|動產|採購|買.{0,5}(?:設備|器材|電腦)|承攬|印刷契約/.test(t);
 const receipt=/收據|回執|收款證明/.test(t);
 if(!lease&&!dues&&!event&&!purchase&&!(receipt&&/協會|社團|團體/.test(t)))return null;
 const receiptSignal=t.replace(/(?:沒有|未曾|未|沒)(?:任何|另外|另行)?(?:收款簽收|收訖註記|簽收|開(?:立)?收據|收據)/g,'');
 const hasStamp=/簽收|簽章註明|寫(?:了)?已收|收訖|蓋章收款|手寫已收|(?:房東|出租人)(?:有|另外|已)?開(?:了)?收據/.test(receiptSignal);
 const plain=/只簽|單純|只有租約|只是簽|沒有收據|沒開收據|沒簽收/.test(t)&&!hasStamp;
 const withdraw=lease&&/扣繳|扣稅|租金.{0,7}所得稅/.test(t);
 const qualified=/(?:公益|慈善|教育|文化).{0,10}(?:財團|社團)法人|(?:財團|社團)法人.{0,10}(?:公益|慈善|教育|文化)/.test(t)&&!/不是|尚未登記|還沒登記|未辦法人/.test(t);
 const cityOther=/台北|臺北|新北|桃園|台中|臺中|台南|臺南|高雄|基隆|新竹|宜蘭|花蓮|台東|臺東|苗栗|彰化|南投|雲林|嘉義|澎湖|金門|連江/.test(t)&&!/屏東/.test(t);
 const stamp=n=>law('印花稅法','G0340091',n);
 const local=['印花稅：找地方稅機關',cityOther?'請洽相關縣市的地方稅捐稽徵機關。印花稅是地方稅，不是租金所得扣繳。':'屏東請洽屏東縣政府財稅局印花稅窗口，08-7338086 轉 234 或 0800-877979。若憑證案件在外縣市，請洽當地地方稅機關。'];
 const leaseRow=['單純租約與簽收欄不同','單純租賃契約本身不在印花稅課稅範圍。房東另立租金或押金收據，或在租約上寫明實收金額並簽收而代替收據時，原則由收款立據人按實收金額千分之四（4‰）繳納；如果適用法定免稅或屬營業發票性質，另按規定。只寫約定租金或押金，未表示收到，不等於簽收。'];
 const dueRow=['入會費及常年會費有條件免稅','財政部台財稅第770266092號函：教育、文化、公益或慈善的財團或社團法人，向會員收取入會費或常年會費所開的收據，可比照印花稅法第6條第14款免貼印花稅票。僅有立案或名稱寫協會，不能直接認定符合。'];
 const eventRow=['活動報名費不等於會費','不能把入會費及常年會費的函釋直接套用活動報名費。要核對憑證性質；一般銀錢收據由立據人按收款金額4‰繳納，但兼具營業發票性質或有法定免納事由則另論。'];
 const purchaseRow=['先確認是不是買賣動產或承攬契據','依屏東縣政府財稅局，單純買賣動產契據每件新臺幣12元；若屬承攬（例如委託印刷完成工作），通常為合約金額1‰。由立約或立據人按憑證性質辦理。若只有廠商出具銀錢收據，原則是收錢開據的廠商繳納，不是付款的協會；統一發票不在銀錢收據的課稅範圍。若同一張兼有買賣與承攬，須依印花稅法第13條及契約內容判斷，不可只套12元。'];
 const deductRow=['租金所得扣繳：另洽國稅局','若協會給付租金，應按房東身分確認扣繳。境內居住個人或在境內有固定營業場所的營利事業，原則按給付額10%扣繳；符合各類所得扣繳率標準第13條或第13條之1，每次應扣稅額不超過新臺幣2,000元可免扣，但免扣不等於免申報。境外或特殊身分另查規定。這部分可洽國稅局 0800-000-321。'];
 const area=cityOther?(t.match(/台北|臺北|新北|桃園|台中|臺中|台南|臺南|高雄|基隆|新竹|宜蘭|花蓮|台東|臺東|苗栗|彰化|南投|雲林|嘉義|澎湖|金門|連江/)?.[0]||''):'';
 const choices=lease&&!hasStamp&&!plain&&!withdraw?[
  {label:'只簽租約，沒有收款簽收或收據',question:area+'協會租辦公室只簽租約，沒有收款簽收也沒開收據，要貼印花稅嗎？'},
  {label:'房東有開收據，或在租約簽收',question:area+'協會租辦公室，房東在租約簽收租金和押金，要貼印花稅嗎？'}
 ]:null;
 const rows=[...(lease?[leaseRow]:[]),...(dues?[dueRow]:[]),...(event?[eventRow]:[]),...(purchase?[purchaseRow]:[]),local,...(withdraw?[deductRow]:[])];
 const summary=withdraw?'兩種稅分開：房東收據的印花稅問地方稅機關；協會給付租金的所得扣繳問國稅局。':lease?(hasStamp?'租約簽收代替銀錢收據，或房東另立銀錢收據時，原則由房東按實收金額的4‰繳納印花稅。':plain?'只簽租約、不另立收據，也沒有收訖註記，單純租賃契約本身不在這份列舉的課稅範圍。':'租賃契約本身不在這份列舉的課稅範圍。若同時作為收據，就依銀錢收據判斷。'):dues&&event?'把會費和活動報名費分開，活動報名費不能直接套用會費免稅。':dues?(qualified?'符合教育、文化、公益或慈善的財團或社團法人資格者，入會費及常年會費收據可免貼印花稅票。':'要先確認是否屬於函釋所列的財團或社團法人；不因名為會費就一律免貼。'):purchase?'單純動產買賣契據每件12元；委外承攬原則按承攬金額1‰，要看憑證內容。':'銀錢收據原則按4‰繳納，應按收據性質及例外判斷。';
 return {direct:true,category:'稅務',title:withdraw?'租金扣繳與收據印花稅：不同機關':'協會印花稅：看這張憑證的用途',summary,steps:rows,
 refs:[stamp(5),stamp(6),stamp(7),...(lease?[{title:'財政部稅務入口網：租約作為收據及押金簽收',source:'https://www.etax.nat.gov.tw/etwmain/announcement/news/3WVWbVz'}]:[]),...(dues?[{title:'內政部：財政部會費收據免貼印花稅函釋',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220048'}]:[]),...(purchase?[stamp(13),{title:'屏東縣政府財稅局：動產契據與承攬契據',source:'https://www.etax.nat.gov.tw/etwmain/announcement/news/WewNjKP'}]:[]),...(cityOther?[]:[{title:'屏東縣政府財稅局：印花稅窗口',source:'https://www.etax.nat.gov.tw/etwmain/announcement/news/bBA6pNj'}]),...(withdraw?[law('所得稅法','G0340003',88),law('所得稅法','G0340003',89),law('各類所得扣繳率標準','G0340028',2),law('各類所得扣繳率標準','G0340028',13),law('各類所得扣繳率標準','G0340028','13-1')]:[])],
 ...(choices?{choiceHeading:'這份租約有沒有兼作收據？',choices}:{})};
}

function coopRepresentativeAssembly(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>175||!/合作社|信合社/.test(t)||!/代表/.test(t)||/儲蓄互助社|農會|漁會|公會|合作社聯合社|保險合作社|初選|出缺|補選|候補|辭職|辭任|股息|股金|社股|退股|退還|退款|清算|解散|合併|轉型|查詢名冊|有幾家/.test(t))return null;
 const creditRe=/信用合作社|信合社/;
 const regularRe=/(?:一般(?:的)?|普通|消費|生產|運銷|勞動|住宅|員生|交通)合作社/;
 const credit=creditRe.test(t), regular=regularRe.test(t.replace(/信用合作社/g,''));
 const proxy=credit&&/代理|委託|把票交給|代投/.test(t)&&/大會|投票|表決|選舉|缺席|出席/.test(t);
 const isElection=/選(?:舉|理事|監事|理監事|社員代表)|改選/.test(t);
 const ordinaryMotion=/一般議案|議案表決|一般表決|通過議案|例行議案/.test(t);
 const seat=/幾(?:席|個|名|位)(?:社員)?代表|代表.{0,9}(?:幾個|幾名|幾位|幾席|幾人|多少|人數|名額|任期|任幾年|當幾年)|(?:選|推選|選出)(?:多少|幾|[0-9,]+)(?:個|名|位|席)?(?:社員)?代表|代表大會(?:是否|可以|能不能|能否|可不可以)(?:開|舉行|召開)|(?:能|可|要|能否|得否)(?:不)?(?:以|夠)?(?:召)?開(?:社員)?代表大會|代表大會.{0,18}(?:多少|幾年|幾人)|(?:代表制|代表大會).{0,15}(?:門檻|條件|章程|人數|怎麼選|怎麼開|怎麼辦)|(?:能|可)(?:不)?(?:以|夠)?選(?:出)?(?:社員)?代表/.test(t);
 if(!seat&&!proxy)return null;
 if(!proxy&&/代表.*(?:報備|函報|會議紀錄|通知何時|寄通知|開會通知|監事會|理事席次)/.test(t)&&!/幾(?:席|個|名|位|人)|多少|任期/.test(t))return null;
 const creditLaw=n=>law('信用合作社法','G0380058',n);
 const creditRules=n=>law('信用合作社社員代表理事監事經理人應具備資格條件及選聘辦法','G0380069',n);
 const regularRules=law('合作社選舉罷免辦法','D0050022',4);
 function toNumber(raw){
  if(/^\d[\d,]*$/.test(raw)){const n=Number(raw.replace(/,/g,''));return Number.isSafeInteger(n)&&n>0?n:null;}
  const digits='零一二三四五六七八九', units={十:10,百:100,千:1000};
  let partial=0,total=0,prev=10000;
  for(const c of raw){if(c in units){if(units[c]>=prev)return null;prev=units[c];total+=(partial||1)*units[c];partial=0;}else partial=c==='兩'?2:digits.indexOf(c);}
  return total+partial||null;
 }
 function counts(x){
  const nums=[...x.matchAll(/(\d{1,3}(?:,\d{3})+|\d+|[零一二兩三四五六七八九十百千]+)(?:名|位|個)?(?:正式)?社員(?!代表|大會|資格)|社員(?:總)?人數(?:有|為|是|達|共|[:：])?(\d{1,3}(?:,\d{3})+|\d+|[零一二兩三四五六七八九十百千]+)(?!歲|天|月|年|位代表)/g)].map(m=>toNumber(m[1]||m[2])).filter(Boolean);
  return [...new Set(nums)];
 }
 const unique=counts(t),n=unique.length===1?unique[0]:null;
 const separate=(re)=>{
  const candidates=[...new Set(t.replace(/(?<=\d),(?=\d{3}(?:\D|$))/g,'').split(/[，,；;。？?！!]/).filter(s=>re.test(s)).flatMap(counts))];
  return candidates.length===1?candidates[0]:null;
 };
 const quotedNumber=(v,cap,isCredit)=>{
  if(!v)return '';
  if(v<=200)return '以'+v+'名社員而言，未超過200人，不能依這條改開社員代表大會。';
  const x=Math.max(51,Math.min(cap,v/10));
  if(!Number.isInteger(x))return v+'名社員的10%是'+x+'，名額取整請按該社選舉規定與主管機關確認，不自行四捨五入。';
  return v+'名社員，'+(isCredit?'依法為':'依名額原則推算為')+x+'名社員代表'+(v/10<51?'（最低51名）':v/10>cap?'（最高'+cap+'名）':'')+'。';
 };
 const cCount=quotedNumber(credit&&regular?separate(creditRe)||(n&&/同樣|各有|都是/.test(t)?n:null):n,151,true);
 const rCount=quotedNumber(credit&&regular?separate(regularRe)||(n&&/同樣|各有|都是/.test(t)?n:null):n,199,false);
 const cRow=['信用合作社／信合社','依信用合作社法第13條，社員超過200人，得選社員代表並開社員代表大會行使社員大會職權，不是超過就一定要改開。代表人數是社員人數10%，最低51名、最高151名；任期三年，連選得連任。'+cCount];
 const rRow=['一般合作社','依合作社選舉罷免辦法第4條，社員超過200人可依章程分組選代表；章程未規定但經主管機關核准，也可分組。代表以社員人數10%為原則，最低51名、最高199名。'+rCount+(/任期|任幾年|當幾年/.test(t)?'一般合作社的代表任期請核對該社章程；同辦法第4條未訂一般合作社代表的年數，不能直接套信合社的三年。':'')];
 const proxyRow=['先分辨是否為信用合作社選舉','信用合作社的選舉，依選聘辦法第27條，選舉人須親自出席，不能委託代理。若是代表大會的一般議案而不是選舉，本條不能直接判定；請核對該社核定章程及議程，必要時洽信用合作社主管機關確認，不直接套人民團體的委託規定。'];
 const typeMissing=!regular&&!credit;const both=credit&&regular;
 const nText=n?'有'+n+'名社員，':'';
 const choices=typeMissing?[
  {label:'一般合作社（如消費、勞動）',question:'一般合作社'+nText+'可以開社員代表大會嗎？代表要選幾位？'},
  {label:'信用合作社（信合社）',question:'信用合作社'+nText+'可以開社員代表大會嗎？代表要選幾位？'}
 ]:proxy&&!isElection&&!ordinaryMotion?[
  {label:'是選理監事等選舉',question:'信用合作社的社員代表大會要選理監事，不能到場可以委託投票嗎？'},
  {label:'是一般議案表決',question:'信用合作社的社員代表大會一般議案表決，代表缺席可委託代理嗎？'}
 ]:null;
 return {direct:true,category:'合作社會務',title:proxy?'信合社代表大會：選舉和一般議案要分開':both?'一般合作社與信用合作社的代表名額不同':typeMissing?'先確認是哪一類合作社，再看社員代表名額':credit?'信用合作社代表大會：最低51名、最高151名':'一般合作社代表大會：最低51名、最高199名',
 summary:proxy?(isElection&&!ordinaryMotion?'信用合作社的選舉不能委託投票；選舉人須本人出席。':ordinaryMotion&&!isElection?'一般議案表決不是選舉；不能單憑選舉條文判斷可否委託。':'如果是信用合作社的選舉，不能委託投票；如果是一般議案，請先確認章程和議程。'):both?'兩種合作社使用不同規則，不要把最高199名套到信合社。':typeMissing?'兩類都須超過200名社員才有這個選項，但代表名額上限及程序不同。請選所屬類型。':(credit?cCount:rCount)||'是否可開代表大會，要先確認社員人數是否超過200人。',
 steps:[...(seat&&((credit||!regular))?[cRow]:[]),...(seat&&((regular||!credit))?[rRow]:[]),...(proxy?[proxyRow]:[])],
 refs:[...((credit||typeMissing)?[creditLaw(13)]:[]),...((regular||typeMissing)?[regularRules]:[]),...(proxy?[creditRules(27),creditLaw(8)]:[])],
 ...(choices?{choiceHeading:typeMissing?'您問的是哪一類合作社？':'這次是選舉還是一般議案？',choices}:{})};
}

function coopRepresentativeSeats(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>160||!/合作社|信合社/.test(t)||!/社員代表/.test(t)
 ||!/(?:選|推選)(?:出)?(?:幾|多少|最多|最少)|(?:社員)?代表(?:的)?(?:名額|席次|要選|能選)|(?:幾|多少)(?:席|位|個|名|人)(?:社員)?代表/.test(t)
 ||!/幾(?:席|位|個|名|人)|多少(?:人|位|席|名)?|法定名額|名額上限|最多|最少|最低|最高|名額怎麼算|人數怎麼算/.test(t)
 ||/協會|人民團體|公會|工會|農會|漁會|聯合社|保險合作社|儲蓄互助社|出席|流會|表決|決議|代理|委託|改期|出缺|候補|罷免|補選|罰鍰|監事|理事|通知/.test(t))return null;
 const out=coopRepresentativeAssembly(q);
 return out?{...out,questionState:{focus:'compound'}}:null;
}
function creditCoopShareRedemption(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 const isCredit=/信用合作社|信合社/.test(t);
 const regularOnly=!isCredit&&/一般合作社|普通合作社|消費合作社|勞動合作社/.test(t)&&/決議.{0,10}(?:三|3)個月/.test(t)&&/股金|社股|退股|股款/.test(t)&&/退還|退款|退股|返還/.test(t);
 if(t.length>190||(!isCredit&&!regularOnly)||/除名|罷免|死亡|繼承|贈與|轉讓|出質|清算|倒閉|解散|變更.{0,5}商業銀行|農會|漁會|儲蓄互助社|保險合作社|信用部/.test(t))return null;
 const withdrawal=/退社|出社|退出(?:合作社|信合社|社員身分)?|退掉(?:會籍|社員身分)/.test(t);
 const reduction=/減少(?:認繳|認購|所持|我的|自己的)?(?:股金|持股|股數|社股)|減(?:持|資)|少持|減掉.{0,7}(?:股|持股)|只退(?:一部分|部分|幾股)|不退社|不退出/.test(t);
 const refund=/退股|股金|社股|持股|股款|每股|退錢|返還|退款|退還|淨值/.test(t);
 if(!regularOnly&&(!(withdrawal||reduction||/退股|股金.{0,8}(?:退還|返還|退款|領回|領還|拿回)|(?:退還|返還|領回|拿回).{0,8}股金/.test(t))||!refund))return null;
 if(/股息|股利/.test(t)&&!/退股|退還|領回|返還|退款/.test(t))return null;
 if(/(?:只|僅)辭職|(?:只|僅)辭(?:去|掉)主席/.test(t)&&!reduction&&!withdrawal)return null;
 const compare=/一般合作社|普通合作社|消費合作社|勞動合作社/.test(t);
 const deposit=/定存|定期存款|活期存款|存摺|存單/.test(t);
 const vague=!withdrawal&&!reduction;
 const credit=n=>law('信用合作社法','G0380058',n);
 const filing=['退社申請是另一個時間點','依信用合作社法第12條之1，社員得在年度終了時退社，原則上要在年度終了三個月前提出請求書；章程可延長到六個月，社員是法人時可延長到一年。退社後依章程請求退還股金。'];
 const less=['只想減少持股，不一定要退出','依信用合作社法第12條之1末項，申請減少股金，準用前五項，包括時點、核算及返還規則。先查章程及該社認購社股下限，向該社確認應留股數及書面程序，不是到櫃檯就能把部分股份當存款領出。'];
 const timing=['返還的三個月從哪天算？','應在社員代表大會決議通過後三個月內退還股金。起算點是社員代表大會決議通過日，不是送出退社申請書日，也不是年底當天。可請信合社確認決議日期和退款方式。'];
 const face=t.match(/每股面額(?:為|是)?(\d+(?:\.\d+)?)元/),net=t.match(/淨值(?:除以股數)?(?:後)?(?:每股)?(?:為|是)?(\d+(?:\.\d+)?)元/);
 const example=face&&net?'依您給的假設數字，兩者取低，每股退'+Math.min(+face[1],+net[1])+'元。':'例如，每股面額100元，決算每股淨值120元，最高退100元；淨值若為80元，依80元計。';
 const amount=['每股退多少：淨值不得超過面額上限','以營業年度終了、經社員代表大會決議通過的決算淨值除以股數，計算每股應退股金，不得超過每股面額。決議前須確認已依會計師查核簽證提足相關評價準備。'+example];
 const depositRow=['定期存款和社股分開','定存按存款契約處理，到期提領或提前解約的條件與利息應看存單；若有質借、設定擔保或其他限制，也要先向存款機構確認。退社的股金返還期限不是領定存的期限。'];
 const regular=['一般合作社不套用這個三個月','一般合作社依合作社法第27、30條及章程辦理退社與股金；年度終了財產是原則上的計算基準，章程另有規定從其規定。這兩條未規定「社員代表大會決議後三個月內返還」，那是這裡的信用合作社規則。'];
 if(regularOnly)return {direct:true,category:'合作社財務',title:'一般合作社不能套信合社的三個月期限',summary:'不一定。一般合作社不能直接套用社員代表大會決議通過後三個月內返還的信用合作社期限。',steps:[regular,['先看退社與章程','社員原則上在年度終了時退社，須於年度終了三個月前提出請求書，章程可延長。出社後，依章程請求退還股金的一部或全部，請該社說明章程的計算及返還方式。']],refs:[coop(27),coop(30),credit('12-1')]};
 const choices=vague&&!deposit&&!compare?[
  {label:'我要退社，申請返還股金',question:'信用合作社社員要退社並領回股金，怎麼算、什麼時候退？'},
  {label:'我要減少持股，仍保留社員身分',question:'信用合作社社員不退社、只減少持股，股金怎麼算、什麼時候退？'}
 ]:null;
 return {direct:true,category:'信用合作社財務',title:deposit?'信合社退股與定期存款是兩件事':compare?'一般合作社與信合社：退股期限不同':reduction?'信合社減少持股：退還規則準用信用合作社法':'信合社退還股金：不是從申請日起算三個月',
 summary:deposit?'要把定存和社股分開。定存依契約，社股則在社員代表大會決議通過後三個月內返還。':compare?'信用合作社有決議通過後三個月內退還的期限；一般合作社不能直接套用。':'信用合作社退還股金，應在社員代表大會決議通過後三個月內辦理；每股以決算淨值計算，且不得超過每股面額。',
 steps:[timing,amount,...(reduction?[less]:[]),...(!reduction||withdrawal&&!/不退社|不退出/.test(t)?[filing]:[]),...(deposit?[depositRow]:[]),...(compare?[regular]:[])],
 refs:[credit('12-1'),...(reduction?[credit(12)]:[]),...(deposit?[credit(15)]:[]),...(compare?[coop(27),coop(30)]:[])],
 ...(choices?{choiceHeading:'您是要退社，還是只減少持股？',choices}:{})};
}

function coopChairAndShare(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>175||!/合作社/.test(t)||/信用合作社|信合社|保險合作社|聯合社|農會|漁會|工會|公會|協會|清算|解散|罷免|除名|法院|股息|股利/.test(t))return null;
 const director=/理事會主席|理事主席|理事長/.test(t), supervisor=/監事會主席|監事主席/.test(t);
 if((director&&supervisor)||(!director&&!supervisor&&!/(?:消費|勞動|一般)?合作社(?:的)?主席/.test(t)))return null;
 const valid=t.replace(/(?:不是|並未|沒有|尚未|不曾|未|沒有要|不想|不打算)(?:請假|辭職|辭任|出缺|退社|退出|領回股金)/g,'');
 const resign=/辭職|辭任|辭了.{0,16}(?:理事長|理事會主席|監事會主席)|辭去.{0,12}(?:主席|理事長)|卸任|下台|不做(?:了|主席|理事長)/.test(valid);
 const vacancy=resign||/出缺|缺額|過世|死亡|離世/.test(valid);
 const leave=/請假|出差|暫時|休假|不能執行職務|暫不能行使職權/.test(valid)&&!vacancy;
 const equity=/股金|社股|股份|股款|退股/.test(t)&&!/不打算領|不問股金|不領股金/.test(t);
 const refund=equity&&/退回|退還|退股|領回|領還|領錢|拿回|怎麼領|何時領|還是年底|能領|當場領|找誰領|一併領/.test(t);
 const staffing=/誰.{0,5}(?:代理|補選|補位)|(?:誰|怎麼|如何)(?:來)?代理|代理人|誰接|找誰|由誰|怎麼補選|還要補選|互推|主持|補選期限/.test(t);
 if(!refund&&!staffing&&(!leave||!/代辦|代理|處理/.test(t)))return null;
 const approvedOut=/退社已生效|已出社|已辦完退社|已完成退社/.test(t);
 const noOut=/沒有退社|無意退社|不退社|沒有退出|不退出|只辭職|只辭去|僅辭職|(?:還沒|尚未|沒有)申請退社/.test(t)&&!/又另外|另行|另外|同時/.test(t);
 const requestedOut=!noOut&&(approvedOut||/提出退社|申請退社|另外退社|另行退社|同時退社|辭職又退社/.test(t));
 const meetingOnly=leave&&/主持|會議主席|代主持/.test(t)&&/社員(?:代表)?大會|理事會|監事會/.test(t);
 const knownRole=director||supervisor;
 const meetingName=supervisor?'監事會':'理事會',role=supervisor?'監事':'理事';
 const settle=/所遺|剩下|還有|剩餘|任期剩/.test(t);
 const vacancyRule=['真的出缺：由原來的會補選','合作社選舉罷免辦法第7條：'+(knownRole?'自出缺日起一個月內由'+meetingName+'補選主席。所遺任期未滿六個月，得由'+role+'互推一人代理；剛好六個月不屬於這項例外。候補'+role+'是補'+role+'席次，不會直接接任主席。':'自出缺日起一個月內，理事會主席由理事會補選，監事會主席由監事會補選。所遺任期未滿六個月，可由各該會的理事或監事互推一人代理；候補人員不會直接接任主席。')+(settle?'以出缺當天距離原任期屆滿的時間計算，不從提出辭呈但未送達那天算。':'')];
 const written=['辭職何時生效？','合作社選舉罷免辦法第8條：以書面辭職，送達合作社社址所在地時生效。應保留送達證明、完成交接，並於會議報告。'];
 const acting=['只請假：先分主持會議和代行其他職務','單純請假不等於主席出缺。依合作社法施行細則第13條，'+(knownRole?'若只是這一場'+meetingName+'的主席缺席，由'+role+'互推一位'+role+'主持。':'理事會或監事會主席缺席，由各該會理事或監事互推一人主持。')+'若要在整段請假期間代簽、用印或對外代表，不可把主持這一次會議當成已取得全部職權；請核對章程、授權紀錄和對外代表人。'];
 const meetingRow=['社員大會由誰主持','依合作社法施行細則第12條，社員大會或社員代表大會的理事會主席缺席，由理事互推一人；無法產生，才由出席人過半數同意臨時公推一人。臨時大會若由監事、社員或社員代表召集，由出席人過半數同意臨時公推。'];
 const share=['股金不是主席職務的一部分','辭主席不等於退社；單靠辭職不能請求按出社程序退還股金。'+(approvedOut?'若退社已生效，':'若另行自請退社，原則上年度終了時退社、年度終了三個月前提出書面請求（章程可延長至六個月；法人社員可延長至一年）。退社生效後，')+'依合作社法第27、30條及章程請求退還一部或全部。原則以營業年度終了時的財產狀況計算，章程另有規定從其規定；不是辭職或提出退社申請當場就能領。'];
 const rule=n=>law('合作社選舉罷免辦法','D0050022',n);
 const detail=n=>law('合作社法施行細則','D0050113',n);
 const showClarification=refund&&!noOut&&!requestedOut&&!leave;
 const choices=showClarification?[
  {label:'只辭主席，仍是社員',question:'一般合作社'+(supervisor?'監事會主席':'理事會主席')+'只辭職、沒有退社，誰代理？股金可以領回嗎？'},
  {label:'主席已辭，也另行申請退社',question:'一般合作社'+(supervisor?'監事會主席':'理事會主席')+'辭職且另行申請退社，誰代理？股金何時領回？'}
 ]:null;
 const memberChair=meetingOnly&&/社員(?:代表)?大會/.test(t);
 const summary=memberChair?'請假不等於出缺。若是社員大會，理事會主席缺席時，依當次大會的召集方式推選主持人。':leave?'請假不等於出缺。'+(knownRole?'如果是'+meetingName+'缺主持人，由'+role+'互推一人主持當次會議；':'由缺主持人的理事會或監事會，各自互推一人主持當次會議；')+'若問整段請假期間代行職務，要另外核對授權。':refund?'先把主席職務和社員身分分開。辭主席不等於退社；單憑辭職不能按退社程序領回股金。':vacancy?'真正出缺，原則一個月內補選；剩餘任期未滿六個月，才可走此出缺代理例外。':'要先確認是暫不能執行職務，還是主席真的出缺，兩種處理不同。';
 return {direct:true,category:'合作社會務',title:leave?'合作社主席請假：主持會議和代行職務要分開':refund?'合作社主席辭職與退社領回股金，分開看':'合作社主席暫時代理與出缺補選不同',summary,
 steps:[...(resign?[written]:[]),...(vacancy||!leave?[vacancyRule]:[]),...(!vacancy?[acting]:[]),...(memberChair?[meetingRow]:[]),...(refund?[share]:[])],
 refs:[...(vacancy||!leave?[rule(7)]:[]),...(resign?[rule(8)]:[]),...(!vacancy?[detail(13),coop(34)]:[]),...(memberChair?[detail(12)]:[]),...(refund?[coop(26),coop(27),coop(30)]:[])],
 ...(choices?{choiceHeading:'您只辭職，還是也已另行申請退社？',choices}:{})};
}

function associationMembershipIdentity(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'').replace(/身份證/g,'身分證');
 if(t.length>165||!/身分證|身分證明文件|身分證明/.test(t)||/工會|公會|合作社|農會|漁會|基金會|改選證明|印鑑|轉帳|銀行|申辦補助|登記為法人|選任職員簡歷|投票時|投票當天/.test(t))return null;
 /* 交叉巡檢第28輪：問外籍人士能不能當理事、監事（順帶問身分證）是資格題，交給 round-fixes */
 if(/(外籍|外國|新住民|外配)/.test(t)&&/(理事長|理事|監事)/.test(t)&&/(擔任|當|可以|能不能)/.test(t))return null;
 const join=/入會|加入.{0,12}(?:協會|社團|團體)|成為會員|新會員|會員申請/.test(t);
 const roster=/名冊|會籍|會員大會.{0,9}(?:留|收|查|驗)/.test(t);
 const entity=/協會|社團|團體|會員/.test(t);
 const founder=/發起人|籌組|(?:成立|新設|設立).{0,8}(?:新)?(?:協會|社團|人民團體)/.test(t);
 if(!join&&!roster&&!entity)return null;
 if(!join&&/委託書|代理出席|政府補助/.test(t))return null;
 if(founder&&!join)return null;
 if(/上網|公開(?:發布|張貼|名冊)|分享名冊|貼到群組/.test(t)&&!join)return null;
 const wantsNumber=/字號|統一編號|證號|證件號/.test(t);
 const wantsCopy=/影本|掃描|影印|正反面|照片|拍照|留存/.test(t);
 const wantsCheck=/只出示|出示|核驗|核對身分|看正本|驗證|不留存/.test(t);
 const mixed=wantsNumber&&(wantsCopy||wantsCheck);
 const rocLaw=n=>law('個人資料保護法','I0050021',n);
 const record=['會員大會名冊不是身分證檔案','人民團體會務輔導辦法第10條：會員（會員代表）大會前的審定名冊列姓名、聯絡電話、地址及權利義務受限制情形，沒有要求寫身分證字號或附身分證影本。選舉罷免辦法第5條的選務名冊也未列字號或影本。'];
 const id=['填字號與交影本，應分別說明必要性','國民身分證統一編號是個人的身分證字號，不是協會的統一編號。加入已立案的一般協會時，依章程核對入會資格；不能把名冊條文當作強制收身分證字號或正反面影本的依據。若協會因其他特定目的要收資料，依個人資料保護法第5、19條，要有適法事由、限於必要範圍；能少收就不多收，不能認為同意就可不限用途。'];
 const show=['可以提出只出示、不留影本','若只需要核對本人身分，可請對方確認是否能當面出示正本或提供其他必要證明，不抄錄完整字號、不留影本。若對方仍要留存，請它說明依據、用途及為何不能用較少資料處理；不能一律保證每個程序都接受只出示。'];
 const notice=['交資料前先問清楚','除依法免告知外，蒐集前應依個人資料保護法第8條告知蒐集者、目的、資料種類、利用期間／地區／對象／方式、可行使的權利；資料可自由選擇提供時，也應說明不提供的影響。請不要把真實身分證字號或證件照片貼在聊天框或群組。'];
 const split=['別把發起人籌組文件當成一般入會文件','籌組新團體的發起人是另一個程序，人民團體法第8條及主管機關辦理籌組的書表適用；請看最新籌組文件清單，別把這項要求套在已立案協會的每位新會員身上。'];
 const choices=!join&&!roster?[{label:'加入已立案的一般協會',question:'加入已立案的協會，依法一定要填國民身分證字號或交影本嗎？'},{label:'編會員大會的名冊',question:'協會編會員大會名冊要身分證影本，可以只出示不留存嗎？'},{label:'籌組新協會的發起人',question:'成立新協會的發起人是否要附身分證影本？'}]:null;
 return {direct:true,category:'人民團體會務說明',title:'協會會員資料：身分證字號、影本和出示用途不同',
 summary:choices?'要看索取用途。一般入會、編會員名冊和籌組發起人是不同程序；請先選情境，不必在這裡提供資料。':roster?'只為編會員大會名冊，法規沒有要求填身分證字號，也沒有規定一定要附身分證影本。'+(wantsCheck?'若只為核對身分，可先請對方確認是否接受只出示、不留存。':''):mixed?'加入已立案的一般協會，沒有通用規定要求一律填身分證字號或交影本。若協會要留資料，應說明用途與必要性。':wantsNumber?'加入已立案的一般協會，不是依法一律要填身分證字號。若協會另有需要，應說明適法事由和用途。':'已立案協會的一般入會，沒有規定一定要附身分證影本；驗證身分和留存影本是兩件事。',
 steps:[record,id,show,notice,split],
 refs:[law('人民團體會務輔導辦法','D0020094',10),law('人民團體選舉罷免辦法','D0050093',5),association(8),association(12),rocLaw(5),rocLaw(8),rocLaw(19)],
 ...(choices?{choiceHeading:'這是入會、會員名冊，還是籌組新團體？',choices}:{})};
}

function coopAssociateMemberAssembly(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>175||!/合作社|信合社/.test(t)||!/準社員/.test(t)||/保險合作社|聯合社|農會|漁會|儲蓄互助社|工會|協會|偽造|解散|合併|除名|股金|股息/.test(t))return null;
 const election=/選舉|選[理監]|參選|候選|投票選|被選|改選|票選|選社員代表/.test(t);
 const roster=/名冊|清查|列冊|公告|更正|列(?:成|為)合格/.test(t);
 const quorum=/成會|法定人數|出席人數|應出席|到場|能開|開得成|算人頭|算.{0,6}出席|人數.{0,5}(?:算|計)|計入|納入|門檻/.test(t);
 const voting=/投票|表決|決議|幾票/.test(t);
 const seating=/列席|旁聽|參加|可以出席|能出席/.test(t);
 if(!election&&!roster&&!quorum&&!voting&&!seating)return null;
 if(/信用合作社|信合社/.test(t)){
  if(!election)return null;
  return {direct:true,category:'合作社會務',title:'信合社中小企業準社員沒有選舉權或被選舉權',questionState:{focus:'compound'},summary:'信用合作社的中小企業準社員，不能以準社員身分參選社員代表，也不能以該身分投票選舉。',steps:[['用信合社專法，不用一般合作社規則','信用合作社法第11條第2項明定中小企業準社員沒有選舉權和被選舉權。這與一般社團會員、一般合作社準社員的法律條件不同；其他議案或出席資格不能只用這一句選舉條文判斷。']],refs:[law('信用合作社法','G0380058',11)]};
 }
 const totalMatches=[...t.matchAll(/(\d+)(?:名|位|個|人)?(?:合格|正式)社員|(?:合格|正式)社員(?:總數|人數|總共|共有|有|共|為|是)?(\d+)(?:名|位|個|人)?/g)].filter(m=>!m[1]||!/^有?(?:到場|出席)/.test(t.slice(m.index+m[0].length))).map(m=>Number(m[1]||m[2])).filter(n=>Number.isSafeInteger(n)&&n>0);
 const totalSet=[...new Set(totalMatches)];
 const total=totalSet.length===1?totalSet[0]:null;
 const presentMatch=t.match(/(\d+)(?:名|位|個|人)?(?:合格|正式)社員(?:有)?(?:到場|出席)|(?:到場|出席|來了)([0-9]+)(?:名|位|個|人)(?:(?:合格|正式)?社員)?/);
 let present=presentMatch?Number(presentMatch[1]||presentMatch[2]):null;
 const subset=t.match(/(?:其中|包括|包含|裡面有|內含)(\d+)(?:名|位|個|人)?準社員/);
 const explicitlyEligible=presentMatch&&(!!presentMatch[1]||/(?<!準)社員$/.test(presentMatch[0]));
 const separateAttendance=presentMatch&&/^(?:、|，|,|。)?(?:(?:另外|另有|還有|加上|加)\d+)/.test(t.slice(presentMatch.index+presentMatch[0].length));
 if(present!==null&&!explicitlyEligible){if(subset&&!/非社員|非社員來賓|其他來賓/.test(t))present-=Number(subset[1]);else if(!separateAttendance)present=null;}
 if(!Number.isSafeInteger(present)||present<0||(total!==null&&present>total))present=null;
 const min=total===null?null:Math.floor(total/2)+1;
 const vote=present===null?null:Math.floor(present/2)+1;
 const example=min===null?'過半數不是剛好一半；由正式名冊的合格社員計算。':present===null?'有'+total+'名合格社員時，至少'+min+'名合格社員出席才能成會；不要用準社員補足。請確認實際到場的合格社員有幾位，不要用全場人數判定。':present<min?'合格社員'+total+'名，至少要'+min+'名出席；只有'+present+'名合格社員出席，不能成會，準社員不能補足人數。':'合格社員'+total+'名，至少要'+min+'名出席；'+present+'名已達一般法定開會門檻。若是一般議案且無另定較高門檻，至少需'+vote+'名出席社員同意；不把準社員算入。';
 const participation=['列席、成會、表決是三件事','依合作社法第11條，準社員沒有選舉權、被選舉權、罷免權與表決權，其他權利義務與社員同。按社員大會會前社籍清查及地方政府簽到表的作法，準社員可依會議安排列席，與應出席的合格社員分開登記；不把列席準社員計入法定成會人數，也不能投票。'];
 const count=['一般社員大會怎麼算','合作社法第48條：全體合格社員須過半數出席，一般決議須出席社員過半數同意。'+example+'如有特別議案或章程合法規定較高門檻，另依其規則；這不是對個案決議效力的認定。'];
 const listing=['名冊列錯，公告期間書面請求更正','依合作社法施行細則第12條之1，會前清查名冊，合格社員、出社社員及準社員要分冊，提經理事會通過後公告十五日並報主管機關備查；清查工作應於會前十五日完成。對社籍分類有異議，可在公告期間以書面向合作社請求更正並保留送達證明，先不以錯列名冊判定投票資格。'];
 const elect=['選舉理事不能靠列席取得選舉權','準社員不能投票選理事或參選。依合作社選舉罷免辦法第3條，選舉會議是具出席資格者過半數，不用準社員補足；改選名冊依同辦法第12條。'];
 return {direct:true,category:'合作社會務',title:'一般合作社社員大會：準社員列席不計入成會或表決',questionState:{focus:'compound'},
 summary:roster&&!quorum&&!voting&&!election?'可在公告期間以書面向合作社請求更正，合格社員、出社社員和準社員不能混列。':quorum||voting&&!election?example:'準社員可依會議安排列席，但沒有選舉權或表決權，不能投票選理事。',steps:[participation,...(quorum||voting&&!election?[count]:[]),...(roster?[listing]:[]),...(election?[elect]:[])],
 refs:[coop(11),coop(48),law('合作社法施行細則','D0050113','12-1'),...(election?[law('合作社選舉罷免辦法','D0050022',3),law('合作社選舉罷免辦法','D0050022',12)]:[]),{title:'雲林縣政府合作社會議範例：合格社員與準社員分開簽到',source:'https://ws.yunlin.gov.tw/Download.ashx?n=6Zuy5p6X57ij5ZCI5L2c56S%2BKOS4jeWQq%2Bi%2BsualreaAp%2BWQiOS9nOekvinovqbnkIbop6PmlaPmuIXnrpfnmbvoqJjmtYHnqIvlj4rnm7jpl5zooajku7bnr4TkvosoMS0xMCkt5b2Z5pW05qqULTExMi4xMi4xOeabtOaWsC5wZGY%3D&u=LzAwMS9VcGxvYWQvNDE0L3JlbGZpbGUvOTM0MC8yNjczNTEvMzEwMDIwYjUtYzgyZi00ZTQyLWJhZjUtMDc4MTU1MThmYzkzLnBkZg%3D%3D'}]};
}

function answerMixed(q){
 const associateMember=coopAssociateMemberAssembly(q);if(associateMember)return associateMember;
 const memberIdentity=associationMembershipIdentity(q);if(memberIdentity)return memberIdentity;
 const coopChair=coopChairAndShare(q);if(coopChair)return coopChair;
 const redeemCreditShare=creditCoopShareRedemption(q);if(redeemCreditShare)return redeemCreditShare;
 const coopRepresentatives=coopRepresentativeAssembly(q);if(coopRepresentatives)return coopRepresentatives;
 const stampDuty=associationStampDuty(q);if(stampDuty)return stampDuty;
 const volunteerTax=volunteerTravelMealTax(q);if(volunteerTax)return volunteerTax;
 const deityManager=deityAssociationManagerReferral(q);if(deityManager)return deityManager;
 const noiseReferral=outsideCounterNoiseReferral(q);if(noiseReferral)return noiseReferral;
 const industryDelegate=industryDelegateReplacement(q);if(industryDelegate)return industryDelegate;
 const commerceDelegate=commerceDelegateReplacement(q);if(commerceDelegate)return commerceDelegate;
 const delegateReplacement=associationDelegateReplacement(q);if(delegateReplacement)return delegateReplacement;
 const electionObjection=associationElectionObjection(q);if(electionObjection)return electionObjection;
 const creditDeposits=creditCoopDepositsAndDividends(q);if(creditDeposits)return creditDeposits;
 const votingRoll=associationVotingRollDisclosure(q);if(votingRoll)return votingRoll;
 const giftReturn=formerMemberGiftReturn(q);if(giftReturn)return giftReturn;
 const coopWithdrawal=coopWithdrawalAndAssembly(q);if(coopWithdrawal)return coopWithdrawal;
 const duesRights=duesAndAssemblyRights(q);if(duesRights)return duesRights;
 const missed=missedSupervisorNotice(q);if(missed)return missed;
 const expenses=memberMeetingExpenseFunding(q);if(expenses)return expenses;
 const withdrawal=withdrawalAndAssemblyRoll(q);if(withdrawal)return withdrawal;
 const boardMinutes=inspectAndPublishBoardMinutes(q);if(boardMinutes)return boardMinutes;
 const address=associationRegisteredAddress(q);if(address)return address;
 const preschool=preschoolParentFiling(q);if(preschool)return preschool;
 const parent=schoolParentFiling(q);if(parent)return parent;
 const creditVacancy=creditCooperativeVacancy(q);if(creditVacancy)return creditVacancy;
 const coopVacancy=coopBoardVacancies(q);if(coopVacancy)return coopVacancy;
 const dual=dualBoardVacancies(q);if(dual)return dual;
 const designated=designatedMeetingConvener(q);if(designated)return designated;
 const directorsQuorum=associationDirectorsQuorum(q);if(directorsQuorum)return directorsQuorum;
 const representativeParticipation=assemblyRepresentativeParticipation(q);if(representativeParticipation)return representativeParticipation;
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
 return identifiedAnswer(identify(q));
}
function identifiedAnswer(keys){
 if(!keys)return null;
 const isCoop=keys.includes('report');
 return {direct:true,category:isCoop?'合作社財務':'人民團體會務說明',
  title:keys.includes('companyInterest')?(isCoop?'股份有限公司股息與合作社清算報告，分開看':'股份有限公司股息依公司法，不是合作社社股年息'):
    keys.includes('creditor')?'合作社清算：就任後公告與終結報告，分別計算':isCoop?'合作社清算報告與股息上限，分開看':'協會入會資格與會員除名，分開看',
  ...(keys.includes('admission')&&keys.includes('expulsion')?{questionState:{focus:'compound'}}:{}),summary:keys.length===1?topics[keys[0]].line[1]:'你問了兩件事，分別如下。',steps:keys.length>1?keys.map(k=>topics[k].line):[],refs:keys.flatMap(k=>topics[k].laws)};
}
if(typeof module!=='undefined'&&module.exports){module.exports={identify,answerMixed,dissolutionAndGrant,chairVacancy,monthsRemaining,assemblyCommunications,assemblyPrivacy,coopRegistryPrivacy,yearEndAuditVacancy,overdueFundraising,publishDocumentPrivacy,fundraisingDisclosure,changedAssociationDues,resignationAndMeeting,formerMemberArrearsPrivacy,changedMeetingVenue,familyAssemblyProxy,dualBoardVacancies,coopBoardVacancies,creditCooperativeVacancy,schoolParentFiling,associationRegisteredAddress,inspectAndPublishBoardMinutes,temporaryMeetingNotice,withdrawalAndAssemblyRoll,memberMeetingExpenseFunding,missedSupervisorNotice,duesAndAssemblyRights,coopWithdrawalAndAssembly,designatedMeetingConvener,assemblyRepresentativeParticipation,formerMemberGiftReturn,preschoolParentFiling,associationVotingRollDisclosure,associationDirectorsQuorum,creditCoopDepositsAndDividends,associationElectionObjection,associationDelegateReplacement,commerceDelegateReplacement,industryDelegateReplacement,outsideCounterNoiseReferral,deityAssociationManagerReferral,volunteerTravelMealTax,associationStampDuty,coopRepresentativeAssembly,coopRepresentativeSeats,creditCoopShareRedemption,coopChairAndShare,associationMembershipIdentity,coopAssociateMemberAssembly};return;}
root.verifiedMixedQuestionAnswer=answerMixed;
root.verifiedCoopRepresentativeSeats=coopRepresentativeSeats;
root.verifiedAssociationAdmissionAndExpulsion=function(q){const keys=identify(q);return keys&&keys.includes("admission")&&keys.includes("expulsion")?identifiedAnswer(keys):null;};
root.verifiedWithdrawalAndAssemblyRoll=withdrawalAndAssemblyRoll;
})(typeof window!=='undefined'?window:globalThis);
