const assert=require('node:assert/strict');const {directorLecture}=require('./association-director-lecture-fee');
const cases=[
 ['協會可以聘理事當講師領鐘點費嗎？',['理監事本職無給','確實授課則是另一件事','要用哪種經費'],[]],
 ['協會排理事每週三固定值班，沒有上課也領講師鐘點費，這可以核銷嗎？',['沒有實際授課，不能核銷講師鐘點費','不會因改名'],['這類據點或巷弄長照站：']],
 ['協會理事真正在巷弄長照站上兩小時課，計畫能領講師費嗎，理事的值班另外算嗎？',['實際授課符合核定計畫','不能另領這類計畫的臨時工資','1150860661'],[]],
 ['巷弄長照站的協會監事早上實際授課，晚上只值班沒有上課，這兩筆能一起核銷嗎？',['實際授課符合核定計畫','不能另領這類計畫的臨時工資'],[]],
 ['關懷據點的協會監事已領專業服務費，是專職人員，還可以再領講師費嗎？',['不得重複請領'],[]],
 ['在巷弄長照站，理事臨時工資能報嗎？只有值班沒上課',['不能申領臨時工資','不能核銷講師鐘點費'],[]],
 ['屏東縣一般民間團體補助研習，協會理事實際授課可核銷鐘點費嗎？',['不是每一位理監事都符合','核定函'],['1150860661']],
 ['協會理事真的授課，協會可用自籌款支付講師費嗎？',['自籌經費','不是固定薪津'],['1150860661']]
];
for(const [q,yes,no] of cases){const a=directorLecture(q);assert.ok(a?.direct,q);const s=JSON.stringify(a);for(const x of yes)assert.ok(s.includes(x),q+' missing '+x);for(const x of no)assert.ok(!s.includes(x),q+' unexpected '+x);}
for(const x of directorLecture(cases[0][0]).choices){assert.ok(!directorLecture(x.question).choices,x.label);}
for(const q of ['協會欠總幹事薪水，理事長不簽還能發嗎？','同一人可兼當理事監事嗎？','合作社理事可以領聘任講師鐘點費嗎？','長照站可以去哪裡申請設立？','協會講師鐘點費怎麼核銷？'])assert.equal(directorLecture(q),null,q);
console.log('理監事本職、實際授課、計畫例外與臨時工資通過');
