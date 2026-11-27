/* AI 理解問題：小屏答不出來（難倒小屏）或不確定有沒有聽懂（把關選單）時，
   請中繼 Worker 的 /understand 用 Claude 判斷「這句話最接近題庫裡的哪幾題」，
   再把那幾題列成按鈕讓民眾點選。AI 只挑題目、不產生答案；點下去看到的仍是題庫原本已核對的答案。
   未設定端點、逾時或任何失敗時，畫面維持原本的回覆。 */
(function(){
  const meta=document.querySelector('meta[name="ai-understand-endpoint"]');
  const base=(meta&&meta.content||'').replace(/\/+$/,'');
  if(!base||typeof renderAnswer!=='function')return;
  if(navigator.webdriver)return; // 自動檢查（每小時 smoke）不呼叫，避免耗用 API 額度
  const prev=renderAnswer;
  let seq=0;
  renderAnswer=function(q,a){
    const out=prev(q,a);
    const my=++seq;
    try{
      if(!a||!(a.unanswered||a.guarded))return out;
      const host=document.querySelector('#board');
      const bank=(typeof window.keywordQuestions==='function'&&window.keywordQuestions())||[];
      const clean=typeof scrubPII==='function'?scrubPII(q):'';
      if(!host||!bank.length||!clean||clean.length<4)return out;
      const shown=new Set(a.related||[]);
      const box=document.createElement('div');
      box.className='sec ai-understand';
      box.setAttribute('role','status');
      box.textContent='小屏正在想您問的是哪一題…';
      const actions=host.querySelector('.actions');
      host.insertBefore(box,actions||null);
      const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),30000);
      fetch(base+'/understand',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:clean}),signal:ctl.signal})
        .then(r=>r.ok?r.json():null)
        .then(j=>{
          clearTimeout(to);
          if(my!==seq||!box.isConnected)return;
          // 只接受題庫裡真的有的題目，而且不重複畫面上已經列出的
          const picks=((j&&j.picks)||[]).filter(p=>typeof p==='string'&&bank.includes(p)&&!shown.has(p)).slice(0,4);
          if(!picks.length){box.remove();return}
          box.textContent='';
          const h=document.createElement('h3');h.textContent='小屏猜您想問的是';box.appendChild(h);
          for(const p of picks){const b=document.createElement('button');b.type='button';b.className='qbtn';b.dataset.q=p;b.textContent=p;box.appendChild(b)}
          const note=document.createElement('p');
          note.style.cssText='margin:8px 0 0;font-size:.9em;opacity:.8';
          note.textContent='這幾題是請 AI 從已核對的題庫裡挑出來的，點下去看到的是題庫原本的答案。都不是的話，請換個說法再問一次，或電洽承辦人員。';
          box.appendChild(note);
        })
        .catch(()=>{clearTimeout(to);if(box.isConnected)box.remove()});
    }catch(e){}
    return out;
  };
})();
