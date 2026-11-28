(function(root){
'use strict';
const get=(x,pcode,n)=>({title:x,source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+pcode+'&flno='+n});
const p=n=>get('人民團體法第'+n+'條','D0050091',n);
const e=n=>get('人民團體選舉罷免辦法第'+n+'條','D0050093',n);
const c=n=>get('合作社法第'+n+'條','D0050112',n);
const nature={title:'內政部台內團字第1080022879號：由自然人代表參選',source:'https://www.moi.gov.tw/News_Content.aspx?n=14119&s=256747'};
const replace={title:'內政部函：改派後的原任解任與新代表不逕行繼任',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=256716'};
const norm=q=>String(q??'').normalize('NFKC').replace(/\s+/g,'');
const org=/協會|人民團體|社會團體|社團法人/;
const corporation=/公司(?:法人|員工|股東)?|法人本身|團體會員|團體代表|團體推派|公司推派|宮廟團體會員/;
const seats=/理事|監事|席次|參選|當選|去職|原任|補選|候補/;
const ordinary=['公司是團體會員；理事或監事是當選的自然人',
 '公司符合協會章程並已獲准成為團體會員時，由正式推派的自然人代表行使團體會員權利。依法符合選務及名冊資格的代表可參選；當選理事的是那一位自然人，不是公司法人本身。由當選的自然人依規定出席並行使該理事或監事席次的職權，不是公司指派另一人代坐。'];
const how=['誰擔任正式代表，按章程及團體會員的合法推派',
 '依人民團體法第13、16、17條及內政部函釋，先看協會章程的團體會員資格、代表名額及推派程序，再核對本次選舉的正式代表名冊。沒有一律要求只能派法定負責人、老闆或股東；員工也不是只憑職稱就成為代表。符合被選舉資格的正式代表，不必一概另加個人會員資格。'];
const proxy=['臨時受託出席，不等於正式代表或候選人',
 '只是代老闆坐場、受託出席或列席者，不會因此取得團體會員代表資格或被選舉權。一般協會會員大會的書面委託，要另依人民團體法第42條和相應選務規定核對代理資格、範圍與一人僅代理一人的限制。'];
const successor=['改派代表，不等於可以接原理事席次',
 '若原本是憑團體會員推派的正式代表資格當選，且合法改派後已喪失該當選資格，依人民團體法第23條和內政部函釋應即解任，理事或監事缺額由同類候補依序遞補。新代表只在其合法代表範圍內行使公司會員權；不因改派而自動繼任理事或監事。若公司只換自己的負責人、沒有有效改派，不先假定原代表資格已喪失。'];
const twoSeats=['兼有個人會籍時，不能自動把原任席改掛其他身分',
 '選罷辦法第18條規定，即使同時具有兩個以上會員或會員代表資格，被選舉權仍只有一個。先核對當屆審定名冊、候選資格及原選舉紀錄；只因現在另有個人會籍，不等於必然可保任，也不因僅聽到公司換人就逕行解任。當選依據不清或雙重會籍有爭議，請核章程與主管機關，不用貼姓名、公司或完整名冊。'];
const zh={零:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
const small='[0-9一二兩三四五六七八九十]{1,4}';
function num(s){
 if(!s)return null;
 if(/^\d+$/.test(s))return Number(s)<=1000?Number(s):null;
 if(s.length===1)return zh[s]??null;
 const t=s.match(/^([一二兩三四五六七八九])?十([一二兩三四五六七八九])?$/);
 return t?(t[1]?zh[t[1]]:1)*10+(t[2]?zh[t[2]]:0):null;
}
function count(t,pat){
 for(const x of pat){const a=num(t.match(new RegExp(x.replace('#','('+small+')')))?.[1]);if(a!==null)return a;}
 return null;
}
function filling(t,full){
 const size=count(t,['(?:章程(?:原定)?|所定|核定|定額|全額|原來全額)(?:所定|定額|有|是|為|共|:){0,3}#(?:位|人|席|名)',
 '章程.{0,7}(?:定|訂)(?:額|有|為|是)?#(?:位|人|席|名)',
 '(?:原來|原本)(?:定額|全額|的理事)?#(?:位|人|席|名|(?=[,，。;；?!！？]|$))']);
 const live=count(t,['(?:理事|監事)?(?:還有|只剩|剩下|尚餘|剩|現在只有|現有|還剩|只有)(?:是|有)?#(?:位|人|席|名)',
 '(?:在任|實際在任)(?:還)?(?:有|是|剩)?#(?:位|人|席|名)']);
 const min=size>0?Math.ceil(size*2/3):null;
 const actual=min&&live!==null&&live<=size;
 const ago='依選罷辦法第17條，先由候補理事或候補監事各自依序遞補。若遞補後（或沒有可遞補的人）同一職類仍未達章程定額三分之二，應辦補選足額；剛好達三分之二，不因這項規定就要立即補選。';
 if(!actual)return ['沒有候補，不等於一律要補選',ago+'如果想核算，請提供章程定額和遞補後現任同一職類的人數，不用提供名單。'];
 return ['按章程定額算同一職類，不把理事和監事合計',ago+'依您提供的定額'+size+'位，門檻為'+min+'位。'+(full?'沒有可遞補者，現有':'若這已是遞補後的人數，現有')+live+'位'+(live<min?'未達門檻，應補選足額，不是讓新代表入座。':'達三分之二，不需僅因本次缺額立即補選，但章程和其他法定事由仍須確認。')];
}
function answer(q){
 const raw=String(q??'').trim(),t=norm(raw);
 if(!t||t.length>410||!corporation.test(t)||!seats.test(t)||/工會|公會|農會|漁會|基金會|管委會|公司股東會|獨立董事|有限合夥|罷免|清算|不動產|簽證|統編/.test(t))return null;
 const coop=/合作社|社員大會/.test(t);
 if(coop){
   if(/信合社|信用合作社|保險合作社/.test(t)||!/可以|能不能|比照|套用|公司|非營利法人/.test(t)||!/法人.{0,5}入社|法人社員|非營利法人|比照協會|代表(?:當|任)理事/.test(t))return null;
   return {direct:true,category:'代表與理事｜合作社與協會分開',title:'一般合作社的法人社員，不直接套用協會團體會員規則',
    summary:'一般合作社依合作社法第12條，法人限非營利者，且僅可成為有限責任或保證責任合作社社員；一般營利公司不能僅因能當協會團體會員就比照入社。',steps:[
     ['代表法人行使表決權不等於理事候選資格','合作社法第49條規定法人社員的表決由其代表人行使；第32條則規範出自社員的理監事選任。要另按章程、該次選舉和社員資格認定，不直接套人民團體的代表或遞補。']],refs:[c(12),c(32),c(49)],questionState:{focus:'compound'}};
 }
 const inferred=!org.test(t)&&/(?:公司會員|團體會員).{0,18}(?:改派|換代表|正式代表)/.test(t)&&/理事會|監事會/.test(t);
 if(!org.test(t)&&!inferred||!/代表|法人|團體會員/.test(t)||!/公司|法人|派.|改派|換人|換代表|補選/.test(t))return null;
 const change=/換代表|改派|換人|更換|改由|失去.{0,8}資格|改換|換了|代替|繼任|直接接任|遞補|去職|解任/.test(t);
 const personal=/個人會員|個人會籍|自己的會籍|雙重會籍|同時具有/.test(t);
 const lost=/已.{0,6}喪失|(?:因此|已|已經)?失去當選資格|改派而失職|不再是代表|沒有代表資格/.test(t);
 const tag=t.match(/當選資格確認:(團體代表|個人會員|尚無法確認)/)?.[1];
 const unknown=change&&personal&&/找不到|查不出|不清楚|不知道|不確定|沒有記錄|沒有紀錄/.test(t);
 const hasNumbers=/定額|全額|還有|只剩|現有|章程.{0,6}位/.test(t);
 const wantFill=change&&/候補|補選|不夠|缺額|不足|遞補|剩|定額/.test(t);
 const viaGroup=tag==='團體代表'||/(?:以|用|憑|依).{0,10}(?:團體|公司|正式).{0,6}代表.{0,9}當選|公司.{0,5}選派.{0,11}當選/.test(t);
 const viaIndividual=tag==='個人會員'||/以個人會員(?:的)?身分當選|原由個人會員資格當選/.test(t);
 const out=[ordinary,how,...(/委託|代理|代老闆|列席/.test(t)?[proxy]:[])];
 if(change)out.push(successor);
 if(personal&&change){
   if(viaIndividual)out.push(['如果原來本來以個人會員資格當選','仍具原當選所依據的個人會員資格時，只是失去另一個團體代表資格，不宜把人直接當成失去其原職資格；核當屆名冊和選舉紀錄，有其他事由另看。公司新代表仍不自動當理事。']);
   else if(viaGroup)out.push(['已確定以團體代表資格當選，仍有個人會籍時不要自行換身分','內政部函釋對原代表喪失當選所依資格有解任說明；另一個個人會籍並不表示現任席可直接改掛。需查兼具資格時當屆名冊、候選審定及原選舉紀錄，若有爭議洽原主管機關。'],twoSeats);
   else out.push(twoSeats);
 }
 if(wantFill||hasNumbers&&change)out.push(filling(t,/沒有候補|沒候補|候補.{0,4}(?:全|都)?用完|無候補|候補都沒/.test(t)));
 if(tag==='尚無法確認')out.push(['只確認原當選依據，不用填個資','請會務人員查該屆候選資格、審定的名冊與大會選舉紀錄，再按章程及原主管機關說明；在確認前別先將新代表視為當選，也不改寫當初的選務文件。']);
 const choices=unknown&&!tag&&raw.length<330?[['原以團體代表當選','團體代表'],['原以個人會員當選','個人會員'],['現在仍查不到','尚無法確認']].map(([label,code])=>({label,question:raw+'；當選資格確認：'+code+'。'})):[];
 const title=change?'公司的新代表不會自動接任原理事':'協會的理事是當選的自然人，不是公司法人';
 const summary=change?(unknown&&!tag?'公司改派不等於接任理事。若原任同時有個人會籍，先確認他當年是用哪種資格當選。':lost&&!personal?'原代表既已喪失當選資格，依法應即解任；由候補遞補，未達定額三分之二才依法補選。新代表不能直接接任。':'新代表依法行使團體會員權，不會自動接任理事。原任是否解任，先確定原當選依據與資格是否喪失。'):'公司本身不能直接當協會理事；正式推派的自然人，符合資格且經選舉當選後，才是理事。公司不一定要派負責人。';
 return {direct:true,category:'協會｜團體會員、代表與理事職務',title,summary:(inferred?'如果您問的是一般協會：':'')+summary,steps:out,
  refs:[p(13),p(16),p(17),nature,...(change?[p(23),e(17),replace]:[]),...(personal&&change?[e(18)]:[]),...(/委託|代理|代老闆/.test(t)?[p(42)]:[])],
  questionState:{focus:choices.length?'clarify':'compound'},...(choices.length?{choiceHeading:'原任是依哪一種資格當選？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports=answer;return;}
root.verifiedAssociationCorporateMemberOfficers=answer;
})(typeof window!=='undefined'?window:globalThis);
