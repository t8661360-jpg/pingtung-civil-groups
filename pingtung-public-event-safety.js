/* Venue agreement, road permissions, and event safety are independent. */
(function(root){
'use strict';
const ref=(title,source)=>({title,source,cat:'官方來源'});
const county=ref('消防署：屏東縣民間辦理大型群聚活動安全管理自治條例第3至5、8至9條','https://www.nfa.gov.tw/cht/index.php?act=article&article_id=5357&code=print&ids=909');
const national=ref('消防署：大型群聚活動安全管理作業指引','https://www.nfa.gov.tw/cht/index.php?article_id=13441&code=list&flag=detail&ids=23');
const roadLaw=ref('道路交通管理處罰條例第3、82條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040012');
const roadRules=ref('道路交通安全規則第142條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040013');
const building=ref('國土管理署：地方建築管理窗口','https://www.nlma.gov.tw/ch/titlelist/areanu/4884');
const opts=[['venue','只借場地或確認舞台、棚架'],['road','會使用道路或公共通行空間'],['crowd','查人數、活動類型和投保'],['change','已報備，要改地點或時間']];
function result(title,summary,steps,refs,state,extra={}){
 return {category:'活動安全｜場地、道路與報備',title,summary,steps,refs,notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{domain:'pingtung-public-event',focus:'cross-public-event'},pingtungEventContext:state,...extra};
}
function route(q,previous){
 const t=String(q??'').normalize('NFKC').trim().replace(/\s+/g,'');
 const picked=t.match(/^櫃檯確認活動安全:(venue|road|crowd|change)$/)?.[1];
 if(picked&&!previous)return null;
 const negativeRoad=/沒有(?:要)?封路|不(?:會|用|再)?封路|不用道路|不占道路|改回廣場|移回廣場/.test(t);
 const clean=t.replace(/沒有(?:要)?封路|不(?:會|用|再)?封路|不用道路|不占道路|不是室內場|不是縣府主辦/g,'');
 const event=/園遊會|成果展|活動|群聚|市集|展演|音樂會|演唱會/.test(clean);
 const place=/操場|公園|廣場|道路|縣道|校方|學校|場地|場館|戶外/.test(clean);
 const safety=/消防|舞[台臺]|棚架|臨時用電|發電機|避難|公共意外|群聚|動線|封路|占道|道路使用|報活動|活動核准|活動申請|報備|下雨|活動延期/.test(clean);
 const follow=!!previous&&t.length<80&&/^(?:所以|那|如果|若|還是|更正|已經)/.test(t)&&/保險|延期|改期|同意|場地|棚架|發電/.test(t)&&!/換題|另問|理事會|會員大會|股金|志工保險|勞工保險/.test(t);
 if(!picked&&!follow&&(!event||!place||!safety||/^換題.{0,5}(?:股金|理事會)|醫療保險|會員大會/.test(clean)))return null;
 const outside=!!(picked||follow?previous?.outside:/高雄|臺南|台南|臺東|台東|臺北|台北|花蓮|新北|嘉義|基隆|雲林|南投|苗栗|澎湖|金門/.test(clean)&&!/屏東/.test(clean));
 const road=!negativeRoad&&(/縣道|封路|占(?:道|用道路)|道路使用|改到.{0,8}道路|馬路/.test(clean)||!!((picked||follow)&&previous?.road));
 const large=/一千|千人|千二|1200|1,200|1000|1,000|兩千|二千|2000|2,000|三千|3000/.test(clean)||!!((picked||follow)&&previous?.large);
 const low=/八百|800|不到一千|未達一千/.test(clean)||!!((picked||follow)&&previous?.low);
 const extended=/[二兩三四五六七八九十23456789](?:個)?(?:小時|鐘頭)/.test(clean)||!!((picked||follow)&&previous?.extended);
 const moved=/改到|改去|移回|移到|換到|換場地|改場地/.test(t)||!!((picked||follow)&&previous?.moved);
 const weather=/下雨|天候|颱風|大雨|延期|改期/.test(t)||!!((picked||follow)&&previous?.weather);
 const state={outside,road,large,low,extended,moved,weather};
 const site=['場地同意不代替其他程序','先問學校、公園或廣場管理單位是否准搭設、何時可搭拆；舞台、看台、棚架、臨時用電和發電設備，請由合格人員核對結構與用電，以尺寸、圖說向所在地建築管理及場管確認是否另需申請。'];
 const street=['道路使用另問警察與道路主管','路段、攤位或交通管制應在活動前向轄區警察和道路主管機關確認許可及交通維持。沒有封路不一定代表未用道路，供公眾通行的廣場或通道也可能在道路定義內。不要自行設攤、封路或讓志工代替有權單位指揮交通。'];
 const scope=['先確認屏東條例適用與否','屏東自治條例第3條須同時看主管機關公告區域、預估聚集達1,000人且持續2小時以上、活動是否屬列舉類型或另有公告，也要看原設施用途等排除。這不是所有活動的人數門檻。領縣府補助不等於縣府主辦。'];
 const filing=['條例適用時怎麼報備','依第4、5條一般在活動開始日前60日，向屏東縣政府報備公共安全維護計畫；包含場地同意、公共意外責任保險證明、臨時搭建安全、醫療救護與緊急應變。公益等例外須經核定，不能自行略過。'];
 const safe=['主辦要做的安全工作','保留消防、救護與疏散動線，規劃容量、人流、接待與緊急通報；不要讓棚架、發電設備或攤位堵住通道。與場管和消防確認應變，遇不安全天候應延期或停止，不能只因借到場地就繼續。'];
 const vary=['已報備又要改動','依第8、9條不能自行變更。通常應於原定開始日前7日提出；天候等不可抗力無法如期舉辦，不受這個期限，但仍應聯繫承辦。變更地點、活動內容或增加人數，另依第4條報備，不以7日規定替代。'];
 const cover=['不封路也不等於免保險','條例適用要附公共意外責任保險證明。不適用該條例，仍須看場地契約、活動種類和補助或其他許可條件；改場或延期亦應向承辦與保險人確認保障範圍和期間。'];
 if(outside)return result('用活動所在地規定，不照搬屏東門檻','場地同意、道路使用、臨時搭建及保險是不同事項。活動若不在屏東，先問所在地縣市主管與場地管理單位，不直接套屏東時限。',[site,street,safe],[national,roadLaw,roadRules,building],state);
 if(picked==='venue')return result('先確認借場地與臨時搭建，不等於通過活動','場地核准不等於舞台棚架、用電或活動安全都核准。',[site,safe,...(large?[scope,filing]:[cover])],[building,county,national],state);
 if(picked==='road')return result('占用或使用道路，要另查交通許可','請用路段及時間聯繫轄區警察和道路主管；場地同意不能代替道路使用。',[street,safe,cover],[roadLaw,roadRules,county],state);
 if(picked==='change')return result('活動已報備要變更：先通知承辦','延期和改地點不是同一程序；先確認是改期、改地點、改內容，還是增加人數。',[vary,cover,...(road?[street]:[])],[county,roadLaw,national],state);
 if(picked==='crowd')return result('聚集人數不是唯一條件，保險另查','核對公告區域、活動類型、聚集人數和時間；再決定是否適用屏東大型群聚報備。',[scope,filing,cover,safe],[county,national],state);
 if(follow&&negativeRoad&&/保險/.test(t))return result('移回廣場或不封路，不表示免投保','道路使用與保險是兩件事；移回廣場後要依新地點、活動條件、場地約定及原安全計畫判斷。',[cover,street,...(moved?[vary]:[]),...(large?[scope]:[])],[county,roadLaw,national],state);
 const h=low&&!large?'若確認聚集未達1,000人，就不到屏東這個大型群聚定義的人數門檻；但舞台、用電、場地、通行與天候仍要查安全要求。':large&&extended?'人數和時間已達屏東條例所列兩項門檻，但還要核對公告區域、活動類型與排除情形，不能只拿場地同意。':'可以先問場地管理人，但場地同意不能取代臨時搭建、道路或活動安全程序。';
 const choices=!large&&!low&&!road?[{label:opts[0][1],question:'櫃檯確認活動安全:venue'},...opts.slice(1).map(([id,label])=>({label,question:'櫃檯確認活動安全:'+id}))]:[];
 return result('先分場地、道路、活動安全與保險',h,[site,...(road||negativeRoad?[street]:[]),scope,...(!low||large?[filing]:[]),safe,cover,...(moved||weather?[vary]:[])],[county,roadLaw,roadRules,national,building],state,choices.length?{choiceHeading:'您目前最想確認哪一項？',choices}:{});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return}
root.verifiedPingtungPublicEventSafety=route;
})(typeof window!=='undefined'?window:globalThis);
