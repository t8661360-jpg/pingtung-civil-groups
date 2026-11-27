(function(root){
'use strict';
const refs=[
 {title:'合作社法第35、36、37、74條：簿冊備置、查閱與妨礙',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112'},
 {title:'個人資料保護法第5、19、20條：目的及必要範圍',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021'},
 {title:'全國法規資料庫：仍適用的個人資料保護法第27條',source:'https://law.moj.gov.tw/LawClass/LawOldVer.aspx?pcode=I0050021'},
 {title:'人民團體會務輔導辦法第18條：屆期改選交接',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0020094&flno=18'}
];
const coopSummary='一般合作社的社員或合作社債權人，可以依法向合作社查閱社員名簿等法定簿冊；不是憑親屬身分就可要求查閱，也不是可任意複製或公開。';
const associationSummary='協會的會員名冊是團體資料。理事長可以按會務需要和權限使用，不能把私人設備當成唯一、協會無法管理的保管處，也不宜私下留整份或轉傳。';
const coopStep=['合作社社員名簿｜依法查閱，不是自行整批下載','合作社理事會依第35條備置社員名簿等資料。社員及合作社債權人依第37條得查閱第35、36條所列資料，可向合作社證明資格、約定查閱方式。不能僅因名簿有個資而一律拒絕法定查閱；是否可拍照、抄整份或另行提供，須另核對合法依據、目的與必要範圍。遭不當拒絕，先請合作社說明；仍有爭議可向原登記主管機關反映。第74條第2款對規避、妨礙或拒絕法定查閱有處理規定。不要把名簿貼到聊天、群組或網路。'];
const assocStep=['協會會員名冊｜按團體授權與安全措施管理','建議由協會書面指定保管人、設備或協會可控帳號，限制存取、加密與備份，並留存取紀錄。沒有辦公室，也不等於可把唯一原檔放在個人手機、私人雲端或任意轉傳。若需要在受控裝置處理會務，核對協會授權、特定用途和必要範圍；不是法律規定一律只能放辦公室。'];
const handover=['如遇整屆改選，再適用交接期限','依第18條，屆期整屆改選前備妥檔案清冊，新任理事長就任後15日內會同監交人接收。團體驗收完整原檔和備份後，再依法移除無保留依據的私人副本與舊權限，不要先刪除唯一原檔。一般保管疑問或其他更動，不一概套用15日。'];
function mixedRoster(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>245||/信用合作社|信合社|保險合作社|公會|工會|漁會|農會|公寓大廈|發起人名單|捐款名單/.test(t))return null;
 if(!/合作社/.test(t)||!/協會|社會團體/.test(t)||!/社員(?:的|之)?名(?:簿|冊|單)/.test(t)||!/會員(?:的|之)?名(?:簿|冊|單)|協會(?:的)?名冊/.test(t))return null;
 const clauses=t.split(/[；;。？！?!]+|另外|順便|再(?:請)?問|同時還想問|[、，,](?=(?:另|至於|那|一般)?(?:一般)?(?:合作社|協會|社會團體))/).filter(Boolean);
 const c=clauses.findIndex(x=>/合作社|社員/.test(x)&&/社員(?:的|之)?名(?:簿|冊|單)/.test(x)&&/查閱|調閱|閱覽|查|能.{0,6}看|看.{0,6}名/.test(x));
 const a=clauses.findIndex(x=>/協會|社會團體/.test(x)&&/理事長|會長/.test(x)&&/名冊|名單/.test(x)&&/私人|自己(?:的|家|手機)|帶回家|私有|個人(?:手機|設備|裝置|雲端)/.test(x)&&/保管|保存|留|備份|存|放|帶/.test(x));
 if(a<0||c<0||a===c)return null;
 const seq=[{i:c,summary:coopSummary,steps:[coopStep]},{i:a,summary:associationSummary,steps:[assocStep,...(/前任|新任|改選|交接|接任/.test(clauses[a])?[handover]:[])]}].sort((x,y)=>x.i-y.i);
 return {direct:true,category:'團體名簿｜查閱權與內部保管',title:'合作社社員名簿查閱，和協會保管會員名冊分開看',summary:seq.map(x=>x.summary).join(' '),steps:seq.flatMap(x=>x.steps),refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={mixedRoster};return;}
root.verifiedCoopInspectionAssociationRoster=mixedRoster;
})(typeof window!=='undefined'?window:globalThis);
