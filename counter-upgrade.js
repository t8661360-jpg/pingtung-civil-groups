/* Public counter: cooperative directory, forms and readable knowledge search. */
const COOP_CATEGORIES=['籌組','成立登記','變更登記','決算與年度社務','各項會議','相關書表與選舉','解散清算'];
let coopCatalog=[];
function plainText(text){
  let s=String(text||'');
  const main=s.match(/【(?:規定內容與白話解釋|詳細說明與辦理指引)】\s*([\s\S]*?)(?=【如何實際使用|【櫃檯可以|【法規與資料|$)/);
  if(main)s=main[1];
  return s.replace(/\[(?:[A-Z]+[\d_][A-Z\d_-]*)\]/g,'').replace(/【[^】]*】/g,'').replace(/(?:依據：[A-Z\d_、； -]+；查核：[^。]+。)/g,'').replace(/\b(?:LAW|HX|LA)_[A-Z\d_]+\b/g,'').trim();
}
function readable(text){
  return plainText(text).split(/\n+|(?<=[。！？])\s*/).map(s=>s.trim()).filter(Boolean).map(s=>`<p>${esc(s)}</p>`).join('');
}
function sourceLinks(source){return [...new Set(String(source||'').match(/https?:\/\/[^\s|]+/g)||[])].filter(u=>{try{return ['https:','http:'].includes(new URL(u).protocol)}catch{return false}}).map((u,i)=>`<a target="_blank" rel="noopener" href="${esc(u)}">${i?'相關依據':'查閱原始資料'} ↗</a>`).join('　')}
let statuteData={laws:{}},statutePromise=null;
async function loadStatutes(){
 if(!statutePromise)statutePromise=(async()=>{const response=await fetch('data/statutes.json.gz?v=20261105-1');if(!response.ok)throw Error('法條原文讀取失敗');const bytes=new Uint8Array(await response.arrayBuffer());let text;if(bytes[0]===31&&bytes[1]===139){text=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}else text=new TextDecoder().decode(bytes);statuteData=JSON.parse(text)})().catch(error=>{console.warn(error);statutePromise=null});
 return statutePromise;
}
function statuteFor(row){
 if(!row)return null;const code=String(row.source||'').match(/pcode=([A-Z0-9]+)/);const number=String(row.title||'').match(/第\s*(\d+(?:-\d+)?)\s*條/);if(!code||!number)return null;
 const law=statuteData.laws[code[1]];if(!law||!law.articles[number[1]]||!norm(row.title).startsWith(norm(law.name)))return null;
 return {...law,number:number[1],text:law.articles[number[1]],url:`https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=${code[1]}&flno=${number[1]}`};
}
function originalLawBlock(row){
 const original=statuteFor(row);
 if(!original)return '<section class="statute-original"><h3>法條原文</h3><p>這則資料的條文原文尚未完成對應，請先查閱官方原文。</p><p>'+sourceLinks(row&&row.source)+'</p></section>';
 return `<section class="statute-original"><h3>法條原文</h3><p class="statute-caption">${esc(original.name)} 第${esc(original.number)}條</p><div class="statute-text">${esc(original.text)}</div><p class="statute-version">${esc(original.modified||'版本日期請見官方來源')}｜原文核對：${esc(original.verifiedAt)}</p><a href="${esc(original.url)}" target="_blank" rel="noopener">查閱官方本條原文 ↗</a></section>`;
}
function knowledgeCard(r){return `<details class="plain-card"><summary>${esc(r.title.replaceAll('白話說明','法規說明'))}<small>${esc(r.cat==='正式函釋索引'?'函釋資料與現行對照':r.cat==='逐條法規白話導讀'?'法規導讀':'實務問題說明')}</small></summary><div class="plain-content">${r.cat==='逐條法規白話導讀'?originalLawBlock(r):''}<h3>法規說明</h3>${readable(r.text)}<details><summary>資料來源與適用提醒</summary><p>${sourceLinks(r.source)}</p><p>資料日期：${esc(r.date||'未標示')}。這是輔助說明，個案應核對現行法規、章程與原函適用情況。</p>${r.review?`<p>${esc(r.review)}</p>`:''}</details></div></details>`}
const COOP_RULING={title:'合作社社員大會通過的決議，一定有效嗎？',cat:'正式函釋索引',date:'2014-12-17',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?etype=etype5&id=FE274576&keyword=&type=E',text:'法務部法律字第10303514440號函說明：決議即使經社員大會表決通過，也不能違反法律的強制或禁止規定。\n本函針對消費合作社分配盈餘的個案表示：如果主管機關認定相關規定屬強制規定，且該分配決議違反規定，決議就可能無效。\n對民眾來說，投票通過不等於合法。遇到盈餘分配或追繳爭議，應把決議、交易及主管機關文件一併交給承辦人確認。\n本函討論的是特定歷史案件；不能直接推論所有分配決議都無效，仍須核對現行規定與個案事實。'};
const baseLoadAll=loadAll;
function articleRows(q){
  const match=String(q).normalize('NFKC').match(/([\u4e00-\u9fff]+(?:法|辦法|細則|準則))第\s*(\d+(?:-\d+)?)\s*條/);
  if(!match)return[];
  const law=match[1].replace(/^(請問|查詢|查一下|說明|解釋)/,'');const key=norm(law+'第'+match[2]+'條');
  return STORE.kn.rows.filter(row=>norm(row.title).startsWith(key));
}
let lastQuestionContext=null;
function clarifyIncompleteQuestion(q){
 const text=String(q||'').normalize('NFKC').replace(/\s+/g,'').replace(/[？?。！!，,]/g,'');
 if(/(?:\u5973\u6027|\u7537\u6027|\u5973\u6027\u5225|\u7537\u6027\u5225)/.test(text)&&/(?:\u5718\u9ad4|\u793e\u5718|\u5354\u6703|\u5408\u4f5c\u793e)/.test(text)&&/(?:\u8ca0\u8cac\u4eba|\u7406\u4e8b\u9577|\u7406\u4e8b\u4e3b\u5e2d)/.test(text)&&/(?:\u5e7e\u500b|\u5e7e\u4f4d|\u591a\u5c11|\u6578\u91cf|\u7d71\u8a08|\u540d\u55ae)/.test(text))return {category:'\u78ba\u8a8d\u554f\u984c',title:'\u8acb\u78ba\u8a8d\u67e5\u8a62\u689d\u4ef6',summary:'\u60a8\u662f\u60f3\u67e5\u8a62\u300c\u5973\u6027\u6216\u7537\u6027\u64d4\u4efb\u8ca0\u8cac\u4eba\u7684\u4eba\u6578\u300d\uff0c\u9084\u662f\u300c\u5a66\u5973\u985e\u5718\u9ad4\u53ca\u5176\u8ca0\u8cac\u4eba\u300d\uff1f\u672c\u7ad9\u73fe\u6709\u540d\u518a\u6c92\u6709\u8ca0\u8cac\u4eba\u6027\u5225\u6b04\u4f4d\uff0c\u7121\u6cd5\u64da\u59d3\u540d\u5224\u5b9a\u6027\u5225\u6216\u7d71\u8a08\u6027\u5225\u4eba\u6578\u3002\u8acb\u88dc\u5145\u5718\u9ad4\u985e\u578b\u8207\u5730\u5340\uff1b\u82e5\u9700\u6027\u5225\u7d71\u8a08\uff0c\u8acb\u6d3d\u627f\u8fa6\u4eba\u78ba\u8a8d\u662f\u5426\u6709\u53ef\u7528\u8cc7\u6599\u3002',notes:[],actions:[{label:'\u806f\u7d61\u627f\u8fa6',view:'contact',sub:''}]};
 if(/^(?:請問|查詢|查|想問)?(?:屏東縣)?(?:[一-鿿]{2,4}[鄉鎮市])?(?:男性|女性|婦女|男性團體|婦女團體|女性團體|男性社團|婦女社團|女性社團)(?:的|之)?(?:負責人|理事長|名單)?$/.test(text))return {category:'確認問題',title:'您想查詢哪一項團體資料？',summary:'您想查詢特定地區的團體名單、某個團體的負責人，還是擔任負責人的資格？請補充您的需求；若查詢特定團體，請提供名稱。',notes:[],actions:[{label:'查詢團體',view:'search',sub:''}]};
 const topic=text.replace(/^(?:請問|我想問|想問|我要查|查詢|查)/,'');
 const topics={改選:'想了解改選時間、流程、文件，還是延期規定？請補充團體類型。',任期:'想了解哪個職務的任期？請說明團體類型。',負責人:'想查詢特定團體負責人，還是了解資格或變更程序？',理事長:'想了解任期、連任、資格、改選或變更？若查特定團體，請提供名稱。',開會:'想了解哪種會議的時間、通知、出席人數或紀錄？請補充團體類型。',補助:'想了解哪項補助的資格、期限、文件或核銷？請提供補助名稱。',法規:'請提供法規名稱、條號或想了解的業務，以及團體類型。',合作社:'想了解成立、改選、會議、書表下載，還是查詢合作社資料？',協會:'想了解成立、改選、會議、法規、書表，還是查詢團體資料？'};
 const key=/^(?:\u4eba\u6c11\u5718\u9ad4|\u793e\u6703\u5718\u9ad4|\u5718\u9ad4|\u793e\u5718|\u5354\u6703|\u5408\u4f5c\u793e)(?:\u7684)?\u8ca0\u8cac\u4eba$/.test(topic)?'\u8ca0\u8cac\u4eba':topic;
 if(Object.prototype.hasOwnProperty.call(topics,key))return {category:'確認問題',title:'請再告訴我您的需求',summary:topics[key],notes:[],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 return null;
}
const TAX_OFFICES=[["\u5c4f\u6771\u5206\u5c40","\u5c4f\u6771\u7e23\u5c4f\u6771\u5e02\u5317\u8208\u885755\u865f","08-7311166","\u5c4f\u6771\u5e02 \u4e5d\u5982\u9109 \u91cc\u6e2f\u9109 \u9ad8\u6a39\u9109 \u9e7d\u57d4\u9109 \u9577\u6cbb\u9109 \u9e9f\u6d1b\u9109 \u842c\u4e39\u9109 \u746a\u5bb6\u9109 \u4e09\u5730\u9580\u9109 \u9727\u81fa\u9109"],["\u6771\u6e2f\u7a3d\u5fb5\u6240","\u5c4f\u6771\u7e23\u6771\u6e2f\u93ae\u65b0\u751f\u4e8c\u8def16\u865f","08-8330132","\u6771\u6e2f\u93ae \u65b0\u5712\u9109 \u5d01\u9802\u9109 \u5357\u5dde\u9109 \u7409\u7403\u9109 \u6797\u908a\u9109 \u4f73\u51ac\u9109"],["\u6f6e\u5dde\u7a3d\u5fb5\u6240","\u5c4f\u6771\u7e23\u6f6e\u5dde\u93ae\u6c38\u5eb7\u885766\u865f","08-7899871","\u6f6e\u5dde\u93ae \u5167\u57d4\u9109 \u7af9\u7530\u9109 \u842c\u5dd2\u9109 \u65b0\u57e4\u9109 \u678b\u5bee\u9109 \u4f86\u7fa9\u9109 \u6cf0\u6b66\u9109 \u6625\u65e5\u9109"],["\u6046\u6625\u7a3d\u5fb5\u6240","\u5c4f\u6771\u7e23\u6046\u6625\u93ae\u5357\u9580\u8def98\u865f2\u6a13","08-8892484","\u6046\u6625\u93ae \u8eca\u57ce\u9109 \u678b\u5c71\u9109 \u6eff\u5dde\u9109 \u7261\u4e39\u9109 \u7345\u5b50\u9109"]];
function taxRegistrationAnswer(q){
 const text=String(q||'').normalize('NFKC').replace(/\s+/g,'').replaceAll('\u81fa','\u53f0');
 if(!/(?:\u7d71\u7de8|\u7d71\u4e00\u7de8\u865f)/.test(text)||!/(?:\u7533\u8acb|\u8fa6\u7406|\u8fa6|\u54ea\u88e1|\u4f55\u8655|\u54ea\u88cf|\u600e\u9ebc|\u5982\u4f55|\u53bb\u54ea)/.test(text)||/(?:\u958b\u6236|\u67e5\u7d71\u7de8|\u67e5\u8a62\u7d71\u7de8|\u7d71\u4e00\u7de8\u865f\u662f)/.test(text))return null;
 const all=TAX_OFFICES.flatMap(o=>o[3].split(' '));const matches=all.filter(t=>text.includes(t.replaceAll('\u81fa','\u53f0')));if(!matches.length){const t=townOf(text);if(t)matches.push(t)}
 const selected=TAX_OFFICES.filter(o=>matches.some(t=>o[3].split(' ').includes(t)));
 const office=selected.length?selected.map(o=>"\u82e5\u6703\u5740\u6216\u793e\u5740\u4f4d\u65bc"+matches.filter(t=>o[3].split(' ').includes(t)).join('\u3001')+"\uff0c\u53ef\u6d3d\u5357\u5340\u570b\u7a05\u5c40"+o[0]+"\u3002\u5730\u5740\uff1a"+o[1]+"\uff1b\u96fb\u8a71\uff1a"+o[2]+"\u3002").join('\n'):"\u8acb\u63d0\u4f9b\u5354\u6703\u6703\u5740\u6216\u5408\u4f5c\u793e\u793e\u5740\u6240\u5728\u7684\u5c4f\u6771\u7e23\u9109\u93ae\u5e02\uff0c\u4ee5\u78ba\u8a8d\u570b\u7a05\u8f44\u5340\u3002";
 const people=/(?:\u5354\u6703|\u793e\u6703\u5718\u9ad4|\u4eba\u6c11\u5718\u9ad4|\u793e\u5718|\u793e\u5340)/.test(text);
 const coop=/\u5408\u4f5c\u793e/.test(text);
 const summary=office+(people?'\n'+"\u5354\u6703\u6216\u793e\u5340\u767c\u5c55\u5354\u6703\uff1a\u53ef\u8a62\u554f\u975e\u71df\u5229\u4e8b\u696d\u55ae\u4f4d\u7d71\u4e00\u7de8\u865f\u7684\u7533\u8acb\u65b9\u5f0f\u3002":'')+(coop?'\n'+"\u5408\u4f5c\u793e\uff1a\u8acb\u5148\u5411\u570b\u7a05\u5c40\u78ba\u8a8d\u662f\u5426\u5df2\u6709\u7d71\u7de8\uff0c\u53ca\u662f\u5426\u9700\u8981\u8fa6\u7406\u7a05\u7c4d\u6216\u6263\u7e73\u767b\u8a18\uff1b\u9069\u7528\u8868\u4ef6\u4f9d\u5be6\u969b\u696d\u52d9\u53ca\u767b\u8a18\u72c0\u614b\u78ba\u8a8d\u3002":'')+'\n'+"\u8acb\u5148\u81f4\u96fb\u570b\u7a05\u5c40\u78ba\u8a8d\u9069\u7528\u7a0b\u5e8f\u53ca\u61c9\u5099\u6587\u4ef6\u3002";
 return {category:"\u7d71\u4e00\u7de8\u865f\u7533\u8acb",title:"\u7d71\u4e00\u7de8\u865f\u8981\u5411\u54ea\u88e1\u7533\u8acb\uff1f",summary,refs:[{title:"\u570b\u7a05\u5c40\u670d\u52d9\u5730\u9ede\u8207\u8f44\u5340\uff082026-11-05\u6838\u5c0d\uff09",cat:"\u5b98\u65b9\u4f86\u6e90",source:'https://www.ntbsa.gov.tw/singlehtml/89c6b7678693468287b33f6443b9e19c'}],notes:[],actions:[{label:"\u806f\u7d61\u627f\u8fa6",view:'contact',sub:''}]};
}
function focusedQuestionAnswer(q){return window.CounterQuestions?window.CounterQuestions.resolve(q,{prior:lastQuestionContext,electionDocuments:(MEET.find(item=>item.id==='m-elect')||{}).docs||[]}):null;}
function exactArticleAnswer(q){
  const match=String(q).normalize('NFKC').match(/([\u4e00-\u9fff]+(?:法|辦法|細則|準則))第\s*(\d+(?:-\d+)?)\s*條/);
  if(!match)return null;
  const rows=articleRows(q);
  if(rows.length){const row=rows[0];return{category:'法規說明',title:row.title,summary:row.text,refs:[{title:row.title,cat:'法規說明',source:row.source,date:row.date}],notes:[],actions:[{label:'查詢其他法規',view:'law',sub:/合作社/.test(row.title)?'合作社':'人民團體'}]};}
  return{category:'條文查詢',title:match[1].replace(/^(請問|查詢|查一下|說明|解釋)/,'')+'第'+match[2]+'條',summary:'目前尚未找到這一條的完整對應資料，請確認法規名稱與條號，或至相關法令頁查閱官方原文。',notes:[],actions:[{label:'前往法規查詢',view:'law',sub:/合作社/.test(q)?'合作社':'人民團體'}]};
}
// Scope retrieval before selecting the best result, rather than filtering only the top hit.
const unscopedSearchKn=searchKn;
searchKn=function(q,limit){
  const comparison=/合作社|合作農場/.test(q)&&/協會|社會團體|人民團體/.test(q);
  const coop=/合作社|合作農場/.test(q);
  const people=!coop&&/協會|社會團體|人民團體/.test(q);
  const exact=articleRows(q);
  const results=unscopedSearchKn(String(q).replaceAll('法規說明','白話說明'),STORE.kn.rows.length).filter(hit=>!exact.length||exact.includes(hit._r));
  return results.filter(hit=>{if(comparison||(!coop&&!people))return true;const row=hit._r;const isCoop=/^合作社/.test(row.cat||'')||/合作社|合作農場/.test(row.title||'');if(people&&!/工會|公會|商業|工業|醫事|社工|護理|律師/.test(q)&&/工會|公會|商業團體|工業團體|醫事|社工師|護理|律師/.test(row.title+' '+row.cat))return false;return coop?isCoop:!isCoop}).slice(0,limit||5);
};
const scopedFallback=smartFallback;
smartFallback=function(q,kb){
  const exact=articleRows(q);
  if(exact.length){const row=exact[0];return{category:'法規說明',title:row.title,summary:row.text,refs:[{title:row.title,cat:'法規說明',source:row.source,date:row.date}],notes:[],actions:[{label:'查詢其他法規',view:'law',sub:/合作社/.test(row.title)?'合作社':'人民團體'}]};}
  if(/^(?:請問)?(?:人民團體|社會團體|協會)(?:的|有什麼|有哪些|相關)*(?:法規|法令|法律|法)(?:有哪些|是什麼|介紹|說明|查詢|？|\?)*$/.test(q)){
    const entry=KB.find(e=>e.title==='人民團體相關法令');
    if(entry)return{...kbAnswer(entry),related:['人民團體法第1條 法規說明','人民團體法第13條 法規說明','人民團體法第25條 法規說明']};
  }
  if(/合作社/.test(q)&&!/信用|保險|籌組|差別|不同|比較/.test(q)&&/成立|設立/.test(q)&&/文件|準備|應備|怎麼|如何|流程/.test(q)){
    const item=BIZ.coop.items.find(x=>x.id==='o-new');
    return {category:'合作社成立登記',title:'合作社成立登記要準備哪些文件？',summary:'依本縣承辦人提供的清單，成立登記應準備下列13項文件。會議紀錄請附簽到資料，並留意正本、影本及份數。',docs:item.docs,steps:item.steps,laws:item.laws,notes:[],actions:[{label:'看合作社辦理流程',view:'biz',sub:'coop'},{label:'下載合作社書表',view:'forms',sub:'合作社'}]};
  }
  if(/協會|社會團體/.test(q)&&!/合作社|社區發展|法人|統編|統一編號|稅|開戶|銀行|改選|變更|解散/.test(q)&&/成立|籌組|設立/.test(q)&&/文件|準備|應備|怎麼|如何|流程/.test(q)){
    const entry=KB.find(e=>e.ref==='s-new'&&/成立|籌組/.test(e.title));
    if(entry)return kbAnswer(entry);
  }
  return scopedFallback(q,kb);
};
loadAll=async function(force){await baseLoadAll(force);await loadStatutes();if(!STORE.coopLoaded){
  try{const responses=await Promise.all([fetch('data/coop/directory.json'),fetch('data/coop/catalog.json')]);if(responses.some(r=>!r.ok))throw Error('合作社資料載入失敗');const [dir,cat]=await Promise.all(responses.map(r=>r.json()));STORE.dir.rows=STORE.dir.rows.filter(r=>r.t!=='合作社').concat(dir.rows.map(r=>({...r,d:townOf(r.a)})));coopCatalog=cat.files;STORE.coopLoaded=true;fillCatSelect()}catch(e){console.warn(e)}
}if(!STORE.kn.rows.some(r=>r.title===COOP_RULING.title)){STORE.kn.rows.push(COOP_RULING);KN_IDX=null}};
const oldDirMetaLine=dirMetaLine;
dirMetaLine=function(){const rows=STORE.dir.rows;const original=rows.filter(r=>r.t!=='合作社');return `人民團體 ${original.length} 筆；合作社 ${rows.filter(r=>r.t==='合作社').length} 筆（合作社名冊日期：2026/10/01）。名冊列載不代表即時營運狀態。`};
function lawName(row){
 const title=String(row.title||'').normalize('NFKC');
 const match=title.match(/^(.*?)\u7b2c\s*[0-9\u4e00-\u9fff]+(?:-\d+)?\s*\u689d/);
 return match&&match[1].trim()?match[1].trim():'\u5176\u4ed6\u6cd5\u898f';
}
function groupedLawResults(rows,container){
 const groups=new Map();
 for(const row of rows){const name=lawName(row);if(!groups.has(name))groups.set(name,[]);groups.get(name).push(row)}
 const names=[...groups.keys()].sort((a,b)=>a.localeCompare(b,'zh-Hant'));
 container.innerHTML=names.map((name,i)=>'<details class="law-group" data-law-group="'+i+'"><summary>'+esc(name)+' <small>'+groups.get(name).length+' \u7b46</small></summary><div class="law-group-content"></div></details>').join('');
 container.querySelectorAll('[data-law-group]').forEach(el=>el.addEventListener('toggle',()=>{if(el.open&&!el.dataset.loaded){const list=groups.get(names[Number(el.dataset.lawGroup)]);el.querySelector('.law-group-content').innerHTML=list.map(knowledgeCard).join('');el.dataset.loaded='1'}}));
 return names.length;
}
renderLaw=function(){
  $('#lawtabs').innerHTML='';
  $('#lawbody').innerHTML=`<div class="panel"><h2>法規與函釋說明</h2><p class="lead">先選團體類型，再輸入問題。點開一個結果，就能看重點與原始依據。</p><div class="knowledge-filters"><div class="field"><label for="law-type">團體類型</label><select id="law-type"><option value="people">人民團體</option><option value="coop">合作社</option></select></div><div class="field"><label for="law-kind">想查什麼</label><select id="law-kind"><option value="all">全部說明</option><option value="law">法規條文</option><option value="practice">函釋與實務問題</option><option value="official">正式函釋索引</option></select></div><div class="field"><label for="law-query">輸入關鍵字、條號或文號</label><input id="law-query" placeholder="例如：改選、委託、合作社法第8條"></div></div><div class="row">${['改選','會議','委託','財務','解散'].map(s=>`<button class="btn ghost" data-law-topic="${s}">${s}</button>`).join('')}</div><p id="law-count" aria-live="polite"></p><div id="law-results"></div><button class="btn ghost" id="law-more" hidden>再顯示 20 筆</button><div class="sec" id="official-law-links"></div></div>`;
  $('#law-type').value=lawCat==='合作社'?'coop':'people';$('#law-kind').value=lawCat==='函釋與問答'?'practice':'all';let limit=20;
  const draw=()=>{const type=$('#law-type').value,kind=$('#law-kind').value,q=norm($('#law-query').value.trim());const coop=r=>/合作社|合作農場/.test(r.title+r.cat);let rows=STORE.kn.rows.filter(r=>!['範例教學','辦理機關聯絡','國稅轄區','對話與基本概念','進階聯絡'].includes(r.cat)).filter(r=>type==='coop'?coop(r):!coop(r));if(kind==='law')rows=rows.filter(r=>r.cat==='逐條法規白話導讀');if(kind==='practice')rows=rows.filter(r=>r.cat!=='逐條法規白話導讀');if(kind==='official')rows=rows.filter(r=>r.cat==='正式函釋索引');if(q)rows=rows.filter(r=>norm(r.title+r.text+r.source).includes(q));else rows=rows.slice().sort((a,b)=>Number(!/改選|成立|連任|會議/.test(a.title))-Number(!/改選|成立|連任|會議/.test(b.title)));if(kind==='law'&&rows.length){const count=groupedLawResults(rows,$('#law-results'));$('#law-count').textContent='\u627e\u5230 '+rows.length+' \u7b46\u689d\u6587\uff0c\u5206\u70ba '+count+' \u90e8\u6cd5\u898f';$('#law-more').hidden=true;}else{$('#law-count').textContent=`找到 ${rows.length} 筆，顯示前 ${Math.min(limit,rows.length)} 筆`;$('#law-results').innerHTML=rows.slice(0,limit).map(knowledgeCard).join('')||(kind==='official'?'<p>本站尚未收錄符合這個關鍵字的正式函釋，不代表沒有相關法規或函釋。可改選「法規條文」或「函釋與實務問題」，或從下方官方資料庫查詢原函。</p>':'<p>目前沒有符合的資料。可減少關鍵字，或從下方官方資料庫查詢。</p>');$('#law-more').hidden=rows.length<=limit;}$('#official-law-links').innerHTML=type==='coop'?'<h3>官方查詢</h3><p><a target="_blank" rel="noopener" href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050112">合作社法全文</a>　<a target="_blank" rel="noopener" href="https://cooptw.moi.gov.tw/News.aspx?n=7480&sms=12296">合作事業解釋令彙編</a></p><p>函釋是主管機關對具體問題的解釋。請核對文號、日期及案件條件；本站實務說明與正式原函會分別標示。</p>':'<h3>官方查詢</h3><p><a target="_blank" rel="noopener" href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050091">人民團體法全文</a>　<a target="_blank" rel="noopener" href="https://www.moi.gov.tw/News.aspx?n=14119&sms=12360">社會團體解釋令彙編</a>　<a target="_blank" rel="noopener" href="https://www.moi.gov.tw/News.aspx?n=14143&sms=12360">職業團體解釋令彙編</a></p>'};
  ['#law-type','#law-kind','#law-query'].forEach(id=>$(id).addEventListener('input',()=>{limit=20;draw()}));$('#law-more').onclick=()=>{limit+=20;draw()};$('#lawbody').querySelectorAll('[data-law-topic]').forEach(b=>b.onclick=()=>{$('#law-query').value=b.dataset.lawTopic;limit=20;draw()});draw();
};
const baseRenderForms=renderForms;
renderForms=async function(){const selected=formCat;await baseRenderForms();
 $('#formtabs').insertAdjacentHTML('beforeend',`<button class="tab" role="tab" aria-selected="${selected==='合作社'}" data-f="合作社">合作社書表</button>`);
 if(selected!=='合作社')return;formCat='合作社';$('#formtabs').querySelectorAll('[role=tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.f==='合作社'));
 $('#formhead').innerHTML='<div><h2>合作社書表</h2><p>依辦理階段選擇下載包，保留承辦人提供的原始格式。</p></div>';
 $('#formlist').innerHTML=COOP_CATEGORIES.map((title,i)=>`<div class="panel" style="grid-column:1/-1"><h3>${title}</h3><a class="btn ghost" href="data/coop/forms-${i+1}.zip" download>下載書表（ZIP）</a><details><summary>查看檔案清單（${coopCatalog.filter(f=>f.category===i+1).length} 個）</summary><ul>${coopCatalog.filter(f=>f.category===i+1).map((f,j)=>`<li style="margin:10px 0">${esc(f.name)} <button class="btn ghost small" data-coop-file="${i+1}:${j}">下載此檔</button></li>`).join('')}</ul></details></div>`).join('');$('#formsrc').textContent='來源：承辦人提供之合作社資料。';
};
const baseIntent=intentOf;
intentOf=function(q){if(/(?:法|辦法|細則|準則)第[0-9一二三四五六七八九十百]+|法規說明|函釋/.test(q))return{kind:'ai'};return baseIntent(q)};
const baseAnswer=renderAnswer;
renderAnswer=function(q,a){const exact=exactArticleAnswer(q),focused=a&&a.questionState?a:focusedQuestionAnswer(q);if(exact||focused)a=exact||focused;const label=s=>String(s||'').replaceAll('逐條法規白話導讀','逐條法規說明').replaceAll('白話說明','法規說明');a={...a,title:label(a.title),category:label(a.category),related:(a.related||[]).map(label),refs:(a.refs||[]).map(r=>({...r,title:label(r.title),cat:label(r.cat)}))};baseAnswer(q,a);const el=board.querySelector('.summary');if(el){const row=articleRows(a.title||q)[0];const originals=a.statutes&&a.statutes.length?a.statutes:row?[row]:[];el.innerHTML=originals.map(originalLawBlock).join('')+(originals.length?'<h3>法規說明</h3>':'')+readable(a.summary||'');}lastQuestionContext=a.questionState||(window.CounterQuestions?window.CounterQuestions.understand(q,lastQuestionContext):null);};
function renderMeetUpgrade(){
 $('#meetbody').innerHTML=`<div class="tabs" role="tablist"><button class="tab" role="tab" id="meet-people" aria-selected="true">人民團體會務</button><button class="tab" role="tab" id="meet-coop" aria-selected="false">合作社會務</button></div><div id="meet-content"></div>`;
 const draw=coop=>{$('#meet-people').setAttribute('aria-selected',!coop);$('#meet-coop').setAttribute('aria-selected',coop);$('#meet-content').innerHTML=coop?`<div class="panel"><h2>合作社會務怎麼辦？</h2><p>先確認您要辦的是開會、改選、年度財務或變更登記，再選擇下列項目。</p>${[["社員大會與理監事會","先確認章程及會議種類，再準備通知、議程與簽到表；會後整理紀錄及決議。",5],["改選與交接","先確認任期、選舉方式及候選程序，再使用對應的選票、委託書與會議紀錄表單。",6],["年度決算與預算","依合作社的會計年度準備決算、監事審核及社員大會紀錄，核對應報送的書表。",4],["理監事、章程或社址變更","先完成必要的會議決議，再準備變更申請及相關證明。",3],["解散與清算","解散及清算有不同階段，請依承辦人提供的流程與各階段書表辦理。",7]].map(([t,d,n])=>`<div class="sec"><h3>${t}</h3><p>${d}</p><a href="data/coop/forms-${n}.zip" download>下載對應書表</a>　<button class="btn ghost" data-coop-law="${t}">查法規說明</button></div>`).join('')}</div>`:MEET.map(itemPanel).join('');$('#meet-content').querySelectorAll('[data-coop-law]').forEach(b=>b.onclick=()=>{lawCat='合作社';location.hash='law';renderLaw()})};$('#meet-people').onclick=()=>draw(false);$('#meet-coop').onclick=()=>draw(true);draw(false);
}
const statuteStyle=document.createElement('style');statuteStyle.textContent='.statute-original{margin:0 0 24px;padding:20px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink)}.statute-original h3{margin-top:0}.statute-caption{font-weight:700}.statute-text{white-space:pre-wrap;font-size:1rem;line-height:1.9;text-align:left}.statute-version{font-size:.85rem;color:var(--muted);margin-top:16px!important}.statute-original a{font-size:.9rem}.plain-content .statute-original{margin-top:8px}.summary>h3{margin:20px 0 12px}';document.head.append(statuteStyle);
const upgradeStyle=document.createElement('style');upgradeStyle.textContent='.law-group{border:1px solid var(--line);border-radius:12px;margin:12px 0;background:var(--surface);color:var(--ink)}.law-group>summary{cursor:pointer;padding:18px;font-weight:700;overflow-wrap:anywhere}.law-group>summary small{font-weight:400;color:var(--muted);margin-left:8px}.law-group-content{padding:0 14px 14px}.knowledge-filters{display:grid;grid-template-columns:1fr 1fr 2fr;gap:16px}.plain-card{border:1px solid var(--line);border-radius:12px;margin:12px 0;background:var(--surface);color:var(--ink)}.plain-card>summary{cursor:pointer;padding:18px;font-weight:600;line-height:1.7}.plain-card small{display:block;font-weight:400;color:var(--muted);margin-top:4px}.plain-content{padding:0 22px 22px;max-width:78ch;font-size:17px;line-height:1.9;overflow-wrap:anywhere}.plain-content p,.summary p{margin:0 0 14px}.plain-content details{border-top:1px solid var(--line);padding-top:12px;font-size:14px}.summary{line-height:1.9}@media(max-width:650px){.knowledge-filters{grid-template-columns:1fr}.plain-content{padding:0 16px 16px}}';document.head.append(upgradeStyle);
loadAll().then(()=>{fillCatSelect();renderMeetUpgrade();route()});

const coopZipCache=new Map();
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-coop-file]');if(!button)return;
 const [category,index]=button.dataset.coopFile.split(':');const status=$('#formstatus');button.disabled=true;
 try{status.textContent='正在準備檔案…';if(!coopZipCache.has(category))coopZipCache.set(category,(async()=>{const [Zip,response]=await Promise.all([loadJSZip(),fetch(`data/coop/forms-${category}.zip`)]);if(!response.ok)throw Error('檔案暫時無法讀取');return Zip.loadAsync(await response.arrayBuffer())})().catch(error=>{coopZipCache.delete(category);throw error}));const zip=await coopZipCache.get(category);const name=coopCatalog.filter(file=>file.category===Number(category))[Number(index)].name;const file=zip.file(name);if(!file)throw Error('找不到檔案');await saveFile(name,await file.async('uint8array'),status)}catch(error){status.textContent='下載未完成，請稍後再試，或使用上方的整包下載。'}finally{button.disabled=false}
});
