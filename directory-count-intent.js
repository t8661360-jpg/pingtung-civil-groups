(function(root){
'use strict';
const norm=v=>String(v??'').normalize('NFKC').replace(/臺/g,'台').replace(/\s+/g,'');
const reset=/(?:^|[，,。；;!?？！])(?:我說|現在|我想|想先|再|先|那)?(?:換(?:個|一個)?問題|換(?:一|個)?題|改問|新(?:的)?問題|新題|另一(?:個)?問題)(?=[:：,，;；。!?？！]|$)[:：,，;；。!?？！]*/g;
const quant=/有多少|有幾(?:個|家|間|筆)?|幾(?:個|家|間|筆)|多少(?:個|家|間|筆)?|總數|總計|各有|團體數|社團數|有幾筆|數量|小計/;
const dword=/名冊|團體|協會|學會|宗教|慈善|體育|文化|社團|公會|合作社|老人會|社區發展|總數/;
const noName=/不用(?:查|找|列)?(?:團體)?(?:全名|特定名稱|具名資料)|(?:不是|不想|不要|不必)(?:要)?(?:找|查)(?:哪個|特定|團體)?(?:團體名稱|協會名稱|個別團體|特定(?:團體|協會)?|名稱)|只(?:想|要|需)(?:知道|看|查|給|列)?(?:存續|總數|數量|小計)|不用列(?:聯絡|人名|地址)|不要列(?:聯絡|人名|地址)/;
const artifact=/更新(?:日|日期|月份|到)|資料(?:是)?(?:截至|哪天|日期|更新|來源)|哪(?:天|一日|個月)的資料|截至|更新日|名冊日期|這份名冊更新/;
const correct=/^(?:前面(?:說錯了|不用了)[，,。；;]?)?(?:更正[，,:：]?|不是.{1,12}[，,]|前面說錯了)/;
const include=/包含.{0,8}已解散|含(?:有|了)?已解散|連.{0,5}解散.{0,6}(?:算|計|要)|解散也算/;
const onlyGone=/(?:只|僅)(?:要|看|算|計|列|問|查)?(?:已)?解散(?:的)?/;
const onlyLive=/(?:只|僅)(?:看|要|算|列|查|計)(?:仍在|還在|尚在|存續|運作|營運|未解散)|不(?:含|計入|算)(?:已)?解散/;
const liveMention=/存續|還在運作|還在營運|是否還在/;
const notRegion=/不是(?:要查|查|問|只問)?(?:全縣|全部|屏東縣全部)/g;
function query(input,towns,cats,prior){
 const raw=norm(input);
 if(!raw||raw.length>490)return null;
 let s=raw,resetFound=false;
 for(const m of raw.matchAll(reset)){const tail=raw.slice(m.index+m[0].length);if(tail){s=tail;resetFound=true;}}
 const force=/名冊查詢確認:(全縣|先選鄉鎮)/.exec(s)?.[1];
 const needsDates=artifact.test(s),negativeName=noName.test(s),correction=correct.test(s);
 let relevant=s.replace(notRegion,'').replace(/(?:不是|並非|不查|不用查|不是問)(?:要|問|查|找)?(?:公司(?:營業)?登記|工商(?:營業)?登記|會員名冊|社員名冊|個人名單|特定團體|團體全名|哪個特定名稱)(?=$|[，,。；;、])/g,'');
 const locs=[];
 for(const town of towns||[]){
  const base=norm(town).slice(0,-1),full=norm(town);
  if(!base)continue;
  const neg=new RegExp('(?:不是|不要|不查|不要算|不包括|排除)(?:問|找|查)?(?:屏東)?'+full+'(?=$|[，,。；;、])|(?:不是|不查|排除)(?:屏東)?'+base+'(?=$|[，,。；;、])','g');
  relevant=relevant.replace(neg,'');
  let at=relevant.indexOf(full);
  if(at<0&&base!=='屏東'){
   const m=new RegExp(base+'(?!會|里|路|村|街|鄉公所|鎮公所|公司)').exec(relevant);if(m)at=m.index;
  }
  if(at>=0)locs.push([town,at]);
 }
 locs.sort((a,b)=>a[1]-b[1]);
 let regions=locs.map(x=>x[0]);
 const filters=[];
 const choices=cats||[];
 for(const [name,pattern] of choices){
  const re=new RegExp(pattern.source,pattern.flags.replace(/[gy]/g,''));
  const m=re.exec(relevant);if(m)filters.push({name,key:'c',at:m.index});
 }
 const typeList=[['社區發展協會',/社區發展協會|社區發展組織/],['合作社',/一般合作社|普通合作社|合作社/],['社會團體',/社會團體/],['職業團體',/職業團體/]];
 for(const [name,pattern] of typeList){
  const m=pattern.exec(relevant);if(m&&!filters.some(f=>f.name.includes(name)))filters.push({name,key:'t',at:m.index});
 }
 filters.sort((a,b)=>a.at-b.at);
 const statusLive=onlyLive.test(s),statusGone=onlyGone.test(s),statusExtra=include.test(s);
 const explicitAll=/(?:全縣|整個屏東縣|屏東縣(?:全部|所有))/.test(relevant)||force==='全縣';
 const carry=!resetFound&&!force&&correction&&prior&&regions.length===1&&/其他一樣|其餘不變|只想知道|總數|一共有/.test(s);
 const listTarget=filters.length||dword.test(relevant)||carry;
 if(!(quant.test(relevant)||carry||force)||!listTarget)return null;
 if(!regions.length&&!explicitAll&&!force&&!(negativeName||needsDates)&&!/比較|各有|分開/.test(s))return null;
 if(/幾個人|幾位|多少人|多少錢|多少費用|多少預算|幾天|幾年|幾月|幾歲|幾次|幾成|比例|每個團體|(?:有多少|有幾|多少名|幾位)(?:個|位|名)?(?:會員|社員|理事|監事|工作人員)|(?:會員|社員|理事).{0,5}(?:有多少|總數|有幾個)|一個團體.{0,9}(?:要|最多|至少)/.test(relevant))return null;
 if(/成立(?:需要|要件)|申請(?:資料|補助|流程)|怎麼(?:解散|成立|報名|加入)|如何(?:解散|成立|報名)|會員人數|理事名額|改選要|會員資格|補助款|法人登記|討論預算|費用要|法院扣押|會費|名冊要報|會員大會|註冊流程|(?:改|變更|修)章程|怎麼報名|怎麼成立|要申請|需要資金|怎麼辦理/.test(relevant))return null;
 if(/「[^」]{2,40}」|『[^』]{2,40}』|重複|撞名|想取名|名稱是否可用/.test(relevant))return null;
 if(/(?:公司|工商)(?:營業)?登記|會員名冊|社員名冊/.test(relevant))return null;
 if(!force&&!resetFound&&!correction&&!negativeName&&!needsDates&&!statusLive&&!statusGone&&!statusExtra&&regions.length<2&&filters.length<2&&!/只要|比較|各有|總數|小計|總計|團體數/.test(s))return null;
 if(!filters.length&&carry)filters.push(...prior.filters);
 if(!filters.length&&/文化/.test(s))return null; // no agreed type: don't silently count all
 if(!filters.length)filters.push({name:'全部名冊類別',key:'all'});
 if(regions.length>5||filters.length>4)return {kind:'narrow',regions,filters,scope:'live'};
 if(explicitAll&&!regions.length)regions=[''];
 const scope=statusGone&&!statusExtra?'gone':statusExtra?(statusLive||liveMention.test(s)||/差別|分開|各有|也想|如果|話是/.test(s)?'both':'all'):'live';
 if(!regions.length)return {kind:'region',regions,filters,scope,s,needsDates};
 const relation=/各(?:類|種)|兩類|三類|這(?:兩|三)類|類別.{0,8}各|分開.{0,8}(?:小計|算|統計)|(?:學術文化|文化)類.{0,8}(?:慈善|宗教|體育)類.{0,8}各/.test(relevant);
 if(regions.length>1&&filters.length>1){
  const chunks=relevant.split(/[，,。;；、]|和|與|跟|及/).filter(Boolean);
  const pairs=[];
  for(const c of chunks){
   const local=regions.filter(d=>c.includes(norm(d))||norm(d).slice(0,-1)!=='屏東'&&c.includes(norm(d).slice(0,-1)));
   const kinds=filters.filter(f=>f.key==='c'&&choices.some(([name,re])=>f.name===name&&new RegExp(re.source,re.flags.replace(/[gy]/g,'')).test(c))||f.key==='t'&&c.includes(f.name));
   if(local.length===1&&kinds.length===1)pairs.push([local[0],kinds[0]]);
  }
  if(!/每個鄉鎮|每個地方|每一地區|每地各算/.test(relevant)&&pairs.length===regions.length&&new Set(pairs.map(x=>x[0])).size===regions.length)return {kind:'count',regions,filters,pairs,scope,needsDates};
  if(!relation&&!/各有|各(?:幾|多少)|分開|比較/.test(relevant))return {kind:'narrow',regions,filters,scope};
 }
 return {kind:'count',regions,filters,scope,needsDates};
}
function response(input,plan,rows,meta){
 if(!plan)return null;
 const q=String(input??'').trim();
 const nav={label:'到團體查詢頁篩選',view:'search',sub:''};
 const out=(title,summary,steps=[],tail={})=>({direct:true,category:'團體查詢',title,summary,steps,actions:[nav],questionState:{focus:tail.choices?'clarify':'compound'},...tail});
 if(plan.kind==='narrow')return out('團體名冊統計｜先確認要分開數哪幾組','您提到多個鄉鎮市和類別。可補充「每個鄉鎮各算兩類」，或指定各地要算的類別；我不把不同條件一起合算。');
 if(plan.kind==='region'){
  const chosen=/名冊查詢確認:先選鄉鎮/.test(norm(q));
  return out('團體名冊統計｜先確認地區','您要查全屏東縣，還是某一個鄉鎮市？選定後可依同一名冊列出數量和更新日期。',[],chosen?{}:{choiceHeading:'選擇要查的地區範圍',choices:[['查全屏東縣','全縣'],['我想補充鄉鎮市','先選鄉鎮']].map(([label,id])=>({label,question:q+'；名冊查詢確認：'+id+'。'}))});
 }
 if(!Array.isArray(rows)||!rows.length)return out('團體名冊統計｜資料暫不可用','目前未能載入名冊，不把無法讀取誤報為零。可稍後再查，或到團體查詢頁確認。');
 const date=/^\d{4}-\d{2}-\d{2}/.exec(String(meta?.updatedAt??''))?.[0]??'';
 const provenance=date?'名冊更新：'+date+'（以下各項均採同一份名冊）。':'名冊沒有提供更新日期，不能當作今天的即時數量。';
 const stat=plan.scope==='gone'?'只計名冊標為已解散的團體。':plan.scope==='all'?'以下數量包含存續及名冊已標為解散的團體。':plan.scope==='both'?'分列存續、含已解散與差額。':'以下只計名冊未標示為已解散的團體。';
 const pairs=plan.pairs||plan.regions.flatMap(d=>plan.filters.map(f=>[d,f]));
 const unsupported=new Set(), summary=[];
 for(const [d,f] of pairs){
  if(f.key!=='all'&&!rows.some(r=>r[f.key]===f.name)){unsupported.add(f.name);continue;}
  const rs=rows.filter(r=>(!d||r.d===d)&&(f.key==='all'||r[f.key]===f.name));
  const alive=rs.filter(r=>r.s!=='已解散').length,gone=rs.length-alive;
  const count=plan.scope==='all'?'含已解散 '+rs.length+' 個':plan.scope==='gone'?'已解散 '+gone+' 個':plan.scope==='both'?'存續 '+alive+' 個，含已解散 '+rs.length+' 個（相差 '+gone+' 個）':'存續 '+alive+' 個';
  summary.push([(d||'屏東縣')+'｜'+f.name,count]);
 }
 const first=summary.length===1?summary[0][0]+'：'+summary[0][1]+'。\n\n':'';
 return out('團體名冊統計｜'+(plan.regions.length===1?(plan.regions[0]||'屏東縣'):'各鄉鎮市分開統計'),first+provenance+'\n\n'+stat,summary.length>1?summary:[],{
  notes:['依本站名冊的鄉鎮市、類別與登記狀態統計；不代表即時營運狀況。',...(unsupported.size?['這份名冊沒有可核對的類別：'+[...unsupported].join('、')+'，不當成零。']:[])]
 });
}
if(typeof module==='object'&&module.exports)module.exports={query,response};
else root.RegistryCountIntent={query,response};
})(typeof window==='object'?window:globalThis);
