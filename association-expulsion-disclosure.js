(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const a=n=>law('人民團體法','D0050091',n);
const p=n=>law('個人資料保護法','I0050021',n);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>180||!/協會|社會團體/.test(t)||/合作社|社員|工會|公會|農會|漁會|基金會|公司|股東|志工|員工|離職|罷免|法院|訴訟|改章程|改期|退費|補助/.test(t))return null;
 if(!/欠(?:繳)?(?:了)?會費|會費.{0,6}(?:沒繳|欠繳|未繳)|因欠費/.test(t))return null;
 const remove=/除名|開除.{0,5}會員|把.{0,6}(?:踢出|趕出)/;
 const disclose=/(?:公開|公告|公布|張貼|貼(?:在|到|上)|發(?:到|上))[^。？！?；;]{0,14}(?:名單|姓名|名字|欠費|網路|社群|官網|群組)|(?:名單|姓名|名字|欠費紀錄)[^。？！?；;]{0,12}(?:公開|上網|放上網|貼到|貼上|貼在|公布)/;
 if(!remove.test(t)||!disclose.test(t))return null;
 if(/不公開|不公布|不張貼|沒有公開|沒貼|不貼|只是個別通知|已完全去識別|匿名統計/.test(t)&&!/可不可以公開|能不能公開/.test(t))return null;
 const outward=/網路|上網|官網|公開|社群|對外/.test(t), closed=/會員群組|內部群組|限定會員|會員才看得到|僅供會員/.test(t);
 const removal=['除名：監事、理事會或理事長不能自己決定','先對照章程及實際欠繳情形；欠費不會自動除名。須有人民團體法第14條所列事由，且造成危害團體情節重大，才得提會員（會員代表）大會決議。依第27條，大會須過半數出席，並由出席人數三分之二以上同意。若只是有人口頭宣布，可要求說明並核對章程與正式決議紀錄。'];
 const privacy=['名單：公開與個別通知是兩件事','只要從姓名、會員編號或搭配其他資訊能認出個人，欠費或除名名單就是可識別個資。依個資法第5、20條，利用要在原蒐集目的所必要範圍內；目的外利用須有法定例外。未確認依據，不要把可辨識的名單貼到網路。可先個別通知本人並核對帳目，不以公開名單催繳。'];
 const access=['僅供內部閱覽，也要限必要的人和資料','不是對外上網，不表示就能讓所有會員看每個人的欠費。依實際業務需要控制閱覽對象和欄位；必要時採個別通知，避免在群組散布可辨識資料。'];
 const steps=t.search(remove)<t.search(disclose)?[removal,privacy]:[privacy,removal];
 if(closed)steps.push(access);
 return {direct:true,category:'協會｜會員除名與名單揭露',title:'欠會費不會自動除名，也不能任意公開名單',
  summary:'監事不能當場自行除名。'+(outward?'未確認合法依據，也不要在網路公開可辨識的名單。':closed?'會員群組不是對外公開，仍要確認必要的閱覽範圍與依據。':'通知本人、限內部閱覽、對外公開是不同的利用情形。'),
  steps,refs:[a(12),a(14),a(27),p(5),p(20)],questionState:{focus:'compound'},
  ...(!outward&&!closed?{choiceHeading:'這份名單會給誰看？',choices:[
   {label:'對外公開到網路',question:'協會監事因欠會費要除名，並把名單貼上公開網路，可以嗎？'},
   {label:'只有會員群組看得到',question:'協會監事因欠會費要除名，並把名單貼在只有會員看得到的內部群組，可以嗎？'}
  ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationExpulsionDisclosure=route;
})(typeof window!=='undefined'?window:globalThis);
