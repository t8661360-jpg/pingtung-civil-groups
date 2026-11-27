(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n);
const refs=[p(12),p(16),p(17),p(27),law('人民團體會務輔導辦法','D0020094',10),{title:'新竹市政府章程草案範例：僅供對照，不是貴會章程',source:'https://society.hccg.gov.tw/uploaddowndoc?file=downloadfile%2F202203151555370.pdf&filedisplay=%E7%AB%A0%E7%A8%8B%E8%8D%89%E6%A1%88.pdf&flag=pdf'}];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/贊助會員/.test(t)||!/表決|投票|修章|改章程|選理事|選監事|選舉|參選|被選/.test(t)||/公會|工會|合作社|農會|漁會|財團法人|運動總會|公務人員協會|離職|退費|轉(?:為|成)?(?:正式|一般)會員|強制捐款|有無違法/.test(t))return null;
 const scope=/一般協會|社會團體|協會|社團/.test(t);
 if(!scope)return null;
 const ord=/已依法取得(?:一般|正式)會員資格|已依法是(?:一般|正式)會員/.test(t)&&!/還沒|未取得|不確定/.test(t);
 const denied=!ord&&/章程.{0,20}(?:無|不具|沒有)(?:表決(?:權)?|投票(?:權)?).{0,22}選舉.{0,12}被選舉/.test(t)&&!/不確定|不知道|沒寫清楚|有無|是否寫/.test(t);
 const wantAmend=/修章|(?:改|修|變更)章程|章程.{0,5}(?:修正|變更)/.test(t);
 const wantElect=/選理事|選監事|選舉|參選|被選/.test(t);
 const steps=[
  ['看權利條文和正式名冊，不是只看「可以收」','人民團體法第12條要求章程載明會員資格、入出會及權利義務；第16條保障依法有權的會員（代表）之表決、選舉、被選舉及罷免權。請拿現行核備章程，核對該人取得的會員類別及權利條款，再確認大會前由理事會審定的名冊。一般政府章程範例會另列不具上述權利的贊助類別，但範例不代替貴會章程。'],
  ...(wantAmend?[['修章是表決權','若只有贊助資格且章程明定贊助會員不具表決權，就不能投這一票，不可把他當有該項權利的應出席或投票人員。一般人民團體修章依第27條，應有會員（代表）過半數出席、出席人數三分之二以上同意；不能用出錢多少決定票數。']]:[]),
  ...(wantElect?[['投票選理事和自己參選分開看','選別人是選舉權，自己當候選人涉及被選舉權。第16、17條及選舉名冊是核對依據；若只有贊助資格且章程明定這些權利均不具備，就不能投理監事選票，也不能以該資格參選。若已依法另具正式會員資格，按該資格及名冊判斷。']]:[])
 ];
 if(!denied&&!ord)steps.push(['沒有權利條文，先別把票算進去','若章程只寫可收贊助會員，沒寫表決、選舉或被選舉權，或權利條款相互矛盾，先向主管機關查明會籍和章程適用，不要猜有票，也不能僅因名稱就剝奪原有的正式會員權利。']);
 const repeat='，可以投票'+(wantAmend?'修改章程':'')+(wantElect?(wantAmend?'或選理事':'選理事'):'')+'嗎？';
 return {direct:true,category:'人民團體會務｜贊助會員權利',title:'能收贊助會員，不等於可以表決或選理事',summary:denied?'若確定只有贊助會員身分，且現行章程明定無相關權利，就不能以該身分修章表決、投選舉票或參選。':ord?'已依法取得正式會員資格者，按正式會員的權利與審定名冊判斷，不因同時有贊助紀錄就喪失權利。':'先看現行章程的會員權利條文，以及本人屬於哪一類。只確定可以收贊助會員，還不能確定能不能投票。',
  steps,refs,questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}],...(!denied&&!ord?{choiceHeading:'章程和會籍上是哪一種情況？',choices:[{label:'明定無表決、選舉及被選舉權',question:'一般協會章程明載贊助會員無表決與選舉及被選舉權'+repeat},{label:'已另有正式會員資格',question:'一般協會有人也贊助，章程寫贊助會員，但本人已依法取得正式會員資格'+repeat}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationSponsorBallot=route;
})(typeof window!=='undefined'?window:globalThis);
