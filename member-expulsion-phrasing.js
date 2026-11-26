(function(root){
'use strict';
// Normalize first-person wording for the existing, source-checked member-expulsion answer.
function canonicalMemberExpulsion(q){
 const t=String(q??'').normalize('NFKC').replace(/\s/g,'');
 if(/工會|公會|合作社|基金會|政黨|公司|群組|聊天室|群聊|LINE|志工|員工|工作人員|候選|代班|會議|會場|申訴|救濟|法院|判決|訴訟|沒(?:有)?入會|還沒入會|非會員|(?:不|(?<!能)不能|不會|沒有|沒|不想)(?:要)?把/u.test(t))return null;
 if(!/(?:理事長|會長|理事會)/u.test(t))return null;
 if(!/(?:把|將)(?:我|本人|我們|會員)(?:直接)?(?:踢出|趕出|逐出)(?:我們的?|這個|這間|這家|本|貴|社區發展)?(?:協會|社團|團體)/u.test(t))return null;
 if(!/(?:可以|能不能|能否|能把|有權|合法|合不合法|自己決定|單方面|直接)/u.test(t))return null;
 return '理事長可以直接把會員除名嗎';
}
if(typeof module!=='undefined'&&module.exports){module.exports=canonicalMemberExpulsion;return;}
const previous=root.verifiedRoundAnswer;
root.verifiedRoundAnswer=function(q,ctx){return previous.call(this,canonicalMemberExpulsion(q)||q,ctx);};
})(typeof window!=='undefined'?window:globalThis);
