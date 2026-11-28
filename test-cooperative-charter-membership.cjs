'use strict';
const assert=require('node:assert/strict');
const {route}=require('./cooperative-charter-membership.js');
function has(q,...ps){
 const a=route(q);assert.ok(a,q);
 for(const p of ps)assert.match(JSON.stringify(a),p,q);
 return a;
}
has('不是社區發展協會，是合作社，原社員要重新加入才能申請變更章程嗎？',/不必為了修章重新入社/,/第9條第4項/,/修章決議後一個月內/);
has('合作社想改名字，社址也搬了，要社員大會嗎？何時登記？',/名稱、社址及經營業務/,/七日前/,/一個月內/);
has('我們是一般合作社，要改社員資格、原社員住外地，現在要退股還是保留在名冊？',/過渡安排/,/不能只因住外地就自動刪名/);
has('社區合作社想改業務、降低每股金額、下個月開會、人數只有一半、住外地社員想委託，通過後幾天內登記？',/正好一半不足/,/一人最多代理一人/,/給至少一個月異議/,/清償或提供相當擔保/,/財產目錄及資產負債表/);
has('更正：是信用合作社改章程，不是一般合作社；原章程、社員會通過和送哪裡是三件事吧？',/第8條/,/第5條所列中央/,/轉請中央主管機關核定/,/未登記不能對抗/);
has('更正，不是修章，只是原社員申請退社後又想回來。',/先查退社是否已生效/,/第29條及第14條/,/年度終了/);
const a=has('不確定是普通合作社還是信用合作社，社址、章程和社員名冊都要處理，先選哪一種？',/兩者/,/信用合作社/);
assert.equal(a.choices.length,2);
has(a.choices[0].question,/不必為了修章重新入社/,/社員大會/);
has(a.choices[1].question,/第8條/,/縣（市）先轉請中央核定/);
has('一般合作社，並非信用合作社，社址搬了要改章程嗎？',/一般合作社修章/);
for(const q of ['本協會要改章程','社團法人協會的社員原本就是會員，要改協會章程嗎？','保險合作社要改章程','合作社理事會要委託出席嗎','新題：恆春鎮合作社多少個','信用合作社退社了又想回來','合作社怎麼改成銀行，要改章程嗎','合作社的總幹事代替出庭嗎'])assert.equal(route(q),null,q);
console.log('Cooperative charter procedure, credit distinction and membership cases passed');
