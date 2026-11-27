const assert=require('node:assert/strict');
const {clanScope}=require('./clan-association-scope.js');
const issues=[
 ['協會的章程可以規定會員一定要是某個姓氏的人嗎？宗親會歸誰管？',['配偶能否加入看該會章程','不能直接照搬同姓限制','屏東縣政府社會處','全國性宗親會：內政部'],['1020041526']],
 ['我要籌組屏東縣的宗親會，章程可只收同姓嗎？不同姓的配偶呢？',['不因結婚就自動入會','30位以上','成立大會後30日內'],['全國性宗親會：內政部']],
 ['同地已有聯宗會，可以再成立一個單姓宗親會嗎？',['不當然阻止','不得與已許可團體同名'],['自動核准成立']],
 ['我們要處理祖產與派下員，成立宗親會後可直接辦土地嗎？',['不會自動取得或移轉祖產','鄉（鎮、市）公所','地政事務所'],[]],
 ['跨縣市的全國性宗親會要找社會處還是內政部？',['內政部合作及人民團體司','按章程擬定的組織區域'],['屏東地方性宗親會：屏東縣政府社會處']],
 ['一般社區發展協會已立案後想限制某個姓氏的人才可入會，可以嗎？',['不能直接比照宗親會','團體宗旨','適用的特別規定'],['全國性宗親會：內政部']],
 ['祭祀財團法人新設要找民政還是社政？',['先洽民政','不是宗親會社團立案'],['社會處人民團體業務']],
 ['我配偶不同姓，屏東地方性宗親會肯收嗎？縣府哪個處室受理？',['不因結婚就自動入會','08-732-0415'],['全國性宗親會：內政部']]
];
for(const [q,w,no] of issues){
 const a=clanScope(q);assert.ok(a?.direct,q);const s=JSON.stringify(a);
 for(const term of w)assert.ok(s.includes(term),q+' missing '+term);
 for(const term of no)assert.ok(!s.includes(term),q+' unexpected '+term);
}
const mixed=clanScope(issues[0][0]);assert.equal(mixed.choices.length,3);
for(const x of mixed.choices){const next=clanScope(x.question);assert.ok(next);assert.ok(!next.choices);if(!x.label.includes('祖產'))assert.ok(JSON.stringify(next).includes('不因結婚就自動入會'));}
for(const q of ['查詢屏東縣有幾個宗親會','佳冬鄉的宗親會有幾家？','地方社區發展協會一定要有戶籍嗎？','合作社清算如何處理？','協會章程修改需要幾票？'])assert.equal(clanScope(q),null,q);
console.log('宗親會、普通社團、祭祀公業與主管機關分流通過');
