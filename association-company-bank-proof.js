(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const refs=[
 law('社會團體財務處理辦法','D0050097',16),law('社會團體財務處理辦法','D0050097',17),law('人民團體法','D0050091',54),law('公司登記辦法','J0080020',4),
 {title:'高雄高分院判決所載各銀行個別變更印鑑實例（不代表所有銀行必備文件）',source:'https://judgment.judicial.gov.tw/FJUD/printData.aspx?id=KSHV%2C112%2C%E4%B8%8A%2C18%2C20240828%2C1'}
];
const association=['協會團體戶：當選證明可以是佐證，不一定只要這張','請向協會原開戶單位核對代表人和留存印鑑變更。理事長當選證明、改選核備資料、會議紀錄、團體立案資料、留存印鑑及有權人證件等，依開戶單位需要準備。一般協會提款另適用社會團體財務處理辦法第17條：負責人、秘書長或總幹事及財務人員共同用印，不是新任理事長一人即可。'];
const company=['公司戶：用公司自己的變更登記及代表權文件','協會的理事長當選證明不能替代公司的公司變更登記或代表權證明。公司依類型辦理負責人、代表公司之人等變更登記，並向原開戶銀行確認核准資料、最新公司變更登記事項表、適用的決議文件、公司及新負責人印鑑、證件與到場人員。這是可能的文件，非各銀行或公司一項不變的清單。'];
const check=['就算同一人，也請分兩個戶名核對','先在本地對照戶名是協會還是公司，再問該行證明、印鑑與操作權限需如何異動。不把協會與公司的收入、銀行授權或圖記混用。不要貼證件、完整帳號、銀行文件或印鑑圖樣。'];
function accountProof(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||/合作社|農會信用部自己|證券戶|商號負責人|行號負責人|工會|公會/.test(t))return null;
 if(!/協會|社會團體/.test(t)||!/理事長|協會.{0,8}當選/.test(t)||!/公司.{0,7}(?:負責人|代表人|董事長|法人戶)|(?:負責人|代表人|董事長).{0,6}公司/.test(t))return null;
 if(!/當選(?:證明|證書)|選任證明|改選核備|備查(?:函|證明)/.test(t)||!/銀行|開戶|公司戶|團體戶|戶名|帳戶/.test(t)||!/印鑑|大小章|換章|變更代表/.test(t))return null;
 const rev=t.search(/公司.{0,7}(?:負責人|代表人|董事長|法人戶)/)<t.search(/協會|社會團體/);
 return {direct:true,category:'帳戶文件｜協會與公司分流',title:'協會當選證明不是公司的代表權文件',summary:'不能用協會的理事長當選證明去證明公司負責人變更。協會和公司各用該戶名的登記或代表文件，即使是同一個人也要分開辦。',steps:[...(rev?[company,association]:[association,company]),check],refs,questionState:{focus:'compound'}};
}
if(typeof module!=='undefined'&&module.exports){module.exports={accountProof};return;}
root.verifiedAssociationCompanyAccountProof=accountProof;
})(typeof window!=='undefined'?window:globalThis);
