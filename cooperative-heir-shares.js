(function(root){
'use strict';
const law=n=>({title:'合作社法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050112&flno='+n});
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>218||!/合作社|社員/.test(t)||!/過世|去世|死亡|身故|往生/.test(t)||!/繼承|繼任|家屬|股金|社股|社員資格/.test(t)||/信用合作社|信合社|農會|漁會|公司|協會|股票|遺產稅|訴訟|遺囑爭議|洪災|身故保險|社員代表喪失/.test(t))return null;
 const date=/年底|年度結束|年度終了|年度中/.test(t);
 return {direct:true,category:'合作社會務｜死亡出社與股金',title:'社員身故即出社；社股繼承與家屬入社分開',
  summary:'家屬不會因繼承就自動成為社員。社員死亡是出社事由；社股的繼承、是否另辦入社或退還股金，要分開處理。'+(date?'死亡出社不用等到年度結束；股金計算才原則上看營業年度終了時財產。':''),
  steps:[['死亡出社不是自行退社','合作社法第26條列死亡為出社事由，不用等第27條自請退社的年度終了及預告程序。家屬不能只憑繼承代行社員投票或參加選舉。'],
  ['股金有繼承規定，而社員資格另查','第20條規定社股繼承人承繼相關權利義務。繼承人若本來不是社員，可依第11、14條及章程申請入社；沒有依法加入時，依規定退還其股金。不是改一下名冊就完成入社。'],
  ['退多少和何時拿到，不是看面額直接發','依第30條與章程核對應退範圍及金額；計算原則以營業年度終了時財產為準，章程另有規定從其規定。向合作社核對死亡及合法繼承證明、共同繼承人怎麼辦、章程結算及付款安排；不要在小屏貼證件或完整戶籍資料。']],
  refs:[law(11),law(14),law(20),law(26),law(27),law(30)],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeHeirShares=route;
})(typeof window!=='undefined'?window:globalThis);
