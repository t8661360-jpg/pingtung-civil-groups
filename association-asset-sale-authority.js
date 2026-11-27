(function(root){
'use strict';
const law=(title,pcode,flno)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+flno});
const articles={
  vote:law('人民團體法第27條：財產處分決議','D0050091',27),
  land:law('社會團體財務處理辦法第13條：不動產處分','D0050097',13),
  civil:law('民法第106條：自己代理與雙方代理','B0000001',106),
  conflict:law('民法第52條第4項：利害關係表決','B0000001',52),
  coop:law('合作社法第39條：與理事訂約的代表','D0050112',39),
  minutes:law('人民團體會務輔導辦法第12條：會議紀錄','D0020094',12),
  private:law('個人資料保護法第20條：利用範圍','I0050021',20)
};
const validVote=['一般協會處分會產：大會先依法成會，再看同意票','依人民團體法第27條，一般協會的會員（會員代表）大會須有應出席者過半數出席，財產處分須有出席者三分之二以上同意。先確認應出席名冊與依法計算的出席人數、適用的特別規定及章程，不拿理事會的一般表決門檻取代。'];
const landProcess=['不動產原則先有大會決議，不能無授權先賣','依社會團體財務處理辦法第13條，土地或房屋的買賣、轉讓及設定他項權利，原則要大會先通過。只有特殊需要且大會事前授權，才可依該條由理事會及監事會或理監事聯席會議先通過，再提大會追認。沒有事前授權，不要走先賣再補追認的例外。受贈土地還要核對受贈時的指定用途、權利限制及契約。'];
const self=['理事長是買方，誰能代表協會要另查','大會同意處分，不等於同意理事長同時代表協會與自己簽約。依民法第106條，原則不要由買方本人代賣方簽；先按協會法律身分、章程及合法決議確認有權且沒有利益衝突的代表或適法授權。是否存在合法許諾或已簽契約的效力，不能只憑職稱、票數或章程沒寫就斷定；也不把合作社的監事代表規定移用到協會。'];
const conflict=['表決迴避與簽約是兩回事','若已登記為社團法人，依民法第52條第4項，當這筆交易因會員自身利害關係可能損害社團利益時，該會員不得參與表決，也不得代理他人行使表決權。包括理事長若是具會員身分的買方，須先核對該利益衝突。未明法人身分或票數有爭議，先確認適用規則及章程，不自行從應到人數扣除，也不逕算票。'];
const coop=['一般合作社賣給本社理事：由監事代表合作社','依合作社法第39條第1項第4款，真正買方是本社理事本人時，由監事代表合作社這一方，買方在自己那方簽。先核對章程、處分權限和適用的內部決議程序；不套一般協會的三分之二門檻，也不因監事可簽就跳過社內決議。不是理事本人而是另一團體，應另查契約當事人及代表權。'];
const minutes=['會議紀錄可以依法查閱，不等於全本可以公開','一般協會的會議紀錄依會務輔導辦法第12條留存、供會員或代表查閱，大會紀錄另於閉會後三十日內報主管機關備查。公開網站或群組是另一種利用；先確認個資法下的目的與合法依據，勿把可辨識的全本直接公開。需要公告決議時，可先整理不含非必要姓名、聯絡資料、簽名、印鑑等資訊的摘要；合作社的內部查閱規定另依其適用法令。'];
function route(q){
  const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
  if(!t||t.length>310||/信用合作社|信合社|農會|漁會|工會|公會|管委會|區權會|解散|清算|查封|補助款|補助買的|捐贈人名冊|義賣/.test(t))return null;
  const sell=/賣|出售|處分|轉讓/.test(t)&&!/只(?:談|問).{0,5}(?:捐|租)|(?:沒要|沒有要|不是要)(?:賣|出售|處分|轉讓)/.test(t);
  const property=/財產|會產|不動產|動產|設備|器材|(?:受贈的?)?(?:土地|房屋|會館)|受贈的?地|賣地|賣房/.test(t);
  const quorum=/幾票|多少票|多少人|幾個人|出席|同意|門檻|大會.{0,9}(?:表決|通過)|表決.{0,9}(?:怎麼|怎樣|需要)/.test(t);
  const rights=/誰(?:能|來|可|得)?簽|誰.{0,5}代表|能.{0,5}自己簽|可以.{0,5}自己簽|能.{0,5}原主席簽|簽名|簽約|利益迴避|能投.{0,6}票|自己.{0,8}投票|自己的.{0,5}票|票要避開|迴避表決|回避表決/.test(t);
  const isLand=/不動產|土地|房屋|會館|受贈的?地|賣地|賣房/.test(t);
  const process=/事前授權|先賣|大會追認|補追認|處分權限/.test(t);
  const publish=/紀錄/.test(t)&&/公開|貼(?:上)?|群組|公告|上網|網站/.test(t);
  const assoc=/協會|社會團體|社團法人/.test(t)&&!/不是(?:一般)?(?:協會|社會團體)/.test(t);
  const cooperative=/合作社/.test(t)&&!/不是(?:一般)?合作社/.test(t);
  const coopDirector=cooperative&&/(?:合作社)[^。！？!?；;，,]{0,22}(?:賣|出售|轉讓|處分)[^。！？!?；;，,]{0,19}(?:理事|主席)/.test(t)&&!/理事的(?:家人|公司|親屬|配偶)|理事.{0,2}關係企業/.test(t);
  const assocDirector=assoc&&/(?:賣|出售|處分|轉讓)[^。！？!?；;，,]{0,24}(?:給|予|與)(?:本會|協會的?)?理事長|理事長(?:本人)?(?:要)?買|理事長(?:是|當)買方/.test(t)&&!/理事長的(?:家人|公司|親屬|配偶)/.test(t);
  const ownOfficer=/(?:自己|自家|本社|本會)的?理事|理事長本人/.test(t);
  if(!sell||!property)return null;
  if(!assoc&&!cooperative&&ownOfficer&&(quorum||rights)){
    return {direct:true,category:'財產處分｜先確認團體類型',title:'先確認哪一種團體要出售設備',summary:'你已說是把財產賣給自己的理事。一般協會和一般合作社的決議、簽約代表並不相同，先選你問的團體。',steps:[],refs:[],questionState:{focus:'compound'},choiceHeading:'哪一種團體要處分財產？',choices:[
      {label:'一般協會',question:'我們是一般協會。'+raw+' 是賣給本會理事本人，請說明這個財產處分與簽約。'},
      {label:'一般合作社',question:'我們是一般合作社，合作社賣給自己理事本人。'+raw+' 請說明決議與簽約。'}
    ]};
  }
  if(!((assoc&&(quorum||rights||process||publish||assocDirector))||coopDirector))return null;
  // When both organizations are mentioned, require evidence of a separate asset sale to the cooperative's own director.
  if(cooperative&&assoc&&!coopDirector)return null;
  const selfAsked=assoc&&(assocDirector||(!cooperative&&ownOfficer&&/賣|出售|處分|轉讓/.test(t)));
  const voteConflict=selfAsked&&/能投|投票|表決權|自己的.{0,8}票|自己.{0,8}票|票要避開|利益迴避|迴避表決|回避表決|自己的表決/.test(t);
  const chairIsBuyer=assocDirector;
  const selfStep=chairIsBuyer?self:self.map(x=>x.replace(/理事長/g,'理事'));
  const steps=[...(assoc?[validVote]:[]),...(assoc&&isLand?[landProcess]:[]),...(selfAsked?[selfStep]:[]),...(voteConflict?[conflict]:[]),...(coopDirector?[coop]:[]),...(publish?[minutes]:[])];
  const refs=[...(assoc?[articles.vote]:[]),...(assoc&&isLand?[articles.land]:[]),...(selfAsked?[articles.civil]:[]),...(voteConflict?[articles.conflict]:[]),...(coopDirector?[articles.coop]:[]),...(publish?[...(assoc?[articles.minutes]:[]),articles.private]:[])];
  if(publish&&!assoc)for(const s of steps)if(s===minutes)steps[steps.indexOf(s)]=['紀錄能查閱，不代表能公開全本','請依合作社的規定保存紀錄並確認誰能依法查閱；公開網站或群組須另有合法依據，只公開必要資訊，不揭露非必要可識別資料。'];
  const summary=assoc?(selfAsked?('協會先確認大會處分決議，'+(chairIsBuyer?'理事長':'理事')+'是買方時，不要直接自己代表協會簽。'):'一般協會處分財產，要有過半數出席、出席者三分之二以上同意。')+(coopDirector?' 一般合作社與本社理事本人訂約，由監事代表合作社，不能套協會程序。':''):'一般合作社賣給本社理事本人時，由監事代表合作社；內部決議與簽約代表要分開確認。';
  return {direct:true,category:'財產處分｜大會表決、契約代表與紀錄',title:assoc?'協會賣會產：先確認大會門檻，再確認誰能簽':'合作社賣給本社理事：由監事代表合作社',summary,steps,refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssetSaleAuthority=route;
})(typeof window!=='undefined'?window:globalThis);
