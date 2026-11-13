/* AI 即時補答：櫃檯規則與知識庫都答不出來（unanswered）時，才請中繼 Worker 的 /ask 用法條原文整理回答。
   回答標示「AI 整理，僅供參考」，並列出引用的法條原文；未設定端點或任何失敗時，維持原本的「難倒小屏」答案。 */
(function(){
  const meta=document.querySelector('meta[name="ai-endpoint"]');
  const base=(meta&&meta.content||'').replace(/\/+$/,'');
  if(!base||typeof renderAnswer!=='function')return;
  const prev=renderAnswer;
  let seq=0;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  renderAnswer=function(q,a){
    prev(q,a);
    const my=++seq;
    if(!a||!a.unanswered)return;
    const host=document.querySelector('#board');
    if(!host)return;
    const clean=typeof scrubPII==='function'?scrubPII(q):String(q||'');
    if(!clean||clean.length<4)return;
    const box=document.createElement('div');
    box.className='ai-box';
    box.setAttribute('role','status');
    box.style.cssText='margin:14px 0;padding:12px 14px;border:1px dashed var(--accent,#e0914f);border-radius:12px;line-height:1.8';
    box.textContent='小屏正在幫您找相關法條…';
    host.appendChild(box);
    const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),25000);
    fetch(base+'/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:clean}),signal:ctl.signal})
      .then(r=>r.ok?r.json():null)
      .then(j=>{
        clearTimeout(to);
        if(my!==seq||!box.isConnected)return;
        if(!j||!j.answer){box.remove();return}
        const cites=(j.cites||[]).map(c=>'<li><strong>'+esc(c.law)+'第'+esc(c.no)+'條</strong>：'+esc(c.text)+'</li>').join('');
        box.style.borderStyle='solid';
        box.innerHTML='<strong>相關法條（僅供參考）</strong><div style="white-space:pre-wrap;margin-top:6px">'+esc(j.answer)+'</div>'
          +(cites?'<details open style="margin-top:8px"><summary>法條原文</summary><ul>'+cites+'</ul></details>':'')
          +'<p style="margin:8px 0 0;font-size:.9em;opacity:.8">以上是自動檢索的條文原文，不代表結論，正式辦理請以縣府承辦人員的說明為準。</p>';
      })
      .catch(()=>{clearTimeout(to);if(box.isConnected)box.remove()});
  };
})();
