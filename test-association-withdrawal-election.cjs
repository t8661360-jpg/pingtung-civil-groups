'use strict';
const assert=require('node:assert/strict');
const {withdrawalElection:f}=require('./association-withdrawal-election');
for(const [q,terms] of [
 ['我們是協會，會員在理事會改選前退會，還能推選理事長嗎？另外今年會費可退嗎？',['投票選理事長須具在任理事身分','應即解任','已通過的退費原則']],
 ['理事說想退會但章程沒說何時生效；接下來能選理事長嗎，年費能退嗎？',['先確認退會是否生效','由理事在常務理事中選出一人','提會員（代表）大會通過後']],
 ['協會一般會員已經退會，還可以投票選理事長嗎？',['一般會員本來不直接投票選理事長']],
 ['協會現任理事已經退會生效，還能投票選理事長嗎？年費能退嗎？',['不能投票選理事長或參選','退費原則']],
 ['已經不是會員，我原本是協會理事，還能推選理事長和拿回已繳年費嗎？',['不能投票選理事長或參選','會費要不要退']],
 ['合作社的社員年費可以和入股一起退嗎？一般協會也用同一條嗎？',['不適用同一條','合作社法第30條','社會團體財務處理辦法第14條']]
]) for(const x of terms) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['信用合作社股金如何拿回來？','會員退會以後繳過的會費可以退嗎，他還能投票嗎','協會如何罷免理事長？']) assert.equal(f(q),null,q);
console.log('withdrawal election and fees tests passed');
