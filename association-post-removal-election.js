(function(root){
'use strict';
const p={title:'人民團體法第17、22、23、54、58條：職務、解任與異動',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091'};
const e={title:'人民團體選舉罷免辦法第17、20、27、34、37、38條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050093'};
const o={title:'人民團體會務輔導辦法第9、18條：出缺及交接',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020094'};
const c={title:'合作社選舉罷免辦法第7、8、46條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050022'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>520||/^(?:另問|另外問|新題)|信用合作社|信合社|公會|工會|農會|漁會|基金會|公司|管委會/.test(t))return null;
 const pick=t.match(/;櫃檯確認卸任情況:(chair|director|order|unclear)$/)?.[1];
 const b=t.replace(/;櫃檯確認卸任情況:[a-z]+$/,'').replace(/(?:不是(?:要)?問|不是|並非)(?:一般)?(?:合作社|協會)(?=[而,、;。是])/g,'');
 const coop=/合作社/.test(b), recall=/罷免/.test(b), official=/撤免/.test(b);
 const resigned=/辭職|請辭|辭(?:掉|去|了)|辭理事長|口頭說不/.test(b);
 const reelection=/補選|再選|回選|參加選舉|可以選|改選|遞補|候補|同一任期|同任|代理|哪項職務|身分|資格/.test(b);
 const out=(title,summary,steps,refs)=>({direct:true,category:coop?'合作社｜離任後選舉':'協會｜理事長出缺及補選',title,summary,steps,refs,questionState:{focus:'cross-post-removal-election'}});
 if(coop&&reelection&&/(?:理事|監事|社員代表)/.test(b)&&(recall||resigned&&/送達|同一任期|同任|回選/.test(b))){
  if(resigned&&recall)return null;
  return recall?out('一般合作社被罷免，同一任期不能再當選原職','合作社選舉罷免辦法第46條明文禁止。同一任期內，社員代表、理事、監事及理事會／監事會主席遭罷免後，都不能再當選原職。',[
   ['別和一般協會混用','一般協會的罷免及出缺依人民團體法規，不能拿來取代一般合作社規定。也不要把罷免案否決視為罷免已生效。']
  ],[c]):out('一般合作社的書面辭職送達社址即生效','依合作社選舉罷免辦法第8條，書面辭職書送達合作社社址所在地即生效，不用套一般協會的監事會或理事會准辭決議。辭職生效後，同一任期內不得再當選原職。',[
   ['確認送達並辦交接、遞補','保留辭職書及送達紀錄，依法由候補依次遞補，查第7條的缺額規則；原任需完成交接並依規定報告。']
  ],[c]);
 }
 if(coop||!reelection||!(recall||official||pick)||!/協會|社團|理事長|理事身分.{0,20}職務/.test(b))return null;
 if(/打算罷免|如何罷免|要怎麼罷免|想罷免|罷免不通過|罷免(?:被)?否決|提案罷免/.test(b)&&!/(?:已|經|被|才|剛)(?:合法)?罷免(?!不)/.test(b))return null;
 const unsure=/不確定|不清楚|不知道|未確認|沒確認|先辨認/.test(b);
 const bothLost=/理事也辭|辭(?:掉|去).{0,3}理事(?!長)|(?:只|同時|一併|一起)罷免(?:了)?理事(?!長)|理事.{0,4}(?:也|一併|一起)(?:已)?(?:被罷免|解任|沒了|失去)/.test(b);
 const chairOnly=/(?:還|仍)在理事名冊|仍(?:然)?是理事|只罷免(?:了)?理事長|只撤免(?:了)?理事長/.test(b);
 const officialKnown=official&&/(?:處分.{0,12}撤免|主管機關.{0,8}撤免)/.test(b);
 const needsChoices=!pick&&unsure&&!chairOnly&&!bothLost&&!officialKnown;
 const scope=['先看是哪個職務出缺','核對原選舉方式、章程、決議或主管機關處分的主文與生效日期：被免掉理事長，不一定一起失去理事席或會員資格；理事身分已消失則須重新核對理事長資格。不要在這裡貼公文、名冊或個資。'];
 const schedule=['再按剩餘任期選補選或代理','依選罷辦法第17條，理事長出缺原則在一個月內補選；所遺任期不足六個月，才可在一個月內依章程或由常務理事互推一人代理，未設常務理事則由理事互推。章程採理事互選，就不能用口頭慣例直接改成會員大會直選或讓原任自動代理。'];
 const seats=['理事席確實出缺，先按名冊順序處理','依第17條由候補理事依次遞補；遞補後仍未達章程所定名額三分之二，應補選足額。已失理事身分者，依章程採理事互選就不能直接以理事資格參選或依理事身分代理。'];
 const files=['重核會議通知與代表資料','新任人選依章程和法定程序產生，不能拿原罷免會議或舊選票直接當補選。罷免會議依法不得由被罷免人擔任主席；補選另按適用的召集與主持規定辦理。依法保存紀錄與異動資料，核對人民團體法第54條報主管機關核備的30日要求；交接與銀行代表人及印鑑另按有效文件向原開戶機構確認，不以圖記在誰手上判定簽約或提款權。'];
 const plain=['只有罷免理事長且確實仍是理事','現行人民團體選舉罷免辦法未明訂一般協會經罷免者一律不得在同一任期再當選原職；但不等於本案當然可以。仍須查有效章程、在任理事資格、適用選舉方式及個別處分。若是辭職而非罷免，依第27條已生效的辭職有同一任期不得再當選同一職務的明文。'];
 if(needsChoices||pick==='unclear'){
  const a=out('先辨認是只去理事長、理事也出缺，還是主管機關撤免','仍有沒有理事資格會改變補選資格。先核對會議紀錄或處分主文，不憑紙本名冊或口頭說法猜。',[scope,schedule],[p,e]);
  if(pick)return a;
  return {...a,choiceHeading:'確認文件上寫的是哪一種？',choices:[['只罷免理事長，仍是理事','chair'],['理事職務也出缺','director'],['主管機關撤免','order'],['我不確定職務範圍','unclear']].map(([label,k])=>({label,question:String(q??'')+'；櫃檯確認卸任情況:'+k}))};
 }
 if(pick==='director'||!pick&&bothLost)return out('若理事身分已失去：先遞補席次，不能用原理事資格代理或競選','如果已不是理事，而有效章程要求理事互選理事長，不能沿用原理事資格代理或參選；不能只用一張舊選票換成直選。',[scope,seats,schedule,files],[p,e,o]);
 if(pick==='order'||!pick&&official)return out('主管機關撤免不等於協會內部罷免：依處分主文及資格判斷','先看撤免的是哪個職務、何時生效及是否另有限制，再決定遞補、補選或代理。不要用一般罷免或請辭條文代替個別處分。',[scope,seats,schedule,files],[p,e,o]);
 return out('罷免理事長後能否補選，要看是否仍有理事資格','一般協會的選罷辦法沒有明文禁止被罷免者一律在同任期再當選原職，但不代表他一定有補選資格。',[scope,plain,schedule,...(/銀行|帳戶|圖記|核備|會議|選票|章程/.test(b)?[files]:[])],[p,e,o]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationPostRemovalElection=route;
})(typeof window!=='undefined'?window:globalThis);
