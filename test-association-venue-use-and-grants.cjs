const {route,follow}=require('./association-venue-use-and-grants'),a=require('node:assert/strict');
const q=[
 "社區發展協會只借公所活動中心做一天課程，借用同意書和收據能否作新會址登記，補助可以報水電嗎？",
 "我們一般協會和同名的合作社要共用里民中心辦公，房東說只有協會能簽。合作社可以用協會收據、請理事長代簽、會址能先報嗎、兩邊水電怎麼分？",
 "屏東協會拿到縣府補助辦活動，場館開兩張收據，押金已原路退、跨年後才扣取消費、剩餘額想轉下一場、公所只口頭說能改場地、會費又由里長先收，怎麼補憑證和繳回？",
 "社區協會有法院法人登記、獲縣府和中央補助，活動借活動中心被颱風取消，全額退押金但場租另付沒退。現在想搬會址掛在活動中心、里長說可借、不給正式同意；理事會決議後要不要修章、國稅/銀行/法院要不要跑、將原訂費和水電報給兩邊，沒花完能否改成辦公費、要先問誰？",
 "更正，我們不搬會址，只是租一天活動場地，押金全部退了，兩筆補助原核定未同意分攤。",
 "換題：合作社章程禁止社員把社股質押給銀行，請問有法規嗎？",
 "屏東協會只是借活動中心兩天，借用契約要用理事長私人名還是協會名？收保證金要怎麼記？",
 "一般協會的會址搬到同鄉，房東只同意收信、不同意辦活動；可用那址登記、地址誰決議、是不是要修章、租金可用哪一方補助嗎？",
 "合作社和協會原本借同個地址、共用電表，縣府要求補地址資料；合約快到期、兩方各有房租補助，我們想把房租、水電、戶籍登記、各自會址決議、補助憑證一起處理。要先核對哪些、哪張單據不能重複？",
 "補充：房東只同意協會，未同意合作社對外登記；兩家補助分項並沒有重複全額。",
 "我們一般協會借教室，這次並沒有遷會址，大門寫了協會名稱，押金後來全退了，能列核銷嗎？",
 {
  "q": "我們協會借活動中心，想問會址和費用，但還沒決定是不是遷登記地址。補助能報水電嗎？",
  "choose": "只借場地，不遷會址"
 },
 {
  "q": "協會借活動中心，這次借場和正式登記會址都在考慮，補助水電可報嗎？",
  "choose": "也要遷登記會址"
 }
],all=x=>JSON.stringify(route(x));
a.match(all(q[0]),/不是長期辦公或登記會址的證明/);
a.match(all(q[0]),/只列核定容許且實際負擔/);
for(const w of ['不同團體','一個月內','部分轉租','兩個團體也不能互用對方收據'])a.ok(all(q[1]).includes(w),w);
for(const w of ['已退金額不是補助實支','跨年','里長代收的會費','應繳回'])a.ok(all(q[2]).includes(w),w);
for(const w of ['已法院登記','另向法院辦變更','國稅局','必要','原核定','場租'])if(w!=='必要')a.ok(all(q[3]).includes(w),w);
a.ok(follow(q[4]));
const t=all(q[3]+'；更新情況：'+q[4]);
a.match(t,/已退金額不是補助實支/);a.match(t,/原核定沒有同意分攤/);a.doesNotMatch(t,/向法院辦變更登記/);
a.equal(route(q[5]),null);a.equal(follow(q[5]),false);
a.match(all(q[6]),/由合法有權代表人/);a.match(all(q[6]),/可收回款項/);
a.match(all(q[7]),/只准收信/);a.match(all(q[8]),/戶籍/);
for(const i of [11,12])a.equal(route(q[i].q).choices.length,2);
const x=route(q[11].q);
a.doesNotMatch(all(x.choices[0].question),/協會正式遷址/);
a.match(all(x.choices[1].question),/協會正式遷址/);
const arb=require('./answer-arbiter.js');
a.ok(!arb.topicsOf(q[8]).includes('任期'));
a.ok(arb.topicsOf('租約快到期了但理事長任期也到期').includes('任期'));
a.ok(arb.topicsOf('協會理事月底到期怎麼辦').includes('任期'));
console.log('association venue bifurcation cases passed');
