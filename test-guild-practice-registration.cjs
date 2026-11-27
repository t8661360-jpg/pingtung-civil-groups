'use strict';
const assert=require('node:assert/strict');
const {guildPractice:f}=require('./guild-practice-registration');
for(const [q,terms] of [
 ['護理師在屏東要執業，沒有加入所在地護理師護士公會，可以上班嗎？',['護理人員法第10條','不得執業','衛生主管機關']],
 ['醫師要在屏東診所執業，先加入所在地公會還是去辦執業登記？公會能拒絕嗎？',['醫師法第9條','衛生主管機關','先入公會，再辦執業登記']],
 ['第一次辦社工師執登，可以先送件再補公會會員證明嗎？',['社會主管機關','社會工作師法施行細則第4條','不能保證會受理']],
 ['商業同業公會可以拒絕有資格的同業公司入會嗎？跟社工師公會一樣嗎？',['會員是公司、行號','登記證照影本二份','社會工作師法第31條','暫緩入會']]
]) for(const x of terms) assert.ok(JSON.stringify(f(q)).includes(x),q+' '+x);
for(const q of ['地政士公會可以拒絕我入會嗎','護理師公會理事長能連任嗎','社工師事務所開業執照要如何申請','協會怎麼成立'])assert.equal(f(q),null,q);
console.log('guild practice tests passed');
