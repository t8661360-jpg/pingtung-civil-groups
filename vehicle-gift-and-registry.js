(function(root){
'use strict';
const law=(title,p)=>({title,source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode='+p});
const registry=law('道路交通安全規則第15、16、22條','K0040013');
const finance=law('社會團體財務處理辦法第4、5、8、12、20條','D0050097');
const people=law('人民團體法第11條：立案及法人登記','D0050091');
const roads={title:'交通部公路局：機車過戶',source:'https://www.thb.gov.tw/cp.aspx?Create=1&n=526'};
const motor={title:'交通部公路局：監理服務網（考照、車籍及監理所站）',source:'https://www.mvdis.gov.tw/'};
const moi={title:'內政部常見問答：社團法人開立捐物證明',source:'https://www.moi.gov.tw/News_toggle3.aspx?PageSize=30&n=174&page=64&sms=9015'};
const county={title:'屏東縣政府對民間團體補助經費作業要點第8點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const norm=s=>String(s??'').normalize('NFKC').replace(/\s/g,'');
const vehicle=/機車|摩托車|摩托|車子|車輛|(?:一台|一臺|一輛|贈|捐|收|送|舊|這)車|汽車|車籍|車主|行照|行車執照/;
const org=/協會|社區發展|社區協會|社會團體|人民團體|社團法人|公益團體/;
const gift=/捐(?:贈|來|物|車|收據|的|給)|捐|贈送|受贈|留給(?:我們|協會)|送給(?:協會|團體|我們)|贈與/;
const transfer=/過戶|換名|換.{0,4}(?:名字|行照|行車執照)|登記.{0,9}(?:名下|名義|個人|協會|團體)|(?:理事長|協會|團體|個人).{0,9}(?:名下|名義|名字)|車籍|名下|轉名/;
const books=/入帳|登帳|列財產|記入財產|列(?:入)?帳|財產登記|財產目錄|列冊|登錄財產|收據|捐贈證明/;
const roles={g:'協會實際受贈車輛',r:'個人租用或借用的車',t:'個人車籍異動或駕照'};
function parse(q,prior){
 const full=norm(q);if(!full||full.length>580)return null;
 const fresh=/^新題[:：]?/.test(full), raw=full.replace(/^新題[:：]?/,'');
 const rawPersonal=/(?:我|個人|自己).{0,14}(?:租的|租來|租用|駕照|考照|自己的|車行租)|不是(?:送給|贈送給|捐給|捐贈給|給)?(?:一般)?協會.{0,16}(?:個人|自己|車行|租)/.test(raw);
 const t=raw.replace(/(?:不是|並非|不問|不談|不涉及)(?:送給|贈送給|捐給|捐贈給|給)?(?:一般)?(?:協會(?:的)?|社團法人|捐贈|補助|我要考照)|(?:不是|不要|不想)(?:去|要)?考照/g,'');
 if(/地政|土地|不動產|房子|房屋|報廢回收|電動自行車|微型電動二輪車|腳踏車|交通違規申訴|信用合作社|合作社|工業同業公會|商業同業公會|工會/.test(t))return null;
 const pick=Object.keys(roles).find(k=>raw==='確認車輛問題:'+roles[k]);
 const follow=!!prior&&!fresh&&(pick||/^(?:更正|補充|其實|確認|不是|剛才|剛剛|那|這台)/.test(raw)&&(vehicle.test(t)||org.test(t)||transfer.test(t)||books.test(t)));
 const p=follow?prior:{};
 const hasOrg=org.test(t)||/團體想|登在理事長|團體名義/.test(t);
 const donation=gift.test(t)||books.test(t)&&/要捐|送給|給我們/.test(t);
 const driving=/考(?:駕照|照)|駕照.{0,4}(?:考|領|換)|駕駛執照|怎麼考/.test(t);
 const rental=/車行租|租(?:用|來|的)(?:一台|一臺|一輛|的)?(?:機車|車子|車輛)|租賃(?:機車|車輛)|租車|租用.*行照/.test(t);
 const personal=rawPersonal&&!hasOrg||/(?:自己的|本人|我自己|個人的).{0,8}(?:機車|車輛|車籍)/.test(t)&&!donation;
 if(!follow&&!(vehicle.test(t)&&(transfer.test(t)||driving||rental&&/換|辦|怎麼/.test(t)||books.test(t)||donation||hasOrg&&/收下|怎麼辦|可先用/.test(t))))return null;
 if(!follow&&!donation&&hasOrg&&!transfer.test(t)&&!driving&&!rental&&/補助.{0,10}(?:買|購)/.test(t))return null;
 const explicit=pick||(personal?(rental?'r':'t'):hasOrg&&(donation||transfer.test(t)||books.test(t))?'g':driving?'t':rental?'r':null);
 const mode=explicit||p.mode||null;
 const changed=!pick&&!!p.mode&&!!explicit&&explicit!==p.mode;
 const yes=/法院登記|已(?:經)?(?:完成|辦理|辦)?(?:社團)?法人登記|社團法人/.test(t);
 const no=/不是社團法人|不是法人|只有(?:縣府)?立案|只立案|沒(?:有)?辦(?:法院)?(?:社團)?法人登記|未(?:辦|完成).{0,5}法人登記/.test(raw);
 const keep=(r,k)=>!!(r.test(t)||!changed&&p[k]);
 return {mode,rental:rental||!changed&&p.rental,driving,reg:no?'no':yes?'yes':!changed?p.reg:null,
   gift:keep(gift,'gift'),motorbike:keep(/機車|摩托/,'motorbike'),inspection:keep(/(?:[5-9]|\d\d|五|六|七|八|九|十)[年歲]|車齡|舊車|臨檢|驗車/,'inspection'),
   inUse:keep(/被借|借(?:人|去|給)|第三人|先用|先騎|舊牌|仍在使用|代團體|先登個人|名字可否代|個人.{0,6}名義|理事長.{0,8}個人/,'inUse'),
   restrict:keep(/限定用途|限制用途|限用途|指定用途|口頭限|送餐|指定.*用/,'restrict'),
   tax:keep(/抵稅|扣稅|扣除|報稅|節稅/,'tax'),
   grant:!/(?:不問|沒有|不涉及|無).{0,6}(?:政府|縣府)?補助/.test(raw)&&keep(/補助|核銷|核定的經費/,'grant')};
}
function route(q,prior){
 const s=parse(q,prior);if(!s)return null;
 const steps=[],refs=[registry];
 const add=(h,b)=>steps.push([h,b]);
 const out=(title,summary,choices)=>({direct:true,category:'車輛過戶與團體財產',title,summary,steps,refs,vehicleRegistryContext:s,questionState:{focus:choices?'clarify':'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(choices?{choiceHeading:'您問的是哪一種情況？',choices}:{})});
 if(s.mode==='t'||s.mode==='r'){
  refs.push(motor,...(!s.driving?[roads]:[]));
  return out(s.driving?'個人機車考照請洽公路監理機關':'個人車籍或租車行照請洽車主及監理所站',s.driving?'機車駕照不是人民團體櫃檯的業務。請至交通部公路局監理服務網或就近監理所站確認考照報名、體檢及應備資料。':s.mode==='r'?'承租人或實際騎乘者不一定是登記車主。先看租賃契約並請車行或登記車主確認能否辦理；換發行照、更名和移轉所有權並不相同，由公路監理所站確認。這不是協會改名或捐贈。':'個人車籍更名、換行照與過戶請分別向公路監理所站查核，不是修改協會章程。');
 }
 if(!s.mode){
  refs.push(motor);
  return out('先分清個人車籍、租用或協會受贈','如果只是更改車籍資料，先找公路監理所站，不是協會改名。若有團體受贈，再分開確認財產與捐物證明。',Object.values(roles).map(v=>({label:v,question:'確認車輛問題:'+v})));
 }
 refs.push(roads,finance,people,moi);
 add('過戶找監理所站，團體名義和代表代辦是兩件事','道路交通安全規則第16條對以團體名義辦理登記，要求團體正式證明文件及財稅機關編配的統一編號。'+(s.reg==='no'?'只在縣府立案而未辦法人登記，請洽監理站確認哪些立案及代表文件可以採認；不能說一律不准或保證可登記。':s.reg==='yes'?'已辦法院登記，先讓監理所站核對登記證明、團體統編與代表資格，不代表所有車都能直接移轉。':'若不清楚有無法院登記，可備正式立案與代表證明詢問；車籍和土地登記不同。')+'理事長可依規定持權限文件代表團體送件，不要以理事長的私人名義取代團體車主。');
 add('先核對車籍、保險和臨時檢驗','備行照、過戶登記書、雙方證明及印章、強制汽車責任保險證明等；團體的證件及可否委託以監理所站查核為準。'+(s.motorbike?'公路局說明，機車出廠5年以上辦過戶須臨時檢驗合格。':'如為機車，公路局說明出廠5年以上過戶須臨時檢驗合格；汽車不要照套這個年數。')+'辦機車過戶前先把強制險改到新車主名義或依法移轉權益，證明的剩餘效期須至少30日；舊保單還有效不表示已符合。檢查有無欠費、查封或其他限制。');
 if(s.inUse||s.gift)add('還有人在用、牌照未核對，先別當作協會的車上路','查登記車主有無權處理、是否仍外借或有契約限制；保留書面贈與、交付及確認現況的紀錄。不要因拿到鑰匙、已有保險或只是由理事長代辦，就認定能上路或由誰負事故責任。須確定保險、車籍、權限與使用安全；事故責任依實際行為、契約、保險與法律另判。');
 add('受贈後按實際取得認列，不把借用物當自有','社會團體財務處理辦法第4、5、12條：有憑據且確定屬團體的財物，登記在財產登記簿並列年度財產目錄；備贈與、交付、車籍和可核對的價值依據。不確定或只是借用，先列待查／保管，不能僅因在協會手上就認成自有。'+(s.restrict?'約定送餐或其他指定用途要留書面、列入財產資料並依約使用；不要擅轉成個人使用。':''));
 if(s.gift||s.tax)add('捐物證明可開，能否扣稅由國稅局判斷','確實受贈時，以團體全名開捐物收據，寫品名、數量、日期及實際受領資料，依規定用章留存根（第8條及內政部說明）。不任意估價、開現金收據或保證能扣除。抵稅、實物價值及證明由所在地國稅局依實案認定。');
 if(s.grant){refs.push(county);add('修理費或保險費能否用補助，另看核定','受贈和過戶不自動讓維修、檢驗、保險或運送成為核定支出。先送原補助單位核對項目、期限、用途及有無變更同意，不用另案補助或個人收據自行抵扣。');}
 return out(s.tax?'協會受贈車輛：監理過戶、列帳，扣稅洽國稅局':'協會受贈或登記車輛：監理過戶與列帳分開','公路監理所站處理車籍；協會自己依實際受贈與取得資料列財產並開捐物證明。沒有核對過戶資格前，別先用理事長私人名義登記。');
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedVehicleGiftAndRegistry=route;
})(typeof window==='object'?window:globalThis);
