// 2026-11-12 每日巡檢：Issue #18（大會未依規定召開）、#20（地政士）、理事出席人數句型、委託書口語、死亡同義詞、合作社任期不反問
const rf=require(__dirname+'/round-fixes.js'), qu=require(__dirname+'/question-understanding.js'), ab=require(__dirname+'/answer-arbiter.js');
const page=q=>{const n=rf.normalizeQuestion(q);const a=rf.verifiedRoundAnswer(n,{});const f=qu.resolve(n,{});const u=qu.understand(n);const c=[a&&a.title?a:null,f].filter(Boolean);if(!c.length)return{tag:'--'};const v=ab.judge(n,c,u);return v.answer?{tag:'OK',title:v.answer.title,a:v.answer}:v.clarify?{tag:'ASK'}:{tag:'REJ'};};
let fail=0;const ok=(cond,msg)=>{console.log((cond?'✔ ':'✘ ')+msg);if(!cond)fail++;};
const has=(q,re)=>{const r=page(q);ok(r.tag==='OK'&&re.test(r.title),q+' => '+(r.title||r.tag));return r;};
const not=(q,re)=>{const r=page(q);ok(!(r.title&&re.test(r.title)),'(排除) '+q+' => '+(r.title||r.tag));};

// Issue #18
const R18=/會員大會沒有依規定召開/;
const r18=has('不依規定招開大會',R18);
ok(/第25條/.test(r18.a.summary)&&/第26條/.test(r18.a.summary)&&/第27條/.test(r18.a.summary)&&/輔導辦法第15條/.test(r18.a.summary)&&/第58條/.test(r18.a.summary),'#18 引用 §25/§26/§27/輔導§15/§58');
ok(!/第30條/.test(r18.a.summary),'#18 摘要正文不把§30（理事會）當大會依據');
has('大會沒有按規定開怎麼辦',R18);
has('理事長不依規定召開會員大會怎麼辦',R18);
not('會員大會通知要幾天前寄',R18);
not('大會不依規定幾天前通知可以嗎',R18);
not('合作社社員大會不依規定召開',R18);
not('理事長一直不開會怎麼辦',R18);
not('理事會不依規定召開怎麼辦',R18);

// Issue #20
const R20=/地政士／地政士公會/;
const r20=has('地政士',R20);
ok(/不在本站法規庫/.test(r20.a.summary)&&/5317/.test(r20.a.summary),'#20 明示地政士法不在法規庫並給公會承辦分機');
has('地政士公會要找誰',R20);
not('律師公會要找誰',R20);

// 出席人數句型
has('理事9人出席4人可以開會嗎',/理事9人只出席4人：不能開會，至少要5人出席/);
has('理事15人出席8人能開會嗎',/理事15人出席8人：可以開會，15人的過半數是8人/);
has('監事5人來了3人可以開會嗎',/監事5人出席3人：可以開會/);
has('理事九人出席五人可以開會嗎',/理事9人出席5人：可以開會/);
const RB=/出席\d+人：(可以|不能)開會|只出席/;
not('理事9人剩7人開會要幾人',RB);          // vacancyQuorum
not('理事9人只有4人出席可以開會嗎',RB);     // vacancyQuorum 澄清
not('理事會要幾人出席',RB);                 // boardQuorumGeneral
not('合作社理事9人出席4人可以開會嗎',RB);
not('會員大會100人出席40人可以開會嗎',RB);
not('理事9人委託4人可以開會嗎',RB);
not('候補理事幾人',RB);

// 委託書口語（原 PR #3）
has('委託書一個人可以拿幾張',/會員大會：每位會員最多代理一人/);
has('委託書一個人最多可以拿幾張',/會員大會：每位會員最多代理一人/);
has('合作社委託書一人可以拿幾張',/合作社：每位社員最多代理一人/);
not('委託出席比例不能超過多少',/每位會員最多代理一人/);

// 死亡同義詞 → 過世（頁面先 normalizeQuestion 再理解）
has('理事長死了怎麼辦',/理事長出缺：原則上一個月內補選/);
has('理事長往生了要補選嗎',/理事長出缺：原則上一個月內補選/);
ok(rf.normalizeQuestion('理事長逝世')==='理事長過世','normalizeQuestion 逝世→過世');

// 合作社任期：純問幾年不反問
{const r=page('合作社理事主席任期幾年');ok(r.tag==='OK'&&/最長三年/.test(r.title),'合作社理事主席任期幾年 => '+(r.title||r.tag));}
has('合作社理事主席可以連任嗎',/連選連任|連任/);
has('合作社理事主席任期',/任期與連任|最長三年/);

console.log(fail?`✘ ${fail} 項失敗`:'✔ 全部通過');
process.exit(fail?1:0);
