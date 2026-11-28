(function(root){
'use strict';
const law=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const labor=(n)=>law('勞動基準法','N0030001',n);
const guide={title:'勞動部：勞動契約如何認定',source:'https://www.mol.gov.tw/1607/28162/28296/28340/28342/28344/'};
const channel={title:'勞動部：勞資爭議調解與勞動法令申訴',source:'https://www.mol.gov.tw/1607/28690/89680/nodelist'};
const pingtung={title:'屏東縣政府勞動暨青年發展處：勞資爭議調解',source:'https://www.pthg.gov.tw/planlab/ServicePage_1_3_5.html'};
const coopLaw=law('合作社法','D0050112',30);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>340||/工資墊償基金|職災|法院強制執行|支付命令|資遣費|退休金|薪資扣繳|所得稅/.test(t))return null;
 if(/(?:沒有|未曾|不是)(?:實際)?(?:聘僱|受僱)|只(?:是|當).{0,8}(?:監事|理事|志工).{0,8}(?:搭車|交通費|開會)/.test(t)&&!/不是志工|確實受僱|實際受僱/.test(t))return null;
 const role=/(?:是|算)(?:員工|志工).{0,7}(?:志工|員工)|勞動關係|是否受僱|究竟.{0,9}(?:志工|員工)/.test(t)&&/排班|代班|固定|津貼|交通費|考勤|約定/.test(t);
 const org=/協會|社會團體|社區發展|合作社/.test(t)||/理事長|總幹事/.test(t)&&/志工|員工|行政|受僱|聘僱/.test(t);
 if(!org||/不是(?:一般)?協會.{0,12}(?:公司|工商行號)|我們是(?:公司|行號)|信用合作社|信合社|同業公會|事業工會/.test(t))return null;
 if(/是否受僱有爭議|有沒有勞動契約.{0,6}(?:諮詢|判斷)/.test(t)){
  return {direct:true,category:'人民團體用工｜勞動契約諮詢',title:'不確定是否受僱，可請工作地勞工窗口協助判斷',
   summary:'可向工作所在地的勞工主管機關或撥1955諮詢。保留約定、班表、代班核准、工作指示和每月給付款項資料，讓窗口按實際從屬性判斷，不靠「津貼」名稱定性。',
   refs:[labor(2),guide,channel],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 }
 const wage=/薪水|薪資|工資|發薪|給薪|欠薪|追薪|月薪/.test(t);
 const overdue=/欠薪|追薪|拖欠|積欠|欠.{0,11}(?:薪|工資)|(?:沒|未|不)發薪|沒拿到.{0,6}(?:薪水|工資|薪資)|到了.{0,9}(?:沒|未)|(?:沒(?:有)?|未)(?:發|付|領|匯|拿|收到|入帳)|補助.{0,8}沒下來|等補助|尚未撥|沒有薪水/.test(t);
 const scope=/工作人員|員工|總幹事|幹事|行政|出納|受僱|聘|打卡|勞工|排班|欠薪|追薪|發薪|欠我.{0,6}(?:薪水|薪資|工資)/.test(t);
 const alternateSignature=/(?:副理事長|副會長).{0,18}(?:代簽|代蓋|代領)|(?:代簽|代蓋|代領).{0,18}(?:副理事長|副會長)/.test(t);
 if(!role&&(!wage||!overdue||!scope||alternateSignature))return null;
 const receipt=/簽收|已清償|簽已領|先簽|收據|私人帳戶|代付/.test(t);
 const capital=/合作社|社員/.test(t)&&/股金|股款/.test(t);
 const dissolution=/解散|清算/.test(t);
 const outside=/工作(?:地|所在地|地點)?(?:在|是)(?:高雄|台北|臺北|新北|台中|臺中|台南|臺南|宜蘭|花蓮|臺東|台東|桃園|新竹|基隆|彰化|南投|雲林|嘉義|澎湖|金門|連江)/.test(t);
 const first=['先看是否實際受僱，而不是比職稱','即使叫志工、無給職理事或交通津貼，還是要看實際指揮監督、排班、考勤、報酬與工作安排。偶爾能找人代班只是其中一項，還要看代班是否需經同意。真的是志工或無給職監事時，交通費核銷不是追薪。'];
 if(role&&(!wage||!overdue)){
  return {direct:true,category:'人民團體用工｜員工與志工',title:'固定給錢或能代班，都不能單獨決定是不是員工',
   summary:'先看實際工作方式：誰排班、誰指揮或考核、有沒有固定報酬、代班要不要核准。不是把薪水寫成交通津貼，就一定不是員工。',
   steps:[first],choiceHeading:'您比較接近哪個情況？',choices:[
    {label:'確實受僱，工資已到期未領',question:'我實際受僱在協會，工資已到給付日但沒有收到，如何申訴或調解？'},
    {label:'僅擔任無給職監事',question:'協會無給職監事出席會議可憑車票報交通費嗎？'},
    {label:'不確定有沒有勞動契約',question:'協會工作是否受僱有爭議，應向哪裡諮詢勞動契約判斷？'}
   ],refs:[labor(2),guide],actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
 }
 const pay=['到期的工資不能因補助還沒撥而扣住','如果是實際受僱，雇主應按約定或法定週期足額給付工資並提供明細。實際已到發薪日，不能因縣府補助未到、停止活動、內部簽核或改叫志工、無給職而片面延後。補助能否支應另看核定函，不是把追薪請求改向補助機關。'];
 const methods=['申訴與討回欠薪是兩條路','反映疑似違反勞基法，可向勞工主管機關或勞動檢查機構申訴；要和雇主處理欠薪的給付，可向勞務提供地的勞工主管機關申請勞資爭議調解。'+(outside?'您提到實際工作在別縣市，請向工作所在地的勞工局（處）辦理。':'在屏東工作，可找屏東縣政府勞動暨青年發展處；不是必須找補助承辦。')+'可先撥1955諮詢，不保證單靠申訴就收到工資。'];
 const docs=['把實際欠薪月份、金額和發薪日列出來','私下保留勞動契約或工作約定、排班出勤、薪資明細、匯款紀錄，以及書面催薪和雇主回覆。不要貼個人薪資、帳號或完整文件到公開欄。'];
 const extra=['沒有收到，不要先簽「已領」或「已清償」','如實確認已收到的金額及日期，不要為領補助而簽與事實不符的收據。別用私人帳戶代付同事，也不要把協會核銷與員工已領薪資混在一起。'];
 return {direct:true,category:'人民團體用工｜欠薪與勞資爭議',title:capital?'工資與社員股金分開處理':'受僱工資到期仍沒發：不用等補助，申訴與調解分開',
   summary:'實際受僱且工資已到約定發薪日，可先向雇主書面確認；補助沒到，不能當作延期發薪的理由。違反勞基法可向工作所在地勞工主管機關或勞檢機構申訴；想討回欠薪可另外申請勞資爭議調解。'+(receipt?'沒有收到工資，不要先簽已清償。':''),
   steps:[pay,methods,...(receipt?[extra]:[]),docs,...(/無給職|志工|津貼/.test(t)?[first]:[]),...(dissolution?[['協會解散與欠薪分開','擬解散或停辦活動不代表已清償，先向勞工窗口說明實際解散狀況與未付工資，必要時個別確認後續主張對象。']]:[]),...(capital?[['社員股金不是工資','如果另一筆是出社退股，按合作社法第30條及章程核對出社、年度財產、股金計算和確切請求。先向合作社確認，再向該社主管機關查詢；不能把股金與工資合成一筆，也不推定何時應退。']]:[])],
   refs:[labor(2),labor(22),labor(23),labor(74),law('勞資爭議處理法','N0020007',9),channel,...(outside?[]:[pingtung]),...(/無給職|志工|津貼/.test(t)?[guide]:[]),...(capital?[coopLaw]:[])],
   actions:[{label:'聯絡承辦',view:'contact',sub:''}],questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationUnpaidWageTriage=route;
})(typeof window!=='undefined'?window:globalThis);
