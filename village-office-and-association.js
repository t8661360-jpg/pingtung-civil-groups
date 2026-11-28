(function(root){
'use strict';
const ref=(name,pcode,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const el=n=>ref('公職人員選舉罷免法','D0020010',n);
const local=n=>ref('地方制度法','A0040003',n);
const admin=n=>ref('公務員服務法','S0020038',n);
const privacy=n=>ref('個人資料保護法','I0050021',n);
const cec={title:'屏東縣選舉委員會：村里長登記須知與書表',source:'https://web.cec.gov.tw/ptec/article/63564'};
const cecDay={title:'中央選舉委員會：投票日注意事項',source:'https://info.cec.gov.tw/vote2026/question/'};
const schedule={title:'屏東縣選舉委員會：115年村里長投票時間公告',source:'https://web.cec.gov.tw/api/file/e0db1834-e57d-4d53-ac7d-48fc0a1b48ab.pdf'};
const functions={title:'衛生福利部函釋彙編：社區發展協會與村里辦公處分工',source:'https://dep.mohw.gov.tw/DOSAASW/cp-552-4781-103.html'};
const moi={title:'內政部台內民字第0990053291號：村里長無給職的公務員服務法適用',source:'https://laws.gov.taipei/Law/Interpretation/Content/FE292692'};
const county={title:'屏東縣民間團體補助經費作業要點第5、8、10點',source:'https://portal.ptc.edu.tw/bulletin/attachment.php?a_sn=33872&b_sn=B114003910'};
const interest=ref('公職人員利益衝突迴避法','I0070008',2);
const village=/村(?:\(里\))?長|里長|村里長|村(?:里)?辦公處|里辦公處|村辦章|里辦章/;
const org=/協會|社會團體|社區發展|本會|團體活動/;
const political=/參選|候選|競選|助選|造勢|拜票|拉票|選上|當選|投票日|開票|報名選|登記(?:選|當|村|里)|選(?:村|里)長/;
const digital=/(?:line|line群|群組|貼文|轉傳|簡訊|社群|轉發|轉貼|發文)/i;
const contactData=/會籍.{0,7}(?:名單|資料)|會員.{0,8}(?:聯絡|電話|名單|名冊|手機|個資)|會籍.{0,9}聯絡|戶籍.{0,4}名冊/;
const norm=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const reg=['僅是一般協會理事長，不因登記參選村里長就必須先辭',
 '公職人員選舉罷免法第24、26、27條規範候選資格與禁止事由，沒有把社區發展協會或一般協會理事長這個職稱本身列為必須先辭的原因。還不是村長、只是準備參選，不必只為報名現在就辭職。是否能登記仍看年齡、選舉區等資格及其他禁止身分，並依該次選舉的登記須知向選委會確認。這和已經當選、正式就任後能不能兼任是兩回事。'];
const elecWorker=['公所選務人員的限制，不是辭理事長就能解除',
 '若您確實是鄉（鎮、市、區）公所辦理選舉事務的人員，公職人員選舉罷免法第27條第1項第4款列為不得登記之人員；各級選委會的委員、監察人員、職員和投開票所工作人員也在該款。先讓公所確認實際選務指派，由選委會確認候選資格與身分認定，不自行判斷撤換指派後就可補登記。'];
const transfer=['開票結果或當選證書，不等於已就職',
 '暫時的開票結果、選委會正式公告當選、發給當選證書、正式就職是不同階段。地方制度法第59條規定，一般依法選出的村里長應於上屆任期屆滿之日就職；不是開票領先、當選公告或領證就開始有新一任公務簽署權。尚未就職者不能以新任村里長身分簽公務文件；現任連任者，現有尚未終止的本屆職權另依原身分，個別就職安排以公所為準。'];
const hold=['只因是民選村里長，不直接套受薪公務員的兼職規定',
 '地方制度法第59、61條的民選村里長是無給職，事務費不是公務員俸給。公務員服務法第2條的適用範圍、內政部函釋，都不能推成只因當村里長就一律套用第15條申請同意；若本人另有受俸公職等職務，才另核該職務的兼職規定。有無其他限制、是否可先兼，還要看實際身分、協會章程與個案，不保證公所一定同意或一定不用確認。'];
const roles=['社區發展協會與村里辦公處，權限、簽名和補助帳目分開',
 '村里辦公處處理公務，社區發展協會是獨立立案團體。協會補助文件由協會依章程、合法授權與核定函以協會名義簽署、簽收並進協會帳戶，不用村辦公處名義替代，也不要改蓋村辦章。如果他已是協會依法有權的理事長，仍可依該案規定以協會理事長身分簽在負責人欄，不靠村里長資格。若您同時介入公務審核、查驗、決定或其他與同一協會有關的補助事項，不要同時代表兩邊或自行審核自己；先向原補助機關及公所政風／權責單位確認應否迴避和替代簽核程序。利益衝突迴避法有其適用身分，不是所有村里長一律套用全部條文。'];
const grant=['縣府活動補助不能挪作個人參選印刷或動員',
 '不要用核定的活動補助印個人競選文宣，也不要把個人競選動員或志工工作冒列成協會獲補助的成果。即使還沒登記、協會內部同意，或票已投完，也不改變核定用途。以屏東縣活動補助為例，核銷要依核定用途如實列支；未依補助用途或虛報，依通案第10點可能被追繳全部或一部並停止補助。請向原核定機關確認項目，不能只改名目。'];
const contacts=['協會會員的聯絡方式，不可逕拿來做選舉宣傳',
 '會員名冊、手機、會籍聯絡名單是為會務而收集時，依個資法第19、20條，使用須在原蒐集特定目的的必要範圍；無獨立合法依據，不得用來發競選簡訊、轉交給候選人或加入競選名單。即使取得合法利用的依據，也不能突破投票日禁止助選的規定。'];
function answer(q){
 const raw=String(q??'').trim(),t=norm(raw);
 const publicNotice=/政府|官方|選委會/.test(t)&&/投票.{0,8}(?:時間|地點|投票所)/.test(t)&&/今天|當天|投票日/.test(t)&&digital.test(t);
 if(!t||t.length>465||!org.test(t)||(!village.test(t)&&!publicNotice)||/(?:我不是|我們不是|不是要|並非要|不是在|不涉及)(?:在|要)?(?:參選|選|報名選)(?:村長|里長|村里長)|鄰長|區長候選|合作社|罷免提案/.test(t))return null;
 const type=t.match(/村里公職階段:(準備登記|當選未就職|已就任)/)?.[1];
 const campaign=political.test(t)||publicNotice;
 const worker=/公所.{0,18}(?:辦理|負責|承辦).{0,6}選(?:舉)?務|選務.{0,6}(?:人員|職員)|投開票所.{0,4}工作人員|投票所.{0,4}工作人員|選委會.{0,6}(?:職員|委員|監察人員)/.test(t);
 const voting=publicNotice||/投票日|投票當天|選舉當天|選舉日|開票當天|投票(?:結束|截止|所關|下班)後|投完票(?:之)?後|(?:今[天日]|當天).{0,12}(?:村里長|村長|里長)?.{0,6}(?:投票|開票)|(?:村里長|村長|里長).{0,5}(?:今天|今日).{0,4}投票/.test(t);
 const content=t.match(/投票日訊息確認:(只有中立資訊|有競選呼籲)/)?.[1];
 const positive=t.replace(/(?:沒有|不含|沒有要|並非)(?:呼籲|勸|請|要)?(?:支持|拉票|拜票|競選|助選|投給)[^，,。；;！!？?]{0,8}/g,'');
 const noPersuade=content==='只有中立資訊'||content!=='有競選呼籲'&&/中立|只(?:是|傳)?通知(?:投票|投票所)?|沒有(?:呼籲|拉票|支持)|不拉票|不(?:含|附|帶)(?:有)?候選(?:人)?資訊|只分享地點|只分享時間/.test(t)&&!/(?:叫|拜託|請|呼籲|替他).{0,10}(?:投給|支持|拉票)/.test(positive);
 const persuasive=content==='有競選呼籲'||/競選|助選|拉票|支持.{0,12}(?:理事長|候選|某)|號召.{0,12}投|參選文宣|拜票|投給/.test(positive);
 const askDigital=digital.test(t)||/文宣|印刷|傳.{0,4}群/.test(t);
 const hasGrant=/補助|活動款|核銷/.test(t);
 const spend=hasGrant&&/印|文宣|DM|宣傳|助選|拉票|志工.{0,10}(?:成果|動員)|動員.{0,8}志工/i.test(t)&&campaign;
 const hasData=contactData.test(t);
 const explicitAsked=/先.{0,6}(?:選|點)|是.{0,8}還是.{0,8}(?:任|就職)|要選哪/.test(t);
 const pre=type==='準備登記'||!type&&!explicitAsked&&/參選|候選|登記|報名選/.test(t)&&!/只問上任後|只問就任後/.test(t);
 const notYet=type==='當選未就職'||!type&&!explicitAsked&&/未(?:宣誓|就任|就職|上任)|還沒(?:有)?(?:正式)?(?:宣誓|就任|就職|上任)|尚未(?:宣誓|就任|就職|上任)|當選證書|開票結果/.test(t)&&!/還不是村長.{0,20}想登記/.test(t);
 const incumbent=type==='已就任'||!type&&!explicitAsked&&/(?:已|已經|正式)(?:經|宣誓)?(?:就任|就職|上任)|現任(?:的)?(?:村|里|村里)長|(?:現在|目前|本來)是.{0,8}(?:村|里|村里)長|在任(?:的)?(?:村|里)長/.test(t)&&!notYet;
 const role=/兼任|兩個(?:身分|角色)|雙重身分|要不要先辭|要先辭|先辭掉|辭去|簽收|簽(?:字|名|字|文件)|補助(?:文件|審核)|公務員服務法|無給|公所.{0,5}同意|村辦公處|里辦公處|上任.{0,6}兼|就任.{0,6}兼/.test(t);
 if(!campaign&&!role&&!worker)return null;
 if(/協會.{0,12}(?:內部|自己的)?理事長.{0,8}(?:落選|選舉|罷免|改選)/.test(t)&&!campaign&&!incumbent&&!type)return null;
 const steps=[],refs=[];
 const day=voting&&(askDigital||persuasive||noPersuade);
 if(day){
   const isLocal=/屏東/.test(t)||!/高雄|臺南|台南|臺北|台北|嘉義|臺東|台東|花蓮|新北|桃園|南投|新竹|臺中|台中/.test(t);
   const dayMention=/屏東/.test(t)&&/今天|11月28日|115年11月28日/.test(t);
   const isToday=(()=>{try{return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(new Date())==='2026-11-28';}catch{return false;}})();
   const time=dayMention&&isToday?'屏東115年11月28日公告投票時段為8:00至16:00；這不是助選禁令的起止時間。':'投票所關門或下午4點之後，仍是同一個投票日，禁令還在。';
   steps.push(!noPersuade&&!persuasive?['先看轉傳內容有沒有呼籲支持候選人','投票日整天不能競選或助選，下午4點後也不例外。若只轉傳官方時間或地點，沒有帶立場的文字或圖片，則與助選不同；不要只憑平台或群組的名稱判斷。']:noPersuade?['區分純中立資訊和實質拉票內容','公職人員選舉罷免法第56條第2款禁止整個投票日競選、助選。僅轉貼官方不帶立場的投票時間或地點與勸投某人不同；仍看實際訊息、圖片與上下文，有姓名或競選文宣時不要自行認定只是中立。資料限合法使用。']:
   ['投票日當天不能拉票，即使下午4點投完票也一樣',
    time+'依公職人員選舉罷免法第56條第2款，投票日整天不得競選或助選，包含用 LINE 群組、簡訊或社群轉傳支持特定候選人的呼籲。即使是支持協會理事長參選的貼文，也不因只傳給協會會員、不是本人寫文、沒有用補助款或已過投票時間就可以。若只是分享不含拉票的官方時間或地點，需與助選內容分開判斷。']);
   refs.push(el(56),cecDay,...(isLocal?[schedule]:[]));
 }
 if(worker){steps.push(elecWorker);refs.push(el(27),cec);}
 if(pre&&!worker){steps.push(reg);refs.push(el(24),el(26),el(27),cec);}
 if(notYet||pre&&/選上|當選.{0,6}(?:後|才)|上任/.test(t)){steps.push(transfer);refs.push(local(59));}
 if(incumbent||type==='已就任'||role&&!pre&&!day&&!notYet){steps.push(hold);refs.push(local(59),local(61),admin(2),admin(15),moi);}
 if(incumbent||notYet&&role||/簽收|簽.{0,4}(?:補助|文件)|村辦公處|里辦公處|村辦章|里辦章|補助.{0,5}審核/.test(t)){steps.push(roles);refs.push(functions,interest);}
 if(spend){steps.push(grant);refs.push(county);}
 if(hasData||day&&/會員.{0,8}(?:line|群)/i.test(t)){
   steps.push(hasData?contacts:['會員群組也不例外','只發到協會會員群組並不免除投票日的助選禁令；也不要為了拉票另取用原本供會務聯繫的會員名冊。']);refs.push(privacy(19),privacy(20));
 }
 let opts={};
 if(day&&!persuasive&&!noPersuade&&raw.length<=340)opts={choiceHeading:'這則訊息包含什麼內容？',choices:[['只有官方時間或地點','只有中立資訊'],['有呼籲支持候選人','有競選呼籲']].map(([label,code])=>({label,question:raw+'；投票日訊息確認：'+code+'。'}))};
 if(!type&&!day&&!worker&&!incumbent&&!notYet&&!spend&&(!pre||explicitAsked)&&role&&raw.length<=340){
   opts={choiceHeading:'您現在是哪一個階段？',choices:[['準備登記參選','準備登記'],['已當選、尚未就職','當選未就職'],['已就任村里長','已就任']].map(([label,code])=>({label,question:raw+'；村里公職階段：'+code+'。'}))};
 }
 if(!steps.length&&!opts.choices)return null;
 if(!day||spend||hasData)steps.push(['依問題找正確窗口：不同問題分別找誰確認？','候選人資格、登記與投票日競選規範找該次選舉的選委會；就任安排、公務職分與選務指派找公所；協會授權找章程與會務承辦；補助用途、簽收與迴避找原核定機關及適當政風或權責單位。']);
 const title=day?(!persuasive&&!noPersuade?'先分投票資訊與助選':noPersuade?'投票日的中立通知和助選要分開':'投票日整天不能助選，包括投票結束後轉傳LINE'):worker?'公所選務身分須先查，和協會理事長不同':notYet?'尚未就職，不能用新任村里長身分簽署':incumbent?'村里長與協會理事長是兩個身分':pre?'只因當協會理事長，不必先辭才能登記村里長':spend?'團體活動補助不能用做個人競選':'先分登記、已當選及已就職';
 const summary=day?(!persuasive&&!noPersuade?'請先選訊息是不是在呼籲投票支持某人。投票日即使關閉投票所，仍不得競選或助選。':noPersuade?'純中立資訊不是拉票，但請查實際內容與聯絡資料用途。':'只要仍是投票日，即使下午4點投票結束，也不能在 LINE 或其他群組轉傳拉票訊息。')+(spend?'縣府活動補助也不能拿去印個人競選文宣。':''):worker?'若實際是公所辦理選舉事務的人員，選罷法第27條限制候選登記；協會理事長職稱本身並非該限制。':notYet?'有開票結果、公告當選或證書都不是已就職；協會應依自己章程及核定函簽署，不能換用村辦公處名義。':pre?'協會理事長不是法定不得登記的職稱；當選後的兼任及用協會資源競選則是不同問題。':incumbent?'不要把民選無給職村里長等同受薪公務員；協會、公務及補助審核都要分開。':'登記資格、就職前的一般身分，以及就職後的公務權限與兼任，分開判斷。';
 return {direct:true,category:'協會與村里長｜參選、就職及公私分際',title,summary,steps,refs:[...new Map(refs.map(x=>[x.source,x])).values()],questionState:{focus:opts.choices?'clarify':'compound',domain:'village-association'},...opts};
}
if(typeof module!=='undefined'&&module.exports){module.exports=answer;return;}
root.verifiedVillageOfficeAndAssociation=answer;
})(typeof window!=='undefined'?window:globalThis);
