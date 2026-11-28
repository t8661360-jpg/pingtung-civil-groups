'use strict';
const assert=require('node:assert/strict');
const {route}=require('./association-court-representation.js');
function has(q, ...patterns){
 const a=route(q);assert.ok(a,q);
 for(const p of patterns)assert.match(JSON.stringify(a),p,q);
 return a;
}
has('協會的總幹事可以代表協會去法院出庭嗎',/非律師須經審判長許可/,/特別委任/,/法院許可/);
has('協會只立案沒法院法人登記，訴狀可以列協會嗎？總幹事能簽收與出庭嗎？',/有代表人或管理人/,/當事人能力/,/收件不等於/);
has('合作社欠股款，有2個代表理事，總幹事能簽起訴狀嗎？',/共同簽署或可分別/,/D0050112/,/不能僅憑職稱/);
has('總幹事不是律師，協會剛改選但銀行印鑑沒換。民事案件出庭、簽和解、收文件跟舊委任書可用嗎？',/不因銀行印鑑/,/舊的多用途委託書/,/特別委任/,/送達日/);
has('更正，協會的總幹事不出庭也不簽和解，只想去郵局代領法院公文。,',/招領通知單/,/不等於/,/第138條/);
has('協會收到區公所調解通知，能委任總幹事代理嗎？',/不能套用/,/承辦機關/);
const menu=has('我們協會收到調解通知，理事長出國，總幹事拿章程和理事會決議就是有代理權嗎？',/發文機關及通知標題/,/通知送給誰/);
assert.equal(menu.choices.length,4);
for(const [i,r] of [/非律師須經審判長許可/,/簽成調解/,/招領通知單/,/不能套用/].entries())has(menu.choices[i].question,r);
for(const q of ['協會總幹事能代簽租約嗎','社團法人改選了要去法院做變更登記嗎','協會在法院辦法人登記要帶紙本章程嗎','新題：萬丹鄉存續團體幾個？','理事長可委託理事主持大會嗎','合作社理事會可以委託另一位理事出席嗎','大樓管委會總幹事能出庭嗎','法院查封協會銀行帳戶可不可以解凍']){
 assert.equal(route(q),null,q);
}
console.log('Court representation and adjacent routes passed');
