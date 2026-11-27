(function(root){
'use strict';
const units='零一二三四五六七八九';
const digits='[0-9零〇一二兩三四五六七八九十]{1,3}';
function value(x){
 if(!x)return null;if(/^\d+$/.test(x))return +x;
 x=x.replaceAll('兩','二').replaceAll('〇','零');
 if(x.includes('十')){const [a,b]=x.split('十');return (a?units.indexOf(a):1)*10+(b?units.indexOf(b):0);}
 return x.length===1?units.indexOf(x):null;
}
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
function chairVote(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>185||/合作社|社員|信合社|農會|漁會|工會|公會|公司|股東|管委會|區分所有權|罷免/.test(t))return null;
 const chair=/主席|理事長/.test(t), board=/理事會|理監事聯席/.test(t);
 const tie=/可否同數|同票|平手|票數(?:相等|一樣|相同)|(?:同意|贊成)票.{0,8}(?:一樣|相同)|[0-9一二兩三四五六七八九十]+票(?:比|對)[0-9一二兩三四五六七八九十]+票|[0-9一二兩三四五六七八九十]+票(?:同意|贊成)[^。]{0,8}(?:反對|不同意)/.test(t);
 const wants=/不投|沒投|要投|投一票|投票權|再投|補投|表決權|同數時誰決定|平手怎麼辦|票怎麼算/.test(t);
 const election=/互選理事長|改選理事長|選舉理事長|選理事長|(?:理事|監事)選舉/.test(t);
 const ordinary=/一般議案|一般提案|普通議案|決議|支出|表決案/.test(t);
 const meetings={title:'內政部《會議規範》第19、58條',source:'https://ws.moi.gov.tw/001/Upload/OldFile/civil_law_file/%E6%9C%83%E8%AD%B0%E8%A6%8F%E7%AF%84.pdf'};
 const adoption={title:'內政部：團體議事規則與採用《會議規範》',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256736'};
 const hierarchy={title:'內政部：《人民團體法》第29條優先於《會議規範》',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256686&sms=12360'};
 const electionSource=law('人民團體選舉罷免辦法','D0050093',15);
 const elec=['選舉理事長同票不是一般議案平手','依人民團體選舉罷免辦法第15條，選舉同票採抽籤，不是由主席補投一票。當選人不在場，或唱名三次仍不抽籤，才由會議主席或主持人代為抽定。'];
 if(election&&tie&&!ordinary)return {direct:true,category:'人民團體選舉',title:'理事長選舉同票：抽籤，不由主席補投',summary:'互選理事長同票時，按選舉規定抽籤，不是一般議案的表決規則。',steps:[elec],refs:[electionSource,law('人民團體法','D0050091',17)]};
 if(!chair||!(board||ordinary||(tie&&/已(?:經)?(?:投|算在)|再投|加投/.test(t)))||(!tie&&!wants))return null;
 const already=/(?:已經|已|先).{0,5}(?:投了|投票|算在(?:同意|贊成|反對)票|投(?:同意|贊成|反對))/.test(t);
 const absent=/(?:還|尚)?(?:沒|未)投|不投票|不參與表決/.test(t)&&!already;
 const present=value(t.match(new RegExp('理事會(?:開會)?('+digits+')人出席|('+digits+')人(?:實際)?出席'))?.slice(1).find(Boolean));
 const total=value(t.match(new RegExp('(?:共|總共|有)?('+digits+')名(?:現任)?理事'))?.[1]);
 const votes=t.match(new RegExp('('+digits+')票(?:贊成|同意)[，,、]?('+digits+')票(?:反對|不同意)'))||t.match(new RegExp('('+digits+')票(?:比|對)('+digits+')票'));
 const yes=votes?value(votes[1]):null,no=votes?value(votes[2]):null;
 const needed=present?Math.floor(present/2)+1:null;
 const sample=present&&yes!==null&&yes===no&&yes>0&&yes+no<=present&&(!total||present<=total)?[
  '用您提供的票數看',
  (total&&present<=Math.floor(total/2)?'本例只出席'+present+'人，連理事過半數的出席門檻都沒到，不能作成決議。':'按一般二選一議案的過半門檻，出席'+present+'人至少需'+needed+'票同意；目前'+yes+'票同意、'+no+'票反對，沒有過半。'+(absent&&yes+no<present?'若主席有權投且適用規則准許其投票，加一票後是'+(yes+1)+'票'+(yes+1>=needed?'，才達過半。':'，仍未達過半。'):''))]:null;
 return {direct:true,category:'人民團體會務說明',questionState:{focus:'compound'},
 title:already?'理事長已投票，不能再投第二票破平手':'理事會一般議案：主席是否投票與同票門檻分開看',
 summary:already?'不能。已投過一票的主席，不得再因平手加投第二票；仍以合法票數與適用門檻判定。':'平手不等於通過，主席也不必然有決定票。先看章程或採用的議事規則，且最後仍須符合《人民團體法》第29條的出席及同意門檻。',
 steps:[
  ['主席不投票與同數的處理','若團體已有效採用內政部《會議規範》，第19條原則上主席不參與表決。一般議案可否同數時，尚未投票且具投票資格的主席，可依該規範投同意一票，或不投；若不投，依第58條為否決。這不是每個協會自動適用的規則，也不是第二票的權利。'],
  ['法律門檻不能用議事規則取代','人民團體法第29條要求理事過半數出席，再依議案適用出席人數過半數或較多數的同意規則。同意與反對平手不能直接算通過；適用過半時，即使依規則加了一票，還是要重新確認同意票是否超過實際出席人數半數。有特別法定門檻則從其規定。'],
  ...(sample?[sample]:[]),
  ...(election?[elec]:[])
 ],refs:[law('人民團體法','D0050091',29),meetings,adoption,hierarchy,...(election?[electionSource]:[])]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={chairVote};return;}
root.verifiedAssociationChairVote=chairVote;
})(typeof window!=='undefined'?window:globalThis);
