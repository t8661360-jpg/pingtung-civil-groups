(function(root){
'use strict';
const people={title:'人民團體法第6、12、27、54條：會址、章程及異動',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const meeting={title:'人民團體會務輔導辦法第8條：設置及異動會址',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno=8'};
const moi={title:'內政部會址說明：租約或會址使用同意書',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&_Query=a117da08-a09c-481e-bb5e-081f0e39df70&n=8361&page=1&sms=9015'};
const post={title:'中華郵政：郵政專用信箱租用及掛號領取',source:'https://www.post.gov.tw/post/internet/Q_localpost/index.jsp?ID=1444386621238'};
const court={title:'非訟事件法第85條：法人事務所遷移的變更登記',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010008&flno=85'};
const lawCorp={title:'民法第48、53條：社團法人登記事項及章程變更',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'};
const coopRules={title:'合作社法第9、9-1條：社址與章程登記',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'};
function route(q){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s+/g,'');
 if(!t||t.length>500||!/郵政(?:專用)?信箱|郵局(?:的)?(?:專用)?信箱|郵政箱號|郵局箱號|地址.{0,5}改成箱號/.test(t))return null;
 if(/信用合作社|信合社|公司.{0,7}(?:營業登記|地址遷移)|工商公會|工會|戶籍遷入|公寓大廈|基金會/.test(t.replace(/(?:不是|並非)公司.{0,4}地址/g,'')))return null;
 const coop=/一般合作社|普通合作社|合作社/.test(t)&&!/不是(?:一般)?合作社/.test(t);
 const both=coop&&/協會/.test(t)&&/(?:跟|和|與|比照)協會|協會.{0,9}(?:一樣|相同|不同|差別)/.test(t);
 const social=/協會|社團法人|社會團體|人民團體|社區發展協會/.test(t)&&!coop;
 if(!(social||coop||/會址|社址|在屏東.{0,8}立案/.test(t)))return null;
 if(!/會址|社址|登記地址|實際地址|辦公|聯絡|通訊|收信|收文|寄件|掛號|郵件|郵局.{0,9}公文/.test(t))return null;
 const marker=t.match(/郵政信箱用途確認:(只收信|正式遷址|查舊公文|尚不清楚)/)?.[1];
 const z=t.replace(/(?:不是|並非)(?:只|要)?(?:把)?(?:會址換成信箱|要搬會址|遷會址|變更會址|把會址改成信箱|改通訊資料|改通訊地址|改聯絡資料|改公司地址)/g,'');
 const kept=/會址.{0,9}(?:沒搬|不搬|沒變|不變|沒有搬|沒有改|不動)|正式會址.{0,10}(?:不變|仍在|還在)|(?:辦公地址|會所所在地|實際地址).{0,6}(?:沒變|不變|沒有改)|仍(?:然)?可以使用|房東讓.{0,6}繼續用|場地主同意繼續借/.test(z);
 const expired=/會址.{0,12}(?:到期|失效|不能繼續用|停用|歸還|要還)|(?:辦公地點|辦公室|租約|場地|現址).{0,10}(?:到期|不能繼續使用|失效|要歸還)|房東不讓.{0,8}(?:繼續用|使用)|找.{0,5}新的實際會址/.test(z);
 const substitute=/(?:會址|社址|登記地址|法院登記).{0,11}(?:改成|用|換成|填成|改寫成).{0,7}(?:郵政|郵局|箱號|信箱)|(?:郵政信箱|郵局信箱).{0,15}(?:取代|代替|當正式會址|當會址|作會址|當成會址)|沒有實體場所|只有(?:郵政|郵局)信箱/.test(z);
 const future=/下個月.{0,13}遷|將來.{0,10}(?:遷|換)|可能.{0,9}(?:搬|遷)|之後.{0,8}(?:會搬|會遷)/.test(z);
 const contact=/只(?:是)?(?:用來|想|用|當|作|改).{0,12}(?:聯絡|通訊|收|信箱)|收政府|收公所|另(?:外)?租|只是郵局.{0,8}信箱|另(?:列|寄)|單純收信|(?:想|要|打算|準備|用).{0,6}(?:郵政|郵局)(?:專用)?信箱.{0,5}(?:收信|收件|收文)/.test(z);
 const official=/公文|補件|掛號|期限|政府通知|正式送達|漏收|公所.{0,6}寄/.test(z);
 const corporation=/已(?:到法院|辦法人|經法院)|法院登記|社團法人/.test(z);
 const charter=/章程/.test(z);
 const grant=/補助|核銷|核定函/.test(z);
 const bank=/銀行|帳戶/.test(z);
 const personal=/個人.{0,8}(?:名下|租用|信箱)|信箱.{0,16}個人名下|信箱.{0,12}他名下/.test(z);
 const s=marker==='只收信'?'contact':marker==='正式遷址'?'move':marker==='查舊公文'?'mail':marker?'unknown':expired?'move':kept||contact?'contact':substitute?'move':'unknown';
 const name=coop?'一般合作社':/社區發展協會/.test(z)?'社區發展協會':'協會';
 const contactMsg=coop?'社址沒有變，只加郵政信箱收信，不把信箱當新社址；先向原登記主管機關與寄件機關確認可否另留通訊欄位。':'正式會址沒搬，只新增郵政信箱是收信方式改變，不當成正式遷址，不因此改章程或申報第二會址。請先問原立案承辦可否另外登錄通訊地址，也通知仍寄到舊聯絡地址的機關。';
 const documents=coop?'合作社法第9、9-1條規定社址是登記及章程事項。正式社址變更應在一個月內辦理變更登記，修改章程要經社員大會決議，決議後一個月內檢具紀錄等向原主管機關登記。只加郵政信箱仍是聯絡欄位，各機關可接受的資訊另查。':
  '先取得確實能作為會址的場所及使用權資料，例如租約或所有人簽章的會址使用同意書，不一定非簽租約。借場地開會或口頭允許收文，不等於同意長期設立會址。依會務輔導辦法第8條，理事會決議通過後，連同會議紀錄及證明向原立案主管機關備查；若要設到主管機關所在地區之外，先核對人民團體法第6條的核准要求。';
 const boxOnly='郵政信箱可作收件管道，不等於取得可使用的實際會址，也不要先用箱號代替正式會址。屏東是否接受特定情形的箱號作正式會址，未核實明文或個案決定，先向原主管機關確認；如果原場所期限已到，先找有合法使用權的實際場所。';
 const postal=(official?'普通信依郵局規定投放，掛號、快捷等通常放通知單再依規定領取。舊公文可能已寄出時，先查原寄件機關、郵局或舊址的通知，核對送達及回覆期限，不能只換聯絡資料就當期限重算。':'郵政信箱用來收信，不代替實際會址；領取掛號要依郵局規定辦理。')+(personal?'信箱由新任個人租用，團體不見得能用同一人名義領所有公文；先核對受送達人、租用人和郵局要求，不把個人箱號視為已改法人收件地址。':'');
 const legal=coop?'一般合作社向自己登記的主管機關辦社址變更，不照搬協會的縣府備查及法院法人變更流程。':
  (charter?'章程若寫的是完整門牌，真的搬家而需改章程，另依適用的會員（代表）大會修章程序；一般人民團體章程異動依第54條在30日內報核備。若章程只載區域而該部分沒變，不把每次調整都當成必須修章。':'真搬家才看章程是否也變動，聯絡資料不等於章程。')+
  (corporation?'已辦社團法人登記、真實遷移法院登記的事務所時，另依非訟事件法第85條由董事向法院登記處聲請變更，備證明；章程變更的門檻也須核對法人適用規定。只變更郵件聯絡方式不等於法人事務所遷移。':'如已辦法院法人登記，另查是否有法院事務所登記事項異動。');
 const steps=[];
 if(both)steps.push(['合作社與協會的郵政信箱用途相同，遷址程序不同','兩者保持原社址／會址時，都可先把郵政信箱作為另行收信的管道，向原收件機關確認可否更新通訊欄位。一般合作社的社址與章程變更依合作社法第9、9-1條登記；協會正式會址異動則依會務輔導辦法第8條經理事會決議報備查，章程有變再另外辦。郵政信箱不自動取代各自的正式地址。']);
 if(expired||substitute||future||s==='move'||s==='unknown')steps.push(['正式會址與郵政信箱，不是同一欄',boxOnly]);
 if(s==='contact'||s==='mail'||s==='unknown'||kept)steps.push(['沒有搬會址，先處理通訊資料',contactMsg]);
 if(s==='move'||future||expired||substitute){steps.push(['真的要搬，先證明場地能當會址，再辦遷址',documents]);steps.push(['核對章程、主管機關與法院登記',legal]);}
 steps.push(['普通信、掛號與原本待領公文，分開確認',postal]);
 if(grant||bank)steps.push(['補助或銀行已有地址資料，另行核對',(grant?'補助表件若問立案會址，填實際核定登記的會址；若另設通訊欄，依原補助機關確認可否用郵政信箱。已寄出的補件或核銷通知先查實際期限。':'')+(bank?'銀行也分開詢問通訊地址與團體證件資料；真遷址時按銀行要求更新，不先把箱號填成法定會址。':'')]);
 const summary=s==='contact'?contactMsg+(future?'若日後真的搬，再按正式遷址程序。':''):s==='move'?boxOnly:s==='mail'?'先查已寄出的公文，不把改用郵政信箱當成會址已遷移，也不當成原期限重算。':'先把實際會址和收信方式分開：只是多一個郵政信箱，不等於改正式地址；原場地不能用，就先確認新會址使用權。';
 const opts=!marker&&s==='unknown'&&raw.length<300;
 return {direct:true,category:name+'｜郵政信箱、通訊與正式地址',title:both?'一般合作社與協會：分開看郵政信箱和正式地址':name+'：郵政信箱收信和正式會址要分開',summary,steps,refs:[post,...(coop?[coopRules,...(both?[meeting]:[])]:[people,meeting,moi]),...(corporation&&!coop?[court,lawCorp]:[])],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:opts?'clarify':'compound'},...(opts?{choiceHeading:'您目前主要是哪一種情況？',choices:[['會址沒搬，只用信箱收信','只收信'],['要更換正式會址或社址','正式遷址'],['先查已寄出的舊公文','查舊公文'],['還不確定','尚不清楚']].map(([label,key])=>({label,question:raw+'；郵政信箱用途確認：'+key+'。'}))}:{})};
}
if(typeof module==='object'&&module.exports)module.exports=route;
else root.verifiedAssociationPostalBoxAndSeat=route;
})(typeof window==='object'?window:globalThis);
