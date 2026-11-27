(function(root){
'use strict';
const law=n=>({title:'房屋稅條例第'+n+'條',source:'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340102&flno='+n});
const ping={title:'屏東縣政府財稅局：官方網站',source:'https://www.pttb.gov.tw/'};
const hand={title:'財政部：房屋稅減免與應備文件',source:'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-saving-manual/local/house-tax/zx7AP85'};
const ownRef={title:'財政部：自住使用認定標準第2條',source:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0340135'};
const apply={title:'屏東縣財稅局：戶政併收自住房屋稅申報',source:'https://www.etax.nat.gov.tw/etwmain/announcement/news/Q1Lp3xl'};
const localDisaster={title:'屏東縣財稅局：災後地方稅減免',source:'https://www.etax.nat.gov.tw/etwmain/announcement/news/xmeN05n'};
const disasterForm={title:'我的E政府：災害損失房屋稅減免',source:'https://www.gov.tw/News_Content_2_513678'};
const contact={title:'屏東縣財稅局：地方稅服務電話',source:'https://www.etax.nat.gov.tw/etwmain/announcement/news/kD9Y1wx'};
function houseTax(q){
 const t=String(q||'').normalize('NFKC').replace(/\s/g,'');
 if(t.length>190||!/房屋稅/.test(t)||!/減免|免[稅徵]|能免|都能免|減徵|優惠|自住|災損|受災|淹水|泡水|公益|辦公|房屋稅.{0,7}(?:申請|怎麼辦)/.test(t))return null;
 if(/查繳|補發繳款書|重印稅單|欠房屋稅|繳稅截止|分期繳納|建物滅失登記|拆除.{0,8}(?:註銷|稅籍)|契稅.{0,6}申報|土地增值稅.{0,6}申報|農會自用倉庫|申報所得稅|折抵所得/.test(t))return null;
 const disaster=/災損|受災|淹水|水淹|泡水|火災|火燒|地震|颱風|重大災害|災害損失/.test(t);
 const assoc=/協會|公益社團|已立案.{0,4}(?:社團|團體)|社會團體/.test(t)&&/會址|自有|辦公|會館|所有|名下|租借|免稅|免徵|減免|能免/.test(t);
 const same=/同一間|同一棟|同一處|一部分|一半|兼作|兼做|同時作|同時當|設在.{0,6}住家|住家.{0,8}(?:掛|設|登記).{0,6}會址|自宅.{0,8}(?:掛|設|登記).{0,6}會址/.test(t);
 const owner=/私人住宅|個人住宅|自家住|自住優惠|自住|遷戶籍|遷入戶籍|設籍|戶籍遷入|買了?房|買房|自家房子/.test(t)&&!(disaster&&!/自住稅率|自住優惠|遷戶籍|戶籍|私(?:人|宅)/.test(t));
 const nonLocal=/臺北|台北|新北|桃園|臺中|台中|臺南|台南|高雄|臺東|台東|花蓮|嘉義|基隆|宜蘭|雲林|彰化|新竹|苗栗|南投|金門|澎湖|連江|外縣市/;
 const propertyPlace=t.match(new RegExp('(?:(?:房屋|房子|住宅|會址|房產)(?:是)?(?:在|位於|坐落在?)|坐落於?)('+nonLocal.source+'|屏東)'))?.[1];
 const location=propertyPlace||t.match(nonLocal)?.[0]||(/屏東/.test(t)?'屏東':'');
 const local=!location||location==='屏東';
 const placePrefix=location?'房屋在'+location+'，':'';
 const contactText='房屋稅由房屋所在地的地方稅稽徵機關辦理，不是社會處或國稅局。'+(local?'房屋在屏東可洽屏東縣政府財稅局總機 08-733-8086，或用免付費專線 0800-000-321 轉2。':'請洽房屋所在地的縣市稅捐稽徵機關。')+'不用在小屏填地址、稅單號碼或證件。';
 const where=['去哪裡申請',contactText];
 const personal=['私人住宅：自住優惠稅率不是協會免稅','個人持有的住家，原則要沒有出租或營業，供本人、配偶或直系親屬實際居住且在該屋設籍；本人、配偶及未成年子女全國合計在3戶以內。符合條件而申報使用情形變更，應於當期開徵40日以前辦理；逾期降低稅額的申報，自次期開始適用。'+(local?'屋主本人到屏東縣的戶政事務所辦理遷入，可以請戶政併收自住優惠申報，由財稅局審核；只由配偶或親屬遷入，不適用這項併收服務，屋主仍可向房屋所在地稅捐機關申報。':'是否有戶政併收服務，依房屋所在地的規定。')];
 const organization=['協會自有辦公房屋：另查公益社團免徵條件','房屋稅條例第15條第1項第5款，政府核准的非營利公益社團，自有並作辦公使用的房屋，才可能依該款申請免徵；不能只因協會有立案或登記為會址就免徵。借用或租用的私人房屋不符合該款「自有」條件。受益對象限同業、同鄉、同學或宗親者原則不免，條文另有依法組成工會、報請地方政府核准之例外。可備申請書、公益社團核准文件及產權證明等，由房屋所在地稅捐機關核認。'];
 const sameStep=['若其實是同一間房屋兼作住家與會址','不要把分開兩處的規則直接套到同一間。向地方稅稽徵機關說明產權、房屋各部分實際用途、有沒有獨立空間及是否對外營業；不能只憑會址登記判定整棟免稅或失去自住優惠。'];
 const separate=['兩處分開看，不是同一房屋混用','協會自有辦公房要核對公益團體資格；理事長私人住宅是不同產權，不能用協會的免徵身分。私人住宅若符合自住條件，可申報較低稅率，不代表免徵。'];
 const disasterStep=['災害受損：先保留照片，儘快辦理','安全許可時先拍照、再清理，保留受損日期、範圍和證明。'+(local?'屏東縣財稅局提醒應於災害發生日起30日內儘速申請；不同災種或案件的細部要件請向財稅局核對，不用等房屋稅開徵。':'各地實際申報方法及期限請向所在地稅捐機關確認，不用等房屋稅開徵。')+'房屋稅條例第15條規定，重大災害毀損占整棟面積5成以上且須修復才能使用，得免徵；3成以上未達5成得減半，須由稅捐機關查核。淹水如另有住宅救助名冊或地方專案，與上述整棟受損比例不同。'];
 const other=/低收入|低收戶|中低收入|身心障礙|公益出租人|原住民|合法工廠|寺廟|教堂|宗祠/.test(t);
 const chosen=disaster||owner||assoc;
 const title=disaster?'災損房屋稅：向房屋所在地地方稅機關申請':assoc&&owner?'公益社團自有辦公房與私人住宅，按不同條件申請':owner?'房屋稅自住優惠：先看使用及設籍，再向地方稅機關申報':assoc?'協會會址的房屋稅：非營利公益社團自有辦公房才適用該款':'房屋稅減免要向稅捐稽徵機關申請，不是社會處';
 const summary=(disaster?'房屋受災請先留照片；'+(local?'房屋在屏東，請在災害發生日起30日內儘速向財稅局申請。':'請向房屋所在地稅捐機關確認申請期限。'):assoc&&owner?(same?'同一處房屋有住家和會務兩種用途，須按產權及實際使用判斷，不能整棟一概免稅。':'兩處要分開。協會自有辦公房查公益社團免徵資格，理事長的私人住宅查自住優惠，不是兩處都免。'):owner?'向房屋所在地的地方稅稽徵機關申報自住優惠，不是去社會處。':assoc?'不是每個協會會址都免房屋稅。先核對團體是否為政府核准的公益社團、房屋是否由協會所有並用於辦公。':'向房屋所在地的地方稅稽徵機關申請；自住優惠、災損和公益團體辦公用房的條件不同。')+(!chosen&&local?'房屋在屏東可洽屏東縣政府財稅局 08-733-8086。':'');
 const choices=!chosen&&!other?[
  {label:'私人住宅改用自住優惠',question:placePrefix+'個人住家要申請房屋稅自住優惠，怎麼辦？'},
  {label:'房屋淹水或其他災損',question:placePrefix+'房屋淹水受災，怎麼申請房屋稅減免？'},
  {label:'公益社團自有辦公房屋',question:placePrefix+'公益社團自有供辦公的房屋，可以申請免徵房屋稅嗎？'}
 ]:[];
 return {direct:true,category:'業務分流',questionState:{focus:'compound'},title,summary,
  steps:[where,...(assoc&&owner?[same?sameStep:separate]:[]),...(disaster?[disasterStep]:[]),...(assoc?[organization]:[]),...(owner?[personal]:[]),...(!chosen&&other?[['其他房屋稅減免條件','不同原因的文件及審核條件不一樣，不因福利身分或稱為公益就一律免稅，請向所在地財稅機關核對資格。']]:[])],
  refs:[...(local?[ping,contact]:[]),...(owner?[law(7),ownRef,...(local?[apply]:[])]:[]),...(assoc||disaster?[law(15)]:[]),...(disaster?[...(local?[localDisaster]:[]),disasterForm]:[]),hand],
  ...(choices.length?{choiceHeading:'您要辦哪一種房屋稅優惠？',choices}:{})};
}
if(typeof module!=='undefined'&&module.exports){module.exports={houseTax};return;}
root.verifiedHouseTaxReferral=houseTax;
})(typeof window!=='undefined'?window:globalThis);
