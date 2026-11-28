const a=require('node:assert/strict');
const {route}=require('./office-resignation-scope');
const advanced=["我是一般協會的理事，已書面辭職、理事會也同意。我月底還能以會員身分到大會投票嗎？理事會跟會員大會的簽到名冊要不要一起改？","我們是消費合作社，不是協會。理事會主席只想卸下主席，不退社也不卸理事；新主席未補選前，是誰主持例會、可以代簽房租或用印嗎，股金這個月能先拿回嗎？","我們協會常務理事同時是理事長，書面只寫辭理事長，剩任期剛好六個月。理事會已通過，我要不要通知候補理事，常務理事可互推暫代，還是一定要補選？原大會在月底，需不需要改日期、誰召集、何時報新的名冊？","協會有兩個理事和監事通通說不想做，有人只口頭，另兩人寫信，監事會還沒開、理事會先同意其中一位。理事會應到9位，在場這次有5位，只有一個候補，補完是不是還要開會員大會？能提前選新一屆、任期重新算嗎？原會員大會已通知，理事長沒有辭職，還能照開、誰表決、後續名冊和大會紀錄要一起報嗎？","更正，沒有理事辭職，只有監事口頭說不做，沒有書面也沒有監事會決議，其餘不變。","新題：東港鎮有哪些社會福利團體？","他請辭了，補人、投票和開會要怎麼辦？"];
const complex=["我是協會當屆的理事，理事會已同意我辭職，下次大會我還想以會員投票，也要再交原本的會費嗎？","理事長說他只辭理事長，不退會也不辭理事；理事會口頭答應了，候補理事要不要遞補，應該由誰互選新理事長？","一般勞動合作社的理事會主席想只卸主席，還是理事、社員，會議先由誰代開、何時補選、可不可以要求把社股現在領走？","我們協會的理事長、兩個理事和一個監事一起書面請辭，明天大會原通知還是舊理事長，候補不足，可以直接叫會員一起提前選新一屆嗎？要不要有人代理、把新名單報縣府、重新算任期？","更正：剛才說集體辭職不對，只有監事口頭說不做，還沒開監事會。","新題：萬巒鄉有哪些社區發展協會？"];
const quality=["我們協會理事辭職經理事會通過，他還是會員嗎？","理事長想辭理事長、保留理事跟會員，理事會可以補選主席嗎？原訂大會還是照開嗎？","理事請辭後還能投票嗎？","更正：他只辭理事長，沒有辭理事，也沒有退會。","如果是一般勞動合作社的理事會主席辭主席，不是協會、也不退出合作社，能直接按退社拿股金嗎？","新題：新園鄉有哪些社區發展協會？"];
const all=r=>[r.summary,...r.steps.flat()].join(' ');
const director=route(advanced[0]);a.match(all(director),/不能再以理事身分.*會員大會投票.*會員名冊不要因卸職一併刪除.*異動後30日內/);
const coop=route(advanced[1]);a.match(all(coop),/辭主席不等於退社.*送達合作社社址時生效.*一個月內補選.*未滿六個月.*不因此自動取得.*不啟動退社退款/);
const chair=route(advanced[2]);a.match(all(chair),/不等於一起辭理事.*沒有該席缺額.*出缺日起一個月.*恰好六個月.*原通知.*自閉會後30日/);
const multiple=route(advanced[3]);a.match(all(multiple),/不能混算.*三分之二.*至少還要有6位.*過半需5位.*仍合法在任.*會議紀錄/);
const fixed=route(advanced[4],multiple.officeResignationContext);a.match(fixed.title,/^監事/);a.match(fixed.summary,/不能把監事當成出缺.*經監事會決議/);
a.equal(route(advanced[5],fixed.officeResignationContext),null);
const unclear=route(advanced[6]);a.equal(unclear.choices.length,4);
for(const option of unclear.choices){const x=route(option.question,unclear.officeResignationContext);a.ok(x,option.label);if(option.label==='合作社主席卸任'){a.match(x.title,/合作社/);continue;}a.equal(x.choices.length,2);const chosen=route(x.choices[0].question,x.officeResignationContext);a.equal(chosen.officeResignationContext.status,'effective');const no=route(x.choices[1].question,x.officeResignationContext);a.equal(no.officeResignationContext.status,'pending');}
a.match(all(route(complex[0])),/會員大會投票.*卸任不會自動免掉會員會費.*不必因卸任重繳/);
a.match(all(route(complex[1])),/只口頭.*不能先當成理事長出缺.*互選/);
a.match(all(route(quality[4])),/不能只因辭去主席.*股金/);
for(const s of [quality[0], '協會理事長辭職了，理事會跟會員大會都還能開嗎？','協會監事辭職，只剩一名監事，可以單獨審年度決算嗎？','我辭了勞動合作社理事會主席，又另外申請退社，股金是當場領還是年底做完才能領？','理事長辭職了，銀行印鑑要怎麼換，還要報縣府嗎','工業會理事長請辭後還能投票嗎？','我們合作社這次開的是社務會，不是社員大會，監事也要到嗎？要提前幾天通知？', '我想移交資料、申請會址異動'])a.equal(route(s),null,s);
console.log('office scope, confirmation indexes, oral supervisor correction, 6-month boundary and cooperative refusal passed');
