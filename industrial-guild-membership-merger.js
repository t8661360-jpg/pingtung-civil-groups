(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const i=n=>law('工業團體法','D0050103',n), r=n=>law('工業團體法施行細則','D0050104',n);
const interpretation={title:'內政部台內社字第16537號：會員公司合併後的會籍和代表',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219729'};
const debtLaw={title:'企業併購法：合併權利義務的承受',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080041'};
const absorb=['吸收合併、原會員公司消滅：註銷原會籍','依內政部台內社字第16537號，原會員公司因併入他公司而消滅，工業同業公會應註銷原會籍，原先派出的會員代表資格隨同喪失。不要把原會籍、原代表或其選舉權直接移給存續公司；原代表不能再以已失效的舊資格投票。既有欠繳會費等債務是否依合併而承受，另按企業併購及適用規定核對，不會只因原會籍註銷就當作一律免除。'];
const apply=['存續公司：用自己的資格核對入會或異動','先確認存續公司的新工廠登記、行業和工廠所在地區，依《工業團體法》第13條確認適用的工業同業公會。若尚無適用會籍，依施行細則第11條送申請書及工廠登記證照，由公會審查。若已是會員，也要確認原工廠是否屬原來核准的會籍或須另辦，不把現有的一份會籍推作全都涵蓋。符合後才能依第16條與施行細則第15條確認合格人選、正式指派或改派並通知公會。'];
const same=['只改名或交易股份，法人及登記主體不變：不是吸收消滅','同一公司、同一工廠登記主體且仍符合入會行業、區域時，不因改名或股東變動就當作原會籍消滅。拿更新後的公司及工廠登記資料，向公會辦會籍資料異動並核對代表，不必因改名而一概重辦入會。若連同工廠、業別、所在地或登記主體變更，須另查實際會籍與適用公會。'];
const asset=['只買工廠或產線，舊公司仍在：先查各廠登記','資產買賣與原公司因合併消滅不同。各公司依自己的工廠登記主體、業別、區域和實際是否仍營業，確認原會籍異動及新經營者是否需申請入會。僅憑買賣合約不直接推定取得原代表資格；尚未核對公會名冊時，不要用舊代表證替新經營者投票。'];
const sameVote=['代表資格另看原派任是否仍有效','單純公司改名不當然使原代表喪失資格。向公會更新名冊與所代表工廠資料，確認原指派和當屆出席資格；若人員已離職、另有派任或工廠會籍變動，須另外核對。'];
const votes=['代表、選舉與公會職務要分開核對','原會籍註銷後，原代表不能用舊身分代表新公司出席或投票。若本身另有獨立且仍有效的代表資格，另依該資格核對；新的指派也須看當屆有效名冊及選務時點，不保證趕上。原代表如兼任公會理事或監事，喪失資格或所代表工廠遭註銷時依工業團體法第25條解任，由候補依序遞補，不是職位自動轉交新公司。'];
function merger(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>220||!/工業(?:同業)?公會|工業.{0,4}同業公會/.test(t)||/商業同業公會|工會|農會|漁會|合作社/.test(t))return null;
 if(!/會員|會籍|代表|投票|改派|入會|退會|理事|監事/.test(t)||!/合併|吸收|併入|併購|收購|被買|只買|改名|更名|名稱變更|股權變動|股東(?:變更|換了)|法人消滅/.test(t))return null;
 const uncertain=/不確定|不知道|不清楚|沒弄清楚/.test(t);
 const gone=/消滅|註銷(?:舊|原)?公司|原公司.{0,6}不再存在|併入.{0,10}(?:他|別家|另|新)公司/.test(t)&&!/不消滅|沒有消滅|未消滅/.test(t)&&!uncertain;
 const nameOnly=/只是改名|僅改名|只更名|法人.{0,8}(?:沒有變|不變|未變)|主體.{0,8}(?:沒有變|不變|未變)|公司存續且|法人仍是同一|登記主體.{0,6}(?:沒有變|不變|未變)/.test(t)&&!gone&&!uncertain;
 const assetOnly=/(?:只買|只收購|只是買|只是收購|買的是).{0,8}(?:工廠|設備|產線|資產)/.test(t)&&/舊公司.{0,8}(?:仍在|未消滅|還在|存續)|原公司.{0,8}(?:仍在|未消滅|還在|存續)/.test(t)&&!gone&&!uncertain;
 const explicitVote=/投票|出席|出任|當選|資格|理事|監事|選舉|派.{0,6}代表/.test(t);
 const choose=!gone&&!nameOnly&&!assetOnly;
 const summary=gone?'不要直接移轉會籍。原會員公司因吸收合併消滅，公會須註銷原會籍，原代表也不能用舊資格投票；存續公司另核自己的工廠登記和會籍。':nameOnly?'如果只是改名，法人及工廠登記主體不變且仍符合資格，不必因改名先退會再入會；先向公會辦會籍資料異動。':assetOnly?'只買工廠或設備、原公司仍在，不等同吸收合併。先按更新後的工廠登記核對，新經營者不能直接用原代表資格投票。':'先確認原會員公司有沒有消滅。吸收消滅是註銷原會籍、存續公司另核；只是改名且主體不變，通常是資料異動；單買工廠要另核登記。';
 return {direct:true,category:'工業同業公會｜合併及會籍業務分流',title:gone?'工業同業公會：消滅公司的會籍與原代表資格不直接移轉':nameOnly?'工業同業公會：僅變更名稱，不等於原會籍消滅':assetOnly?'工業同業公會：購買工廠不等於取得原會籍':'工業同業公會：先確認買賣或合併後的公司身分',summary,
  steps:gone?[absorb,apply,...(explicitVote?[votes]:[])]:nameOnly?[same,...(explicitVote?[sameVote]:[])]:assetOnly?[asset]:[absorb,same,asset,apply,...(explicitVote?[votes]:[])],
  refs:[interpretation,i(13),i(14),i(16),...(explicitVote?[i(25)]:[]),r(11),r(15),r(16),...(!nameOnly?[debtLaw]:[])],questionState:{focus:'compound'},...(choose?{choiceHeading:'公司登記變動是哪一種？',choices:[
   {label:'原公司被吸收、已消滅',question:'原會員公司被吸收合併而消滅，存續公司續營工廠，原工業同業公會會籍和代表投票怎麼處理？'},
   {label:'只是改名或換股東，法人未變',question:'我們公司只是改名或換股東，法人與工廠登記主體不變，工業同業公會要退會再入會嗎？'},
   {label:'只買工廠或產線，原公司仍在',question:'工業同業公會會員只買工廠或產線，原公司仍在，新經營者可繼續用原會員代表投票嗎？'}
  ]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={merger};return;}
root.verifiedIndustrialGuildMerger=merger;
})(typeof window!=='undefined'?window:globalThis);
