'use strict';
const assert=require('node:assert/strict');
const {chairVote:f}=require('./association-chair-vote');
for(const [q,terms] of [
 ['理事會開會，理事長可以不投票嗎，可否同數時誰決定',['平手不等於通過','第29條','已有效採用']],
 ['九名理事，理事會五人出席含主席，兩票贊成兩票反對，主席不投票時議案過了嗎？',['出席5人至少需3票同意','沒有過半']],
 ['九名理事，理事會六人出席，二票同意二票反對，主席還沒投票，能再投嗎？',['出席6人至少需4票同意','仍未達過半']],
 ['理事長已經算在同意票了，結果三票比三票，還能再投一票打破平手嗎？',['不得再因平手加投第二票']],
 ['如果是互選理事長兩個人同票，也是讓主席補投嗎？',['按選舉規定抽籤','人民團體選舉罷免辦法第15條']]
]) for(const x of terms) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['合作社理事會四票對四票，主席可以再投嗎','協會的理事會多久一次','協會要選理事長，要用無記名投票嗎？'])assert.equal(f(q),null,q);
console.log('association chair vote tests passed');
