const assert=require('node:assert/strict');
const {answerMixed,schoolParentFiling}=require('./verified-mixed-questions');
const initial=answerMixed('家長會長改選要報縣府嗎');
assert.deepEqual(initial.choices.map(x=>x.label),['屏東縣立國中小','屏東縣立高中','教育部主管高中','另外立案的家長協會']);
for(const q of ['國立屏東女中家長會長換人，要報屏東縣府嗎？','要向誰報備？國立屏東女中家長會長任期中辭職，由別人接任。',initial.choices[2].question]){
 const a=answerMixed(q);assert.match(a.title,/學校報國教署備查/);
 assert.match(a.steps.flat().join(' '),/開會後一個月內.*會議紀錄.*報國教署備查.*第28條也適用會長異動/);
 assert.ok(!a.choices);
}
const basic=answerMixed(initial.choices[0].question);
assert.match(basic.summary,/教育處 08-7320415 轉 3621/);
assert.doesNotMatch(basic.steps.flat().join(' '),/一個月內/);
assert.match(answerMixed(initial.choices[1].question).summary,/高中職業務/);
assert.doesNotMatch(answerMixed(initial.choices[1].question).summary,/3621/);
for(const q of [initial.choices[3].question,'屏東縣的幼兒園家長會改選，能向教育處報備嗎？','高雄國中家長會改選要報哪裡？','協會改選理事長要報誰？','學校家長會的會費可以怎麼用？']) assert.equal(schoolParentFiling(q),null,q);
console.log('school parent filing OK');
