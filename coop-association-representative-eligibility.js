(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const p=n=>law('人民團體法','D0050091',n);
const c=n=>law('合作社法','D0050112',n);
const e=n=>law('合作社選舉罷免辦法','D0050022',n);
const elect=n=>law('人民團體選舉罷免辦法','D0050093',n);
const m={title:'內政部：團體會員原代表當選理監事，新代表不逕行接任',source:'https://www.moi.gov.tw/News_Content.aspx?Create=1&n=14119&s=256716'};
const individual=['合作社理、監事由社員中選任','按合作社法第32條，理、監事由社員大會就社員中選任。依法採代表制時，選罷辦法第4、5條規範代表及選任。若當事人確實不具社員資格、也不是依法代表某法人社員，只因被稱為「代表」、受託或列席，不能當作具備社員身分參選。先核對社員名簿及選舉資格。'];
const corporate=['法人社員推派的人，不能單憑代表名義認定能參選','合作社法第12條有非營利法人可為有限責任或保證責任合作社社員的規定；第49條是法人社員代表的表決。法人是社員、由代表投票，與該自然人能否當理事不是同一問題。要查合作社類型、章程、合法推派、當屆候選人資格及適用特別法，再請原主管機關核對。'];
const association=['一般協會正式會員代表，與臨時受託出席不同','人民團體法第13、16、17條：依法由團體會員推派的正式代表，權利原則與會員相同，名冊與選務資格符合時可以投票並列為理監事候選，不須再一概要求以本人名義取得個人會員資格。僅當天代理出席、列席或尚未依法推派的人，不會因此取得會員代表或候選人資格。'];
const upper=['先確認是哪種代表，不直接承接前任理事席次','若是上級人民團體，理監事當選不限下級團體所派出席代表，另依第19條及其他資格；在一般協會，團體會員改派代表也不等於遞補原代表當選的理監事席次。核對推派證明、章程和依法審定名冊，不必上傳名冊或證件。'];
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(!t||t.length>225||!/代表/.test(t)||!/當理事|當監事|(?:被)?選(?:成|為|做)?理事|選監事|能.{0,4}(?:當|選)|參選|候選/.test(t)||/信用合作社|勞動合作社和工會|公證人公會|工商團體|職業團體|工業公會|同業公會|工會|公務人員協會|聯合社|漁會|農會|股東|掛名|罷免|代理投票的票數/.test(t))return null;
 const coop=/合作社|社員代表|法人社員/.test(t);
 const social=/一般協會|社會團體|協會|團體會員|人民團體|會員代表大會/.test(t);
 const legal=/法人社員(?:的)?(?:所)?(?:推派|代表)|法人社員指派|非營利法人社員/.test(t)&&!/不是法人社員代表|不是法人社員的代表|也沒有代表法人社員/.test(t);
 const ordinary=/只有列席|只有暫時代理|僅受託出席|也沒有代表法人社員|不是法人社員代表/.test(t)&&!/不確定/.test(t);
 const broad=/不是本人.{0,6}會員|不是個人會員|不是會員|團體會員|(?:代表大會).{0,10}(?:改選|投票)|代表.*能不能投票/.test(t);
 if(!coop&&(!social||!broad))return null;
 if(coop&&!/社員代表|法人社員|代表社員/.test(t))return null;
 const comparison=coop&&social;
 const steps=[...(coop?(legal?[corporate]:ordinary?[individual]:[individual,corporate]):[]),...(social?[association,upper]:[])];
 const choices=[{label:'本人不是社員，也沒有代表法人社員',question:'合作社社員代表本人不是社員，也沒有代表法人社員，只有列席，能當理事嗎？'+(comparison?'一般協會的團體會員推派代表也一樣嗎？':'')},{label:'由法人社員正式推派',question:'由法人社員推派的代表，本人不是社員，合作社可以被選為理事嗎？'+(comparison?'一般協會的團體會員推派代表也一樣嗎？':'')}];
 const title=comparison?'合作社的社員代表，不等於協會的團體會員代表':coop?'合作社先核社員資格，再辨別是否代表法人社員':'協會團體會員的正式代表，可以依法投票或參選';
 const summary=comparison?'不能混用這兩種代表資格。一般合作社先查社員身分和當屆候選資格；一般協會依法推派並具資格的正式會員代表可投票或參選。':coop?(legal?'法人社員代表的表決權不能直接等同個人候選資格；還要核對合作社型態、章程和選舉規則。':ordinary?'本人不是社員，也沒有因合法推派代表法人社員，單以列席或受託不具社員參選資格。':'先分本人是否為社員，或正式代表某一法人社員；不能只看「代表」兩字就確定能當理事。'):'若是一般協會，依法推派或選出的正式會員代表，可依個別資格投票或參選。若只是臨時受託代理或列席，並不因此具候選資格。';
 return {direct:true,category:'團體選務｜社員與會員代表',title,summary,steps,refs:[...(coop?[c(12),c(32),c(49),e(4),e(5)]:[]),...(social?[p(13),p(16),p(17),p(19),elect(5),m]:[])],questionState:{focus:'compound'},...((coop&&!legal&&!ordinary)?{choiceHeading:'合作社這一位，是哪一種身分？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCoopAssociationRepresentativeEligibility=route;
})(typeof window!=='undefined'?window:globalThis);
