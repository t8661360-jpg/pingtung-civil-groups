(function(root){
'use strict';
const exec={title:'行政執行法第9、11、14、24、42條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030023'};
const penalty={title:'行政罰法第15、16條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030210'};
const faq={title:'行政執行署屏東分署：常見問題',source:'https://www.pty.moj.gov.tw/259660/259692/259740/259741/Lpsimplelist'};
const moi={title:'法務部：公法上金錢給付的義務人與執行（法務部函）',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE324625&type=E'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>430||/^(?:新題|另問|另外問)|(?:不(?:是|談)|並非)(?:行政)?(?:罰鍰|罰款|裁罰)|違約金|刑事罰金|法院判刑|合作社|公會|工會|工廠|股東|農會|漁會/.test(t))return null;
 const pick=t.match(/;櫃檯確認罰單對象:(group|person|unknown)$/)?.[1];
 const b=t.replace(/;櫃檯確認罰單對象:[a-z]+$/,'');
 if(!/協會|社團法人|社會團體|人民團體/.test(b)||!/(?:罰鍰|罰款|裁罰|被罰|處分書|受處分人|執行分署|執行署|行政執行)/.test(b))return null;
 if(!pick&&!/(?:個人|自己|本人|理事長|負責人|代表人|執行署|行政執行|沒繳|未繳)/.test(b))return null;
 const anyPerson=/(?:另列|另對|也罰|也裁罰|同時裁罰|另.{0,5}罰)(?:我|本人|理事長|負責人|代表人|個人)|重大過失/.test(b);
 const group=/(?:只|僅)(?:罰|列|寫|處罰|處分|裁罰)(?:本會|協會|社團法人|團體)|(?:受處分人|義務人)(?:欄)?(?:只|僅)?(?:是|寫|列)(?:本會|協會|社團法人|團體)/.test(b);
 const unknown=/(?:不知道|不確定|看不懂).{0,28}(?:處分書|個人|協會|義務人|受處分人)|(?:誰|哪裡).{0,5}(?:罰|繳)/.test(b);
 const late=/逾期|未繳|沒繳|不繳|執行署|行政執行|扣款|帳(?:戶|號)|扣我|被扣/.test(b);
 const result=(title,summary,steps=[],refs=[exec,penalty])=>({direct:true,category:'協會｜行政罰鍰及執行',title,summary,steps,refs,...(pick?{questionState:{focus:'cross-association-fine-recipient'}}:{})});
 const roles=['先看主文，不看信封收件人','核對處分書的受處分人、罰鍰主文、金額及救濟教示；收件人是理事長，可能只是依法代表協會收文。行政執行文件另看「義務人」。請不要在這裡貼姓名、證號、帳號或完整公文。'];
 const cooperation=['代表人可能要到場或說明協會財產','執行分署依法通知到場、提出資料或報告團體財產，應按通知期限處理；行政執行法第14、24條的程序義務，不等於理事長要用個人財產替協會繳款。'];
 const statement=['先看是否真的另有一筆個人罰鍰','有時姓名只是代表人欄，不是裁罰對象；若主文確有另對個人的金額或法律依據，它可能是另一筆裁罰，不是替協會代繳。行政罰法第15、16條在符合要件時可另裁罰有代表權的人。本人因故意或重大過失使團體違規，或對受僱人等違規故意或重大過失未盡防止義務，才可能適用；另須查有無特別法。不因單任理事長就當然成立。'];
 const lateStep=['逾期移送與救濟分開','公法罰鍰逾期且符合法定移送要件，由行政執行分署就義務人財產執行（第11條）；行政執行法第42條排除舊的公法金錢給付移送法院規定。原處分內容、金額或救濟請先向裁罰機關查詢，執行措施向通知的分署查詢。若個人帳戶已遭執行而不認同，請立即核對名義並向該分署詢問依第9條聲明異議；不要等回覆才查看其他救濟期限。'];
 if(pick==='group'||!pick&&group&&!unknown&&!anyPerson)return result('只裁罰協會，理事長不會只因身分就要自掏腰包','若協會才是義務人，沒有另對理事長的裁罰或其他獨立責任依據，原則只能執行協會財產，不能只因他是理事長就扣他個人所有的帳戶。',[roles,cooperation,...(late?[lateStep]:[])],[exec,penalty,moi,faq]);
 if(pick==='person'||!pick&&anyPerson&&!unknown)return result('協會罰鍰和另列個人的罰鍰，要看是不是兩筆裁罰','請看主文是只處罰協會並列理事長為代表人，還是確實另外處罰自然人。兩者不同，不能只看名字欄就認定要個人負責。',[roles,statement,...(late?[lateStep]:[])],[exec,penalty,faq]);
 if(pick==='unknown')return result('先辨認「受處分人」和「義務人」欄，再決定向哪邊查','找不到欄位或文件互相矛盾時，以通知及處分書所載的聯絡方式向原機關或執行分署核對，不猜由誰繳。',[roles,cooperation,lateStep],[exec,penalty,faq]);
 return {...result('協會被罰，先看處分書究竟罰誰','如果只處罰協會，不會只因理事長身分就扣他的個人財產；如果另對他個人裁罰，要另看那筆處分。收到執行通知也不要不理。',[roles]),choiceHeading:'處分書「受處分人」欄列誰？',choices:[['只列協會','group'],['也另對個人裁罰','person'],['不確定列誰','unknown']].map(([label,c])=>({label,question:String(q??'')+'；櫃檯確認罰單對象:'+c}))};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationFineLiability=route;
})(typeof window!=='undefined'?window:globalThis);
