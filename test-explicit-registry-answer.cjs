const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const code=readFileSync(__dirname+'/index.html','utf8');
const source=code.slice(code.indexOf('function explicitRegistryAnswer('),code.indexOf('function dirAnswer('));
const {explicitRegistryAnswer:answer}=new vm.Script(source+'\n({explicitRegistryAnswer});').runInNewContext({STORE:{dir:{rows:[
 {n:'屏東縣測試雨林協會',s:'已解散',d:'滿州鄉',r:'測試登記001',p:'測試私人姓名',tel:'測試私人電話',a:'測試地址',sd:'測試解散013',dt:'2025-01-01'},
 {n:'屏東縣測試晨曦協會',s:'正常',d:'長治鄉',r:'測試登記002',p:'測試私人姓名',tel:'測試私人電話',a:'測試地址'},
]}}});
for(const q of ['幫我查另外一家協會：屏東縣測試雨林協會的立案資料。','屏東縣測試雨林協會的電話與會址在哪裡？']){
 const r=answer(q);assert.match(r?.summary,/已解散/);assert.match(r.summary,/測試登記001/);assert.doesNotMatch(JSON.stringify(r),/私人姓名|測試私人電話|測試地址/);
}
const live=answer('屏東縣測試晨曦協會的電話。');
assert.match(live?.summary,/正式公開管道/);assert.doesNotMatch(JSON.stringify(live),/測試私人電話/);
for(const q of ['不是查屏東縣測試晨曦協會的電話，我是問能不能公開私人手機？','屏東縣測試雨林協會如何重新申請立案資料？','屏東縣測試晨曦協會會址應該怎麼變更？','另外協會需要公告借用人的電話嗎？','佳冬鄉文化類團體有幾個？','屏東縣不存在協會立案了嗎？','屏東縣測試雨林協會的立案資料？另外合作社改選怎麼辦？'])assert.equal(answer(q),null,q);
console.log('精準團名、既有資料、私人欄位及會務路徑通過');
const {registryFollowup:follow}=new vm.Script(source+'\n({registryFollowup});').runInNewContext({STORE:{dir:{rows:[{n:'屏東縣測試雨林協會',s:'已解散',r:'測試登記001'}]}}});
assert.match(follow('有個協會名字我不知道，但我想找它在屏東的立案證號，我要先提供什麼？')?.summary,/所在地鄉鎮市/);
const m=follow('想查屏東縣測試雨林協會的立案資料，另外一般協會最晚哪一天能寄開會通知？');
assert.match(m?.summary,/已解散/);assert.match(m.summary,/十五日前/);
assert.match(m.summary,/七日前/);
assert.equal(follow('屏東縣測試雨林協會的電話和會址在哪裡？'),null);
assert.match(answer('幫我查屏東縣測試雨林協會立案資料')?.summary,/成立日期：2025-01-01；解散字號：測試解散013/);
const dated=follow('想查屏東縣測試雨林協會的立案資料，另外一般協會115年7月12日開會，最晚幾天前通知？');
assert.match(dated?.summary,/已提到「115年7月12日」/);
assert.equal(dated?.choices?.length,2);
assert.ok(dated.choices.every(x=>x.question.includes('115年7月12日')));
