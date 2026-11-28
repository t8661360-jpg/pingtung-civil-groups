(function(root){
'use strict';
const src=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const law=src('人民團體法第12、16、17、23、41條','D0050091');
const ele=src('人民團體選舉罷免辦法第5、25條','D0050093');
const letter={title:'內政部台內團字第1020342168號：參選理監事的入會年資','source':'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256699&sms=12360'};
const trade=src('商業團體法第16至18、20條','D0050100');
const tradeRules=src('商業團體法施行細則第45條','D0050101');
const clean=q=>String(q??'').normalize('NFKC').replace(/\s/g,'');
const noOrg=/(?:不是|並非)(?:在問|指|問)?(?:一般(?:社會團體|協會)|社區發展協會|協會|商業同業公會|工業同業公會|合作社)(?=[，,；;。]|$)/g;
const pending=/還沒(?:有)?(?:審|核准|正式|入會)|尚未(?:審|核准|正式|入會)|仍(?:在|待)審|還在審|只是(?:送|交|提出|繳)|只(?:送|交|繳)了?|沒(?:有)?正式(?:列為|成為)會員|申請還在等/;
const admitted=/正式入會|已(?:經)?(?:核准|通過|成為|是)(?:我)?(?:入會|加入|正式會員|會員)|入會已(?:經)?通過|已(?:經)?理事會通過|列(?:為)?會員|在(?:有效)?會員名冊上/;
const isAdmitted=s=>admitted.test(s.replace(/(?:沒有|沒|尚未|還沒|未)正式(?:入會|列為會員|成為會員)/g,''));
const changed=/^(?:更正|補充)[，,:：]/;
const follow=t=>changed.test(t)&&!/新題|另問|不是一般協會|不是協會|商業同業公會|工業同業公會|合作社/.test(t)&&/入會|會員|審查|沒審/.test(t)&&/只(?:是|問)|其實|原來|目前|還沒|尚未|已(?:經)?/.test(t)&&t.length<105;
const eligibility=/參選|候選|被選舉|選(?:理事|監事)|當(?:理事|監事)|不給(?:我)?登記|不讓.{0,4}登記/;
const tenure=/(?:入會|成為會員|會籍|會員資格|會員身分).{0,10}(?:滿(?:一|1)年|(?:年資|多久)|(?:八|十|8|10)個月)|(?:入會|成為會員)(?:要|需|須)?(?:一|1)年(?:才|方|始|以上|之後)|滿(?:一|1)年|入會年資|章程.{0,9}另訂年資/;
function route(q,held){
 const raw=String(q??'').trim(),s=clean(raw);
 if(!s||s.length>740)return null;
 const z=s.replace(noOrg,'');
 const correction=held&&follow(s)&&!eligibility.test(z);
 const scope=correction?clean(held).replace(noOrg,''):z;
 const assoc=/協會|社會團體|人民團體/.test(scope.replace(/社會團體那封函|社會團體的函/g,''));
 const guild=/商業(?:同業)?公會/.test(scope);
 if(!(assoc||guild)||assoc&&guild||/信用合作社|信合社|合作社|工業同業公會|工會|農會|漁會|基金會|管委會|選立委|選議員|政治獻金|黨團/.test(scope))return null;
 if(!correction&&(!eligibility.test(z)||!tenure.test(z)||!/會員|入會|會籍|年資/.test(z)||/(?:參選|選|當)理事長/.test(z)&&!/理事(?!長)|監事/.test(z)))return null;
 if(guild)return {direct:true,category:'商業同業公會｜會員代表及參選',title:'商業同業公會先核對正式會員代表資格，不能只套一般協會函釋',summary:'先看公司或行號是否已正式指派合格的會員代表，以及該代表在這次選舉是否具被選舉權。一般社會團體那封函不能直接代替商業團體法判斷。',steps:[
  ['公司是會員，實際參選要看它派出的代表','依商業團體法第16至18、20條，代表須為成年，且是公司或行號的負責人、經理人或現任職員，並不得有第17條的情形。合格代表有選舉權、被選舉權，理事、監事由會員代表互選。'],
  ['要求說明年資規則的法源和適用對象','施行細則第45條規定另依人民團體選舉罷免辦法辦理。請公會說明是公司入會年資、代表任職年資，還是章程的候選限制，以及所據法令與該次審定名冊；對適用有爭議時向主管機關核對，不從一句章程認定必然有效或無效。']
 ],refs:[trade,tradeRules,ele],questionState:{focus:'compound'}};
 const chosen=scope.match(/會員狀況確認:(已正式入會|還沒核准|不確定)(?=$|[。；;])/)?.[1];
 const t=correction?z:scope.split(/會員狀況確認:/)[0];
 const inquiry=/不知道|不確定|不清楚|已繳費.{0,9}(?:還沒拿到|沒收到)|有沒有.{0,8}(?:審過|核准|上名冊)/.test(t);
 const a=isAdmitted(t);
 const p=pending.test(t);
 const people=!correction&&a&&p?Array.from(t.matchAll(/([甲乙])(?:是|已|入會|還|只是|尚|都|有|先|只)[^甲乙]{1,100}/g),m=>[m[1],m[0]]):[];
 const memberLabel=people.find(([,s])=>isAdmitted(s)&&!pending.test(s))?.[0];
 const pendingLabel=people.find(([,s])=>pending.test(s)&&!isAdmitted(s))?.[0];
 const multi=memberLabel&&pendingLabel&&memberLabel!==pendingLabel;
 const state=chosen==='不確定'?'unknown':chosen==='已正式入會'?'member':chosen==='還沒核准'?'pending':multi?'both':inquiry||a&&p?'unknown':p?'pending':a?'member':'general';
 const missing=/名冊(?:上)?(?:漏|沒|不見)|漏列|漏我|未列名冊|沒有列(?:在|入)名冊/.test(t);
 const post=!correction&&/(?:結果|當選名單).{0,9}(?:宣布|公布|揭曉)|已(?:經)?開票|開完票/.test(t)&&!/(?:還沒|尚未|未)宣布|結果還沒/.test(t);
 const there=/在(?:現場|場).{0,6}(?:投票|出席)|(?:我|甲).{0,8}(?:有投票|有出席)|出席參加/.test(t)&&!/我(?:沒|未)(?:有)?出席/.test(t);
 const rule=['已正式入會，不能只因未滿一年就擋參選','人民團體法第16、17條保障會員或會員代表的選舉權和被選舉權。內政部就「入會滿一年才可參選理、監事」明確說明，不應在章程任意限制。仍要核對正式會員身分、個別依法適用的規定及有效章程；若援引第41條主張有另行核准規定，請出示主管機關核准的內容，不把一般章程備查當成任意加限制的依據。'];
 const inProcess=['只有申請或繳費，不等於已正式入會','向協會會務承辦或理事會詢問申請收件、依章程應走的審查程序、是否已有通過日期及會籍資料，必要時請協會書面回覆。已送件可先查進度，不用先重新填表；繳費、有收據或參加過活動本身，不足以認定已具有這次選舉權或被選舉權。'];
 const roll=['已入會卻漏列，請團體核對和更正名冊','依選罷辦法第5條，理事會應在會議15日前審定資格、造具名冊供會員閱覽；沒有選舉權或被選舉權應在名冊註記。請團體核對入會審查紀錄與本次名冊、書面查明漏列或限制理由，留存收件或送達證明。不要把完整名冊或聯絡資料貼到群組。'];
 const dispute=['結果宣布後，不要為了等紀錄或備查而錯過期限',(there?'您提到有人已出席參加選舉；':'若是出席參加選舉的會員或會員代表，')+'第25條允許在結果宣布之日起15日內，向該團體書面提出異議。團體自收件起另有15日查明並書面回覆。可列明拒絕登記、名冊或章程等問題及可合法提供的資料，請補記反映、保留原紀錄與送達證明。縣府尚未備查，不等於期限還沒開始；不要自行宣布無效或重選。仍有爭議得依法向法院提起訴訟。'];
 const summary=state==='both'?'分開看兩人：'+memberLabel+'已是正式會員，不能只因未滿一年就擋他參選；'+pendingLabel+'還沒審查，繳費不等於已取得選舉權及被選舉權。'+(post?'若是出席參加選舉的會員，可在結果宣布之日起15日內向協會書面反映。':''):
 state==='pending'?'您說申請尚未核准，先向協會會務承辦或理事會查收件、審查結果和名冊，不要只憑繳費就認定能投票或參選。':
 state==='unknown'?'先向協會核對是否已正式入會：只有繳費不能確定。若已具會員資格，也不能只用「未滿一年」任意擋參選。':
 post?'不能只因會員未滿一年就任意不讓登記。若已出席參加選舉，可在結果宣布之日起15日內向協會書面異議，不用等會議紀錄補記。':
 '一般協會不能單憑「入會未滿一年」就任意排除已正式入會的會員參選理事或監事。'+(missing?'請該團體先核對這次的選舉名冊及有無漏列。':'還要確認實際會員身分及其他依法適用的資格。');
 const steps=state==='pending'?[inProcess,...(correction?[]:[rule])]:state==='both'?[rule,inProcess,...(post?[dispute]:[]),roll]:state==='unknown'?[inProcess,rule,roll]:[rule,...(post?[dispute]:[]),...(missing||post||chosen==='已正式入會'?[roll]:[])];
 const opts=state==='unknown'&&!chosen;
 return {direct:true,category:'社會團體選舉｜入會年資與被選舉權',title:correction?'還沒收到入會審查結果，先向協會確認':'已入會與申請待審不同；不能只以未滿一年擋參選',summary,steps,refs:correction?[law]:[law,letter,ele],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},
  ...(opts?{choiceHeading:'這位申請人的會籍是哪種狀況？',choices:[['已正式入會，名冊可能漏列','已正式入會'],['只送件或繳費，還沒核准','還沒核准'],['不確定有沒有核准','不確定']].map(([label,key])=>({label,question:raw+'；會員狀況確認：'+key+'。'}))}:{}),...(!correction?{membershipQuestion:raw}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedCandidateMembershipTenure=route;
})(typeof window==='object'?window:globalThis);
