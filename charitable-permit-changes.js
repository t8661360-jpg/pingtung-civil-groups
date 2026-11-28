(function(root){
'use strict';
const norm=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const f=(n,reg=false)=>({title:(reg?'公益勸募許可辦法':'公益勸募條例')+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+(reg?'D0050147':'D0050138')+'&flno='+n});
const rules='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050146';
const self=/捐物|捐贈|勸募|募款|收款|現金|捐款人|付款|公開|核准|到期|期滿|截止/;
function follow(q){const s=norm(q);return s.length<220&&/^(?:補充|更正|不是|還沒到期|已經到期|已到期)/.test(s)&&self.test(s)&&!/換題|換一題|另一個問題/.test(s);}
function route(q){
 const raw=String(q??'').trim(), t=norm(raw);
 if(!t||t.length>650||/政治獻金|選舉募款|宗教香油|合作社|商業投資|新法草案/.test(t))return null;
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
