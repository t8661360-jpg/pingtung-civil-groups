const assert=require('node:assert/strict');
const {merger}=require('./industrial-guild-membership-merger');
const cases=[
 ['工業同業公會會員只買工廠或產線，原公司仍在，新經營者可繼續用原會員代表投票嗎？',['只買工廠或設備、原公司仍在','僅憑買賣合約不直接推定取得原代表資格'],['原本派出的會員代表資格隨同喪失']],
 ['工業同業公會的會員工廠被合併了，會員資格要轉給新公司嗎？',['先確認原會員公司有沒有消滅','公司登記變動是哪一種？','台內社字第16537號'],[]],
 ['我們原公司被別家公司吸收而消滅，存續公司繼續經營原工廠，原來的工業同業公會代表能繼續投票嗎？',['不能用舊資格投票','先確認存續公司的新工廠登記','不會只因原會籍註銷就當作一律免除'],['公司登記變動是哪一種？']],
 ['我們公司只是改名，法人、統編與工廠登記主體不變，工業同業公會要先退會再入會嗎？',['不必因改名先退會再入會','會籍資料異動'],['須註銷原會籍']],
 ['原公司被吸收消滅，工業同業公會原本代表還當著理事，能直接讓新公司接理事嗎？',['依工業團體法第25條解任','候補','不是職位自動轉交新公司'],[]],
 ['工業同業公會會員法人不變只是股東變更，原會員代表資格需要重辦嗎？',['單純公司改名不當然使原代表喪失資格','核對代表'],['原會員公司因併入他公司而消滅']]
];
for(const [q,yes,no] of cases){
 const a=merger(q); assert.ok(a,q); const raw=JSON.stringify(a);
 for(const x of yes)assert.ok(raw.includes(x),q+' missing '+x);
 for(const x of no)assert.ok(!raw.includes(x),q+' unwanted '+x);
}
for(const c of merger(cases[1][0]).choices)assert.ok(!merger(c.question).choices);
for(const q of ['工業同業公會的會員代表可以同時代表兩家工廠嗎？','商業同業公會的會員公司被併購會籍可直接轉讓嗎？','工業同業公會會員因員工離職更換代表怎麼辦？'])assert.equal(merger(q),null,q);
console.log('工業同業公會吸收合併與會籍異動通過');
