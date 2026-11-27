'use strict';
const a=require('node:assert/strict');
const {route}=require('./association-meeting-finance-sequence');
const {route:filing}=require('./association-withdrawal-and-filing');
for(const q of ['我們協會今年先改理事長任期、沒有改選，修章忘記報；現在想延後大會，決算還沒經監事會審，補助款又等著撥，這些事情怎麼排順序？','補助款已核定還在等撥、決算沒給監事會審、大會想延期；協會今年沒有改選但改了理事長任期且漏送縣府，先做哪件？']){
 const x=route(q);a.ok(x,q);a.match(x.summary,/沒有改選.*次屆.*同時做.*決算先由監事會審/);
 a.match(x.steps[0][1],/30日內核備/);a.match(x.steps[1][1],/大會追認後再報/);a.match(x.steps[2][1],/15日前.*派員列席/);
 a.match(x.steps[3][1],/核定函、撥款條件、補正期限.*一定能撥或一定撤回/);
}
a.equal(route('合作社決算還未審、補助款等撥、修章沒報、社員大會延期。'),null);
a.equal(route('協會今年沒有改選，改理事長任期未報；大會延期，決算也已經監事會審核，補助等撥。'),null);
for(const q of ['協會章程改了但還沒報，會址也搬了；大會通知已寄，不過開會還是在原地點，這三件事各怎麼辦？','大會地點沒換，原來的通知也寄了；不過協會章程改了還沒報，登記的會址也搬了，怎麼分開辦？']){
 const x=filing(q);a.match(x.steps[2][1],/依您說的大會仍在原地點.*不必只因登記會址搬遷而重發/);
 a.match(x.steps[0][1],/章程異動後30日/);a.match(x.steps[1][1],/理事會通過/);
}
a.match(filing('協會章程已改還沒報，會址搬了，大會原通知已寄但會場也改了，三件事一起辦嗎？').steps[2][1],/若會場已變，應更正/);
