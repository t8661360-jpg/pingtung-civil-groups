/* 第255輪：解散與清算（欠錢解散、解散大會理事長不開、剩餘財產捐給別的協會） */
const r=require('./round-fixes.js');
const zlib=require('zlib'),fs=require('fs');
const st=JSON.parse(zlib.gunzipSync(fs.readFileSync('data/statutes.json.gz')));
const A=q=>r.verifiedRoundAnswer(r.normalizeQuestion(q),{});
let bad=0;
const pos=(qs,k)=>qs.forEach(q=>{const a=A(q);const t=a&&a.title||'';if(!t.includes(k)){bad++;console.log('✗',q,'=>',t||'(無)','期望',k)}});
pos(['欠會員錢的協會可以解散嗎','協會欠銀行錢可以解散嗎','沒錢還債的協會怎麼解散','協會有欠款可不可以直接結束','解散前要不要先把錢還完','協會負債累累要怎麼收掉','協會欠一屁股債可以散夥嗎','欠債的協會能不能直接解散'],'協會欠錢也可以解散');
pos(['解散大會理事長不開怎麼辦','理事長不召集解散大會怎麼辦','解散的大會理事長拖著不開'],'理事長不肯召集會員大會');
pos(['解散後剩餘財產捐給別的協會可以嗎','協會解散剩下的錢可以送給其他團體嗎','解散後把財產轉給另一個協會可以嗎','解散剩餘財產給別家社團行不行'],'可以捐給別的協會嗎');
pos(['理事長可以自己決定解散嗎'],'理事長不能自行解散協會');
pos(['理事長拖著不開會怎麼辦'],'理事長不開會');
const L=st.laws;
const chk=(pc,n,s)=>{const a=L[pc]&&L[pc].articles[n];if(!a||!a.includes(s)){bad++;console.log('✗法條',pc,n,s)}};
chk('B0000001','44','公益為目的之法人解散時');chk('G0340012','2','解散後，其賸餘財產應歸屬');chk('D0020094','15','三十日內');
const a=A('解散後剩餘財產捐給別的協會可以嗎');if(!a||!(a.statutes||[]).some(s=>/民法第44條/.test(s.title))){bad++;console.log('✗ 缺民法44')}
if(bad){console.log('失敗',bad);throw new Error('r255')}console.log('r255 OK');
