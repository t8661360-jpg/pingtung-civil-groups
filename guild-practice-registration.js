(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const profiles={
 nurse:{name:'護理師／護士',guild:'執業所在地護理人員公會',nameLaw:'護理人員法',code:'L0020166',entry:8,join:10,local:{title:'屏東榮總：護理人員執登與入會資訊',source:'https://org.ptvgh.gov.tw/Personnel/News_Content.aspx?n=82F8F7F12F742A90&s=6EF47456F9912E0D&sms=4B62C7D54BB7E036'}},
 physician:{name:'醫師',guild:'執業所在地醫師公會',nameLaw:'醫師法',code:'L0020001',entry:8,join:9,local:{title:'屏東縣醫師公會：入會與執業登記書表',source:'https://web.ptmed.org.tw/zh/article/16f1106c-35d6-1172-d2ec-3a122bc5e0dc/PageContainer'}},
 social:{name:'社會工作師',guild:'執業所在地社會工作師公會',nameLaw:'社會工作師法',code:'D0050125',entry:9,join:31,local:{title:'衛福部《社會工作師執業指引手冊》：先入會再向所在地社會局（處）申請',source:'https://sa.hl.gov.tw/Upload/202509111056103672221.pdf'}}
};
function guildPractice(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||/地政士|建築師|律師|藥師|牙醫師|中醫師|獸醫師|物理治療師|職能治療師|外籍|外國人|懲戒|改選|罷免|任期|理事長|解散|工會|工業同業公會|信用合作社|社員/.test(t))return null;
 const news=/執業|執登|執照|執行業務|加入|入會|公會.{0,4}(?:拒絕|退件)|上班/.test(t);
 const qualifiers=/何時|先|要不要|需要|資格|一定|可以|能否|能不能|能.{0,3}不|有沒有|沒(?:有)?加入|未加入|還沒|拒收|拒絕|怎麼|如何|要.{0,4}辦|應不應|得不|可否|沒入會/.test(t);
 if(!news||!qualifiers)return null;
 const selected=Object.keys(profiles).filter(k=>({nurse:/護理師|護士|護理人員/,physician:/醫師(?!護士)|(?<!護理)醫生/,social:/社會工作師|社工師/})[k].test(t));
 const company=/商業同業公會|商業公會/.test(t)&&/拒絕|拒收|申請|入會|加入/.test(t);
 if(!selected.length&&!company)return null;
 if(/事務所開業|(?:成立|開設|設立).{0,7}事務所|開業執照|診所開業|(?:成立|開設|設立).{0,5}診所/.test(t))return null;
 if(!company&&/退會|換照|歇業|停業|復業|支援報備|終止會員資格/.test(t))return null;
 const steps=[],refs=[];
 const supplement=/先送|先申請|再補|後補|補件/.test(t);
 const awaiting=/先上班|先執業|領到之前|還在等|還沒領|還沒發|能上班|可以上班|先開始/.test(t);
 const location=/屏東/.test(t);
 for(const k of selected){
  const d=profiles[k],social=k==='social';
  steps.push([d.name+'：先入公會，再辦執業登記','取得相應資格後，先加入'+d.guild+'並取得會員證明，再向'+(social?'執業所在地直轄市或縣（市）社會主管機關（社會局／處社工業務）':'執業所在地直轄市或縣（市）衛生主管機關')+'申請執業登記，領到執業執照後才能執業。'+d.nameLaw+'第'+d.join+'條規定，具會員資格者，公會不得拒絕入會。執業登記所需的公會會員證明，依'+(social?'社會工作師法施行細則':'醫事人員執業登記及繼續教育辦法')+'第4條第1項第5款辦理。'+(location?'在屏東執業，可依下方屏東或官方資料確認受理流程。':'')]);
  refs.push(law(d.nameLaw,d.code,d.join),law(d.nameLaw,d.code,d.entry),law(social?'社會工作師法施行細則':'醫事人員執業登記及繼續教育辦法',social?'D0050126':'L0020181',4),...(social||location?[d.local]:[]));
 }
 if(company){
  steps.push(['商業同業公會：會員是公司、行號','依商業團體法第12條及內政部函釋，商業同業公會不得拒絕或抵制符合資格的公司、行號申請；應先核對登記、營業區域及實際業別，與專業人員以個人身分入會、辦執業登記不同。登記證照符合且已開業，同區域公司、行號原則在開業後一個月內加入該地區商業同業公會。依施行細則第8條，入會申請書及登記證照影本二份送理事會審查；未開始經營該登記業務者，第9條另有得決議暫緩入會的規定。']);
  refs.push(law('商業團體法','D0050100',12),law('商業團體法施行細則','D0050101',8),law('商業團體法施行細則','D0050101',9),{title:'內政部：商業團體不得拒絕合法公司、行號申請',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219392'});
 }
 if(selected.length&&(awaiting||supplement)){
  steps.push(['尚缺會員證明或執照，不等於已能執業','公會會員證明是法定應備文件，不能把先送件視為已完成登記。'+(supplement?'想先送件再補，請向前述受理機關確認能否補件和期限；本櫃檯不能保證會受理。':'')+'未領到執業執照前，不得以該專業身分執業；受僱、報到與是否能執行法定專業業務是不同問題。']);
 }
 const title=company&&selected.length?'同業公司入會與專業人員執業，要分開看':company?'商業同業公會不得任意拒絕符合資格的公司、行號':selected.map(k=>profiles[k].name).join('、')+'：先入公會，再辦執業登記';
 const summary=company&&selected.length?'兩類公會都不能任意拒絕合格申請，但資格與程序不同：商業同業公會看公司、行號資格；專業人員須以本人身分取得會員證明並完成執業登記。':company?'符合區域、實際營業及登記資格的公司、行號，公會不得任意拒絕；依規定不符合或尚未經營該項業務則另行審查。':'必須加入相應公會並領到執業執照；還沒辦妥前，不得執業。具會員資格者，公會不得拒絕入會。';
 return {direct:true,category:'公會入會與執業登記',questionState:{focus:'compound'},title,summary,steps,refs:[...new Map(refs.map(x=>[x.source,x])).values()]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={guildPractice};return;}
root.verifiedGuildPractice=guildPractice;
})(typeof window!=='undefined'?window:globalThis);
