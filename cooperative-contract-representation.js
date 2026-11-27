(function(root){
'use strict';
const act=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const civil=act('民法','B0000001',106);
const coop=n=>act('合作社法','D0050112',n);
const precedent={title:'法務部（84）法律決字第29716號：同一人代表兩方訂約',source:'https://mojlaw.moj.gov.tw/LawContentExShow.aspx?id=FE077663&media=print&type=E'};
function route(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>195||!/合作社/.test(t)||!/簽約|簽.{0,8}(?:租約|合約|契約|協議|名)|訂.{0,4}(?:租約|合約|契約)|承租|出租|租.{0,10}房/.test(t)||/信用合作社|信合社|工會|公會|農會|漁會|解散|清算|遺產|補助|罷免|任期屆滿|未改選|出缺|代理出席|投票/.test(t))return null;
 const separate=/各由不同|各自.{0,6}(?:不同|合法代表)|不是同一人|分別由不同|兩個不同.{0,5}(?:代表|人)/.test(t);
 const shared=/同一(?:個|位)?人|同時代表|自己代表雙方|兩邊.{0,6}(?:都由|同一)|雙方代理|兩邊.{0,7}都簽/.test(t)&&!/各由不同.{0,13}不算同一/.test(t);
 const directParty=/理事(?:長|主席|會主席)?(?:本人)?名下|理事本人|理事(?:長|主席|會主席)?(?:自己|個人)(?:名下|所有)|向.{0,4}理事.{0,5}(?:租|買)|(?:理事|主席)(?:本人)?(?:是|當)房東/.test(t)&&!/不是(?:跟|與|向)?(?:該)?理事本人|不是理事(?:本人)?名下|不向理事本人/.test(t);
 const association=/協會|社會團體/.test(t);
 const uncertain=association&&!shared&&!separate&&!directParty&&/誰(?:來)?簽|該由誰|怎麼簽|找誰簽|哪一方簽|誰代表/.test(t)&&/兩邊|雙方|互簽|跟|與/.test(t);
 const associationContract=association&&(shared||separate||uncertain);
 if(!directParty&&!associationContract)return null;
 if(/關係企業|經理人|理事配偶|理事的配偶|理事.{0,3}親屬|理事的公司|理事的子女/.test(t)&&!associationContract)return null;
 const direct=['合作社與理事本人訂約：由監事代表合作社','依合作社法第39條第1項第4款，若契約另一方是合作社的理事本人，例如合作社承租理事本人名下房屋，合作社這一方依法由監事代表，不是由理事主席以理事身分代表。先由合作社核對內部決議及合格監事的代表權，理事本人在房東一方簽。'];
 const two=['同一人同時代表兩個團體：先處理雙方代理','參照民法第106條及法務部函釋，同一人不能只因兼任兩個職務，就逕代雙方訂約。若要由同一人代表，須核對雙方各自依法所作的事前許諾；已簽者則核對雙方是否依法事後承認，不直接判定必然有效或必然無效。民法另就專履行既有債務設例外，不把新簽租約視為該例外。'];
 const distinct=['各由不同合法代表簽，不是同一人雙方代理','兩邊確由不同且有代表權的人分別簽署，就不是這題的同一人雙方代理。仍須核對章程、各自的合法決議與授權；這不等於其他程序都已符合。'];
 const identity=['先確認契約上的真正當事人','合作社與一個由相同自然人代表的協會訂約，不等於直接與該理事本人訂約。合作社對外代表先依第34條及章程等核對；為避免雙方代理，可由兩團體各派不同的合法代表簽。若協會未辦法人登記或權限不清，先確認契約主體和代表權，必要時洽法律專業。'];
 const steps=[...(directParty?[direct]:[]),...(associationContract?[...(uncertain?[]:[separate?distinct:two]),identity]:[])];
 return {direct:true,category:'合作社及協會｜契約代表與雙方代理',
  title:uncertain?'先確認兩個團體各由誰代表簽約':directParty&&!associationContract?'合作社向自己理事承租，應由監事代表合作社':separate?'兩團體由不同合法代表簽，不是同一人雙方代理':'同一人不能只憑兩個職稱代表雙方簽約',
  summary:uncertain?'兩個團體要各自確認合法代表及授權。若由同一人代雙方簽，還要符合民法第106條；請選實際安排。':directParty&&!associationContract?'契約另一方若是合作社理事本人，合作社由監事代表；不能由理事主席代合作社簽。':separate?'若雙方是不同、各有代表權的人，就不是同一人的雙方代理；仍要各自核對章程、決議和授權。':'有雙方代理問題，不宜直接一人簽兩邊；通常先改由兩團體各用不同且有權的代表，或核對雙方是否依法許諾。',
  steps,refs:[coop(34),...(directParty?[coop(39)]:[]),...(associationContract?[civil,precedent]:[])],questionState:{focus:'compound'},...(uncertain?{choiceHeading:'兩邊預計由誰代表簽約？',choices:[{label:'同一人代表雙方',question:'協會與合作社要簽契約，同一人同時代表雙方可以嗎？'},{label:'雙方各有不同的合法代表',question:'協會與合作社要簽契約，雙方各由不同的合法代表簽可以嗎？'}]}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
root.verifiedCooperativeContractRepresentation=route;
})(typeof window!=='undefined'?window:globalThis);
