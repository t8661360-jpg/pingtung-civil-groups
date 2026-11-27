'use strict';
const assert=require('node:assert/strict');
const {route}=require('./association-expulsion-disclosure');
const q='協會的監事說我欠會費就當場把我除名，順便把名單貼到網路，這兩件可以嗎？';
const direct=route(q);
assert.match(direct.summary,/不能當場自行除名.*不要在網路公開/);
assert.match(direct.steps[0][1],/不會自動除名.*情節重大.*過半數出席.*三分之二以上/);
assert.match(direct.steps[1][1],/目的外利用須有法定例外/);
assert.equal(direct.choices,undefined);
const reverse=route('協會如果先把欠會費名單貼到官網，再由監事把會員除名，可以嗎？');
assert.match(reverse.steps[0][0],/^名單/);
assert.match(reverse.steps[1][0],/^除名/);
const unknown=route('協會監事說要因欠會費除名，還要張貼名單，這樣可以嗎？');
assert.equal(unknown.choices.length,2);
const [publicAnswer,privateAnswer]=unknown.choices.map(x=>route(x.question));
assert.match(publicAnswer.summary,/不要在網路公開/);
assert.match(privateAnswer.summary,/會員群組不是對外公開/);
assert.match(privateAnswer.steps.flat().join(' '),/也要限必要的人和資料/);
for(const a of [publicAnswer,privateAnswer])assert.match(a.steps.flat().join(' '),/欠費不會自動除名/);
for(const negative of [
 '合作社的監事說我欠會費就當場把我除名，順便把名單貼到網路，可以嗎？',
 '協會監事欠會費可以繼續當嗎？',
 '協會因欠會費要不要除名，通知本人，不公開名單，可以嗎？',
 '協會要把匿名統計公開，欠會費除名不能這樣做嗎？'
]) assert.equal(route(negative),null,negative);
