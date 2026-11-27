/* 關鍵字選單：民眾只輸入關鍵字（例如「關懷據點」「股息」「改選」）時，
   不直接猜一個答案，改列出「您是不是要問以下相關的問題？」讓民眾點選。
   候選問題只取已驗證會答對的固定測試題與知識庫條目（data/keyword-questions.json）。 */
(function () {
  let LIST = null;
  const READY = fetch('data/keyword-questions.json?v=20261127-290').then(r => r.ok ? r.json() : null).then(d => { LIST = (d && d.questions) || []; }).catch(() => { LIST = []; });
  const NFK = s => String(s || '').normalize('NFKC').replace(/\s+/g, '').replace(/臺/g, '台');
  const QWORD = /[?？嗎呢]|怎|如何|可以|可不可以|能不能|能否|幾|什麼|甚麼|哪|誰|是否|要不要|多久|多少|為何|為什麼|請問|一定要|需不需要|有沒有|會不會|算不算/;
  function isKeyword(raw) {
    const t = NFK(raw).replace(/[。，,.!！、]/g, '');
    if (t.length < 2 || t.length > 6) return '';
    // 「總幹事」「幹事」「幹部」是職稱，不是「不幹了」的幹（第228輪：原本輸入「總幹事」直接猜一則答案，沒有出選單）
    const t2 = t.replace(/總幹事|幹事|幹部/g, '');
    if (/我|想|了|沒|不|要|幹|弄|丟|往生|過世|離職|辭職|請辭|換人|出缺|關係|門檻|跟|和|與/.test(t2)) return ''; // 有動作、狀態的句子照原本流程回答
    if (QWORD.test(t)) return '';
    if (/\d{2,}|第.+條/.test(t)) return '';
    return t;
  }
  window.keywordQuestions = () => LIST || [];
  window.keywordMenu = async function (q, shownQ, intent) {
    if (!LIST) { try { await Promise.race([READY, new Promise(r => setTimeout(r, 3000))]); } catch (e) {} }
    if (!LIST || !LIST.length) return null;
    const kw = isKeyword(shownQ);
    // 「統一編號」不是團體名稱，不走名冊查詢（第216輪）
    if (intent && (intent.kind === 'dir' || intent.kind === 'staff') && !/^(統一編號|統編)$/.test(kw)) return null;
    if (!kw) return null;
    const keys = [kw];
    const nq = NFK(q).replace(/[。，,.!！、？?]/g, '');
    if (nq && nq !== kw && nq.length <= 8 && !QWORD.test(nq)) keys.push(nq);
    const hits = [];
    for (const c of LIST) {
      const n = NFK(c);
      if (keys.some(k => n.includes(k))) hits.push(c);
      if (hits.length >= 40) break;
    }
    if (hits.length < 1) return null; // 找不到相關問題時照原本流程回答
    // 依問題長度與多樣性挑 8 題：避免同一開頭重複
    const pick = [], seen = new Set();
    for (const h of hits) {
      const head = NFK(h).slice(0, Math.max(6, kw.length + 3)); // 關鍵字本身是開頭時，取關鍵字後面幾個字來分辨
      if (seen.has(head)) continue;
      seen.add(head); pick.push(h);
      if (pick.length >= 8) break;
    }
    return {
      direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
      summary: '「' + shownQ.trim() + '」可以問的方向不只一個，小屏怕直接回答會答錯。請點選下面最接近您想問的問題；都不是的話，也可以把問題講完整一點再問一次，例如「' + pick[0].replace(/[？?]$/, '') + '」',
      related: pick, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'keyword-menu' }
    };
  };
})();
