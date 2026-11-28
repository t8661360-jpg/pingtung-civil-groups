(function(root){
'use strict';
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const f=(n,reg=false)=>({title:(reg?'公益勸募許可辦法':'公益勸募條例')+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+(reg?'D0050147':'D0050138')+'&flno='+n});
const rules='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050146';
const self=/捐物|捐贈|勸募|募款|收款|現金|捐款人|付款|公開|核准|到期|期滿|截止/;
function follow(q){const s=norm(q);return s.length<220&&/^(?:補充|更正|不是|還沒到期|已經到期|已到期)/.test(s)&&self.test(s)&&!/換題|換一題|另一個問題/.test(s);}
const law=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const civil=n=>law('民法','B0000001',n);
const counsel={label:'聯絡承辦',view:'contact',sub:''};
const notEnding=/不是(?:要|打算)?(?:解散|清算)|沒有(?:要)?解散|不(?:打算|準備|會|需要|是要|要)解散|不解散|取消解散/;
const activityDates=/(?:勸募活動|公開勸募|公開募款|勸募|募款|收款).{0,12}(?:延期|延長|展期|展延|延後)|(?:延期|延長|展期|展延|延後).{0,10}(?:勸募活動|募款期間|收款期間)/;
function singlePurposeLatePeriod(t,prior){
 if(!activityDates.test(t)||!/還[剩有]?(?:下|最後)?(?:[1-6一二兩三四五六])天|只剩(?:下)?(?:[1-6一二兩三四五六])天|不到(?:7|七)天|不足(?:7|七)(?:天|日)|少於(?:7|七)(?:天|日)|還有[1-6一二兩三四五六]天就(?:到期|截止)|最後一天.{0,8}(?:剩|還有)[1-6一二兩三四五六]天/.test(t)||/使用期限延期|成果報告延期/.test(t))return null;
 if(!/許可|核准/.test(t+prior))return null;
 if(/(?:已(?:經)?截止|已期滿|已(?:經)?到期|超過原許可)/.test(t))return null;
 return {direct:true,category:'公益勸募｜原許可快到期',title:'勸募活動延期：來不及提前7日，不可自行延長',
  summary:'原核准的活動還沒到期，但如果預計從原期限接著延長，現在不到7日，通常已來不及依規定提前報請許可。先找原許可機關確認，不要先宣布延長或在原期限後繼續募款。',
  steps:[['七日是變更發生前，不是到期後補件','勸募起迄日期要變更，依法先經理事會或董事會同意，再敘明理由於變更事實發生7日前報原許可機關許可。只送件不等於核准；沒有取得有效許可，就按原日期停募。要在其後再發起，確認是否應重行申請，不把空檔當成已核准。'],['用途沒改，就別把兩種程序混在一起','只改勸募活動日期，不等於改變款項用途或財物使用計畫。已經收到的捐款依原核准計畫分帳，原許可期滿後按規定辦理收支公開徵信與備查。若逾期有募得財物，依第22條返還捐贈人；難以返還由主管機關認定處理。']],
  refs:[f(12),f(3,true),f(18),f(22)],questionState:{focus:'compound'},actions:[counsel]};
}
function dissolution(t,raw,prior){
 if(notEnding.test(t)||!/解散|走.{0,4}清算|清算中/.test(t)||!/協會|社會團體|公益社團法人/.test(t+prior)||/合作社|商業公會|職業公會|工會|農會|漁會/.test(t))return null;
 if(!/(?:勸募|公開募款|公益募款).{0,20}(?:餘|剩|未用|財物|款)|(?:餘|剩|未用|指定).{0,19}(?:勸募|公益募款)/.test(t))return null;
 if(!/核准|許可|公開勸募|公開募款|公益勸募/.test(t+prior))return null;
 const registered=/登記狀態確認:已辦|已(?:辦|完成|經)?(?:法院)?(?:社團)?法人登記|已(?:經)?去法院登記|公益社團法人/.test(t)&&!/登記狀態確認:僅|僅立案|只立案|未辦|沒(?:有)?(?:去)?法院登記/.test(t);
 const unregistered=/登記狀態確認:僅|僅立案|只立案|未辦(?:法院)?法人登記|還沒做法人登記|沒(?:有)?(?:去)?法院登記/.test(t);
 const wage=/工資|薪資|薪水|雇員|員工|資遣|勞工/.test(t);
 const borrow=/借用|借來|租來|寄放|借入|向別人借/.test(t);
 const grant=/補助/.test(t);
 const steps=[
  ['公開勸募的賸餘要獨立列冊，不自行轉送','依公益勸募條例第22條，勸募團體解散，經許可公開勸募的賸餘財物原則應返還捐贈人。確實難以返還時，先報原勸募許可主管機關認定；認定後應繳交該機關，由機關按原用途或相關目的辦理，也可由機關依法委託適當團體。不是協會自行挑接收方，也不能直接拿這筆錢支應一般欠款。'],
  ['理事會同意不是解散決議，也不能自行處分','如尚在打算解散，先依法召開會員（代表）大會，依團體身分核對出席及決議門檻和承辦、法院所需程序。進入清算後由有權的清算人盤點自有財產、受限款、第三人財產與債務。']
 ];
 if(borrow)steps.push(['借用器材先確認所有權','器材只是借用或租用、仍屬原主，就依原契約、借用紀錄清點並返還，不列入協會賸餘，也不能捐贈給另一協會。若其實已捐贈、受指定用途限制或有爭議，留存原文件再核對。']);
 if(grant)steps.push(['補助款與設備各按原核定文件','把受補助款餘額和設備分開列冊，查核原核定條件及應否繳回或先取得核准。由清算人向原補助機關確認，不用勸募或一般捐款規則處分。']);
 if(wage)steps.push(['工資和其他欠款另向清算人申報核對','積欠工資、依法應給的退休金及資遣費可能適用勞基法第28條的特別順位；核對欠款期間、順位、債權文件及是否可申請墊償。未清償及釐清前，不先分一般財產；不要把公開勸募受限款一併拿去發放。']);
 steps.push(['一般無指定捐款不等於可任意交接',registered?'已辦法院法人登記：依法清算，先清債及核對特別法，再依章程或有效的會員大會決議處理真正賸餘；沒有適用規定時，依民法第44條歸所在地地方自治團體。公益法人賸餘不得歸自然人或營利團體。' : unregistered?'只有立案、未辦法人登記：依人民團體會務輔導辦法第27條按章程或大會決議處理清算程序；章程未規定或大會無法召開時，由理事長或章程代理人任清算人，無法產生時由主管機關選任，並準用民法清算。確認普通結餘合法去向，不直接把法人財產歸屬規則套用。':'先核對是否已辦法院法人登記；法院法人適用民法清算及財產歸屬，未辦法人登記者依會務輔導辦法第27條核章程或大會決議及依法產生的清算人。無指定捐款若屬團體資產，須先待清債後才判斷剩餘去向。']);
 if(/公告|徵信|成果|備查/.test(t))steps.push(['清算與原勸募案的公告不同','保留原許可、出入帳與捐贈紀錄。依法核對活動期滿後的收支徵信與計畫完竣後成果備查兩個起算點；進入清算時先與原許可機關核對未結案程序，不對外公開不必要的捐贈人個資。']);
 const choices=!(registered||unregistered)&&raw.length<410?[{label:'已辦法院法人登記',question:raw+'；登記狀態確認：已辦法院法人登記。'},{label:'僅縣府立案，未辦法人登記',question:raw+'；登記狀態確認：僅立案，未辦法人登記。'}]:[];
 return {direct:true,category:'協會清算｜公益勸募與一般財物',title:'協會解散：公開勸募餘款不能和其他財物一起送',
 summary:'不可以只由理事投票把錢和器材一起送給另一個協會。先分開已核准的公益勸募賸餘、應還的借用物、未清償的債務和團體自有財產，各依不同程序處理。',
 steps,refs:[f(22),law('人民團體法','D0050091',59),law('人民團體會務輔導辦法','D0020094',27),civil(40),civil(44),...(borrow?[civil(464)]:[]),...(wage?[law('勞動基準法','N0030001',28)]:[])],
 questionState:{focus:'compound',domain:'association-dissolution-estate'},retainPermitQuestion:true,actions:[counsel],...(choices.length?{choiceHeading:'協會是否已辦過法院法人登記？',choices}:{})};
}
function route(q){
 const raw=String(q??'').trim(), t=norm(raw);
 if(!t||t.length>650||/政治獻金|選舉募款|宗教香油|合作社|商業投資|新法草案/.test(t))return null;
 const corrected=t.split('更新資料:');
 const current=corrected.at(-1),prior=corrected.slice(0,-1).join('');
 const near=singlePurposeLatePeriod(current,prior);if(near)return near;
 const liquidation=dissolution(current,raw,prior);if(liquidation)return liquidation;
 const exact=/公益勸募|公開募款|公開募|募款期間|勸募期間|勸募活動|(?:核准|許可).{0,16}(?:募款|勸募)|募款.{0,8}(?:期間|期限)|收款截止/.test(t);
 const extend=/(?:延長|展延|延後|展期|超過一年|滿一年).{0,14}(?:募款|收款|期間|許可)|(?:募款|勸募|期間|期限).{0,15}(?:延長|展延|延後|展期|到期|期滿).{0,18}(?:繼續|還|可|怎|再|、|，|或|。|$)/.test(t);
 const aim=/改成.{0,10}(?:買|用|做)|改買|(?:改|變更|換)(?:募款|勸募|捐款|原)?(?:的)?(?:用途|目的)|把.{0,15}(?:改成|改為)|改作他用/.test(t);
 const remain=/剩款|賸餘|剩餘|未用完|錢沒用完|留三年/.test(t);
 const cash=/萬元[以起]?上|10000|10,000|現金付款|用現金/.test(t);
 const revised=t.split('更新資料:').pop();
 const active=/狀態確認:還在原核准期間|還沒到期|尚未到期|未屆期|仍在.{0,8}(?:原|核准|許可).{0,8}(?:期限|期間)|快到期/.test(revised)||revised===t&&/仍在核准期間/.test(t);
 const expired=/狀態確認:原許可已期滿|已屆期|(?:已經|已|早已)到期|許可(?:已經|已)?期滿|過了(?:原|核准|許可).{0,8}(?:期限|日期|截止)/.test(t)&&!/還沒到期|尚未到期|未屆期/.test(revised);
 const purposeOnly=/使用期限|成果報告|報告延長|延期交報告/.test(t);
 if(!exact||!(extend&&(!purposeOnly||/延長(?:收款|募款期間|勸募期間)|勸募起迄|延長公開募款/.test(t))||aim&&(/異議|不同意|許可|核准|指定|財物使用/.test(t))) )return null;
 const ref=[f(12),f(3,true),f(6,true),f(19),f(22)];
 const items=[];
 if(extend){
  const before='仍在核准期間，若要變更勸募起迄日期，先由理事會或董事會同意（公立學校、未設理董事會行政法人依法走各自程序），於預定變更事實發生七日前報原許可主管機關許可。勸募活動最長一年；報了也要等核准，不能自行延長。';
  const after='原許可期滿後就要停止依該案收款；若要再發起，先和主管機關確認新案及申請，取得適法許可再募。逾期已募集的財物依法返還，難返還時報主管機關認定，不得當作已補准。';
  items.push(['先看募款收件期限，不是財物使用期限',expired?after:active?before:before+' '+after]);
 }
 if(aim||/指定|異議|不同意/.test(t))items.push(['用途和原計畫先不要改動','捐款只能用在原核准計畫與指定用途。若變更許可文件上載明的使用目的，須重新申請，不能先把教材、送餐等指定款拿去買車或設備；若目的原本沒改、只調整財物使用計畫，先經理（董）事會同意，於同意後七日內報原許可機關許可，同時通知捐贈人或公告，給至少一個月異議期；期限內提出異議者應返還捐贈財物。公立學校、未設理董事會行政法人依法走各自程序。']);
 if(remain){items.push(['賸餘不是可以先留用三年','計畫執行完竣有賸餘，得在完竣後三個月內擬同類目的使用計畫，經主管機關同意後才能動支，再執行期間不逾三年。期滿次日起三十日內的收支徵信與計畫執行完畢後三十日內的成果備查是兩件事。若團體已解散或未依規定辦理賸餘，另依第22條處理。']);ref.push(f(18),f(20));}
 if(cash){
  const notPaid=/還沒付|仍沒付|尚未付|還未付|沒付款/.test(revised);
  items.push(['達新臺幣一萬元的勸募開支不能付現',notPaid?'你已說尚未付，請用支票或經郵局、金融機構匯款，核對支出已納入合法計畫並保留付款與支出憑證。':'已付款與尚未付款要分開：未付就改用支票或經郵局、金融機構匯款；若已付現或帳冊漏一筆，保存真實憑證、核對補登並請原主管機關確認處理，不倒填或偽造資料。']);ref.push(f(18),f(21));
 }
 if(/姓名|不公開|徵信/.test(t)){
  items.push(['徵信資料和報主管機關備查要分開','不要擅自公開捐款人的完整姓名或其他不必要個資。衛福部公開徵信作業說明，捐贈人名稱可採簡稱揭露；按適用規定繼續辦理徵信，並向原許可機關確認遮隱格式及依法備查所需資料，不能把完整原始名單逕貼公開網站。']);
  ref.push({title:'勸募條例施行細則：公開徵信及報備欄位',source:rules},{title:'衛生福利部：勸募團體辦理公開徵信作業說明',source:'https://www.society.taichung.gov.tw/media/489541/%E8%A1%9B%E7%94%9F%E7%A6%8F%E5%88%A9%E9%83%A8%E5%8B%B8%E5%8B%9F%E5%9C%98%E9%AB%94%E8%BE%A6%E7%90%86%E5%85%AC%E9%96%8B%E5%BE%B5%E4%BF%A1%E4%BD%9C%E6%A5%AD%E8%AA%AA%E6%98%8E.pdf'});
 }
 if(/主動捐|沒有邀募|沒邀募|企業.{0,5}捐物|收據/.test(t)){
  items.push(['受贈物資按實際來源開收據、分帳','企業雖沒受單獨邀請，若是回應這個公開勸募，就按該許可案開收據記載實際收受物資並入案。確實與本案無關、是對方主動送，依第6條開收據、按指定用途、另列公開徵信與備查；非公立學校的勸募團體原則上於年度終了五個月內報備。不要混填許可文號，也不要承諾有稅務抵扣。']);ref.push(f(6),f(16),{title:'勸募條例施行細則：捐物收據',source:rules});
 }
 const want=extend&&!active&&!expired;
 const summary=expired?'原許可已期滿，先停止用原案收款。':active?'還在原期內，可以依法提出日期變更，不是自行延長。':extend?'先不要自行延長募款或改用捐款。是否還在原核准期間，會影響下一步。':'先不要改用捐款。請先分清楚是變更許可上的使用目的，還是只調整原目的下的使用計畫。';
 return {direct:true,category:'公益勸募｜許可變更與款項',title:'公益勸募的日期、用途和款項分開處理',summary,steps:items,refs:[...new Map(ref.map(x=>[x.title,x])).values()],questionState:{focus:'compound'},retainPermitQuestion:!raw.includes('；狀態確認：'),actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(want?{choiceHeading:'目前是否還在原核准的募款期間？',choices:[
  {label:'還在原核准期間',question:raw+'；狀態確認：還在原核准期間。'}, {label:'原許可已期滿',question:raw+'；狀態確認：原許可已期滿。'}
 ]}:{})};
}
if(typeof module==='object'&&module.exports)module.exports={route,follow};
else {root.verifiedCharitablePermitChanges=route;root.isCharitablePermitCorrection=follow;}
})(typeof window==='object'?window:globalThis);
