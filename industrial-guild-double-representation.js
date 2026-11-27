(function(root){
'use strict';
const law=(name,code,n)=>({title:name+'第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode='+code+'&flno='+n});
const industry=n=>law('工業團體法','D0050103',n);
const vote=n=>law('人民團體選舉罷免辦法','D0050093',n);
const interpretation={title:'內政部 76 社司發字第 48293 號：兩家會員工廠指派同一人',source:'https://www.moi.gov.tw/News_Content.aspx?n=14143&s=219790'};
function doubleFactory(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||!/工業(?:同業)?公會|工業同業公會|工業.{0,4}同業公會/.test(t)||/商業同業公會|工會|漁會|農會|合作社|全國工業總會|總幹事|買車/.test(t))return null;
 if(!/代表|代理|代投|委託|代開會|推派|派任|當.{0,2}席/.test(t))return null;
 const two=/兩|二|2|雙|兩邊|各家|多家|不止一家|同時|各自|另外一家|另(?:一|1)家|別家|另一廠|甲廠.{0,25}乙廠|A廠.{0,25}B廠/i.test(t);
 const proxy=/委託|代為出席|代開會|受託|代投|代領|託我|別的代表請我|其他代表請我/.test(t);
 const designated=/指派|派任|改派|各派|各推派|各自選派|雙重資格|兩個資格|兩家.{0,7}都派|兩邊.{0,7}都派/.test(t);
 const lacks=/只有.{0,11}(?:是|任|上班|工作|任職|職員|受僱)|只在.{0,12}(?:任職|工作|上班)|沒(?:有)?在.{0,9}(?:上班|工作|任職)|不是.{0,4}(?:職員|經理人|負責人)|離職|已退休|不是.{0,8}現任/.test(t);
 if(!two)return null;
 const unclear=!proxy&&!designated&&/代理|代(?:理)?兩家|代開會/.test(t)&&!lacks;
 const proxyOnly=proxy&&!designated;
 const choose=unclear?[
  {label:'兩家工廠各自正式指派',question:'同一工業同業公會，兩家工廠各自正式指派同一人為會員代表，可以嗎？'},
  {label:'會議當天接受缺席代表委託',question:'在工業同業公會，我可接受兩個其他會員代表的委託代為出席同一場會員大會嗎？'}
 ]:[];
 const formal=['兩家工廠正式指派：各自核對資格','內政部76社司發字第48293號函表示，同一人符合資格而由兩家以上會員工廠指派，法律沒有明文限制。依現行工業團體法第16條，必須成年，並且對各該廠各自具有負責人、經理人或現任職員的身分；兩家工廠也須各是公會會員並完成指派，且不得有同法第17條的法定不得擔任情形。一家公司的職務或同一企業集團關係，不會自動成為另一廠的代表。'];
 const exercise=['兩個正式資格各有選舉或罷免權，被選舉權仍只有一個','依現行人民團體選舉罷免辦法第18條，已各自合法取得兩個會員代表資格，具有相應的選舉權或罷免權；被選舉權仍以一個為限，不等於可以當選兩席。先向公會確認兩筆代表名冊、工廠指派文件及資格。函釋使用的舊年齡及條號，應以現行第16條與第18條為準。'];
 const byProxy=['會議委託代理：不能受兩位缺席代表委託','工業團體法第19條是某位會員代表不能親自出席會員大會時的代理規則，依選務規範辦理書面委託，每一會員代表只能代理一人，全體代理人數不得超過親自出席人數的半數。這與各廠正式派任的代表資格不同；不能拿大會委託書補足另一廠的職務資格，也不能把雙重代表資格當作可以多受委託。'];
 const seat=['各廠可派幾人是另一件事','依工業團體法第15條，每一會員工廠派一至七人，實際按會費級別和公會章程確認，不能因這個人同時代表兩廠就增加各廠核定的代表名額。'];
 const summary=unclear?'要先分「兩廠各自正式指派」和「有兩位缺席代表委託」。前者各廠都符合資格才有可能；後者一人只能代理一人。':proxyOnly?'如果是受兩位缺席代表委託出席同一場會員大會，不行。每一會員代表只能代理一人；正式受兩家工廠各別指派是另一回事。':lacks?'單憑在一家工廠任職，不會取得另一家工廠的代表資格；要分別對兩廠符合資格並受正式指派。':'可以有兩個正式代表資格，但要對兩家會員工廠各別符合資格、也各自依法指派。不是拿一份委託書就能代表兩家。';
 return {direct:true,category:'工業同業公會選務',questionState:{focus:'compound'},
  title:proxyOnly?'工業同業公會：一人不得受兩位缺席代表委託':'工業同業公會：雙廠正式指派與開會代理不同',
  summary,steps:[...(proxyOnly?[byProxy,formal,exercise]:[formal,exercise,byProxy]),seat],
  refs:[industry(15),industry(16),industry(17),industry(18),industry(19),vote(6),vote(18),interpretation],
  ...(choose.length?{choiceHeading:'您指的是正式指派，還是出席代理？',choices:choose}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={doubleFactory};return;}
root.verifiedIndustrialDoubleFactory=doubleFactory;
})(typeof window!=='undefined'?window:globalThis);
