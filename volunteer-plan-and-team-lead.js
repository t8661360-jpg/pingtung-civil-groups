(function(root){
'use strict';
const src={title:'志願服務法第3、4、6–9、11、15、16條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050131'};
const p={title:'人民團體法第12、16、17條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const clean=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'');
const plan=/志(?:願服務|工(?:服務)?)(?:的)?計[畫劃]|志工計畫書|服務計[畫劃]|(?:志工隊|志工名冊|用志工|志工).{0,8}(?:備案|備查)|(?:不備案|未備案).{0,9}志工|(?:招募|召募).{0,8}志工|志工.{0,7}(?:怎麼招|要怎麼管|怎麼管理|需要.{0,7}備案)/;
const content=/(?:計[畫劃]|計畫書).{0,12}(?:要寫|應寫|寫什麼|包含|項目|內容|最少)|(?:要寫|應寫|最少).{0,9}(?:什麼|項目|內容)/;
const lead=/隊長|志工召集人|志工幹部/;
const leadAsk=/非會員|沒有入會|沒入會|是會員|當隊長|擔任|要有隊長|要不要(?:有|設)|聘|任命|撤掉|撤換|換隊長|隊長要換|隊員(?:選|自己選)|重選|隊規/;
const negTypes=/(?:不是|並非)(?:問|指)?(?:民間協會|協會自己組隊|一般協會|社區發展協會|醫院志工隊|公所志工隊|祥和志工隊)(?=[，,；;、。]|$)/g;
const sel=/志工分流確認:(相符|不符|待確認|協會隊|祥和隊|機關隊|其他)(?=[。；;]|$)/;
const cleanTitle=x=>x.replace(/(?:不要|不是)(?:問|說|談)?(?:志工)?隊長/g,'');
function route(q){
 const raw=String(q??'').trim(),t=clean(raw),z=t.replace(negTypes,'');
 if(!t||t.length>720||/^新題/.test(t)||!/志工|志願服務/.test(z)||/童軍|政治獻金|義消|義交|巡守隊隊長|私人帳戶|私戶|股金|社股|勞基法|調解|薪資|加班/.test(z))return null;
 const kind=z.match(sel)?.[1];
 const main=kind?z.split(/志工分流確認:/)[0]:z;
 const leadIntent=(lead.test(cleanTitle(main))&&leadAsk.test(main))||/隊員.{0,9}選完.{0,13}撤掉/.test(main);
 const planIntent=plan.test(main)||/志工/.test(main)&&/(?:尚未|還沒|沒)(?:有)?報.{0,3}計[畫劃]|(?:募|召|招)到.{0,4}志工/.test(main);
 if(!leadIntent&&!planIntent)return null;
 if(planIntent&&!leadIntent&&/(送|交|遞|報|寄).{0,3}(去|到|給)?.{0,2}(哪|誰|什麼單位)|哪(裡|個單位|邊|個機關).{0,3}(送|交|備案|報|辦)/.test(main))return null; /* 第258輪：計畫要送哪裡＝備案對象，交給 round-fixes 的備案規則 */
 if(/會費|月費|食材費|材料費|報帳|制服|背心|收據|便當|交通費/.test(main)&&!(leadIntent||content.test(main)||/不備案|沒(?:有)?備案|還沒報計畫/.test(main)))return null;
 const govt=/公所自己的|公所(?:自己|直接).{0,5}(?:用|運用|志工)|(?:鄉|鎮|市|區)公所.{0,8}(?:主辦|自己|運用)|(?:各級)?政府機關.{0,8}(?:自己|運用|主辦)|公立學校|公立機構/.test(main);
 const hospital=/醫院志工隊|醫院.{0,9}(?:主辦|自己|運用)/.test(main);
 const xiang=kind==='祥和隊'||!kind&&/祥和/.test(main)&&!(hospital||govt);
 const assoc=/協會|社會團體/.test(main);
 const teamUnclear=!kind&&leadIntent&&/不確定|不清楚|不知道/.test(main)&&/祥和|公所|誰是|運用單位/.test(main);
 const notFit=/不相符|不符合|不一致|不符章程|章程.{0,14}(?:只有|只寫|僅有|只做).{0,8}(?:文化|體育|運動)/.test(main);
 const fit=!notFit&&/已符章程|(?:章程|計畫|服務|目的).{0,18}(?:相符|一致|符合|一樣)|也有寫.{0,9}(?:送餐|志願服務)/.test(main);
 const asksFile=/備案|備查|函報|沒報計[畫劃]|還沒報|年底|年度|不報|補助/.test(main);
 const asksForm=content.test(main);
 const noPlan=/沒有.{0,4}(?:服務)?計[畫劃].{0,14}(?:可以|能|用)|沒有志工服務計畫可以用/.test(main);
 const noFile=/不備案|沒有備案|未備案|沒備案|不備查/.test(main);
 const signer=/志工.{0,12}(?:簽|簽署).{0,10}(?:計畫|服務計畫)|(?:計畫|計畫書).{0,8}(?:誰簽|由志工簽)/.test(main);
 const rosterFiling=/志工名冊.{0,10}(?:備案|備查)/.test(main)&&!leadIntent;
 const leaderSetup=/志工隊.{0,8}要不要(?:有|設)隊長/.test(main)&&!/非會員|理事會|撤換/.test(main);
 const didOperate=/已經運用|已(?:經)?開始.{0,6}(?:服務|運用|派工)|已經在做|已經服務|已經招|已經召|已經召到|已開始|已開始三個月/.test(main);
 const exemption=govt||kind==='機關隊'||kind==='相符'||fit;
 const mismatch=kind==='不符'||notFit;
 const statutePlan=['服務計畫依法至少寫七項','依志願服務法第7條第2項，召募、訓練、管理、運用、輔導、考核，以及服務項目。實務上可在各項寫清服務對象、內容、招募條件、訓練和督導人、排班與成效如何查核；例子不是另加法定欄位。'];
 const need=['有計畫才按計畫用志工','依法適用的志願服務，運用單位要依「志願服務計畫」運用志工（第7條），不能沒計畫就直接運用。召募時依第6條把志願服務計畫公告；第9條由運用單位辦理基礎及特殊訓練，第11條指定督導，第16條辦理意外事故保險。'];
 const standard=['需要事前備案時，也要按服務期程辦事後備查','第7條第3項：非免備案情形，運用前把服務計畫及立案登記證書影本送主管機關與該計畫目的事業主管機關備案。服務未滿兩年，運用結束後兩個月內向兩機關函報辦理情形；兩年以上，於年度結束後兩個月內函報。備案的是計畫和證書影本，不是志工名冊；特定計畫另要求名冊，依其公告。'];
 const exempt=['免的是事前備案，不是免做計畫或年度報告','依第7條第4項，各級政府機關、機構、公立學校，或志願服務計畫與運用單位章程所載存立目的相符者，免於運用前申請備案。仍須依計畫運用，在年度結束後兩個月內，把辦理情形函報主管機關與該計畫目的事業主管機關備查。'];
 const remedial=['應報未報，先據實向主管機關確認補正','若依法應備案或備查而未依第7條第3或第4項辦理，第5項規定目的事業主管機關應不予經費補助，並作績效考核參據。邀請函、組隊、先招募或已辦服務不是核准補助。送件有欠缺或與法令不符，依第8條按正式通知補正；已開始要說明實際日期，不倒填、也不保證補了就領得到。'];
 const update=['服務更動、隊長名冊與補助分開查','服務對象或項目有變動，請實際運用單位及計畫目的事業主管機關確認應如何更新原計畫和辦理報送。只換隊長，先查運用單位規章及名冊管理；補助則查核定用途、專案列冊和期限，不以章程範本、口頭邀請當成核准。'];
 const leader=['民選、聘任或撤換，先查運用單位的規章','志願服務法沒有規定志工隊一定要設隊長，也未一律要求隊長是協會會員或由理事會、董事會聘任。沒有入會，不代表依法不能擔任隊長；仍要核對這一隊的資格條件。第11條要求運用單位指定督導人，督導與志工隊長不必是同一人；第15條要求志工遵守運用單位規章。看本隊的服務計畫、章程、隊規或公告，確認選任機關、任期、撤換權限與程序，不憑單次隊員投票就說一定有效或需要重選。'];
 const association=['志工隊長不是協會理事長，也不因擔任而成為會員','若要當協會理事、監事或理事長，另有人團法及有效章程的會員與選任規則；志工隊長職務不能拿來替代理監事資格。若隊規沒寫，請運用單位志工督導或計畫承辦說明由何機關做決定，對外名冊僅按正式要求提供必要資料。'];
 const special=['先確認是哪個單位在運用志工',hospital?'請該醫院志工督導或管理窗口核對該院服務計畫與隊規。不同醫院規則不一定相同，不能以協會理事會或別的醫院的做法替代。':govt||kind==='機關隊'?'請公所或該政府機關的志願服務承辦，依主管的計畫和隊規確認隊長由誰選任或撤換。不套協會的理事會聘任程序。':xiang||kind==='祥和隊'?'如是祥和志工方案，請實際運用單位及方案主管承辦查已公告的服務類別、資格、隊規與名冊。不把一般志工、其他縣市或個別團隊的資格當成本案條件。':'請核對招募公告、正式計畫所列運用單位及志工督導；主辦、協力及實際運用志工的機構不一定相同。'];
 const askMatch=planIntent&&asksFile&&!rosterFiling&&!exemption&&!mismatch&&!kind&&!noFile&&!didOperate&&!leadIntent;
 const planOnly=asksForm&&!asksFile&&!leadIntent&&!noPlan&&!didOperate;
 const steps=leadIntent?[leader,...((hospital||xiang||govt||teamUnclear||kind==='其他'||kind==='祥和隊'||kind==='機關隊')?[special]:assoc||kind==='協會隊'?[association]:[special])]:[];
 if(signer)steps.push(['計畫由運用單位負責，不等於每名志工都簽計畫','第7條要求運用單位依計畫辦理，並未規定每位志工都要在服務計畫簽名。個人報名、保險或出勤表依計畫及規章另行查；團體集體從事志願服務與運用單位的服務協議，另依第6條，不是同一份。']);
 if(asksForm||planIntent)steps.push(statutePlan);
 if(planIntent&&!planOnly){
  steps.push(need);
  if(exemption)steps.push(exempt);
  else if(mismatch)steps.push(standard);
  else steps.push(standard,exempt);
  if(noFile||didOperate||/補助/.test(main))steps.push(remedial);
 }
 if(/增加送餐|(?:計[畫劃]|服務).{0,8}(?:變更|增加)|換隊長|隊長要換|重選|名冊.{0,6}(?:補助|列)|補助.{0,12}(?:名冊|隊長)/.test(main))steps.push(update);
 const summary=teamUnclear?'先看是哪個運用單位。志願服務法沒有規定所有隊長都必須是協會會員；選任、聘任或撤換依實際隊規及服務計畫。':
 leaderSetup?'沒有規定志工隊一定要設隊長；第11條要求運用單位指定專人督導。隊長是否設置，由實際運用單位按規章及計畫辦理。':
 leadIntent?'志願服務法未一律要求志工隊長是協會會員，也未指定必須由理事會或董事會聘任。先查運用單位的服務計畫與隊規。'+(planIntent&&exemption?'公所等政府機關免事前備案，但仍須依計畫運用、於年度結束後兩個月函報。':''):
 signer?'志工不一定要簽計畫本身。計畫是由運用單位負責，第7條的備案是另一件事；個人要簽的報名或同意文件另看規章。':
 rosterFiling?'第7條所稱備案的是計畫和證書影本，不是志工名冊；如某項補助或服務計畫另要求名冊，再按該案規定。':
 noPlan?'不可以沒有計畫就運用志工。要有志願服務計畫；有沒有免事前備案，是另一件事。':
 noFile?'如果依法應備案或備查卻沒辦，志願服務法第7條第5項規定不予經費補助；先確認問的是志願服務計畫備案，還是附設隊伍要不要另辦團體立案；兩者不同。':
 planOnly?'志願服務計畫至少要列七項：召募、訓練、管理、運用、輔導、考核與服務項目。':
 exemption?'符合免事前備案的條件，不必在運用前申請，但仍要依法制定計畫，並在年度結束後兩個月內函報。':
 mismatch?'計畫若與章程目的不符，依第7條應在運用前備案。已開始時先如實確認正式補正方式；持續兩年以上，於每個年度結束後兩個月內函報。':
 '適用志願服務法，要依「志願服務計畫」運用志工。是否須事前備案，要看運用單位與章程目的；免事前並不是免計畫。';
 const opts=teamUnclear?[['協會自己的志工隊','協會隊'],['祥和志工方案','祥和隊'],['公所或其他政府機關','機關隊'],['其他或不確定','其他']]:askMatch?[['計畫確實符合章程目的','相符'],['計畫與章程目的不同','不符'],['還不確定是否相符','待確認']]:null;
 return {direct:true,title:leadIntent?'先看誰在運用志工，再判斷隊長資格與任免':planOnly?'志願服務計畫要寫哪些內容？':'有志願服務計畫，才按計畫運用志工',category:leadIntent?'志願服務｜隊長與運用單位':'志願服務｜計畫與備案',summary,steps,refs:[src,...(leadIntent&&assoc?[p]:[])],questionState:{focus:opts?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(opts?{choiceHeading:teamUnclear?'是哪一種志工隊？':'志願服務計畫跟章程目的相符嗎？',choices:opts.map(([label,key])=>({label,question:raw+'；志工分流確認：'+key+'。'}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedVolunteerPlanAndTeamLead=route;
})(typeof window==='object'?window:globalThis);
