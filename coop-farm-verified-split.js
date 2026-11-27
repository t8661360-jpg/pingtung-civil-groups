(function(root){
'use strict';
// Only join two separately verified answers; never infer which group an unlabeled question refers to.
function route(q,coop,farm){
 if(typeof coop!=='function'||typeof farm!=='function')return null;
 const raw=String(q??'').normalize('NFKC').trim();
 if(raw.length>205||!/合作社/.test(raw)||!/農會/.test(raw)||/漁會|信用合作社|信合社|哪個比較|哪個一樣|只問|不用答|不用回答|不是問/.test(raw))return null;
 const split=raw.replace(/[?！!。；;]\s*$/,'').split(/\s*(?:[?！!。；;]+|[,，]\s*(?:另外(?:也)?|再問|順便問|還想問))\s*/).map(p=>p.trim()).filter(Boolean);
 if(split.length!==2)return null;
 const parts=split.map(t=>/合作社/.test(t)&&!/農會/.test(t)?{kind:'合作社',result:coop(t)}:/農會/.test(t)&&!/合作社/.test(t)?{kind:'農會',result:farm(t)}:null);
 if(parts.some(x=>!x?.result?.direct)||parts[0].kind===parts[1].kind)return null;
 const steps=parts.flatMap(({kind,result:a})=>[[kind+'｜'+a.title,a.summary],...a.steps]);
 const refs=[...new Map(parts.flatMap(({result:a})=>a.refs??[]).map(x=>[x.title+'|'+x.source,x])).values()];
 const fa=parts.find(x=>x.kind==='農會').result;
 return {direct:true,category:'合作社與農會｜分題回答',title:'合作社的簽約代表權，與農會選會員代表，是兩件事',summary:'簽約要查合作社任期與代表權；農會代表怎麼選，要分基層選代表或選派赴上級，兩邊不能用同一套規則。',steps,refs,...(fa.choices?.length?{choiceHeading:'要繼續看哪一種農會代表？',choices:fa.choices}:{}),questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCoopFarmSplit=route;
})(typeof window!=='undefined'?window:globalThis);
