/* Separate youth volunteering, education credit, and employment safeguards. */
(function(root){
'use strict';
const ref=(title,source)=>({title,source,cat:'官方來源'});
const work=ref('勞動部：勞動基準法第44至48條','https://laws.mol.gov.tw/flaw/FLAWDAT0201.aspx?beginpos=5&id=FL014930');
const under=ref('勞動部：童工與未滿15歲工作保護','https://www.mol.gov.tw/1607/28162/28166/28256/28258/28260/30384/post');
const permits=ref('未滿15歲工作之無礙身心健康認定基準及審查辦法','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0030025');
const hazards=ref('職業安全衛生法第29條與未滿18歲危險工作認定標準','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0060032');
const insurance=ref('勞工職業災害保險及保護法第6條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0050031');
const volunteer=ref('志願服務法第3、9、10、12、16條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050131');
const record=ref('志願服務證及服務紀錄冊管理辦法','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050132');
const youth=ref('衛福部志願服務法釋義彙集（地方政府公開）','https://ws.hsinchu.gov.tw/001/Upload/8/relfile/8672/261496/763b8468-c873-4105-ae61-b794af7668c0.pdf');
const data=ref('個人資料保護法第5、8、19及20條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021');
const opts=[['vol','自願服務與志工意外保險'],['school','學校服務學習與時數認列'],['work','領時薪、固定排班的工作'],['data','參與者名冊與公開照片']];
function build(title,summary,steps,refs,state,more={}){
 return {category:'青少年參與｜志工與受僱',title,summary,steps,refs,notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{domain:'youth-participation',focus:'cross-youth-participation'},youthParticipationContext:state,...more};
}
function route(q,prev){
 const t=String(q??'').normalize('NFKC').trim().replace(/\s+/g,'');
 const picked=t.match(/^櫃檯確認青少年:(vol|school|work|data)$/)?.[1];
 if(picked&&!prev)return null;
 const cleaned=t.replace(/(?:並?不是|不算|不屬於|並非)(?:志工(?:工作|活動)?|無薪志工|打工|受僱|有薪工作)/g,'');
 const involve=/志工|志願服務|服務學習|公益服務|領時薪|有薪|打工|受僱|勞雇|僱用|聘.{0,10}(?:歲|學生)|排班/.test(cleaned);
 const minor=/1[0-7]歲|十[一二三四五六七]?歲|未成年|未滿(?:1[568]|十[五六八])歲|高中生|國中生|童工|青少年/.test(t);
 const org=/協會|人民團體|社團法人|合作社|社團|社區|學校合辦|高中合辦|學校服務學習|學生公益服務|我們/.test(cleaned);
 const follow=!!prev&&t.length<68&&/^(?:那|所以|如果|若|更正|剛剛說錯)/.test(t)&&/歲|家長|法定代理|車錢|便當|學校|時薪|照片|保險/.test(t)&&!/換題|另外一題|股金|會員大會|會費/.test(t);
 if(!picked&&!follow&&(!involve||!minor||!org||/選任|發起人|入會資格|會員資格/.test(cleaned)))return null;
 const keep=!!picked||follow;
 const has14=/14歲|十四歲|未滿(?:15|十五)歲|(?:14|十四)[、,]/.test(t)||keep&&!!prev?.has14;
 const has15=/15歲|十五歲|(?:15|十五)[、,]/.test(t)||keep&&!!prev?.has15;
 const older=/1[67]歲|十[六七]歲/.test(t)||keep&&!!prev?.older;
 const paid=/有薪|時薪|每小時.{0,8}薪|支薪|受僱|打工|僱用|勞雇/.test(cleaned);
 const vol=/志工|志願服務|自願服務|公益服務|無薪/.test(cleaned);
 const school=/服務學習|校方.{0,7}時數|學校.{0,7}(?:認列|認證)/.test(cleaned);
 const photos=/照片|名冊|名單|個資/.test(t)||keep&&!!prev?.photos;
 const context={has14,has15,older,photos,paid:paid||(keep&&!!prev?.paid),vol:vol||(keep&&!!prev?.vol),school:school||(keep&&!!prev?.school)};
 const choice=picked||(follow&&paid||paid&&!vol?'work':school&&!vol&&!paid?'school':vol&&!school&&!paid&&!photos?'vol':'mixed');
 const volunteerStep=['自願服務、家長與保障','真正自願且不以報酬為目的，先查志工計畫、適齡任務、訓練及督導。志願服務法沒有一律規定最低年齡，但未成年人要看理解能力、任務風險及學校或運用單位的規定；事前宜確認法定代理人同意並留存，不只靠口頭。運用單位要辦志工意外事故保險，依規定發服務證及紀錄冊。'];
 const expenses=['實際車費便當不是當然工資','志願服務運用單位必要時可依法補助交通及誤餐，照實留憑證。若是固定排班、受指揮且按時薪給付，應按實際關係處理，不得用補助或志工稱呼取代工資與雇主責任。'];
 const schoolStep=['學校是否認列由學校確認','先問學校學務單位是否承認活動、所需事前核准及證明。法定志願服務的紀錄與校內服務學習是不同用途，兩種時數不自動互抵，受僱工時也不要登成志工時數。'];
 const privacy=['照片與名冊另行處理','投保、緊急連絡、活動簽到只收必要欄位並限制查閱。參加同意不等於同意對外公開照片；公開前確認適用依據、範圍及學校與法定代理人程序。不要上傳未成年人的完整名冊、身分證、聯絡方式或可識別影像。'];
 const employment=['未滿18歲受僱文件與職災','雇主置備法定代理人同意書與年齡證明。按工資、實際工時、勞動契約與投保身分分別查；登記雇主依法為適用者辦職災保險，不能用志工意外險代替。'];
 const danger=['危險或有害工作不能排','未滿18歲不得排法定危險或有害工作，即使家長同意也不可以。搬運重物、操作機具等要先核對實際重量、設備和職安認定，不清楚先不要安排。'];
 const teen=['15歲至未滿16歲是童工','適用童工規定者，每日不超過8小時、每週不超過40小時、例假日不得工作，晚上8點至隔天早上6點不得工作。'];
 const olderStep=['已滿16歲不直接套童工夜工限制','已滿16未滿18不屬第44條定義的童工，不能僅用第48條斷定晚上9點一律禁止或一律可以；仍須依一般工時、職安及其他適用規定核對，先確保返家與工作安全。'];
 const young=['未滿15歲原則不得僱用','若不清楚，先不要安排14歲者領時薪工作。法律例外涉及已國中畢業或地方主管機關認定安全並許可；家長同意不能代替。未滿15有報酬但稱非勞雇也有準用規定，須向地方勞工主管核對。'];
 const workSteps=[...(has14?[young]:[]),employment,danger,...(has15||!older?[teen]:[]),...(older?[olderStep]:[])];
 if(choice==='work')return build('領時薪與排班不是志工：先核對年齡和工作內容',has14?'14歲原則不得僱用，先向所在地勞工主管問例外與事前許可，不要先排班。':'受指揮、固定排班且領時薪，應依實際受僱關係，不用志工保險或校方時數代替。',[...workSteps,schoolStep,privacy],[work,under,permits,hazards,insurance,data],context);
 if(choice==='vol')return build('青少年志工：先查適齡工作、同意及意外保險','家長同意之外，還要確認適齡、安全與運用單位的志工計畫、訓練、督導及意外保險。',[volunteerStep,expenses,schoolStep,privacy],[volunteer,record,youth,data],context);
 if(choice==='school')return build('學校認列和志工紀錄不能直接互抵','先問學務處認列條件，不必提供學生名冊。',[schoolStep,volunteerStep,expenses,privacy],[volunteer,record,data],context);
 if(choice==='data')return build('青少年資料：必要的投保名冊不等於公開照片','名冊、受僱文件及對外照片要分開管理；不要在聊天或公開群組張貼。',[privacy,schoolStep,...(context.paid?[employment]:[volunteerStep])],[data,work,volunteer],context);
 return build('青少年參與：把志工、校方時數和有薪工作分開','先把每位學生的實際任務、領不領時薪、年齡和校方要求分開。不能共用一份志工名冊涵蓋受僱者，也不要先安排未成年人做危險工作。',[...(context.paid?workSteps:[]),volunteerStep,expenses,schoolStep,privacy],[work,under,hazards,insurance,volunteer,record,youth,data],context,{choiceHeading:'您想先確認哪一類？',choices:opts.map(([id,label])=>({label,question:'櫃檯確認青少年:'+id}))});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return}
root.verifiedYouthVolunteerWorkTriage=route;
})(typeof window!=='undefined'?window:globalThis);
