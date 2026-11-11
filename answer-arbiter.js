/* 回答仲裁層：先理解民眾在問什麼，再決定哪個候選答案可以給。
 * 原則：寧可說「不確定、請洽承辦」或反問，也不要把關鍵字相似的答案硬塞給民眾。
 * 不改任何既有答案函數；只在它們「都算出來之後」做裁判。 */
(function(root){
'use strict';
const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'');
const text=a=>norm([a.title,a.summary,(a.notes||[]).join(''),a.category].join('｜'));

// 主題詞典：每組第一個是正規名，其餘是民眾口語同義詞。問題與答案都先映射成正規名再比對。
const TOPICS=[
 ['選票','選舉票','廢票','無效票'],['候補'],['遞補','遞上去','遞上'],['辭職','請辭','辭掉','不做了','不幹了'],
 ['出缺','過世','死亡','死了','走了','往生'],['通知','寄發','發通知','開會通知'],['任期','任滿','屆滿','到期','做幾年','當幾年'],
 ['連任','連選','再選'],['保存','保管','留多久','留存','要留','放多久'],['出席','到場','來開會','出席人數','法定人數'],
 ['理事會'],['監事會'],['會員大會','大會'],['社員大會'],['理事長','理事主席'],['理事'],['監事'],['常務理事'],['常務監事'],['總幹事','幹事','秘書'],
 ['會員代表','代表'],['會員'],['社員'],['會費','年費','入會費'],['捐款','捐贈','捐獻'],['補助','補助款','核銷'],['統編','統一編號','稅籍'],
 ['開戶','銀行帳戶','帳戶','存摺'],['報稅','繳稅','所得稅','免稅'],['章程','章程修改','修章'],['除名','開除','退會','出會'],['解散','倒閉','收掉','結束'],
 ['成立','籌組','籌備','設立','登記立案','立案'],['法人','法人登記','社團法人'],['名稱','會名','取名'],['分會','分支機構','分部','辦事處'],
 ['視訊','線上','遠距','網路開會'],['委託','委託書','代理出席'],['查帳','查核','看帳','查賬'],['財務報表','決算','預算','收支','報表'],
 ['工作計畫','年度計畫','工作報告'],['薪水','薪資','酬勞','車馬費','出席費','津貼'],['選舉','改選','換屆','選理事','選監事'],['罷免'],
 ['承辦人','承辦','電話','窗口','聯絡'],['名額','幾個','幾人','幾位','幾名','人數','多少人','幾席'],['入會','加入','審查','審核'],
 ['盈餘','分配','分紅','股息'],['合作社'],['社區發展協會','社區'],['協會','人民團體','社會團體'],['補選'],['代理','代行'],
 ['紀錄','會議紀錄','記錄'],['簽到','簽到簿'],['罰則','處分','撤免','停權'],['函釋','解釋'],['書表','表格','範本','表單']
];
const TOPIC_RE=TOPICS.map(g=>({name:g[0],re:new RegExp(g.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|'))}));
// 泛詞：幾乎每題都有，不能當作「對題」的證據
const WEAK=new Set(['協會','合作社','理事','監事','會員','社員','理事會','監事會','會員大會','社員大會','理事長','社區發展協會']);

function topicsOf(s){const t=norm(s);const out=[];for(const g of TOPIC_RE)if(g.re.test(t))out.push(g.name);return out;}

// 問法類型：民眾到底想要「一個數字」「一個期限」「一個程序」還是「可不可以」
function askType(q){
 const t=norm(q);
 if(/幾個|幾人|幾位|幾名|多少人|多少錢|多少|幾張|幾次|幾席|幾票|幾成|比例|名額/.test(t))return'quantity';
 if(/多久|幾天|幾日|幾個月|幾年|什麼時候|何時|期限|最晚|最慢|多早|以前|之前|前要|留多久|放多久/.test(t))return'time';
 if(/可以嗎|可不可以|能不能|可否|能嗎|行嗎|合法嗎|違法嗎|有沒有規定|有規定嗎|要不要|需不需要|是否/.test(t))return'permission';
 if(/怎麼辦|怎麼做|如何|怎麼處理|怎麼弄|流程|程序|步驟|要寫什麼|要準備什麼|帶什麼|附什麼|要做什麼|該怎麼/.test(t))return'procedure';
 if(/是什麼|什麼是|差在哪|差別|不同|定義|意思/.test(t))return'definition';
 if(/哪裡|去哪|找誰|誰|電話|聯絡/.test(t))return'who-where';
 return'open';
}
function domainOf(q){const t=norm(q);const coop=/合作社|社員|理事主席|社務會/.test(t),soc=/協會|人民團體|社會團體|會員|理事長|社區/.test(t);return coop&&soc?'mixed':coop?'coop':soc?'social':'any';}
function candDomain(a){const d=a.questionState&&a.questionState.domain;if(d)return d;const t=text(a);const coop=/合作社|社員/.test(t),soc=/協會|人民團體|會員/.test(t);return coop&&!soc?'coop':soc&&!coop?'social':'mixed';}

// 答案是否「回應了問法」：數量題要有數字，期限題要有時間單位，可否題要有明確可／不可
const HAS_NUM=/[0-9０-９]|[一二三四五六七八九十百千]+(?:人|名|位|分之|個|張|次|席|年|月|日|天)/;
const HAS_TIME=/每(?:年|月|季|半年|[一二三四五六]個月)|至少.{0,4}次|\d+\s*(?:日|天|個月|月|年|小時)|(?:一|二|三|四|五|六|七|八|九|十|十五|三十)(?:日|天|個月|月|年)|屆滿|任期內|之前|以前|以內|內/;
const HAS_YESNO=/可以|不可以|不得|不能|得|應|須|禁止|允許|沒有限制|無限制|不需要|需要/;
function answersAsk(type,a){const t=text(a);if(type==='quantity')return HAS_NUM.test(t);if(type==='time')return HAS_TIME.test(t);if(type==='permission')return HAS_YESNO.test(t);return true;}

function bg2(x){const t=norm(x);const r=[];for(let i=0;i<t.length-1;i++)r.push(t.slice(i,i+2));return r;}
function score(q,a,ctx){
 const qt=topicsOf(q),qStrong=qt.filter(x=>!WEAK.has(x));
 const at=new Set(topicsOf(text(a)));
 const reasons=[];
 // 1 領域不合直接出局
 const qd=domainOf(q),ad=candDomain(a);
 if(qd==='coop'&&ad==='social'){reasons.push('問合作社卻拿協會答案');return{s:-1,reasons};}
 if(qd==='social'&&ad==='coop'){reasons.push('問協會卻拿合作社答案');return{s:-1,reasons};}
 // 2 主題覆蓋：問題裡的「強主題詞」有多少出現在答案裡
 let cover=1;
 if(qStrong.length){const hit=qStrong.filter(x=>at.has(x));cover=hit.length/qStrong.length;if(cover<1)reasons.push('答案沒提到：'+qStrong.filter(x=>!at.has(x)).join('、'));}
 // 3 問法類型：數量題給不出數字就是答非所問
 const type=askType(q);const asks=answersAsk(type,a);if(!asks)reasons.push('問'+type+'但答案裡沒有對應內容');
 // 4 理解層焦點一致加分
 let focusBonus=0;if(cover>=0.5&&ctx&&ctx.focus&&a.questionState&&a.questionState.focus===ctx.focus)focusBonus=0.15;
 // 5 標題與問句字面重疊度：標題直接對應問句者優先（避免同分時反問）
 const qb=[...new Set(bg2(q))];const tt=norm(a.title||'');const titleHit=qb.length?qb.filter(b=>tt.includes(b)).length/qb.length:0;
 let s=cover*0.7+(asks?0.3:0)+focusBonus+titleHit*0.3;
 // 問題只有泛詞、沒有強主題詞時，不能靠泛詞過關：要求問法類型一定要對上
 if(!qStrong.length&&!asks)s=0;
 return{s,reasons,cover,type};
}

/* judge(q,candidates,ctx) -> {answer}|{clarify}|{} ；candidates 依原本優先順序傳入 */
function judge(q,candidates,ctx){
 const cands=(candidates||[]).filter(a=>a&&typeof a==='object'&&(a.title||a.summary));
 if(!cands.length)return{};
 const scored=cands.map((a,i)=>({a,i,...score(q,a,ctx)}));
 const PASS=0.6;
 const ok=scored.filter(x=>x.s>=PASS).sort((x,y)=>(y.s-x.s)||(x.i-y.i));
 /* 已核對法條、觸發詞明確的直接回答：只要不是領域不合，就採用（不受主題覆蓋分數門檻限制） */
 {const d0=scored.find(x=>x.a&&x.a.direct&&x.s>=0);if(d0)return{answer:d0.a};}
 root.__lastArbiter={q,type:askType(q),topics:topicsOf(q),scored:scored.map(x=>({title:x.a.title,s:+x.s.toFixed(2),reasons:x.reasons}))};
 if(!ok.length)return{rejected:scored.map(x=>x.a.title)};
 // 已核對法條、直接回答問句的規則答案，分數接近時優先採用，不反問
 const direct=ok.find(x=>x.a.direct&&x.s>=ok[0].s-0.6);if(direct)return{answer:direct.a};
 // 兩個不同主題的答案分數接近、而問題又短 → 反問，不猜
 if(ok.length>1&&ok[1].s>=ok[0].s-0.1&&(ok[0].a.title!==ok[1].a.title)&&norm(q).length<=12&&!(ok[0].a.questionState&&ok[1].a.questionState&&ok[0].a.questionState.focus===ok[1].a.questionState.focus)){
  const opts=ok.slice(0,3).map((x,k)=>(k+1)+'. '+x.a.title);
  return{clarify:{category:'需要先確認',title:'想先確認您問的是哪一件事',summary:'您的問題我找到幾個不同方向的答案，怕答錯：\n'+opts.join('\n')+'\n\n請再多說一點（例如：是協會還是合作社、問的是人數／期限／程序），我再回答。',notes:['直接回覆上面的編號也可以。'],questionState:{focus:'clarify',options:ok.slice(0,3).map(x=>x.a)}}};
 }
 return{answer:ok[0].a};
}
// 民眾回覆「1」「2」選項時，取回上一輪保留的候選
function pickOption(q,prior){const m=norm(q).match(/^([1-3１-３一二三])[.。]?$/);if(!m||!prior||prior.focus!=='clarify')return null;const k={'1':0,'１':0,'一':0,'2':1,'２':1,'二':1,'3':2,'３':2,'三':2}[m[1]];return prior.options&&prior.options[k]||null;}

const api={judge,askType,topicsOf,domainOf,score,pickOption};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AnswerArbiter=api;
})(typeof window!=='undefined'?window:globalThis);
