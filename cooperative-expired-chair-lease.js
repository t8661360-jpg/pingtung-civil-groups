(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const c=n=>law('合作社法','D0050112',n);
const e=n=>law('合作社選舉罷免辦法','D0050022',n);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>235||!/合作社/.test(t)||!/理事會主席|理事主席|理事長|舊主席|前任主席/.test(t)||!/任期.{0,8}(?:屆滿|到期|過了|到了|已滿)|任滿|屆期|卸任|舊任|前任|還沒改選|沒改選|改選.{0,8}(?:尚未|還沒)/.test(t)||!/租約|租賃|簽新約|簽約|續租/.test(t)||/信用合作社|農會|漁會|基金會|社區發展協會|一般協會|工業會|公會|解散|清算/.test(t))return null;
 const location=/遷址|搬|社址|會址|地址|變更登記/.test(t);
 const self=/租.{0,5}(?:是理事|理事名下|理事的房|理事自己的房)|理事.{0,7}(?:是房東|當房東|出租|租給合作社)|房東.{0,5}(?:是|為)理事/.test(t);
 const executed=/已經簽|已簽|簽好了|都簽了|簽完|已蓋章/.test(t);
 const lines=[
  ['由誰簽，要先核對代表權','合作社法第33條規定理事、監事任期最長三年，符合規定可連選連任。依第34條，理事依法律、章程與社員大會決議執行職務，並互推一人或數人對外代表。查看章程、當屆選舉及理事互推紀錄、主管機關最新登記資料，以及租約所需的內部決議，確認簽約當日誰有代表權。'],
  ['原主席可以召集互選，不等於可以簽新約','選罷辦法第6條規定，由原任理事會主席於理事選出後15日內召集互選；逾期不召集，由得票最多的理事召集。這項召集權不是續任或簽租約的一般授權。若未改選或代表權未釐清，先不要讓前任用原職名簽新約；向合作社主管機關確認改選和登記，再由有權代表人依程序辦。']
 ];
 if(self)lines.push(['理事同時是房東，要分兩邊','合作社若與自己的理事訂立契約，依第39條第1項第4款，由監事代表合作社。出租理事不要同時代表租賃雙方簽署；仍要核對章程、決議及監事權限。']);
 if(executed)lines.push(['已簽的租約不能只憑任期判定有效或無效','保留契約與簽約當時的登記、章程和授權文件，請主管機關核對登記和改選；涉及登記事項已變更卻未登記時，另有第9條對善意第三人的規則。契約效力如有爭議，帶文件向法律專業人員確認，不自行塗改或重簽。']);
 if(location)lines.push(['實際搬遷是另一件事：要辦社址變更','合作社法第9條以社址為登記事項；社址確有變更，應於一個月內辦理變更登記。社址也是第9-1條的章程記載事項；如涉及修章，由社員大會決議，決議後一個月內檢附會議紀錄辦理變更登記。只有先看屋或簽約、社址尚未變更，不等於已辦完社址異動。送件前向屏東縣合作社承辦確認最新證明文件。']);
 return {direct:true,category:'合作社會務｜租約代表權與社址',title:'原主席任期屆滿：先核對簽約代表'+(location?'，搬遷另辦社址變更':''),summary:'不能只憑曾任主席或仍持有印章，就判定可以代表合作社簽租約。'+(self?'出租人是合作社理事時，由監事代表合作社與理事訂約。':'先確認依法有代表權的人與有無必要的決議。')+(location?'社址確有變更，仍須依法辦理變更登記。':''),steps:lines,refs:[c(33),c(34),e(6),...(self?[c(39)]:[]),...(location||executed?[c(9)]:[]),...(location?[c('9-1')]:[])],questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCoopExpiredChairLease=route;
})(typeof window!=='undefined'?window:globalThis);
