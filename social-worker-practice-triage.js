(function(root){
'use strict';
const law=(n,label)=>({title:'社會工作師法第'+n+'條：'+label,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050125&flno='+n});
const refs={license:law(9,'證書與執業登記'),move:law(11,'變更行政區域'),practice:law(12,'專業執業範圍'),place:law(13,'一處原則與支援例外'),secret:law(15,'專業保密'),records:law(16,'紀錄保存'),office:law(21,'事務所許可'),name:law(24,'事務所名稱'),fees:law(25,'事務所收費'),guild:law(31,'加入公會後始得執業'),adjacent:law(33,'鄰近公會例外')};
const change={title:'衛福部 114 年跨縣市變更執業及執照效期函釋',source:'https://www.mohw.gov.tw/dl-97054-487ad221-b05d-4606-859f-0b9e6cd8d2f2.html'};
const help={title:'衛福部社會工作師執業指引手冊',source:'https://dep.mohw.gov.tw/dosaasw/cp-544-82754-103.html'};
const support={title:'衛福部衛部救字第1121361590號函說明四：支援報備',source:'https://www.mohw.gov.tw/dl-85944-1cdc2094-4cc4-4da5-abfe-26205c55943f.html'};
const types=[['first','首次執業登記'],['support','原單位安排跨縣市支援'],['move','主要執業地改到另一縣市'],['unknown','尚未確定如何安排']];
const guild=['公會是執業所在地，不是戶籍地','依法執業須加入社工師公會，原則申請執業所在地公會；所在地無公會才核對鄰近區域例外。單純合法支援通常不會改變主要執業地，也不因支援當然轉會。'];
const supportStep=['真正的機關或團體間支援','先由原執業單位與受援單位確認工作內容與期間。依衛福部函說明四，支援起日後 30 日內向主管機關辦支援報備，載明起訖；每次最長一年，需延續則屆滿前重報。跨縣市應同時副知受援地主管機關。只通知協會不等於完成報備。若不是機關或團體間支援而要用另一例外，應事先報准。'];
const first=['社工師證書不等於執業執照','先確認工作是否屬第 12 條社工師業務及受聘單位是否符合執業登記要求；取得相應公會會籍證明，向工作所在地的縣市主管機關申請登記並領執業執照，才能以社工師身分執業。'];
const privacy=['個案紀錄由執業單位保存','社工師執業應撰製紀錄，執業機關、團體或事務所依法至少保存 7 年；因業務持有的秘密不得無故洩漏。不能把整套可辨識個案紀錄給未獲授權的志工或公開群組。依工作必要及合法授權控管存取，不在小屏貼個案名冊或服務紀錄。'];
const office=['據點聘用社工師不等於開業為事務所','非依法設立的社工師事務所不得以「社會工作師事務所」或類似名義對外。事務所另由具法定業務年資（至少 5 年且有工作證明）的社工師向所在地主管機關申請開業許可；事務所的費用及收據有另定規則，不能賦予協會同一資格。'];
const build=(title,summary,steps,refs,extra={})=>({direct:true,category:'專業公會｜社會工作師執業',title,summary,steps,refs,questionState:{focus:'cross-social-work-practice'},...extra});
function route(q,active=false){
 const raw=String(q??'').trim(),t=raw.normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>490||/^(?:另問|新題|換題)|(?:不是|並非)(?:社會工作師|社工師)[，,是]/.test(t))return null;
 const who=/社會工作師|社工師/.test(t);
 const next=/^(?:補充|更正|不是|其實|如果|那|還有)/.test(t);
 const topic=/執業|支援|報准|改登記|執照|重新入|公會|個案處遇|專業紀錄|事務所/.test(t);
 const pick=t.match(/;櫃檯確認社工執業:(first|support|move|unknown)$/)?.[1];
 if(!pick&&(!topic||!who&&!(active&&next)))return null;
 const provider=/協會|團體|據點/.test(t)&&/聘|個案處遇|個案紀錄|保存紀錄|志工/.test(t)&&(/個案.{0,12}(?:紀錄|處遇)|事務所.{0,12}(?:名義|收費)|尚未辦執業|未登記/.test(t));
 const isMove=/(?:變更|改到|改成|轉到|搬到|遷移).{0,12}(?:主要執業|執業地|行政區域|縣市)|主要執業.{0,10}(?:改|搬|遷|變更)|遷移.{0,14}(?:執業|執照|公會)/.test(t);
 const isSupport=/偶爾.{0,15}支援|(?:機關|團體|原單位).{0,12}(?:間)?支援|支援個案|跨縣.{0,8}支援|支援報備/.test(t)&&!/不是.{0,8}(?:短期支援|支援個案)/.test(t);
 const isDual=/兩邊|兼職|第二(?:個|處)|固定工作|每週.{0,16}幾天|同時.{0,7}(?:執業|留著)/.test(t);
 const unknown=/不確定|還未決定|還沒決定|分不清|可以選|要怎麼選|哪一種|讓我選/.test(t);
 const isFirst=/首次|初次|尚未辦執業|沒有執業執照|剛領證|新領證/.test(t);
 if(!pick&&!provider&&!isMove&&!isSupport&&!isDual&&!isFirst&&!unknown)return null;
 if(pick==='unknown'||(!pick&&unknown&&!provider&&(!isMove&&!isSupport||/還沒決定|分不清/.test(t)))){
  const base=raw.replace(/[;；]櫃檯確認社工執業:[a-z]+$/i,'');
  return build('先分首次登記、臨時支援，還是變更主要執業地','社工師原則只能在一處執業；支援或主要執業地變更的程序不同。您可以選接近的情況，不用提供個案資料。',[],[refs.license,refs.place,help],{choiceHeading:'您是哪一種安排？',choices:types.map(([id,label])=>({label,question:base+'；櫃檯確認社工執業:'+id}))});
 }
 if(!pick&&provider)return build('協會聘社工師、安排支援及保存個案紀錄要分開','領證但未辦妥執業登記者，不能先以社工師身分辦理專業個案處遇；從外縣市來的人要核是否為依法支援。協會不是事務所，不能用事務所名義收費。',[first,guild,supportStep,privacy,office],[refs.license,refs.practice,refs.place,refs.guild,refs.secret,refs.records,refs.office,refs.name,refs.fees,support,help]);
 if(pick==='support'||!pick&&isSupport)return build('短期跨縣市支援：先區分事後報備與事先報准','真正的機關或團體間支援，不必為了支援改主要執業地；須依規定報備。若不屬機關或團體間支援，不能自行用事後報備代替事先報准。',[supportStep,guild,['不透露個案資料','準備支援單位、起訖和工作範圍並向主管機關核實表單，不用在小屏提供姓名、證號或個案內容。']],[refs.place,support,refs.guild,help]);
 if(pick==='move'||!pick&&isMove)return build('主要執業地改到另一縣市：原機關備查、新地重辦','真正把主要執業地改到另一個縣市，並非兩邊各保留一張正常執業執照。安排到職前可先確認兩地受理文件與公會轉入程序。',[
  ['原發照機關備查、新所在地申請','依第 11 條與衛福部函，自新單位到職日起 30 日內向原發照機關報變更，並依第 9 條向新所在地主管機關辦執業登記。舊照由原機關註銷並副知新地；不要等辦完才詢問另一地文件或讓期限過去。'],guild,
  ['登記完成與生效日分開','新照經核發後，符合函釋且期限內申請，效期可自新單位到職日起至原應更新日；逾期則自核定日起。這不等於未核發可先自行執業，請向兩地主管機關核對銜接。']
 ],[refs.license,refs.move,refs.place,change,refs.guild,help]);
 if(pick==='first'||!pick&&isFirst)return build('首次執業：加入所在地公會並申請執業執照','先區分領有社工師證書和依法以社工師身分執業。具證書仍須辦妥公會會籍與執業登記。',[guild,first],[refs.license,refs.practice,refs.guild,refs.adjacent,help]);
 return build('兩邊固定工作：不能把第二處自行當支援','社工師執業原則以一處為限。同時接受另一單位排班，不等於有受援資格；每週工作幾天不是唯一判準。',[supportStep,guild,['如果實際已搬遷','若主要執業地確定改到另一縣市，依跨區變更向兩地主管機關辦，不是另留一張正常執業照。']],[refs.place,refs.move,support,change,refs.guild,help]);
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedSocialWorkerPracticeTriage=route;
})(typeof window!=='undefined'?window:globalThis);
