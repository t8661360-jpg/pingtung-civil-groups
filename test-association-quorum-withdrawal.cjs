'use strict';
const assert=require('node:assert/strict');
const {quorumWithdrawal:f}=require('./association-quorum-withdrawal');
for(const [q,expected] of [
 ['理事會開到一半有人走掉，剩下的人通過的支出，可以直接拿存款嗎？',['領款憑證上共同蓋章','當時有沒有通過清查動議']],
 ['協會九名理事有六人簽到，兩人離席，清查動議通過後點到四人，已經三方蓋章，這筆錢能領嗎？',['至少要5人出席','清查動議通過後只剩4人','不能補正會議程序']],
 ['協會理事會五人合法通過支出，但是只有理事長蓋章，可以提款嗎？',['不能只憑理事長一人蓋章提款']],
 ['協會理事會表決之後才有人離席，先前通過的支出要重表決才能領款嗎？',['不必只因事後離席重表決']]
]) for(const x of expected) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['合作社理事會有人離席後表決支出，合作社帳戶提款是否也要三方蓋章？','社區協會理事長換人，銀行印鑑怎麼辦','理事會決議同票，理事長可否再投一票']) assert.equal(f(q),null,q);
console.log('association quorum withdrawal checks passed');
