(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const coop=n=>law('合作社法','D0050112',n), e=n=>law('合作社選舉罷免辦法','D0050022',n);
const g=n=>law('人民團體會務輔導辦法','D0020094',n), pp=n=>law('個人資料保護法','I0050021',n);
const history={title:'全國法規資料庫：個資法仍適用版本（第12條及第27條）',source:'https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=I0050021'};
const status={title:'全國法規資料庫：個資法修法施行狀態',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021'};
const books=['合作社社員名簿：理事會要在合作社備置','依法由合作社理事會管理，不是退休社員、卸任社長／理事會主席、或單一承辦人私有。第35條要求將社員名簿及應備資料置於合作社，不能只留在前任個人雲端或家中，讓合作社拿不到完整可用的名簿。新任依職務及授權來使用是另一回事，也不能自行以私人帳號作唯一保管處。'];
const clock=['分清辭職交接和屆期改選','合作社選舉罷免辦法第8條第2項：辭職者應完成原辦工作交接，交接、辭職和遞補於會議提報。若為屆期改選，依合作社章程、決議及主管機關可適用的要求辦理，不直接套一般協會15日交接規則；合作社選罷辦法第6條的15日是新一屆理事會／監事會互選召集時點，不是名簿移交期限。'];
const association=['一般協會：接任理事長依法可以要求團體檔案交回','依人民團體會務輔導辦法第18條，每屆理監事改選前先造交接清冊。新任理事長就任後15日內會同監交人接收；會員名冊屬會務資料時要列入，不是新任私人取得整本而可以任意轉傳。若不是每屆改選（例如另因辭職或補選），不要直接套本條期限，先看章程與適用程序。'];
const migration=['先移交團體可用資料，再處理私人副本','保有個資檔案的一方應按仍適用的個資法第27條採取適當安全措施。用書面或會議紀錄列清檔案版本、紙本、電子檔及受控帳號，指定會內有權限的人安全接收，確認可讀、登入權限與備份皆接管後，停用舊權限。依法或有調查保全必要的副本另受控保存；無合法必要的私人副本交回或安全刪除。不要先刪唯一原檔，不要求交出私人帳號密碼，也不要把名簿貼在聊天框或群組。'];
const dispute=['拒絕交接或懷疑名簿外洩','合作社可由理事會記錄缺失並請監事查核；無法處理可向原登記主管機關反映。名簿第37條依法供社員及債權人查閱，不等於一律可把整份另存、轉傳或公開。若有公開連結、非授權存取等跡象，先限制可控的分享並保全紀錄，立即核對是否實際外洩；依仍適用的個資法第12條，因違反該法而造成個資遭竊取、洩漏、竄改或其他侵害，須查明後以適當方式通知當事人。不要僅因使用雲端就宣告外洩。'];
function rosterCoop(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>210||/信用合作社|信合社|保險合作社|農會|漁會|公會|工會|公寓大廈|發起人名單|捐款名單/.test(t))return null;
 if(!/合作社|社員(?:名冊|名單|名簿|社籍資料)/.test(t)||!/社員名簿|社員名冊|社員名單|社籍|名簿|名冊/.test(t))return null;
 const stage=/前任|舊任|原任|舊社長|前社長|舊主席|前主席|換屆|改選|辭職|卸任|移交|交接|新(?:任|的)?(?:理事長|理事會|社長)|換了(?:社長|主席)|接任/.test(t);
 const storage=/私人|雲端|自己|家裡|家中|帶回家|帶走|保管|保存|備份|保留|移交|交接|交還|怎麼交|何時(?:收|交)|如何交|拿回|不(?:交|還)|扣著|群組|外洩|權限/.test(t);
 const newFiling=/新(?:加入的?|入社的?)?(?:社員|準社員)|(?:社員|準社員).{0,6}(?:許可入社|新加入)/.test(t)&&/多久|幾天|期限|要報|怎麼報/.test(t)&&/報備|備查|報縣府|報主管機關/.test(t)&&!/成立|創立會/.test(t);
 if(!stage&&newFiling)return {direct:true,category:'合作社會務｜新社員備查',title:'合作社新社員入社：許可加入後一個月內報備查',summary:'依合作社法第14條第2項，新加入社員或準社員由合作社在許可加入後一個月內報原登記主管機關備查。起算看核准加入，不是申請日，也不是新舊理事會交接日。',steps:[['請走正式管道','按主管機關當前書表與必要欄位提送；相關社員名簿由合作社依第35條備置。不要在聊天框提交個人資料。']],refs:[coop(14),coop(35)],questionState:{focus:'compound'}};
 if(!stage||!storage)return null;
 if(/公告.{0,8}名(?:簿|冊)|選舉資格|創立會|報備.{0,7}新社員/.test(t)&&!/交接|移交|交還|雲端/.test(t))return null;
 const unknown=/不確定|分不清|要看.{0,5}團體|(?:合作社|協會).{0,4}(?:或|還是)(?:合作社|協會)/.test(t)&&/合作社/.test(t)&&/協會|社會團體/.test(t);
 if(unknown)return {direct:true,category:'團體名簿｜交接業務分流',title:'先確認是哪種團體，名簿交接期限不同',summary:'不論哪種團體，都不要把名簿當作前任私人檔案。先確認資料已由團體接管；至於交接期限與程序，請分開看。',steps:[migration],refs:[coop(35),g(18),pp(5),history,status],questionState:{focus:'compound'},choiceHeading:'您是哪一種團體？',choices:[
  {label:'合作社',question:'合作社前任主席交接後還可把社員名簿保留在私人雲端嗎？'},
  {label:'一般協會',question:'一般協會前任理事長交接後還可以把會員名冊保留在私人雲端嗎？'}
 ]};
 const mixed=/協會|人民團體|社會團體/.test(t)&&/理事長|會員名冊|會員名單/.test(t)&&/先問|再(?:請)?問|另外|也想|分別|一樣嗎|和一般|另問|至於/.test(t);
 const steps=[books,clock,...(mixed?[association]:[]),migration,dispute];
 return {direct:true,category:'團體名簿｜合作社及一般協會業務分流',title:mixed?'合作社社員名簿、協會會員名冊：交接分開看':'合作社交接：社員名簿由合作社理事會備置',summary:mixed?'合作社不能只把社員名簿留在前任私人雲端。一般協會新理事長可依法辦交接、要求交還團體資料；兩類不能套用同一交接期限。':'社員名簿應由合作社理事會在合作社備置，不能只留在卸任人員的私人雲端。要把團體文件安全交回，不是交出私人帳號或任意複製名簿。',steps,questionState:{focus:'compound'},
  refs:[coop(34),coop(35),coop(37),coop(39),coop('54-1'),e(6),e(8),...(mixed?[g(18)]:[]),pp(5),pp(11),pp(20),history,status],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={rosterCoop};return;}
root.verifiedCooperativeRosterHandover=rosterCoop;
})(typeof window!=='undefined'?window:globalThis);
