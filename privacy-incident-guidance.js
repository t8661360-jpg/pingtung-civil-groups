/* Verified public guidance only. Never collects or submits incident records. */
(function(root){
'use strict';
const law='https://www.pdpc.gov.tw/News_Html/100/';
const act='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021';
const sector='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020085';
const care='https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0070060';
const ref=(title,source)=>({title,cat:'官方法規來源',source});
const rows=[['group','人民團體（含社區發展協會）'],['coop','合作社或儲蓄互助社'],['care','私立長照機構'],['other','其他或尚不確定']];
const version='個資法第27條目前仍有效：持有個資檔案的非公務機關須採取適當安全措施。114年11月11日公布的第27條刪除、第20-1條新增，以及第12、48條修正，施行日尚未確定，不能當現行規定。';
const notice='依現行個資法第12條，違反個資法造成個資受侵害者，查明後要以適當方式通知受影響的資料當事人；通知本人和向主管機關通報是兩件事。';
const fine='第48條不是「發生外洩就一定罰」：主管機關要依查明事實判斷違反的義務及裁罰要件，不能直接使用尚未施行的罰則。';
const contain='先關掉公開分享或撤回錯寄，請對方停止轉傳；要求受託商協助查明。保護並留存必要的發現時間、流向、權限與存取紀錄，不要先銷毀證據。不要把名冊、截圖或身分資料貼到群組、公開回報或傳給小屏／其他聊天機器人。';
const plan='人民團體及合作社保有會（社）員個資達5,000筆，要訂安維計畫及會（社）務終止後的處理方法。未達門檻不代表免除一般安全義務。原本未達而後來達門檻，從達門檻日起六個月內報主管機關備查。';
const report='屬內政部人民團體／合作社辦法的事故，受影響達1,000筆（含正好1,000筆），自發現後72小時內，依附件格式書面通報主管機關。這是受影響筆數，不是平時保有筆數。筆數還不清楚時先控制事故、查清範圍並儘速請主管機關確認，不要等到時限過後。';
function result(title,summary,steps,refs,extra){return {category:'個人資料保護',title,summary,steps,refs,notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:'cross-privacy-incident',domain:'privacy-incident'},...extra}}
function route(q,previous){
 const raw=String(q||'').normalize('NFKC').trim();
 const match=raw.match(/^個資事故類型確認[:：](group|coop|care|other)$/);
 const t=raw.replace(/[,，\s]/g,'');
 const explicit=/個人資料保護法|個資法/.test(t);
 const article=/(?:第|§|、|及|與)(?:12|27|48|20(?:-1|條之1|之一))(?![0-9-])|(?:第)?(?:十二|二十七|四十八)條|第二十條之一/.test(t);
 const directCitation=explicit&&article&&!/施行細則|第\s*\d+[項款]/.test(t);
 const info=/個資|個人資料|名[冊單]|社員資料|會員資料|長照資料|電話資料/.test(t);
 const incident=/外洩|洩漏|被竊|誤寄|寄錯|寄給陌生人|誤傳|被.{0,8}下載|有人下載|個資事故|個資事件|誤.{0,12}(?:公開|傳到)|名冊.{0,12}(?:外流|外洩)/.test(t);
 const follow=!!previous&&t.length<=40&&/^(?:如果|那|所以|若|後來|查出|已查出|超過|恰好|正好)/.test(t)&&/筆|要通報|要通知|貼到群組/.test(t)&&!/換題|另外一題|投票|選舉|改選|開會/.test(t);
 if(!match&&!directCitation&&!(info&&incident)&&!follow)return null;
 if(directCitation&&!incident&&!follow){
     return result('個資法：查現行條文，不把未施行版本當成現行',version,[[ '通知當事人',notice],['裁罰須核對事實',fine]],[ref('個資保護委員會籌備處：現行與未施行條文對照',law),ref('全國法規資料庫：生效狀態',act)]);
 }
 const pos=t.replace(/(?:並?不是|不屬於)(?:一家|一般|長照法人|人民團體|社區發展協會|協會|合作社|儲蓄互助社|私立(?:長照|日照)(?:機構)?)?/g,'').replace(/(?:用|照|套)(?:同樣的)?人民團體(?:的)?(?:門檻|規定)/g,'');
 const careOrg=/私立.{0,6}(?:日照|長照|住宿)|日照機構|日照中心|住宿式(?:長照|機構)|綜合式.{0,8}長照/.test(pos);
 const groupOrg=/協會|人民團體|社會團體|社團/.test(pos);
 const coopOrg=/合作社|儲蓄互助社/.test(pos);
 const type=match?match[1]:follow?previous.type:careOrg&&!groupOrg&&!coopOrg?'care':groupOrg&&!coopOrg&&!careOrg?'group':coopOrg&&!groupOrg&&!careOrg?'coop':'other';
 const county=follow||match?!!previous?.county:/縣立案|縣府立案|縣政府立案|縣級|屏東縣府.{0,8}立案/.test(t);
 const pth=follow||match?!!previous?.pth:county&&/屏東/.test(t);
 const residential=follow||match?!!previous?.residential:/住宿式|夜間住宿|設有住宿/.test(pos)&&!/不住宿|無住宿|沒有住宿|純日照|只做日照/.test(t);
 const ctx={type,county,pth,residential};
 const main=[ref('個資法現行及未施行條文對照：第12、27、48條',law)];
 const basic=[['先止損、保留紀錄',contain],['誰要被通知',notice],['查生效狀態再判斷',version],['是否裁罰',fine]];
 if(type==='group'||type==='coop'){
   const where=county?(pth?'這是屏東縣立案團體，請向屏東縣政府通報，縣府收到後副知中央。':'這是縣（市）立案團體，請向立案縣（市）政府通報；如在屏東立案，就是屏東縣政府。縣（市）政府收到後副知中央。'):'縣（市）層級請通報該縣（市）政府；全國層級請核對中央主管機關，不確定先查立案或登記機關。';
   const knownFew=/(?:只有|不到|未滿)(?:八百|800|一千|1000)筆/.test(t);
   const knownAffected=/下載(?:約)?(?:一千兩百|一千二百|1200)筆|(?:受影響|外洩|洩漏)(?:約|共|了)?(?:一千兩百|一千二百|1200)筆/.test(t);
   const head=follow&&/(?:一千|1000)筆/.test(t)?'正好1,000筆也達門檻。':knownFew?'如果這次確定未達1,000筆，就不到本辦法的書面通報門檻；仍要止損、查明和依法通知。':knownAffected?'若查明這次受影響約1,200筆且已達1,000筆，即應通報，不要等名冊再流傳。':'';
   const summary=head+report+' '+where;
   return result('名冊外洩：先止損，依受影響筆數判斷通報',summary,[basic[0],basic[1],['安全維護計畫',plan],['外包仍要監督並留紀錄','委託處理不等於把責任交出去。依辦法第18、20條，保留管理、使用及應變相關紀錄並監督受託者；適用第18條的軌跡、證據及紀錄通常至少五年，法令或契約另有規定者從其規定。'],...basic.slice(2)],[...main,ref('內政部指定合作及人民團體類安全維護管理辦法：第2、4、8、18、20條',sector)],{privacyIncidentContext:ctx});
 }
 if(type==='care'){
   return result('長照名單外洩：先查許可類型，不套用人民團體門檻',residential?'私立住宿式長照機構，或設有住宿式服務的私立綜合式長照機構，依其安維計畫實施辦法第10條於發現後72小時內通報地方主管機關並副知中央。':'純日間照顧不能直接套用人民團體的1,000筆門檻；私立長照安維辦法的72小時規定限住宿式或設有住宿式的綜合機構。若不確定是哪一類，立即向許可主管機關確認適用規定，不要等待筆數查清才聯繫。',basic,[...main,ref('私立長期照顧服務機構安維計畫實施辦法：第2、10條',care)],{privacyIncidentContext:ctx});
 }
 return result('先控制外洩，再按組織類型確認通報規定','現在可以先停用分享、保留事證並通知內部負責人；不要等待網站判斷才處理。通知誰及要不要通報，應分別核對，通報門檻不能跨用。',basic,main,{privacyIncidentContext:ctx,...(match?{}:{choiceHeading:'哪一類組織持有這些資料？',choices:rows.map(([id,label])=>({label,question:'個資事故類型確認:'+id}))})});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return}
root.verifiedPrivacyIncidentGuidance=route;
})(typeof window!=='undefined'?window:globalThis);
