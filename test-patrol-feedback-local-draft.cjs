const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let failWrites=false, blocked=false, resets=0;
const store=new Map();
const status={textContent:'',className:''};
const context=vm.createContext({
 localStorage:{getItem(k){if(blocked)throw Error('blocked');return store.get(k)??null;},setItem(k,v){if(blocked||failWrites&&k==='feedback_queue')throw Error('unwritable');store.set(k,v);}},
 document:{readyState:'loading',addEventListener(){},getElementById(id){assert.equal(id,'feedback-status');return status;}},
 navigator:{userAgent:'offline QA'},FormData:class {get(k){return {type:'error',question:'測試問題',answer_title:'測試標題',issue:'測試文字'}[k];}},
 console:{error(){}},fetch(){throw Error('network calls prohibited');}
});
vm.runInContext(fs.readFileSync(__dirname+'/feedback-collector.js','utf8'),context);
const create=()=>vm.runInContext('new FeedbackCollector()',context);
const c=create(),form={reset(){resets++}};
c.submitFormData(form);
assert.match(status.textContent,/已儲存在此瀏覽器，尚未送出/);
assert.equal(resets,1);
assert.equal(JSON.parse(store.get('feedback_queue')).length,1);
failWrites=true;
c.submitFormData(form);
assert.match(status.textContent,/未能儲存草稿，內容尚未送出/);
assert.equal(resets,1);
assert.equal(c.getPendingFeedback().length,1);
failWrites=false;
c.submitFormData(form);
assert.equal(resets,2);
assert.equal(JSON.parse(store.get('feedback_queue')).length,2);
blocked=true;
const noStorage=create();noStorage.loadQueue();noStorage.submitFormData(form);
assert.match(status.textContent,/未能儲存/);assert.equal(resets,2);
console.log('local feedback draft OK');
