(function(root){
'use strict';
const ref=(title,source)=>({title,source});
const elder=ref('老人福利法第41至43條：疑似不當對待或無人扶養','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050037');
const elderForm=ref('老人保護通報及處理辦法第2條：正式通報與緊急補表','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050196&flno=2');
const domestic=ref('家庭暴力防治法第50條：責任通報及保密','https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0050071&flno=50');
const disability=ref('身心障礙者權益保障法第75、76條：保護與通報','https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0050046');
const hotline=ref('衛福部113保護專線：立即人身危險先用110','https://dep.mohw.gov.tw/DOPs/fp-1183-6499-105.html');
const portal=ref('衛福部關懷e起來：保護或福利通報','https://topics.mohw.gov.tw/SS/cp-4530-50100-204.html');
const county=ref('各縣市家庭暴力及性侵害防治中心（含屏東）','https://dep.mohw.gov.tw/DOPS/fp-1179-6482-105.html');
const labels={urgent:'現在有危險或需救護',concern:'疑似虐待或疏忽，未見立即危險',support:'沒有立即危險，主要缺餐或需支援'};
const config={urgent:'先在安全處打110；需要緊急救護打119。不要等社工回班或幹部同意，也不要自行對質或強迫長輩離開。',concern:'就算還不能確定是跌倒還是不當對待，也可以先打113，或向當地縣市社政通報。長輩的安全不用等證明或群組回覆。若人正被困、遭暴力或有立即人身危險，先打110；需要緊急救護打119。',support:'獨居或缺餐不等於家暴，也不是一律要打110。但一週缺餐不是小事，今天就聯絡送餐單位、所在地社會處或家庭福利服務中心；若可能因無人照顧陷入困境，也可向113諮詢。若發現有立即危險或需急救，改打110或119。',unsure:'有立即人身危險先打110，需急救打119。沒有立即危險但疑似不當對待，可先打113；如果主要是缺餐且沒有暴力線索，找當地社政或送餐窗口。不要等小屏選項才求助。'};
const norm=q=>String(q||'').normalize('NFKC').replace(/\s/g,'');
function route(q,prior){
 const raw=norm(q);
 const reset=/^(?:換題|新題|另問)(?=$|[,:。，:;!?])/;
 if(reset.test(raw))prior=null;
 const t=raw.replace(/^(?:換題|新題|另問)(?=$|[,:。，:;!?])[,.:。，:;!?]*/,'');
 if(!t||t.length>480)return null;
 const selected=t.match(/^櫃檯長者保護確認:([a-z]+)$/)?.[1];
 if(selected&&(!prior||!labels[selected]))return null;
 const correction=/^(?:我們|我剛|我)?(?:更正|補充|不是|其實|那如果|所以|確認|剛確認)/.test(t);
 const follow=prior&&correction&&/通報|113|110|119|受傷|危險|家暴|獨居|老人|長輩|長者|社工|缺餐|沒.{0,4}餐|沒飯/.test(t);
 const age=/老人|長輩|長者|高齡者|阿公|阿嬤|老先生|老太太|老母親|老父親/.test(t);
 const strong=/被鎖|被關|限制自由|被(?:家人|配偶|伴侶|兒子|女兒|媳婦|照顧者)?打|受虐|遭虐|不給(?:飯|吃|喝)/.test(t);
 const concern=strong||/鎖門|家人推倒|虐待|疏忽|遺棄|家暴|不給(?:飯|吃|喝)|身上.{0,3}有傷|受虐|遭虐|毆打|不當對待/.test(t);
 const unmet=/沒飯吃|無人(?:扶養|照顧)|沒有家屬|獨居.{0,18}(?:沒|未|斷|缺)|斷餐|沒拿到餐|沒有食物|缺餐|沒人送餐/.test(t);
 const knows=/113|110|119|通報|社政|報警|保密|不敢講|不要講|送餐|據點|日照|社工/.test(t);
 const dangerLess=/(?:沒有|沒(?:看到|有看到)?|無|不見)(?:立即)?(?:人身)?危險|沒有(?:受)?傷|沒有被鎖|沒有暴力|並無虐待|不是家暴|不是被鎖/.test(t);
 const riskText=t.replace(/(?:沒有|未曾|沒|並非|不是|不再)(?:被鎖|被關|不能出去|當下有危險|現在有危險|立即人身危險|叫不醒|大量出血)/g,'');
 const urgent=/被鎖|被關|(?:正在|還在|一直在).{0,8}(?:打|毆打|傷害)|現場.{0,10}不停打|不能出去|正在遭受|當下有危險|現在有危險|叫不醒|大量出血/.test(riskText);
 const uncertain=/只有聽|聽說|聽鄰居|可能是自己跌|不確定|不知道(?:現在|有沒有|是否)/.test(t);
 if(!selected&&!(age&&(strong||(concern||unmet)&&knows))&&!follow)return null;
 if(!selected&&!follow&&!urgent&&!unmet&&/不是(?:遭|受)?(?:虐待|家暴)|沒(?:有)?(?:虐待|疏忽)/.test(t)&&!/疑似|可能/.test(t))return null;
 const keep=selected||follow?prior||{}:{};
 const role=/(?:受聘社工|社會工作|社工接案|我是社工|執行職務|其他執行老人|責任通報)/.test(t)||!!keep.role;
 const disabilityMention=/身障|身心障礙/.test(t)||!!keep.disabilityMention;
 const child=/孩童|兒少|小孩/.test(t)||!!keep.child;
 let kind=selected||(urgent?'urgent':dangerLess&&unmet?'support':concern?(uncertain?'unsure':'concern'):unmet?'support':keep.kind||'unsure');
 if(dangerLess&&unmet&&!urgent&&!selected)kind='support';
 const steps=[];
 if(kind!=='support'){
  steps.push(['先說目前的安全與位置','向警方或保護窗口說清楚長輩所在位置、人還能不能離開、是否需要救護；把親眼所見、當事人的話及別人的轉述分開，不自行判定誰犯罪。只向有權處理的人傳必要資料。']);
  steps.push(['113 與內部告知不能互相取代','非立即危險的疑似虐待、疏忽仍可立即打113，或向當地主管機關正式通報。可以同步告知據點負責人，但不能只發內部訊息或等開會。跨區請先提供長輩實際所在地，讓113或當地社政轉介。']);
 }else{
  steps.push(['先確認是否有安全與生活需求','先用安全方式聯繫本人、查詢原送餐服務與備援餐食。無人扶養而有生命、身體危險或生活陷困，可能需要老人保護評估；也可從社會安全網做福利轉介。']);
 }
 if(kind!=='support'||role)steps.push(['要不要依法正式通報，看職務與情況','執行職務的社會工作等人員遇疑似家暴，依家暴法第50條立即通報當地主管機關，最遲24小時；老人福利法第43條也包括其他執行老人福利業務的相關人員，依法填通報表，情況緊急可先口頭或電話，24小時內補表。志工不是一概沒義務，要看實際職務；一般目擊者也可以通報。不要等同意或傷勢證明。']);
 if(disabilityMention&&kind!=='support')steps.push(['有身障權益風險時一併提報','身心障礙者權益保障法第75、76條所列情形，依法負有通報責任的人員知悉就要立即通報，最遲24小時。失智或有身障證明本身不等於無行為能力，不能自行決定強制離家。']);
 if(child&&kind!=='support')steps.push(['也要說明在場兒少的安全','告訴權責機關現場有孩子及所見風險，不因孩子在場就自行判定受虐；保護與安置由權責單位評估。']);
 steps.push(['保密記錄，不在群組散布','記下時間、必要狀況與實際通報的管道及處理進度，只限有權限的人接觸。不要把照片、地址、身分資料或病歷傳到志工群組。依法保密通報者身分，不代表機關一定不需聯繫或記錄；不要承諾一定不通報。']);
 const context={kind,role,disabilityMention,child};
 const choices=kind==='unsure'&&!selected?Object.entries(labels).map(([k,label])=>({label,question:'櫃檯長者保護確認:'+k})):null;
 return {direct:true,title:kind==='urgent'?'長輩有立即危險：先110，需要救護打119':kind==='support'?'獨居斷餐：先聯絡社政，別自動認定家暴':'長輩疑似遭疏忽或虐待：先辨別立即危險與113通報',category:'老人保護｜安全、通報與轉介',summary:config[kind],steps,refs:[hotline,elder,elderForm,domestic,...(disabilityMention?[disability]:[]),portal,county],questionState:{focus:'cross-elder-safeguarding'},elderSafetyContext:context,...(choices?{choiceHeading:'如果目前不確定，可先依眼前情況選一項',choices}:null)};
}
if(typeof module==='object'&&module.exports)module.exports={route};
else root.verifiedElderSafeguarding=route;
})(typeof window==='object'?window:globalThis);
