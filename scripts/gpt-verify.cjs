// 把「需要驗證的問題」交給 GPT 初審，再由本程式自動核對（法條存在、引文逐字、數字一致）。
// GPT 的結論只當草稿，不會寫進網站；通過核對的才標「可人工採用」，其餘一律「待人工」。
// 用法：OPENAI_API_KEY=... node scripts/gpt-verify.cjs verify/queue.json [report.json]
// 測試：GPT_MOCK=verify/mock-replies.json node scripts/gpt-verify.cjs verify/queue.json
const fs=require('fs'),zlib=require('zlib');
const args=process.argv.slice(2).filter(a=>!a.startsWith('--'));const BRIEF=process.argv.includes('--brief');
const [inFile,outFile='verify/report.json']=args;
if(!inFile){console.error('用法：node scripts/gpt-verify.cjs <queue.json> [report.json]');process.exit(2);}
const laws=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz'))).laws;
const byName={};for(const [k,v] of Object.entries(laws))byName[v.name]={pcode:k,articles:v.articles};
const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'');
const cn={零:0,〇:0,一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
const CNN=/(?:百分之)?[一二三四五六七八九十]+(?:分之[一二三四五六七八九十]+)?|\d+/g;
const artNo=a=>String(a).normalize('NFKC').replace(/^第/,'').replace(/條$/,'').replace(/之/,'-').trim();
function artText(law,art){const L=byName[law];if(!L)return null;const a=L.articles[artNo(art)];return a==null?null:String(a);}
const PROVIDER=(process.env.PROVIDER||(process.env.GEMINI_API_KEY&&!process.env.OPENAI_API_KEY?'gemini':'openai')).toLowerCase();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let GEM_MODELS=null;
/* Gemini：金鑰只從環境變數 GEMINI_API_KEY 讀取（GitHub Actions secret，由使用者自行設定）；503／429／逾時自動重試並換備用模型 */
async function askGemini(sys,user){
 const key=process.env.GEMINI_API_KEY;if(!key)throw new Error('未設定 GEMINI_API_KEY');
 const API='https://generativelanguage.googleapis.com/v1beta';
 if(!GEM_MODELS){let listed=[];try{const r=await fetch(`${API}/models?pageSize=200`,{headers:{'x-goog-api-key':key}});const j=await r.json();listed=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name);}catch(e){}
  const flash=listed.filter(n=>/flash/.test(n)&&!/lite|image|tts|audio|live|exp/.test(n)).sort().reverse();
  GEM_MODELS=[process.env.GEMINI_MODEL,'models/gemini-flash-latest',...flash.slice(0,3)].filter((m,i,a)=>m&&a.indexOf(m)===i);
  console.log('Gemini 候選模型：',GEM_MODELS.join(', '));}
 const models=GEM_MODELS;const errs=[];let last='';
 for(const m of models){for(let t=0;t<4;t++){
  let r,j;try{r=await fetch(`${API}/${m}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(120000),body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[{role:'user',parts:[{text:user}]}],generationConfig:{temperature:0,responseMimeType:'application/json',maxOutputTokens:4096}})});j=await r.json();}catch(e){last=m+' 連線失敗：'+e.message;await sleep(10000);continue;}
  if(r.status===429||r.status>=500){last=m+' '+r.status;errs.push(last);await sleep(20000);continue;}
  if(!r.ok){last=m+' '+r.status+' '+JSON.stringify(j).slice(0,160);errs.push(last);break;}
  const text=(j.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('').trim().replace(/^```(?:json)?|```$/g,'').trim();
  try{const o=JSON.parse(text);o._model=m;return o;}catch(e){last=m+' 回覆不是 JSON';continue;}
 }}
 throw new Error('Gemini 無法取得回覆（'+[...new Set(errs.concat(last))].join('；')+'）');
}
async function ask(item,ctx){
 if(process.env.GPT_MOCK){const m=JSON.parse(fs.readFileSync(process.env.GPT_MOCK));return m[item.id]||null;}
 const sysG='你是台灣人民團體法規審查助手。只能依「提供的法條原文」回答，原文沒有寫的就說「法規無明文」，不得臆測，不得引用函釋、新聞或你記得的其他資料，也不得代替縣府、國稅局等機關表示意見。回覆必須是 JSON：{"conclusion":"一至三句結論","cites":[{"law":"法規全名","article":"條號","quote":"自原文逐字摘錄的一段"}],"confidence":"high|medium|low","gaps":"原文不足之處或需承辦確認的事"}。';
 if(PROVIDER==='gemini')return askGemini(sysG,'問題：'+item.question+(item.claim?'\n待驗證的現行說法：'+item.claim:'')+'\n\n可用法條原文：\n'+ctx);
 const key=process.env.OPENAI_API_KEY;if(!key)throw new Error('未設定 OPENAI_API_KEY');
 const model=process.env.OPENAI_MODEL||'gpt-4o';
 const sys='你是台灣人民團體法規審查助手。只能依「提供的法條原文」回答，原文沒有寫的就說「法規無明文」，不得臆測。回覆必須是 JSON：{"conclusion":"一至三句結論","cites":[{"law":"法規全名","article":"條號","quote":"自原文逐字摘錄的一段"}],"confidence":"high|medium|low","gaps":"原文不足之處或需承辦確認的事"}。';
 const user='問題：'+item.question+(item.claim?'\n待驗證的現行說法：'+item.claim:'')+'\n\n可用法條原文：\n'+ctx;
 const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({model,temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:sys},{role:'user',content:user}]})});
 if(!r.ok)throw new Error('OpenAI '+r.status+' '+(await r.text()).slice(0,200));
 const j=await r.json();return JSON.parse(j.choices[0].message.content);
}
function check(item,reply){
 const prob=[];if(!reply)return{status:'待人工',problems:['沒有取得回覆']};
 const cites=Array.isArray(reply.cites)?reply.cites:[];
 if(!cites.length)prob.push('沒有引用任何法條');
 const given=new Set((item.statutes||[]).map(s=>s.law+'|'+artNo(s.article)));
 let citedText='';
 for(const c of cites){
  const t=artText(c.law,c.article);
  if(t==null){prob.push(`查無此條：${c.law}第${c.article}條`);continue;}
  citedText+=t;
  if(!given.has(c.law+'|'+artNo(c.article)))prob.push(`引用了未提供的條文：${c.law}第${c.article}條（已核對存在，仍需人工看是否相關）`);
  if(c.quote&&!norm(t).includes(norm(c.quote)))prob.push(`引文不是原文逐字：${c.law}第${c.article}條「${String(c.quote).slice(0,24)}…」`);
 }
 const ct=norm(citedText);
 for(const m of norm(reply.conclusion).match(CNN)||[]){if(!ct.includes(m)&&!/^\d{1,2}$/.test(m)&&m!=='一')prob.push(`結論中的「${m}」不在所引條文內`);}
 if(item.mustInclude)for(const w of item.mustInclude)if(!norm(reply.conclusion).includes(norm(w)))prob.push(`結論缺少關鍵詞：${w}`);
 if(reply.confidence==='low')prob.push('GPT 自評信心低');
 const hard=prob.some(p=>/查無此條|不是原文逐字|沒有引用|不在所引條文|缺少關鍵詞/.test(p));
 return{status:hard?'待人工':(prob.length?'可人工採用（有提醒）':'可人工採用'),problems:prob};
}
(async()=>{
 const items=JSON.parse(fs.readFileSync(inFile));const report=[];
 if(BRIEF){ // 沒有 API 時：產生可直接貼給 ChatGPT 的題單；把回覆存成 {題目id:回覆JSON} 後用 GPT_MOCK=回覆檔 重跑核對
  let md='# 請 ChatGPT 初審（貼整份）\n\n規則：只能依下方「法條原文」回答；原文沒寫就說「法規無明文」，不得臆測。每題回覆一個 JSON 物件：{"conclusion":"一至三句結論","cites":[{"law":"法規全名","article":"條號","quote":"自原文逐字摘錄"}],"confidence":"high|medium|low","gaps":"原文不足或需承辦確認之處"}。最後把所有題目合成一個 JSON：{"題目id": 該題物件, ...}，用程式碼區塊輸出。\n\n';
  for(const it of items){const ctx=(it.statutes||[]).map(x=>{const t=artText(x.law,x.article);return t==null?`【${x.law}第${x.article}條：資料庫查無】`:`【${x.law}第${x.article}條】\n${t}`;}).join('\n\n')||'（未提供，請說明法規無明文）';
   md+=`---\n## 題目id：${it.id}\n問題：${it.question}\n`+(it.claim?`待驗證的現行說法：${it.claim}\n`:'')+`\n可用法條原文：\n${ctx}\n\n`;}
  fs.writeFileSync('verify/brief.md',md);console.log('已產生 verify/brief.md');return;}
 for(const it of items){
  const ctx=(it.statutes||[]).map(s=>{const t=artText(s.law,s.article);return t==null?`【${s.law}第${s.article}條：資料庫查無】`:`【${s.law}第${s.article}條】\n${t}`;}).join('\n\n')||'（未提供，請說明法規無明文）';
  let reply=null,err=null;try{reply=await ask(it,ctx);}catch(e){err=e.message;}
  const v=err?{status:'待人工',problems:['呼叫失敗：'+err]}:check(it,reply);
  report.push({id:it.id,question:it.question,gpt:reply,...v});
  console.log(`[${v.status}] ${it.id} ${it.question}${v.problems.length?'\n   - '+v.problems.join('\n   - '):''}`);
 }
 fs.writeFileSync(outFile,JSON.stringify(report,null,1));
 console.log('\n報告已寫入',outFile,'（提供者：'+PROVIDER+'）');
 console.log('REPORT_JSON_BEGIN');console.log(JSON.stringify(report));console.log('REPORT_JSON_END');
})();
