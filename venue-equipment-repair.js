(function(root){
'use strict';
const law=(n,p)=>({title:n,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const civil=law('民法第429、430、437、464、467、468條','B0000001');
const budget={title:'屏東縣政府對民間團體補助經費作業要點第8、8之一、10點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const fire={title:'內政部消防署：用電安全及插頭不潮濕污損',source:'https://www.moi.gov.tw/News_Content.aspx?n=2&s=323523'};
const publicExample={title:'屏東縣枋山鄉鄉有活動中心管理自治條例（僅枋山鄉例）',source:'https://www.puli.gov.tw/attachment/33375_%E5%B1%8F%E6%9D%B1%E7%B8%A3%E6%9E%8B%E5%B1%B1%E9%84%89%E9%84%89%E6%9C%89%E6%B4%BB%E5%8B%95%E4%B8%AD%E5%BF%83%E7%AE%A1%E7%90%86%E8%87%AA%E6%B2%BB%E6%A2%9D.pdf'};
const equip=/冷氣|空調|器材|設備|插座|電器|風扇|消防設施|照明/;
const broken=/壞|不冷|不會動|故障|停機|漏水|漏電|維修|修理|修繕|報修|請修|叫修|誰.{0,3}修|請人修|要修|修不修|保固|修好/;
const venue=/活動中心|會館|場館|場地|公所|社區協會|發展協會|私人屋主|房東|租賃|租屋|向縣府借|用補助/;
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const modes={public:['公有場館原有設備','公有場館原有設備'],borrowed:['向公所或其他團體借的設備','借來的設備'],own:['協會自己買或用補助買','協會自己買的設備'],rent:['私人出租、房東的設備','私人租屋的房東設備']};
function parse(q,prev){
 const full=norm(q);if(!full||full.length>550)return null;
 const fresh=/^新題[:：]?/.test(full), raw=full.replace(/^新題[:：]?/,'');
 const t=raw.replace(/(?:不是|並非|不屬)(?:原來的)?(?:公所的|屋主的|房東的|合作社的|協會的|公有的)/g,'');
 if(/我家|自己家|自家|解散|清算|捐回|退會|退費|土地移轉|保管責任|誰.{0,4}(?:負責)?保管|竊盜|走私/.test(t))return null;
 const pick=Object.keys(modes).find(k=>raw==='確認設備來源:'+modes[k][1]);
 const uncertain=/不(?:知道|確定|清楚).{0,20}(?:誰的|公所|借來|自己買|屋主|房東|權屬)/.test(t);
 const follow=!!prev&&!fresh&&(pick||/^(?:更正|補充|其實|不是|現在|剛才|剛剛|這次)/.test(raw)&&(equip.test(t)||venue.test(t)||broken.test(t)));
 const p=follow?prev:{};
 if(!follow&&!(equip.test(t)&&broken.test(t)&&(venue.test(t)||/冷氣不冷了.{0,5}找誰/.test(t))))return null;
 const lease=/私人.{0,8}(?:租|房東|屋主)|房東|出租人|屋主|租屋契約|協會租(?:的|來|用).{0,3}(?:會館|場館)|私租/.test(t);
 const pub=/公有|公所.{0,10}(?:管|活動中心|場館)|公所的活動中心|鄉鎮市公所|公所財產|公所活動中心/.test(t)&&!lease;
 const lend=/(?:冷氣|空調|設備|器材).{0,12}(?:出借|借放|借來|借用)|(?:出借|借放|借來的|借用的)(?:此台|這台|一台|一臺|的)?(?:冷氣|空調|設備|器材)|(?:公所|其他團體|另一團體).{0,10}(?:出借|借放)/.test(t);
 const own=/(?:協會|自己|自有|補助|核定經費).{0,9}(?:買|購置|購買)|自購|財產卡.{0,6}列管/.test(t);
 const landlord=/(?:房東|屋主|出租人).{0,5}(?:的|配備|所有)|(?:冷氣|設備).{0,6}(?:是|屬)(?:房東|屋主|出租人)|房東設備/.test(t);
 const publicEquip=/公所財產|(?:冷氣|空調|設備|器材).{0,9}(?:公所的|公所所有|公有財產)|(?:公所原有|公有場館原有)(?:冷氣|設備|器材)/.test(t);
 const owner=pick||(uncertain?null:lend?'borrowed':landlord?'rent':publicEquip?'public':own?'own':p.owner||null);
 const replaced=!pick&&p.owner&&owner&&p.owner!==owner;
 const keep=(v,k)=>!!(v||p[k]);
 const noGrant=/(?:沒有|不涉及|並無|未使用|不用|沒(?:有)?)(?:縣府|政府)?補助/.test(t);
 return {owner,lease:keep(lease,'lease'),publicVenue:lease?false:keep(pub,'publicVenue'),delegate:!lease&&keep(/代管|委管|委託管理|委託契約/.test(t),'delegate'),
  hazard:keep(/漏電|觸電|電線走火|冒煙|火花|漏水.{0,18}(?:插座|插電|電源|電線)|(?:插座|插電|電源|電線).{0,15}(?:漏水|潮濕)/.test(t),'hazard'),
  upcoming:keep(/明天|下週|共餐|改場地|換場地|要不要取消|活動.{0,8}(?:辦|照常|移)|開課|一堂課/.test(t),'upcoming'),
  grant:!noGrant&&( /補助|核銷|核定經費/.test(t)||!replaced&&p.grant ),
  fees:keep(/費用|誰出|扣租|從房租扣|先墊|場地費|冷氣使用費|租金/.test(t),'fees'),
  warranty:keep(/保固|過保|保修期/.test(t),'warranty'),replace:keep(/報廢|換新|買新|買新的|更換/.test(t),'replace')};
}
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 const steps=[],refs=[];
 const add=(h,b)=>steps.push([h,b]);
 const base=(title,summary,opts)=>({direct:true,category:'活動中心設備｜報修與費用',title,summary,steps,refs,venueRepairContext:s,questionState:{focus:opts?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(opts?{choiceHeading:'這台設備是哪一種來源？',choices:opts}:{})});
 if(s.hazard){
   refs.push(fire);
   add('漏水靠近插座或懷疑漏電，安全排第一','立即停止使用、請人遠離，通知場館管理員及有資格的維修人員。不要碰潮濕的插座、插頭或設備，不自行拆機；若已冒煙、起火或有人觸電，立即到安全處打119。');
 }
 add('先通報，再看設備是誰的','向目前的場館管理員說明哪個空間、何時發生、症狀及下一場使用時間。從安全的位置保留照片和報修紀錄，用財產卡、租借單或契約找所有人與有權叫修的人。請修、付費和事後核銷是三件事。');
 if(s.owner==='public'||s.publicVenue){
   refs.push(publicExample);
   add('公所場館：先找管理公所或場館指定窗口','若是公所的設備，先請公所或委管窗口確認報修及費用。'+(s.delegate?'協會代管不等於擁有冷氣或必須負擔所有維修；按委管契約區分日常維護與大修、換新，並核對財產清冊及故障原因。':'只借一個時段，不因使用就要包修；場地費或冷氣使用費也不一定包含維修。')+'各活動中心規則可能不同，請看這個場館的使用單，不自行叫廠商或先答應賠費。');
 }
 if(s.owner==='borrowed'){
   refs.push(civil);
   add('設備是借來的：通知原出借方，別當自有','按借用單和設備清冊，同時告知場地管理人及原出借方（例如公所、另一團體）。正常使用耗損、保管不當或人為損壞要分開釐清。未經同意不要更換、報廢或自行向借用者收費。');
 }
 if(s.owner==='own'||s.warranty){
   add('有保固先報修，不直接報廢或購置','核對保固期間、原廠／廠商、設備清冊與財產是否列管，先由有權人要求原廠檢查、估價、留存工單。過保不代表必須換新；若設備不能安全修復，再依所有者的財產及原核定程序確認替換、移轉或報廢。');
 }
 if(s.lease||s.owner==='rent'){
   if(!refs.includes(civil))refs.push(civil);
   add('私租先通知房東，租賃物與另借設備要分開',s.owner==='borrowed'?'場館由房東管理，冷氣若是另向公所或他人借來，不能當成房東設備。先一起通知房東及出借方，分別查場館電路／使用安全和冷氣維修責任；不要擅修或從租金扣款。':'若冷氣是租賃物或租約約定的配備，民法第429條原則由出租人修繕，契約另訂或另有習慣者除外。先按第437條通知出租人並保存紀錄；若確定應由出租人修繕，依第430條給相當期限催告，屆期仍不修，才檢視自行修繕並請求償還費用或扣租等法定選項。沒看到契約，就別以口頭轉述推定可先墊或扣租。');
 }
 if(s.grant){
   refs.push(budget);
   add('修繕費能否報補助，要先看原核定','原本核定購買冷氣，不表示保養、維修、替換或改場地也都可用同筆錢。把故障單、保固、估價及核定函向原補助承辦確認是否屬核定用途及是否需先同意變更。不要拿補助餘款先墊；也不把場地費收據當維修憑證。');
 }
 if(s.upcoming)add('活動能否照辦，先等場館確認安全','由場館管理人確認故障區域可否安全隔離、是否有可用的替代空間。若不能在活動前確認安全，就改場地、延期或暫停，通知已報名者；如涉及核定補助場所或計畫變更，另和原承辦確認，不在原場勉強辦。');
 const summary=s.hazard?'漏水靠近用電設備，先停用並讓人遠離，不要碰插座。再通知場地管理人和設備所有人。':'先聯絡場館管理人報修。誰能叫修、誰付費，要看設備所有權、借用或租約及保固，不因協會在場或代管就一定要出錢。';
 if(!s.owner)return base('活動中心設備故障，先報修再查權屬',summary,Object.values(modes).map(([label,val])=>({label,question:'確認設備來源:'+val})));
 return base(s.owner==='public'?'公有場館或設備故障：先通報公所或委管窗口':s.owner==='borrowed'?'借來的設備故障：先通知出借方和場館':s.owner==='rent'?'房東提供的設備故障：先通知出租人並核對租約':'協會設備故障：先查保固、列管與原核定',summary);
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedVenueEquipmentRepair=route;
})(typeof window==='object'?window:globalThis);
