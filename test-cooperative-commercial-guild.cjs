const assert=require('node:assert/strict');
const {coopGuild,guildQuestion}=require('./cooperative-commercial-guild.js');
const cases=[
 ['合作社可以加入商業同業公會當會員嗎？',['強制入會','自願申請','0910012947','目前有哪種登記或許可？'],[]],
 ['我們勞動合作社只有合作社登記證和統編，照規定一定要入商業同業公會嗎？',['不會因此負第12條的強制入會義務','不能單憑這些資料'],['目前有哪種登記或許可？']],
 ['我們合作社持有效的業別特許登記，有實際業務需要，可以自願加入本地商業同業公會嗎？',['可因業務需要自願申請','並非自動成為會員','現行登記'],[]],
 ['我們勞動合作社想加入商業同業公會，只有統編沒有工廠或營業登記，和有特許許可的合作社一樣嗎？',['不同。只有合作社登記或統編','持有適用業別證照'],[]],
 ['合作社另外成立公司，兩個都要加入商業同業公會嗎？',['該公司、行號的義務獨立判斷','不等於合作社或其個別社員同時入會'],[]]
];
for(const [q,yes,no] of cases){const a=coopGuild(q);assert.ok(a,q);const s=JSON.stringify(a);for(const x of yes)assert.ok(s.includes(x),q+' missing '+x);for(const x of no)assert.ok(!s.includes(x),q+' unexpected '+x);}
for(const x of coopGuild(cases[0][0]).choices)assert.ok(!coopGuild(x.question).choices);
for(const q of ['我們工廠是否一定要加入工業同業公會？','合作社一定要加入工業同業公會嗎？','我是公司行號要怎麼加入商業同業公會？','一般合作社怎麼辦新社員加入？']) assert.equal(coopGuild(q),null,q);
const {merger}=require('./industrial-guild-membership-merger.js');
const combo=guildQuestion('工業同業公會的會員工廠被兼併後，還可沿用原代表嗎？另外合作社只有登記證，要加入商業同業公會嗎？',merger);
assert.ok(combo?.steps.some(x=>x[0].includes('原會員公司消滅')));
assert.ok(combo.steps.some(x=>x[0].includes('不是所有合作社')));
assert.ok(combo.choices.every(x=>guildQuestion(x.question,merger)?.steps.some(x=>x[0].includes('不是所有合作社'))));
const uncertain=coopGuild('合作社想加入商業同業公會，但我不確定手上的文件是一般登記還是業別特許，可以先說怎麼看嗎？');
assert.equal(uncertain?.choices.length,2);
console.log('合作社與商業公會法定及自願入會通過');
