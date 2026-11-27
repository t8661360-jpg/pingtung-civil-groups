const a=require('node:assert/strict');
const {scope:h}=require('./meeting-quorum-kind-clarification.js');
const {route:s}=require('./association-membership-suspension.js');
for(const q of ['開會的法定人數用簽到還是現場人數算？','協會會員大會是用簽到算還是開會當時在場的人數？如果後來有人離開會不會影響？']){
 const v=h(q);a.match(v.summary,/簽到或報到.*清查動議.*清查不足即散會/);a.ok(v.refs.some(r=>r.title.includes('第16條')));
}
const e=h('協會選舉理事，成會用簽到還是在場人數？');
a.ok(e.refs.some(r=>r.title.includes('選舉罷免辦法第20條')));a.match(e.steps.flat().join(' '),/現場出席人員多數表決通過/);
a.doesNotMatch(h('合作社社員大會法定人數用簽到還是現場人數？').title,/依法清查時數現場出席者/);
a.ok(h('協會開會要多少人？').choices);
const m=s('協會理事會決議把會員停權，會員大會還能算他出席跟投票嗎？如果他不同意能怎麼申訴？');
a.equal(m.choices.length,2);
const [v,n]=m.choices.map(x=>s(x.question));a.match(v.summary,/可計出席.*不能投/);a.match(n.summary,/不列為該項出席或表決/);
for(const x of [v,n])a.match(x.steps.flat().join(' '),/書面申復.*主管機關反映/);
const o=s('協會的監事只因會員身分被停權，還能去監事會投票嗎？如果章程只說停表決權呢？');a.match(o.steps.flat().join(' '),/實際停權期間是否逾任期二分之一/);
a.match(s('協會會員同時是理事，被停權宣布兩年，但至今一個月就解任嗎？').summary,/不等於當場解任/);
a.equal(s('商業公會會員停權還能去投票嗎？'),null);
