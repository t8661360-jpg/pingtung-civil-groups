(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function rosterHandover(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||/合作社|社員|基金會|財團法人|公會|工會|農會|漁會|政府職員|員工個資|解散|籌備|籌組|發起人|捐款名單/.test(t))return null;
 const association=/協會|社會團體|人民團體/.test(t);
 if(!association&&(!/理事長/.test(t)||!/會員(?:代表)?(?:名單|名冊|資料)|會籍資料/.test(t)))return null;
 if(!/會員(?:代表)?(?:名單|名冊|資料)|會籍資料|名冊|名單/.test(t))return null;
 const stage=/交接|換屆|改選|換(?:了|過)?理事長|新(?:任|的)?理事長|前(?:任|理事長)|原任|舊任|卸任|接任/.test(t);
 const home=/帶.{0,7}回家|帶走|拿回家|在家|我家|私下|自己(?:的|手機|家|手上)|私人|個人.{0,6}(?:手機|電腦|裝置|雲端|信箱)|沒(?:有)?辦公室|只有我能.{0,5}(?:查看|登入)/.test(t);
 const copies=/(?:身分|身份)證.{0,8}(?:影本|正反面|副本|照片|拷貝)|證件.{0,6}(?:影本|正反面|照片)|再.{0,8}(?:收|要|附).{0,7}(?:身分|身份)證/.test(t);
 const storage=/保管|保存|留|備份|存|安全|放|帶|移交|交還|刪/.test(t);
 if(!stage||!storage||(!home&&!copies))return null;
 if(/公開|公告|公示|貼上官網|群組公佈/.test(t))return null;
 const prev=/(?:前任|前理事長|原任|舊任|卸任).{0,8}(?:理事長|已卸任|還|可|能|想|要|仍|不肯|不交)|卸任.{0,7}(?:還|可以|要|能)/.test(t);
 const both=/(?:前任|前理事長|原任|舊任).{0,20}(?:新(?:任|的)?理事長|接任)|(?:新(?:任|的)?理事長|接任).{0,20}(?:前任|前理事長|原任|舊任)/.test(t);
 const personal=n=>law('個人資料保護法','I0050021',n), guide=n=>law('人民團體會務輔導辦法','D0020094',n);
 const retention=['前任留副本：交回後停用，別留私人備份','前任卸任後，若沒有另外的職務授權或其他合法保留依據，不應自行留下整份會員名冊的手機、私人雲端或紙本備份。先確認協會已完整接收及完成備份，再按交接紀錄撤權；私人副本依保存依據處理，沒有依據者交還或安全刪除。不要把團體為會務仍需要的唯一原檔一併刪除。'];
 const current=['新任保管：資料要由協會控管，不是個人的','新任可在辦理會務必要的範圍內使用名冊，但不等於可以把整份帶回自己家、存進私人手機、信箱或個人雲端。法規未一律寫「只能放辦公室」；沒有辦公室，建議先由協會以書面指定保管人、地點、用途、存取權及歸還方式。紙本可用上鎖櫃，電子檔使用協會可管理的帳號、分權與加密，留存取還或存取紀錄，不向無權人開放。'];
 const handover=['每屆改選：名冊以團體檔案列冊交接','依人民團體會務輔導辦法第18條，屆期改選事先造具移交清冊，由新任理事長就任後十五日內會同監交人接收。會員名冊如屬會務檔案，列入交接並點清有幾份、由誰管理及如何撤除舊權限；清冊不必重複貼出所有會員個資。這個十五日規定是每屆理監事改選交接，不把補選或其他情況一概套用。'];
 const id=['另索取會員身分證影本：不能只以交接為理由','人民團體會務輔導辦法第10條的會員大會審定名冊列姓名、聯絡電話、地址及權利義務受限制情形，沒有要求附每位會員的身分證影本。若另有特定目的，先確認個資法第5、8、19條的合法事由、必要範圍和告知義務；如果出示正本或其他較少資料就足以核對，不宜再留影本。不要在小屏或群組貼證件。'];
 return {direct:true,category:'人民團體名冊與個資',questionState:{focus:'compound'},
  title:prev&&!both?(association?'協會':'團體')+'交接後，前任不能無依據保留會員名冊副本':'協會交接：會員名冊由團體管理'+(copies?'，證件影本要另外判斷':''),
  summary:(prev&&!both?'前任卸任後，沒有另外的授權或合法保留依據，就不要把原會員名冊留在私人手機或雲端。':'不能只因接任理事長，就自行把整份會員名單帶回家或留在私人裝置。依法可以辦正式交接，但保管須由協會控管。')+(copies?'交接本身也不是重新向會員索取身分證影本的依據。':'')+(!association?'如您問的是一般協會，可依下列該類團體的程序；若屬其他團體，還要核對專法。':''),
  steps:[...(prev&&!both?[retention,handover,current]:[current,handover,retention]),...(copies?[id]:[])],
  refs:[guide(18),...(copies?[guide(10),personal(8),personal(19)]:[]),personal(5),personal(11),personal(20),
   {title:'個資法現行第27條及尚未生效的修正（官方條文對照）',source:'https://www.aoc.gov.tw/browserFile/a00028'},law('個人資料保護法施行細則','I0050022',12)],
  actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={rosterHandover};return;}
root.verifiedRosterHandover=rosterHandover;
})(typeof window!=='undefined'?window:globalThis);
