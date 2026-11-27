(function(root){
'use strict';
const ref=n=>({title:'地政士法第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0060081&flno='+n});
const landForms={title:'地政士法施行細則第4條：開業登記文件',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0060082&flno=4'};
const med=(title,code,n)=>({title:title+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function both(t){
 if(!/地政士/.test(t)||!/醫師|醫生/.test(t)||!/執業|執登|開業|登記/.test(t)||!/先|後|誰|順序|一樣|分別|比較|不同/.test(t)||!/入會|公會|會員證明/.test(t))return null;
 if(/中醫師|牙醫師|獸醫師|醫師公會的理事|兼職|同一人|雙重|兼任|懲戒|歇業|換照|拒絕|註銷|診所開業|開診所|護理師|律師|會計師/.test(t))return null;
 return {direct:true,category:'職業團體｜醫師與地政士執業順序',title:'醫師先備公會證明；地政士先辦開業登記',
 summary:'兩種專業都不能只拿考試或專業證書就執業，但公會證明在申辦流程的位置不同。',
 steps:[['醫師：先取得所在地醫師公會會員證明','依醫師法第8、9條及醫事人員執業登記及繼續教育辦法第4條第5款，執業登記要附所在地醫事人員公會會員證明；備妥其他文件後向執業所在地衛生主管機關申請，領到執業執照才能執業。'],
 ['地政士：先辦開業登記、領照；實際執業前須加入該管公會','依地政士法第7、33條及施行細則第4條，持地政士證書向事務所所在地直轄市或縣（市）地政主管機關申請開業登記和執照，該條規定的文件不是醫師那套公會會員證明。登記後須加入該管地政士公會才能執業；所在地公會尚未成立前，另有第33條例外。']],
 refs:[ref(7),ref(33),landForms,med('醫師法','L0020001',8),med('醫師法','L0020001',9),med('醫事人員執業登記及繼續教育辦法','L0020181',4)],questionState:{focus:'compound'}};
}
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 const paired=t.length<=185?both(t):null;
 if(paired)return paired;
 if(!t||t.length>185||!/地政士|代書(?:的)?公會/.test(t)||!/加入|入會|公會|執業|開業執照|開業登記/.test(t)||!/一定|可以|要不要|何時|怎麼|如何|哪裡|去哪|先|後|拒絕|被拒|不加入|沒加入|未加入|須|需要|規定|能否|能不能/.test(t))return null;
 if(/委託.{0,8}(?:地政士|代書)|代辦|過戶|受贈|財產移轉|會址|社員|合作社|工會|律師|會計師|醫師|護理師|建築師|工商公會|商業同業|換照|展延|換發|考試資格|懲戒|理事長|罷免|監事/.test(t))return null;
 const rejected=/拒絕|拒收|被拒|不讓加入/.test(t);
 const begin=/怎麼執業|如何執業|申請開業|開業執照|登記|證書|去哪|哪裡/.test(t);
 const refs=[ref(33),...(begin?[ref(3),ref(5),ref(7)]:[])];
 return {direct:true,category:'職業團體｜地政士登記與入會',title:'地政士登記後，原則須加入所在地公會才能執業',
  summary:rejected?'地政士公會依法不得拒絕地政士入會。遭所在地公會拒絕時，經人民團體主管機關認定會員資格後，法律視同已入會。':'要。依地政士法第33條，地政士登記後，沒加入該管直轄市或縣（市）地政士公會不得執業；當地公會尚未成立前有例外。',
  steps:[...(begin?[['證書、開業登記、入會是三件事','考試及格後向內政部申請地政士證書；未領證書不能執業。向直轄市或縣（市）地政主管機關申請登記及開業執照，並依第33條加入該管公會後才開始執業。若要在屏東開業，向屏東縣政府地政業務單位確認送件，不是向社會團體櫃檯辦開業執照。']]:[]),
  ['所在地公會不得拒絕入會','依同條第2、3項，如遭該公會拒絕，留存申請與拒件紀錄，請人民團體主管機關認定會員資格；認定後才視同已入會，不是可直接無會籍執業。'],
  ['例外只適用於所在地公會尚未成立','同條第4項有例外。不要套成「先入會才能辦執業登記」的其他職業程序，也不是用商業同業公會的開業後一個月規則。']],
  refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedLandAgentGuildPractice=route;
})(typeof window!=='undefined'?window:globalThis);
