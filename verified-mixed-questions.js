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
 const post=['閉會後：保存、查閱及報備',subBoard?'理事會、監事會和理監事聯席會議紀錄由團體自行留存，提供會員（會員代表）查閱。依法須向主管機關或目的事業主管機關核辦的決議，另檢附文件送件，不套用大會紀錄通用的三十日期限。':'會員（代表）大會紀錄，須在閉會後三十日內報請主管機關備查；團體仍要自行留存並提供會員（會員代表）查閱。一般規定沒有要求逐一寄給每位會員；章程、其他適用規定另有要求時仍應遵守。'];
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
 const summary=agenda&&privacy?'會前要通知議程，不等於要公開公告；會後也不必依法一律公開出席名單。':proxy&&privacy?'電子委託和公開名冊是兩件事，要各自看適用條件。':privacy?'給會員查閱不等於可以公開；先分清名冊種類和使用目的。':'視訊參與和委託出席不是同一件事。';
 return {direct:true,category:'人民團體會務說明',title:agenda&&privacy?'大會議程通知與出席名單公開，分開看':proxy&&privacy?'視訊大會的電子委託與名冊公開，分開看':privacy?'會員查閱名冊，不等於對外公開':'線上開會與委託出席',summary,steps,refs:[...new Map(refs.map(x=>[x.source,x])).values()]};
}
function answerMixed(q){
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
if(typeof module!=='undefined'&&module.exports){module.exports={identify,answerMixed,dissolutionAndGrant,chairVacancy,monthsRemaining,assemblyCommunications,assemblyPrivacy};return;}
root.verifiedMixedQuestionAnswer=answerMixed;
})(typeof window!=='undefined'?window:globalThis);
