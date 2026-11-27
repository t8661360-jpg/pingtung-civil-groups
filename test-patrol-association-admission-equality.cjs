const a=require('node:assert/strict');
const {associationAdmissionEquality:fn}=require('./association-admission-equality.js');
const text=q=>JSON.stringify(fn(q));
a.match(text('協會可以只因為我的性別表現拒絕我入會嗎？'),/不能只因外在性別表現拒絕入會.*不能把歧視條款當成合法理由/);
a.match(text('我是男生，協會只因為我平常化妝就拒絕入會，章程有寫就可以嗎？'),/化妝、穿著等外在性別表現/);
a.match(text('已經是會員了，協會因我的性別表現要除名，理事長可以自己決定嗎？'),/理事長不能自己把會員除名.*三分之二以上同意/);
a.match(text('住外地和性別表現，協會可以同時用來拒絕我入會嗎？'),/不能只因外在性別表現.*居住地條件和外在性別表現分開看/);
for(const q of ['章程規定每位現任會員都要同意才能入會','協會可以要求住本鄉才可以入會嗎？','職業公會可以拒絕有資格者入會嗎？','協會因為性別表現拒絕聘僱我'])a.equal(fn(q),null,q);
