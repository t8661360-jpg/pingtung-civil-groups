(function(root){
'use strict';
const law=(name,p,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+p+'&flno='+n});
const cec={title:'中央選舉委員會：地方選舉投票日不得助選',source:'https://info.cec.gov.tw/vote2026/article/content/?id=M0092&target=%2Farticle%2FA0096'};
const ptec={title:'屏東縣選舉委員會：08-734-1440',source:'https://web.cec.gov.tw/ptec'};
const grant={title:'屏東縣政府教育處公告附件：民間團體補助經費作業要點',source:'https://portal.ptc.edu.tw/bulletin/view.php?sn=B114003910'};
const election=law('公職人員選舉罷免法','D0020010',56);
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>365||/農會|漁會|合作社|工會|公會|政黨申請|限制公務員投票|競選辦事處/.test(t))return null;
 const org=/協會|社會團體|社區|民間團體/.test(t);
 const internal=/協會.{0,8}(?:理事|監事).{0,8}(?:改選|候選)|(?:理監事|理事|監事)(?:改選|選舉).{0,11}候選/.test(t)&&/自我介紹|致詞|公職.{0,5}選罷法/.test(t);
 if(internal&&org){
  return {direct:true,category:'人民團體選務｜會內選舉',title:'協會內部理監事選舉，不套公職投票日規定',
   summary:'若只是協會內部理事、監事候選人在會員大會自我介紹，不適用公職人員選舉罷免法第56條的公職投票日規定。請依章程及該次選務規則，給候選人一致的介紹機會。',
   steps:[['分清介紹和干涉圈票','依人民團體選舉罷免辦法第8、9條，核對現場選務程序，不得妨礙秩序或監視、勸誘、干涉別人的圈投。介紹仍應按該會合法且一致的程序；若實際另有公職助選，另行判斷。']],
   refs:[law('人民團體選舉罷免辦法','D0050093',2),law('人民團體選舉罷免辦法','D0050093',8),law('人民團體選舉罷免辦法','D0050093',9)]};
 }
 const guest=/民代|議員|候選人|首長|里長|村長|政治人物|縣長|民意代表|公職/.test(t);
 const event=/活動|成果展|致詞|典禮|餐會|主持人|招呼|站上台|祝賀|問候|舞台|借台/.test(t);
 if(/沒有(?:邀請|邀)候選人/.test(t)&&!/致詞|主持人|拜票|號次/.test(t))return null;
 if(!guest||!event||!org&&!/^(?:更正|有人說|補充|活動致詞確認:)/.test(t))return null;
 const state=t.match(/活動致詞確認:(只有問候|有拜票|會內選舉|內容不明)/)?.[1];
 if(state==='會內選舉')return route('這是一般協會理事改選候選人自我介紹，公職選罷法適用嗎？');
 const segments=t.split(/[，,。；;？！?!]/).filter(Boolean);
 const hasPositive=r=>segments.some(s=>r.test(s)&&!/(?:沒有|沒|不是|並非|未曾|不曾|未再)(?:要|有|在|採用|進行|叫人|幫忙|說要)?(?:拜票|拉票|請大家投|喊投|候選人號次|競選標語|使用補助|投票日|公開募集)/.test(s));
 const votingDay=hasPositive(/投票(?:當天|日)|票開完當天|投票結束後同日/) && !/不是投票日|非投票日|並非投票日/.test(t);
 const campaign=state==='有拜票'||state!=='只有問候'&&hasPositive(/拜票|拉票|要求.{0,5}投|喊.{0,4}投他|呼籲.{0,7}投|競選標語|印.{0,7}號次|背景有.{0,4}號次|轉傳助選/);
 const uncertain=(state==='內容不明'||!state&&!campaign&&/不確定|不知道|沒聽到|有人說|怎麼區分/.test(t));
 const funds=/縣府補助|活動預算|攝影|印刷費|補助經費|核銷|用會費|付費|借台/.test(t)&&!/沒有.{0,3}(?:使用|用)?補助|未使用補助|沒有用會費|不使用補助/.test(t);
 const media=/臉書|IG|社群|LINE|群組|簡訊|轉傳|直播|貼文/i.test(t);
 const only=['先看實際內容，不只看來賓身分','單純禮貌致詞、問候或介紹活動，不能只因對方是民代、首長或候選人，就認定是助選。要分清候選人、主持人、主辦方及台下各自做了什麼；若有人喊投某人，查是否由主辦安排或接續宣傳，不把個別行為一概當成協會行為。'];
 const act=['主持人要求投某人，要和來賓問候分開','主持人明確拉票、用候選人號次宣傳或轉發助選內容，不能因候選人本人只致意就一律視為禮貌致詞。看實際言行、時間、場合與公開方式；是否違法由選務機關就個案判斷。'];
 const day=['投票日全天不得競選或助選','依公職人員選舉罷免法第56條第2款，公職投票日禁競選、助選；投票下午四點結束後，仍是同一投票日，不會解除。協會的公開社群、LINE、簡訊轉發助選的內容也要避免；一般活動本身或不含助選的消息須按實際內容區分。'];
 const spend=['補助和團體資源須另外核對','要用協會場地、會費及預算，查章程授權。若攝影、印刷或場地已涉及公職助選，不要直接以原活動補助核銷，先核對核定用途和原補助承辦。免費或低於合理對價提供可估價利益，另請監察院政治獻金業務窗口依政治獻金法判斷，不推定都可提供。'];
 const raw=String(q??'').trim();
 const choices=uncertain&&!state&&raw.length<255?[{label:'只有禮貌問候或致詞',question:raw+'；活動致詞確認：只有問候。'},{label:'有人呼籲投票或用號次宣傳',question:raw+'；活動致詞確認：有拜票。'},{label:'是協會內部理監事選舉',question:raw+'；活動致詞確認：會內選舉。'},{label:'實際內容還不清楚',question:raw+'；活動致詞確認：內容不明。'}]:[];
 return {direct:true,category:'人民團體活動｜來賓致詞與公職選舉',title:votingDay&&campaign?'公職投票日四點後，仍不能拉票或轉發助選':campaign?'來賓只問候，不代表主持人拉票也是致詞':uncertain?'先確認致詞內容、實際行為與日期':'來賓單純致詞，不等於協會助選',
  summary:votingDay&&campaign?'不能把主持人拉票或帶號次的助選片段在同一投票日貼到社群或 LINE，四點過後也是。候選人本人只問候與主辦方助選須分開。':campaign?'先分清是否真的有人呼籲投給公職候選人、是否由協會主辦或轉傳。不是稱為致詞就能當成純問候。':uncertain?'先查是公職選舉還是會內選舉、什麼時間、現場哪些人說了什麼，以及有無號次、拉票或轉發。不用在這裡貼姓名或影片。':'如果真的只有禮貌性致詞、沒有呼籲投票或安排競選宣傳，不能只因對方是民代或候選人，就認定協會在助選。',
  steps:[only,...(campaign?[act]:[]),...(votingDay||media&&campaign?[day]:[]),...(funds?[spend]:[]),['不同問題找不同窗口','活動與選舉日期或是否涉及公職助選，可洽屏東縣選舉委員會 08-734-1440；協會是否有權使用團體資源與補助，另問原立案或補助機關。']],
  refs:[election,cec,ptec,...(funds?[grant,law('政治獻金法','D0020049',2)]:[])],choices,choiceHeading:'實際是哪一種情況？',questionState:{focus:'compound'},actions:[{label:'聯絡承辦',view:'contact',sub:''}]};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedAssociationGuestGreeting=route;
})(typeof window!=='undefined'?window:globalThis);
