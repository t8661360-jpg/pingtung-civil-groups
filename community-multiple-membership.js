(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const law=(title,code,n)=>ref(title+'第'+n+'條','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n);
const p=n=>law('人民團體法','D0050091',n), e=n=>law('人民團體選舉罷免辦法','D0050093',n), g=n=>law('人民團體會務輔導辦法','D0020094',n);
const work=ref('衛生福利部：社區發展工作要點第4、17點（114年7月1日函頒）','https://www.mohw.gov.tw/dl-95694-5dc346e5-6659-487b-9bb3-42e733c51da1.html');
const members=ref('內政部：符合各社會團體資格，法令或章程未限制，可加入多個團體','https://www.moi.gov.tw/News_Content.aspx?n=14119&s=220228');
const current=ref('雲林縣政府轉載衛生福利部1140140974號函：會員資格由理事會依章程與會籍認定','https://ws.yunlin.gov.tw/Download.ashx?n=5YWs5paHLnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvNTMyL3JlbGZpbGUvMjA5MzkvNTY3ODQxLzkyYzBkNDgxLWEzMmQtNGE0Yy04OTU4LTc0MWRmODZkMzVlNy5wZGY%3D');
const losing=ref('內政部：會員資格審定與理事依法解任是不同程序','https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256718');
const replaced=ref('內政部：更換團體會員代表，不會接任原代表的理監事席次','https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256716');
const base={direct:true,questionState:{focus:'compound',domain:'community-multiple-membership'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
function route(input){
 const raw=String(input??'').trim(),q=raw.normalize('NFKC').replace(/\s/g,'');
 if(!q||q.length>600||/信用合作社|合作社|工會|同業公會|醫師公會|公職|村里長|政黨|家長會/.test(q))return null;
 const issueName=/名字|名稱|同名/.test(q)&&/同樣|同名|相同|一模一樣|重複|一樣/.test(q)&&/其他縣市|不同縣市|別的縣市|另一縣|鄰縣|隔壁縣/.test(q)&&/協會|團體/.test(q);
 if(issueName)return {...base,category:'協會｜組織區域與名稱預查',title:'別縣市同名，不宜只看名字就斷定不能在屏東立案',summary:'先看兩會依法核定的組織區域是否相同，不是只比較辦公室在哪個縣市。屏東是否接受這個完整名稱，送件前仍要辦名稱預查。',steps:[
 ['同一組織區域內：避免與已許可團體同名','人民團體法第5、7條：同一組織區域原則可有二個以上同級同類團體，但名稱不得與已許可團體相同，也不能使人誤認與政府機關、政府捐助財團法人或營利團體有關，或使用歧視、仇恨性文字。對方若確是另一縣的地方團體，不等於就踩到同一組織區域同名；對方若是全國性、分支或實際範圍有重疊，先由主管機關認定，不保證核准。'],
 ['社區範圍不是名稱規則','社區發展協會的區域原則以村里為單位，不超出鄉鎮市區；不能從名稱規則就判定一個社區依法只能有一個協會。把雙方完整中文名稱、立案層級與擬定組織區域帶給屏東縣府；若是社區發展協會，並先向公所核對組織範圍。']
 ],refs:[p(5),p(7),work,ref('內政部：縣市改制時同名社會團體處理','https://www.moi.gov.tw/News_Content.aspx?n=11516&s=138690')]};
 const community=/社區發展協會|社區協會|社區組織|甲社區|乙社區|原社區|新社區|鄰近社區|兩個社區|另一個社區/.test(q);
 const dual=/雙邊|兩邊|兩(?:個|間|家|會)協會|兩個社區|另一(?:個|家|間)?社區|另一(?:個|家|間)?協會|其他(?:個|家)?協會|鄰近.{0,8}(?:社區|協會)|第一個.{0,8}社區|原社區.{0,30}新社區|甲.{0,30}乙|甲社區|乙社區/.test(q);
 const move=/戶籍|設籍|居住|住址|搬家|遷出|遷入|搬走|遷籍/.test(q);
 const member=/入會|會籍|會員|理事|代表|投票/.test(q);
 if(!community||!member||!dual||/準備.{0,4}(?:成立|籌設)|章程範本下載|會址使用同意|共用.{0,4}地址/.test(q))return null;
 const status=/身分確認:([^。；]+)/.exec(q)?.[1]??'';
 const correction=raw.split(/；補充[：:]/).at(-1);
 const v=(raw.includes('；補充')?correction:raw).normalize('NFKC').replace(/\s/g,'');
 const explicitPersonal=status==='個人會員'||/是個人會員|本人個人會員|不是掛在.{0,10}團體會員/.test(v)||(/戶籍/.test(v)&&!/代表|團體會員/.test(v));
 const explicitOrg=status==='團體會員正式代表'||/我是團體代表|我是.{0,8}團體會員代表|團體.{0,8}推派|不是個人會員/.test(v);
 const explicitSponsor=status==='贊助會員'||/我是贊助會員|只當贊助會員/.test(v);
 const hasRule=/章程要求設籍|章程.{0,12}(?:明定|限定|要求).{0,6}(?:設籍|戶籍)/.test(v);
 const movedOut=/戶籍.{0,10}遷出|戶籍搬走|遷出.{0,9}社區|搬離原社區/.test(v);
 const refs=[work,members,p(12),p(13),p(15),p(16),p(17),p(23),g(10),e(5)],steps=[];
 steps.push(['甲、乙各看自己的章程，加入乙不會自動失去甲的資格','分開核對兩會最新有效章程、實際組織範圍和各自的入會審查。依法及章程都符合，原則可以同時是兩個社會團體的會員；一般社區發展協會理事加入另一會，不會光因這點就應辭去原職。同時當兩會理事仍須各自具有資格、依法當選，並核對有無章程、特別法或利益迴避限制。']);
 if(move){
   refs.push(current);
   steps.push(['戶籍、居住或工作，不是每個協會都同一條件','現行社區發展工作要點第17點沒有一體要求個人同時設籍與居住；舊工作綱要已廢止。先核對各章程；發起人設籍或工作於組織區域的規定，不等同所有在職會員的資格。僅在原社區當志工，也不等同持有會籍或表決權。']);
 }
 if(explicitOrg||/團體代表|團體會員|代表/.test(q))steps.push(['團體會員的資格和代表本人的戶籍，先分清楚','團體本身依各會章程申請／維持團體會籍；符合資格時再合法推派自然人代表，核對兩會準備的名冊。個人家庭搬家是否影響正式代表，分別看章程、團體會籍與代表是否仍受合法推派；不是把團體所在地直接當個人會籍。若原代表資格經確認喪失，應依規解任，不由新代表直接接任理事。']);
 if(explicitSponsor||/贊助/.test(q))steps.push(['先看贊助會員的權利，不當成一般有票會員','贊助會員的身分和可行使權利依有效章程及審定名冊；未取得正式且有選舉權或被選舉權的會員／代表資格，不能因捐款或參加活動就投票或當理事。']);
 steps.push(['投票與理事席次各由本會判斷，會籍異動要更新','各會先按章程審定本次有選舉權的會員（會員代表），並辦理會籍異動；合格者分別在自己的會內行使選舉權。遷出或改派須先由原會依章程和證據認定，不能用舊名冊當新資格，也不等於處罰除名。若確認喪失原會員或代表資格，依人民團體法第23條應即解任並由候補遞補；會籍尚未依法審定喪失前，不先武斷排除。'+(hasRule&&movedOut?'你補充甲章程確有設籍條件、且戶籍已遷出，先把異動交甲理事會按有效章程認定；若確定喪失甲會籍，甲理事不能續任。乙仍須另完成入會及選舉資格審定。':'')]);
 refs.push(losing,replaced);
 const need=!status&&!(explicitPersonal||explicitOrg||explicitSponsor);
 return {...base,category:'社區協會｜兩會會籍、投票與理事',title:'兩個社區協會各審會籍，加入另一會不等於原職解任',
  summary:hasRule&&movedOut?'甲的設籍條件與乙的新申請分開。先由甲確認戶籍異動是否使會籍喪失，再處理原理事席；乙不會因此自動有投票權。':explicitOrg?'先核對團體會籍和正式推派，不能只看代表個人的戶籍。甲、乙各自認定資格及選舉權。':'可以同時入會的前提是分別符合兩會章程與法令。加入另一會不會自動讓原理事解任；若真的失去原會籍，才按規定另處理。',
  steps,refs,needsDualMembershipFacts:need||explicitOrg||movedOut,
  ...(need?{choiceHeading:'你在原社區是哪一種身分？',choices:[
   {label:'個人會員',question:raw+'；身分確認：個人會員。'},
   {label:'團體會員正式代表',question:raw+'；身分確認：團體會員正式代表。'},
   {label:'贊助會員',question:raw+'；身分確認：贊助會員。'}
  ]}:{})};
}
function follow(q){const s=String(q??'');return s.length<240&&!/另問|換(?:一|新)題|新問題/.test(s)&&/^\s*補充[：:]/.test(s)&&/戶籍|個人會員|團體會員|贊助會員|改派|社區/.test(s);}
if(typeof module!=='undefined'&&module.exports){module.exports={route,follow};return;}
root.verifiedCommunityMultipleMembership=route;
root.isCommunityMultipleMembershipFactReply=follow;
})(typeof window!=='undefined'?window:globalThis);
