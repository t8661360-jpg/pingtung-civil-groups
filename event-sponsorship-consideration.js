/* Separate negotiated sponsorship from donation and public solicitation. */
(function(root){
'use strict';
const ref=(title,source)=>({title,source,cat:'官方來源'});
const tax=ref('營業稅法第3、6條：貨物、勞務與有代價的非營利活動','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340080');
const price=ref('營業稅法施行細則第18條：交換之銷售額','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340081');
const mof=ref('財政部：機關團體銷售貨物或勞務的申報方式','https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=73f92e8eab38483b89f1facc6e724cd6');
const dm=ref('衛福部公益勸募法令彙編：衛部救字第1040101139號函','https://orgws.kcg.gov.tw/001/KcgOrgUploadFiles/273/relfile/67252/113763/ea055770-8d6f-47dd-9b8c-43969560ef3e.pdf');
const solicitation=ref('公益勸募條例第5至7、19條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050138');
const donate=ref('民法第406、412條：贈與與附負擔贈與','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001');
const account=ref('社會團體財務處理辦法第16、17、20條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050097');
const mark=ref('商標法第39條：註冊商標授權','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0070001&flno=39');
const data=ref('個人資料保護法第5、20、27條：目的與安全','https://www.pdpc.gov.tw/News_Html/100/');
const county=ref('屏東縣政府對民間團體補助經費作業要點（公告附件）','https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910');
const conflicts=ref('公職人員利益衝突迴避法第2、3、6、14條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0070008');
const food=ref('食品安全衛生管理法第15條','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040001');
const constit=ref('人民團體法第9、10條：許可籌組與核准立案','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091');
const choices=[['trade','有約定廣告、冠名或攤位'],['gift','只是主動捐贈，沒有交換'],['split','同時有贊助與公開募捐'],['unknown','還不確定有沒有約定回饋']];
function out(title,summary,steps,refs,state,extra={}){
 return {category:'活動贊助｜交易與捐贈',title,summary,steps,refs,notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{domain:'event-sponsorship',focus:'cross-event-sponsorship'},eventSponsorshipContext:state,...extra};
}
function route(q,previous){
 const t=String(q??'').normalize('NFKC').trim().replace(/\s+/g,'');
 const picked=t.match(/^櫃檯確認贊助類型:(trade|gift|split|unknown)$/)?.[1];
 if(picked&&!previous)return null;
 const body=t.replace(/(?:並?不是|不涉及|不屬於|並非)(?:協會(?:公益勸募)?|合作社|對外募款|公開勸募|公益勸募)/g,'');
 const funds=/贊助|捐[贈款助給]|物資|飲水|飲料|捐水|捐飲料|公司給|店家給|廠商給|給.{0,10}換|送.{0,10}換/.test(body);
 const context=/協會|社團法人|合作社|人民團體|社會團體|我們社團|籌備會/.test(body);
 const exposure=/廣告|背板|冠名|曝光|口播|攤位|展位|商標|宣傳|Logo/i.test(body);
 const neg=/沒(?:有)?(?:承諾|約定|換取|提供)(?:任何)?(?:廣告|曝光|宣傳|回饋|冠名)|完全無(?:對價|回饋)|只(?:是)?(?:捐贈|捐水)不(?:換|給)/.test(t);
 const correction=!!previous&&/^(?:剛剛說錯|更正|改成|不是這個)/.test(t)&&funds&&(neg||exposure);
 const follow=!!previous&&t.length<52&&/^(?:若|那|所以|如果|要是)/.test(t)&&(/廣告|冠名|捐款收據|物資交換|商標/.test(t))&&!/換題|另問|投票|會議通知|退費/.test(t);
 if(!picked&&!correction&&!follow&&(!funds||!context||!exposure&&!neg))return null;
 const trade=!neg&&exposure&&/換|交換|換取|要在.{0,12}印|條件|贊助.{0,15}要|指定.{0,8}(?:廣告|曝光|攤位)/.test(body);
 const voluntary=neg&&/主動|純粹|附條件|只用/.test(t);
 const publicAsk=/(?:同時|另外|還有|又要).{0,9}(?:公開|對外)(?:募集|募款|勸募)|一邊.{0,12}一邊.{0,8}募/.test(body)&&!/不(?:是|會|用)(?:另外|同時)?(?:公開|對外)(?:募集|募款)/.test(t);
 const keep=!!picked||follow;
 const org=keep?previous.org:/合作社/.test(body)?'coop':context?'association':previous?.org||'association';
 const f={org,kind:picked||(trade&&publicAsk?'split':trade?'trade':voluntary?'gift':follow?previous.kind:'unknown'),
  grant:(keep&&previous.grant)||/縣府補助|縣政府補助|知會補助|報.{0,4}核銷/.test(t),
  phone:(keep&&previous.phone)||/電話清單|聯繫名單|名冊交|個資|聯絡資料|名單/.test(t),
  related:(keep&&previous.related)||/親屬|自家人|關係人|親戚|配偶/.test(t),
  water:(keep&&previous.water)||/飲水|飲料|飲用水|食物|食品|礦泉水|食品衛生/.test(t),
  prepare:(keep&&previous.prepare)||/沒立案|尚未立案|還沒立案|准予籌組/.test(t)};
 const book=['帳務與憑證',org==='coop'?'交換雙方保留訂約、交付、品項、數量、估值依據及合適憑證；按合作社適用會計與稅務分類，不只記淨額。':'保留合約、款項、品項、數量、交付與合理時價依據；團體收支分開記，不先互抵。一般社會團體收入依財務規則管理，稅務憑證不以捐款收據替代。'];
 const extra=[];
 const refs=[];
 if(f.prepare){extra.push(['還在籌備','准予籌組不等於已立案。先別用已立案團體名義收款、簽贊助合約或開正式捐款憑證；已收的保留完整紀錄，向籌組主管機關查由誰處理。']);refs.push(constit);}
 if(f.grant){extra.push(['縣府補助','把補助和商業贊助分開列帳。廣告、場地是否可核銷，查本案核定函和核定科目，未獲確認不先列支，不重複核銷。']);refs.push(county);}
 if(f.related){extra.push(['有親屬或其他利害關係','先揭露關係，請無利害關係者評估價格與條件；有利害者不要參與審議、表決或核銷。若涉及法定公職人員或其關係人，再按身分、機關及補助／交易類型確認法定迴避與揭露。']);refs.push(conflicts);}
 if(f.phone){extra.push(['不直接提供參加者名單','報名電話不能因贊助承諾就交廠商行銷；無相符目的或其他合法依據時，不提供。能用統計人數就不要交可識別資料，勿在群組或聊天框貼原名單。']);refs.push(data);}
 if(f.water){extra.push(['飲水或食品','保留批次、數量和交付紀錄，查包裝、標示、保存及效期；逾期、破損或不明來源不要發。若限定活動使用，剩餘先依約或與提供者書面確認，不自行挪用。']);refs.push(food);}
 if(f.kind==='gift')return out('沒有換廣告：先分主動捐贈與公開募捐','若沒有回饋作為交換，只是公司主動給物資，限定活動使用不當然變成買賣。這和公開向不特定人募集不同，不要套用另一場的許可文號。',[
  ['主動受贈','保留用途、數量與收受日期。有適用公益勸募條例第6條的勸募團體基於公益被動接受，按該條及細則辦收據、徵信與備查；一般團體另外核對適用會計及受贈資格。不要承諾匿名即免全部依法報送，先問主管機關可公開欄位。'],['受贈紀錄','保留查核所需憑證並分開登記實物收受與使用；不要把收據用來掩蓋有對價交易。'],...extra],[donate,solicitation,...(org==='coop'?[]:[account]),...refs],f);
 const chosenSplit=f.kind==='split';
 if(f.kind==='trade'||chosenSplit)return out(chosenSplit?'分開處理有對價贊助和公開募捐':'用物資或現金換曝光：先按有對價贊助處理',
  '只要雙方約定以現金或物資換冠名、廣告或攤位，即使不收現金也可能是有對價的交易。不要把交換款或物資開成無償捐贈收據；另有公開向不特定民眾募捐時，再分案核對資格及許可。',[
   ['需要哪種憑證','約定的宣傳、攤位等可能屬銷售勞務，非營利也不因此一律免稅。若依法屬營業人之交換，細則第18條依換出或換入的時價從高認定。用條件、估值及收付資料，向所在地國稅局核對稅籍、發票或適用的其他憑證及申報，不能只看名目。'],
   ['曝光和商標','將使用者、版面、媒介、期限和停用寫清楚，向有權者取得同意，留存書面。一般未事先約定的單純致謝和約定交換不同。正式註冊商標授權未登記不得對抗第三人，不等於每次露出都須登記。'],
   book,...(chosenSplit?[['公開募捐另外辦','不同對象、收入及帳務分開，核對公益勸募條例第5至7條；不要拿另一案文號宣傳或收錢。']]:[]),...extra],[dm,tax,price,mof,mark,solicitation,...(org==='coop'?[]:[account]),...refs],f);
 return out('先確認給付有沒有換廣告或攤位','若給付換廣告，不能一律用捐款收據；若公司僅主動贈與，另依受贈規則。先不要對外承諾收據或交付民眾資料。',[book,...extra],[dm,donate,tax,solicitation,...refs],f,picked?{}:{choiceHeading:'店家給錢或物資，是不是為了換回實際好處？',choices:choices.map(([id,label])=>({label,question:'櫃檯確認贊助類型:'+id}))});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return}
root.verifiedEventSponsorshipConsideration=route;
})(typeof window!=='undefined'?window:globalThis);
