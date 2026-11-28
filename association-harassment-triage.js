(function(root){
'use strict';
const law=(title,code,n)=>({title,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const work=[law('性別平等工作法第12條：職場與非工作時間的適用','N0030014',12),law('性別平等工作法第13條：雇主防治及補救','N0030014',13),law('性別平等工作法第32條之1：內部與地方主管機關申訴','N0030014','32-1')];
const pub=[law('性騷擾防治法第7條：場所應有的措施','D0050074',7),law('性騷擾防治法第10條：被害人身分保護','D0050074',10),law('性騷擾防治法第14條：申訴窗口','D0050074',14)];
const guidance={title:'勞動部職場性騷擾申訴處理指導手冊（含各縣市窗口）',source:'https://eeweb.mol.gov.tw/front/sitebuilderuploads/285/%E8%81%B7%E5%A0%B4%E6%80%A7%E9%A8%B7%E6%93%BE%E7%94%B3%E8%A8%B4%E8%99%95%E7%90%86%E6%8C%87%E5%B0%8E%E6%89%8B%E5%86%8A.pdf'};
const regulations={title:'性別平等工作法施行細則：非工作時間與最高負責人',source:'https://laws.mol.gov.tw/FLAW/FLAWDAT10.aspx?id=FL015150&ldate=20260408&modify=1'};
const choices=[['work','性騷擾，涉及工作或雇主'],['public','性騷擾，涉及志工或活動'],['other','不是性騷擾，是其他騷擾或糾紛'],['unknown','仍不確定是哪一類']];
const safety=['保護當事人與留存資料','先離開有風險的現場；有立即危險時打 110。可留存自己持有的訊息、時間或相關紀錄，僅交有權且有處理需要的人。不要在公開群組或小屏貼姓名、截圖、可識別線索或未公開的案情。'];
const response=(title,summary,steps,refs,extra={})=>({direct:true,category:'團體服務｜事件申訴與安全',title,summary,steps,refs,questionState:{focus:'cross-harassment-triage'},...extra});
function route(q,prior){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>500||/^(?:另問|新題|換題)/.test(t))return null;
 const pick=t.match(/;櫃檯確認事件類型:(work|public|other|unknown)$/)?.[1];
 const next=/^(?:更正|補充|再確認|其實|那)/.test(t);
 const workish=/聘的|受僱|受雇|員工|上班|下班|領薪|雇主|僱用|辦公室|執勤|工作人員/.test(t);
 const publicish=/志工|參加者|參與者|公開活動|活動現場|一般民眾|參加民眾/.test(t);
 const group=/協會|人民團體|社會團體|合作社|公會|志工/.test(t);
 const asks=/怎麼|如何|申訴|反映|誰|窗口|主管機關|找|公布|離場|處理|保留|能不能|算/.test(t);
 const containsSex=/性騷擾|言語性騷|性別.{0,5}騷擾/.test(t);
 const noSex=/不(?:是|涉及|指|屬)(?:性騷擾|性別騷擾)|沒有涉及性騷擾/.test(t)&&!/不確定|不知道/.test(t);
 const priorRelation=Boolean(prior&&next&&/騷擾|申訴窗口|申訴|最高負責人/.test(t));
 const contact=/最高負責人|僱用人|雇主本人/.test(t);
 const similar=/被.{0,20}騷擾|騷擾.{0,15}(?:投訴|申訴|我們)|性霸凌/.test(t);
 if(!pick&&!((group||priorRelation)&&asks&&(containsSex||similar||priorRelation&&(contact||/騷擾/.test(t)))))return null;
 if(noSex||pick==='other'){
  return response('先分清一般職場糾紛與性騷擾','如果您確定問的不是性或性別相關騷擾，不先套用性騷擾的申訴程序。',[
   safety,['先找相應窗口','若是受僱工作中的不法侵害，可詢問雇主安全衛生窗口或地方勞工主管機關；一般活動糾紛可先向主辦反映，若有威脅或立即危險可向警方求助。']
  ],[],{triageContext:null});
 }
 const isWork=pick==='work'||(!pick&&(workish||contact&&priorRelation)&&!(/不是受僱|不是員工/.test(t)&&!/另有.{0,15}(?:領薪|受僱|工作人員)/.test(t)));
 const isPublic=pick==='public'||(!pick&&publicish);
 const blended=isWork&&isPublic&&/志工/.test(t)&&/領薪|受僱|職員|工作人員/.test(t);
 const ctx={sexual:Boolean(containsSex||pick==='work'||pick==='public'||priorRelation&&prior.sexual)};
 if(pick==='unknown'||(!ctx.sexual&&!(isWork&&contact&&priorRelation))||!isWork&&!isPublic){
  const base=raw.replace(/[;；]櫃檯確認事件類型:[a-z]+$/i,'');
  return response('先分清是職場、活動，還是其他類型','「被騷擾」不一定是法律上所說的性騷擾。若您是指性或性別相關的騷擾，請只選與工作或活動的關係，不用提供姓名、對話或案情。',[
   safety,['若對方是最高負責人','如果是工作上的性騷擾，而對方是最高負責人或僱用人，依法可直接向地方勞工主管機關申訴，不必先找對方本人。']
  ],[...work,pub[2]],{triageContext:ctx,choiceHeading:'哪一種最接近您的情況？',choices:choices.filter(([id])=>!(id==='public'&&workish&&!publicish)&&!(id==='work'&&publicish&&!workish)).map(([id,label])=>({label,question:base+'；櫃檯確認事件類型:'+id}))});
 }
 const workSteps=[
  ['職場不只限於辦公室','執行職務中的事件先看工作關係。非工作時間如遭最高負責人或僱用人性騷擾，依法也可適用；同一人涉及工作與非工作時間且具密接性的持續行為，有另外的適用條件。不能只憑「下班後」排除，也不能只憑「主管」認定。'],
  ['申訴先看他是誰、雇主是否處理','一般向雇主申訴；被申訴人是最高負責人或僱用人，可以直接向地方勞工主管機關申訴，不必先向本人反映。雇主未處理，或不服雇主的調查或懲戒結果，也可向地方主管機關。屏東可先洽縣府勞動暨青年發展處。'],
  ['人少仍有防治與補救義務','未滿 10 位受僱者不適用第 13 條 10 人以上的公開申訴管道門檻，不等於雇主得不處理；知悉後仍應採取立即有效的糾正及補救，依情況保護當事人並協助申訴。']
 ];
 const publicSteps=[
  ['現場先安全分隔，事後不要公開指認','主辦先保護當事人，按場地和活動規則安排分隔或請工作人員協助。是否要求離場取決於場地管理權及現場安全，不能代替正式調查。適用性騷擾防治法第 7 條的場所與單位，當下知悉應協助申訴、保全證據、必要時請警方到場並檢討場所安全；事後知悉仍應檢討場所安全。'],
  ['一般活動參加者或行為人不明','若不是需另走職場或校園程序、且行為人是一般第三人或不明，可向事件發生地警察機關提出申訴；若涉及法定機關、學校或機構最高負責人等身分，依法另分受理窗口。請向地方性騷擾防治窗口核對，不必在櫃檯填個案資料。']
 ];
 if(blended){
  return response('同一事件可以一起保護，申訴要依個別身分分流','領薪執勤的人與不是受僱者的志工，不能只因同時遇到同一人就一律走同一條申訴程序。如果您指的是性騷擾，主辦應先保護兩人，再依各自與行為人的關係分流。',[
   safety,...workSteps.slice(0,2),...publicSteps,
   ['一般活動參加者涉入受僱者的事件','執行職務期間，如由不特定人於公共場所或公眾得出入場所為之，調查、調解及處罰依性騷擾防治法；不因此免除雇主知悉後的防治與補救。兩人可各向有權窗口提供自己掌握的紀錄，不公開合併個資。']
  ],[...work,...pub,guidance],{triageContext:ctx});
 }
 if(isWork)return response(contact?'涉及最高負責人：可直接向地方勞工主管機關申訴':'先確認工作關係，再分雇主與地方勞工主管機關',contact?'如果是工作性騷擾，且對方是協會的最高負責人或僱用人，您不用先找對方本人。即使協會不到 10 人，仍可直接向地方勞工主管機關申訴。':'不在辦公室不代表不適用職場性騷擾規定。先核對是否執行職務、是否持續、以及對方是不是最高負責人或僱用人。',[safety,...workSteps],[...work,regulations,guidance,pub[1]],{triageContext:ctx});
 return response('一般活動性騷擾：先保護、保密，再找受理窗口','主辦先讓當事人有安全空間，聯繫需要協助的人。一般參加者或行為人不明的案件，且不屬職場或校園另行處理情形，可向事發地警方申訴。',[safety,...publicSteps],pub,{triageContext:ctx});
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationHarassmentTriage=route;
})(typeof window!=='undefined'?window:globalThis);
