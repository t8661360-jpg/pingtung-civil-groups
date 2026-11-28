/* 答案把關與回報：
   1. 信心不足就不硬答：內建「流程型」答案（例如「會員大會怎麼開」）被拿來回答「可不可以／最晚何時／誰／幾個」這類
      具體問題時，不直接顯示，改列出「您是不是要問以下相關的問題？」讓民眾點選。
   2. 每則答案下方加「這個答案沒有幫到我」回報按鈕，送進待處理問題（GitHub Issue → Notion 佇列），不含個資。 */
(function () {
  const NFK = s => String(s || '').normalize('NFKC').replace(/\s+/g, '').replace(/臺/g, '台');
  const SPECIFIC = /可以|可不可以|能不能|能否|是否|最晚|最遲|幾月|幾天|幾日|多久|多少|幾個|幾人|幾位|幾次|誰|哪個|哪一個|哪裡|向誰|算不算|有沒有|會不會|要不要|需不需要|一定要|嗎[?？]?$/;
  const HOWTO = /怎麼|如何|怎樣|流程|步驟|程序|手續|要準備|準備什麼|文件|資料|表單|書表/;
  const grams = s => { const t = NFK(s).replace(/[^一-鿿0-9a-z]/gi, ''); const g = new Set(); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; };
  function similar(q, limit) {
    const list = (typeof window.keywordQuestions === 'function' && window.keywordQuestions()) || [];
    const qg = grams(q); if (!qg.size) return [];
    const scored = [];
    const min = arguments[2] || 0.25;
    for (const c of list) { const cg = grams(c); let n = 0; for (const x of cg) if (qg.has(x)) n++; const s = n / Math.sqrt(cg.size * qg.size || 1); if (n >= 2 && s >= min) scored.push([s, c]); }
    scored.sort((a, b) => b[0] - a[0]);
    const out = [], seen = new Set();
    for (const [, c] of scored) { const h = NFK(c).slice(0, 6); if (seen.has(h)) continue; seen.add(h); out.push(c); if (out.length >= limit) break; }
    return out;
  }
  /* ── 理解強化第1輪 ──────────────────────────────────────────────
     A. 兩種團體互相比較（「社區發展協會跟公會的出席門檻一樣嗎」）：答案沒有同時談到兩種團體，就不硬答，改出選單。
     B. 一句話問兩件事（「理事長一任幾年，還有最多可以連任幾次」）：把兩個小問題分開，各自用已核對的答案回答，
        合在一起顯示；只答得出一半時，明講另一半沒有把握。
     C. 前半是自我介紹、後半才是問題（「我是新上任的總幹事…請問預算什麼時候送」）：答案如果是被自我介紹帶走的，改答後半的問題。
     只重組既有的已核對答案，不新增任何內容。 */
  const TYPES = [['合作社', /合作社/], ['社區發展協會', /社區發展協會|社區協會/], ['公會', /公會|商業會|工業會|職業團體/], ['工會', /工會/], ['基金會', /基金會|財團法人/], ['協會', /協會|社會團體|社團(?!法人)/]];
  const typesOf = t => { let x = NFK(t); const out = []; for (const [n, re] of TYPES) { if (re.test(x)) { out.push(n); x = x.replace(new RegExp(re.source, 'g'), '＿'); } } return out; };
  const COMPARE = /一樣嗎|一不一樣|一樣不一樣|有沒有一樣|相同嗎|是否相同|有什麼不同|有何不同|有什麼不一樣|哪裡不同|哪裡不一樣|差別|差在哪|差異|有什麼差|怎麼分|(跟|和|與).{2,14}(一樣|相同)|比較|各是|各要|各幾|各多|各有|各自|分別/;
  const ASK = /[?？]|嗎|呢$|怎麼|如何|怎樣|可以|可不可以|能不能|能否|是否|幾|多久|多少|誰|哪|什麼|甚麼|啥|要不要|需不需要|有沒有|會不會|算不算|一定要/;
  const fixedUnknown = q => { try { if (typeof reportUnanswered === 'function') reportUnanswered(q); } catch (e) {}
    return { category: '其他', title: '抱歉，這個問題難倒小屏了', summary: '抱歉，這個問題難倒小屏了，小屏暫時無法回答喔！建議您先電洽承辦人員詢問～縣府總機 08-7320415 轉社會處承辦人', notes: [], actions: [{ label: '聯絡承辦', view: 'contact', sub: '' }, { label: '回到常見問題', view: 'home', sub: '' }], unanswered: true, guarded: true }; };
  const menu = (q, first) => { const rel = [...(first ? [first] : []), ...similar(q, 6).filter(x => x !== first && NFK(x) !== NFK(q))].slice(0, 7); // 2026-11-28：不要把民眾原句列成選項（點了又回到同一個選單）
    if (!rel.length) return fixedUnknown(q);
    return { direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
      summary: '小屏不確定有沒有聽懂您的問題，怕直接回答會答錯。請點選下面最接近您想問的問題；都不是的話，請換個說法再問一次，或電洽承辦人員。',
      related: rel, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'guard-menu' }, guarded: true }; };
  const textOf = a => NFK([a.title, a.summary, (a.notes || []).join(''), (a.steps || []).map(x => Array.isArray(x) ? x.join('') : x).join('')].join('｜'));
  function compareGuard(q, a) {
    if (!a || a.unanswered || a.guarded || /您是不是要問|想先確認|分開看|分別/.test(a.title || '')) return null;
    const t = NFK(q); if (!COMPARE.test(t)) return null;
    const ty = typesOf(t); if (ty.length < 2) return null;
    const at = textOf(a);
    if (ty.every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? at.replace(/社區發展協會|社區協會/g, '＿') : at))) return null; // 答案兩種團體都有談到
    return menu(q, null);
  }
  function compareTopic(q, a) {
    if (!a || a.unanswered || a.guarded || !window.AnswerArbiter || /您是不是要問|想先確認/.test(a.title || '')) return null;
    const t = NFK(q); if (!COMPARE.test(t)) return null;
    const ty = typesOf(t); if (ty.length < 2) return null;
    const SKIP = /^(協會|合作社|社區發展協會|理事|監事|會員|社員|理事會|監事會|會員大會|社員大會|理事長|會員代表|名額|法人|成立)$/;
    const tp = window.AnswerArbiter.topicsOf(t).filter(x => !SKIP.test(x)); if (!tp.length) return null;
    const has = x => { const at = new Set(window.AnswerArbiter.topicsOf(textOf(x))); return tp.every(k => at.has(k)); };
    if (has(a)) return null;
    try { const f = typeof focusedQuestionAnswer === 'function' ? focusedQuestionAnswer(typeof normalizeQuestion === 'function' ? normalizeQuestion(q) : q) : null;
      if (f && f.questionState && f.questionState.domain === 'mixed' && has(f)) return { ...f, direct: true, guarded: true }; } catch (e) {}
    return menu(q, null);
  }
  const PART_RULES = ['socialRegionalNameAnswer', 'socialNameRestrictionAnswer', 'coopAnnualReportsAnswer', 'communityAnnualPlanAnswer', 'coopSurplusDistributionAnswer', 'socialBoardProxyAnswer', 'socialDissolutionVoteAnswer', 'coopDissolutionVoteAnswer', 'socialMemberExpulsionVoteAnswer', 'coopMemberExpulsionAnswer', 'socialMembershipFeeRefundAnswer', 'coopVoluntaryWithdrawalAnswer', 'socialBoardQuorumAnswer', 'socialQuorumAnswer', 'proxyRatioAnswer', 'socialProxyAnswer', 'coopProxyAnswer', 'accountingBasisAnswer', 'boardSeatAnswer', 'taxRegistrationAnswer'];
  function resolvePart(p) {
    try {
      const nq = typeof normalizeQuestion === 'function' ? normalizeQuestion(p) : p;
      let r = typeof verifiedRoundAnswer === 'function' ? verifiedRoundAnswer(nq, { catalog: (typeof STORE !== 'undefined' && STORE.forms && STORE.forms.catalog) || undefined }) : null;
      if (!r || typeof r !== 'object' || !r.title) { r = null; for (const f of PART_RULES) { try { const fn = eval('typeof ' + f + "==='function'?" + f + ':null'); const v = fn && fn(nq); if (v && v.title) { r = v; break; } } catch (e) {} } }
      if (!r || typeof r !== 'object' || !r.title) r = typeof focusedQuestionAnswer === 'function' ? focusedQuestionAnswer(nq) : null;
      if (!r || !r.title || !r.summary || r.unanswered || /您是不是要問|想先確認|難倒小屏|請選擇|不是這個櫃檯/.test(r.title)) return null;
      if (r.questionState && /clarify|menu/.test(r.questionState.focus || '')) return null;
      if (window.AnswerArbiter) { const sc = window.AnswerArbiter.score(nq, r, null); if (!(sc.s >= 0.6)) return null; }
      return r;
    } catch (e) { return null; }
  }
  const headOf = p => { const m = p.match(/^(.{2,14}?)(?:的話|怎麼|如何|怎樣|可以|可不可以|能不能|能否|是否|要不要|需不需要|有沒有|會不會|幾|多久|多少|誰|哪|什麼|嗎)/); return m ? m[1].replace(/[要是的]$/, '') : ''; };
  function splitAsk(q) {
    const raw = String(q || '').normalize('NFKC').trim();
    if (raw.length < 12 || raw.length > 90) return null;
    const chunks = raw.split(/[?？。；;！!,，]+|另外|還想問|還有(?=.{4})|順便問|再請問|以及(?=.{6})/).map(x => x.trim().replace(/^(那|那麼|請問|想請問|想問|然後|而且|又|再來|也想知道|想知道)/, '')).filter(x => x.length >= 2);
    const parts = []; let bg = '';
    for (const c of chunks) { if (ASK.test(c) && c.length >= 4) { parts.push({ bg, ask: c }); bg = ''; } else bg += c; }
    if (bg && parts.length) parts[parts.length - 1].tail = bg;
    return parts;
  }
  function compound(q, a) {
    if (!a || a.guarded || (a.questionState && /clarify|menu|compound/.test(a.questionState.focus || ''))) return null;
    if (/您是不是要問|想先確認|分開看|分別|兩件事|不是這個櫃檯/.test((a.title || '') + (a.summary || '').slice(0, 30))) return null;
    if (typeof verifiedRoundAnswer !== 'function') return null;
    const parts = splitAsk(q); if (!parts) return null;
    const whole = NFK(q);
    const gt = typesOf(whole);
    const withType = (p, ref) => { if (typesOf(p).length) return p; const rt = typesOf(ref || ''); const g = rt.length === 1 ? rt[0] : (gt.length === 1 ? gt[0] : ''); return g ? g + p : p; };
    /* C. 自我介紹＋問題 */
    if (parts.length === 1 && parts[0].bg && !parts[0].tail) {
      const bg = parts[0].bg, ask = parts[0].ask;
      if (!/^(我是|我們是|我剛|我才剛|本人是|我在|我目前|我今年|我現在是)/.test(bg) || /如果|假如|要是|萬一|但是|可是|不過|結果/.test(bg) || ask.length < 8 || a.unanswered) return null;
      const B = resolvePart(withType(ask, bg)); if (!B || B.title === a.title) return null;
      const hit = (title, text) => { const tt = NFK(title); let n = 0; for (const g of grams(text)) if (tt.includes(g)) n++; return n; };
      if (!(hit(a.title, bg) >= 2 && hit(B.title, ask) > hit(a.title, ask))) return null; // 原答案不是被自我介紹帶走的，就不動
      return { ...B, direct: true, guarded: true };
    }
    /* B. 一句話問兩件事 */
    if (parts.length !== 2) return null;
    const p1 = (parts[0].bg || '') + parts[0].ask; let p2 = (parts[1].bg || '') + parts[1].ask + (parts[1].tail || '');
    if (p1.length < 5 || p2.length < 5) return null;
    /* 第3輪：後半換成另一種團體（「…，協會理事長又是怎樣」「…，合作社社員也有戶籍限制嗎」）是在問第二件事，不是承接前半 */
    const ty1 = typesOf(p1), ty2 = typesOf(p2), diffType = ty1.length === 1 && ty2.length === 1 && ty1[0] !== ty2[0];
    const SUF3 = /(又是怎樣|又是怎麼樣|又是如何|又怎樣|又怎麼樣|又如何|也一樣嗎|也是嗎|也是這樣嗎|也相同嗎|也是一樣嗎|也可以嗎|也能嗎|也行嗎|也適用嗎)$/; // 2026-11-28：「…公會會員代表可以委託出席嗎，協會會員也可以嗎」
    if (diffType && SUF3.test(p2) && p2.length < 16) { const k = p1.search(/怎麼|如何|可以|可不可以|能不能|幾|多久|多少|誰|要不要|需不需要|有沒有|會不會|一定要/); const subj = p2.replace(SUF3, '').replace(/的$/, '');
      if (k >= 2 && subj.length >= 2) { const re1 = TYPES.find(x => x[0] === ty1[0])[1], re2 = TYPES.find(x => x[0] === ty2[0])[1];
        p2 = subj.replace(new RegExp(re2.source, 'g'), '') ? subj + p1.slice(k) : p1.replace(new RegExp(re1.source), subj); } }
    /* 第5輪：「…，公會的呢」「…？合作社呢？」後半只有另一種團體的名稱 → 把前半問句的團體換成它，當成第二個問題 */
    const bare5 = /呢$/.test(p2) && p2.length < 12 ? p2.replace(/呢$/, '').replace(/^(那麼|那)/, '').replace(/的$/, '') : '';
    const bareType5 = !!bare5 && diffType && !bare5.replace(new RegExp(TYPES.find(x => x[0] === ty2[0])[1].source, 'g'), '');
    if (bareType5) p2 = p1.replace(new RegExp(TYPES.find(x => x[0] === ty1[0])[1].source), bare5);
    else if (/呢$/.test(p2) && p2.length < 12) { const k = p1.search(/怎麼|如何|可以|可不可以|能不能|幾|多久|多少|誰|要不要|需不需要|有沒有|會不會/); const subj = p2.replace(/呢$/, ''); if (k < 2 || subj.length < 2) return null; p2 = subj + p1.slice(k); }
    if (/^.{0,8}(也|一樣|同樣)/.test(p2) && p2.length < 14 && !diffType) return null; // 「監事會也可以嗎」這種承接問法，照原本整句回答
    if (/^(如果|假如|要是|萬一)/.test(p1) && !/嗎|呢/.test(parts[0].ask)) return null; // 條件句照原本整句回答
    const A = resolvePart(withType(p1));
    /* 後半句常省略主詞：依序試「代名詞換成前半的職稱」「補上前半的職稱」「原句」「補上前半的開頭」，第一個答得出來的為準 */
    const ROLE = /理事長|常務理事|常務監事|理事|監事|總幹事|會員代表|會員|社員|理事會|監事會|大會/;
    const role = (p1.match(ROLE) || [''])[0], h = headOf(p1);
    const tries = [/^[他她它]/.test(p2) && role ? withType(role, p1) + p2.slice(1) : '', !/^[他她它]/.test(p2) && role && !ROLE.test(p2) ? withType(role + p2, p1) : '', /^[他她它]/.test(p2) ? '' : withType(p2, p1), h && !/^[他她它]/.test(p2) ? h + p2 : ''];
    let B = null; for (const c2 of tries) { if (!c2) continue; B = resolvePart(c2); if (B) { p2 = c2; break; } }
    const tA = A && A.title, tB = B && B.title, W = a.title;
    const covRate = (ans, other) => { const wt = textOf(ans); const tg = [...grams(String(other.title).split(/[:：]/)[0])]; return tg.length ? tg.filter(g => wt.includes(g)).length / tg.length : 0; };
    const covers = (ans, other) => { const wt = textOf(ans); const cov = covRate(ans, other);
      return cov >= 0.75; };
    /* 原答案有沒有談到「另一半問句」本身：去掉問法用字後的字詞八成以上出現在答案裡；問幾年／幾天／幾人的，答案還要有對應單位的數字 */
    const STOPW = /可不可以|可以|能不能|能否|是否|怎麼辦|怎麼|如何|怎樣|什麼|甚麼|要不要|需不需要|有沒有|會不會|還要|還有|還是|的話|或是|或者|以及|另外|請問|幾|多少|多久|嗎|呢|或|和|跟|與|的|了|要|是|又|也|他|她/;
    const coversQ = (ans, part) => { const wt = textOf(ans); const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOPW.source, 'g')).filter(x => x && x.length >= 2);
      const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); if (!g.length) return true;
      if (g.filter(x => wt.includes(x)).length / g.length < 0.75) return false;
      /* 第4輪：問「多久開一次／一年開幾次」，答案要真的講到頻率（每…一次、至少…次），不能只因為有別的數字就算有答 */
      if (/多久.{0,6}一次|(一年|每年|一屆).{0,6}幾次|幾個月.{0,6}一次/.test(NFK(part)) && !/每[^，。；]{0,10}(一次|[0-9一二三四五六七八九十兩]+次)|至少[^，。；]{0,8}次/.test(wt)) return false;
      const m = NFK(part).match(/幾(年|個月|天|日|人|位|名|次|屆|張|成|歲)|多少(人|錢|元)|(多久)/); if (!m) return true;
      const u = m[3] ? '(?:年|個月|日|天)' : ({ 天: '(?:天|日)', 日: '(?:天|日)', 位: '(?:人|位|名)', 名: '(?:人|位|名)', 人: '(?:人|位|名)', 錢: '元' }[m[1] || m[2]] || (m[1] || m[2]));
      return new RegExp('[0-9一二三四五六七八九十百兩半]+\\s*(?:個)?' + u).test(wt); };
    /* 第4輪：問頻率的那一半（多久開一次、一年幾次），原答案沒有講頻率就不算涵蓋 */
    const freqMiss = (ans, part) => /多久.{0,6}一次|(一年|每年|一屆).{0,6}幾次|幾個月.{0,6}一次/.test(NFK(part)) && !/每[^，。；]{0,10}(一次|[0-9一二三四五六七八九十兩]+次)|至少[^，。；]{0,8}次/.test(textOf(ans));
    const block = (n, x) => '第' + n + '個問題：' + x.title + '\n' + x.summary;
    const merge = (list, base) => { const seen = new Set(); const st = list.flatMap(x => x.statutes || []).filter(x => { const k = x && x.title; if (!k || seen.has(k)) return false; seen.add(k); return true; });
      return { ...base, direct: true, guarded: true, statutes: st, refs: list.flatMap(x => x.refs || []), notes: [...new Set(list.flatMap(x => x.notes || []))], questionState: { focus: 'compound' } }; };
    if (A && B && tA !== tB) {
      const isKB = typeof KB !== 'undefined' && KB.some(e => e.title === W);
      if (a.unanswered || isKB || W === tA || W === tB) {
        if (!(bareType5 && !a.unanswered) && (W === tA && !freqMiss(a, parts[1].ask) && (covers(a, B) || coversQ(a, parts[1].ask)) || W === tB && !freqMiss(a, parts[0].ask) && (covers(a, A) || coversQ(a, parts[0].ask)))) return null; // 原答案已經涵蓋另一半的重點
        return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
          summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [],
          actions: (!a.unanswered && a.actions && a.actions.length ? a.actions : A.actions) || [] });
      }
      /* 整句配到第三則答案：保留原答案，把它沒談到的那一半補在後面 */
      if (!a.summary || (a.steps && a.steps.length)) return null;
      /* 第3輪：兩半問的是不同種團體，原答案卻只談到其中一種 → 兩半分開回答 */
      if (diffType) { const wt3 = textOf(a); if (![ty1[0], ty2[0]].every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? wt3.replace(/社區發展協會|社區協會/g, '＿') : wt3)))
        return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
          summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [], actions: A.actions || [] }); }
      const tOnly = { title: a.title }; const cA = covRate(tOnly, A), cB = covRate(tOnly, B); // 整句配到第三則：只拿標題比，內文太長容易誤判成「有談到」
      if (Math.max(cA, cB) < 0.3) return merge([A, B], { category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩件事，小屏分開回答',
        summary: '您一次問了兩件事，小屏分開回答。\n\n' + block('一', A) + '\n\n' + block('二', B), steps: [], docs: [], laws: [], actions: A.actions || [] }); // 原答案兩半都沒談到
      if (!(Math.max(cA, cB) >= 0.4 && Math.min(cA, cB) < 0.3)) return null;
      const qRate = part => { const wt = NFK(a.title); const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOPW.source, 'g')).filter(x => x && x.length >= 2);
        const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); return g.length ? g.filter(x => wt.includes(x)).length / g.length : 1; };
      const rA = qRate(parts[0].ask), rB = qRate(parts[1].ask);
      /* 第3輪：標題用字像前半、內文其實在答後半（「會員入會要理事會通過嗎？入會費可以收多少？」配到「會費、入會費由誰決定」）→ 補的應該是前半 */
      const add = [(cA < cB ? (rA - rB >= 0.25 ? B : A) : (rB - rA >= 0.25 ? A : B))];
      const lost = add[0] === A ? parts[0].ask : parts[1].ask;
      return merge([a, add[0]], { ...a, summary: a.summary + '\n\n您還問了「' + lost + '」，小屏另外回答：' + add[0].title + '\n' + add[0].summary });
    }
    /* 只答得出一半：原答案就是那一半，而且完全沒談到另一半的主題 → 明講另一半沒有把握 */
    if ((A || B) && !(A && B) && !a.unanswered && W === (tA || tB) && window.AnswerArbiter) {
      const miss = A ? p2 : p1; const WEAK = /^(協會|合作社|理事|監事|會員|社員|理事會|監事會|會員大會|社員大會|理事長|社區發展協會|名額)$/;
      const tp = window.AnswerArbiter.topicsOf(miss).filter(x => !WEAK.test(x)); const at = new Set(window.AnswerArbiter.topicsOf(textOf(a)));
      if (!tp.length || tp.some(x => at.has(x))) return null;
      const shown = A ? parts[0].ask : parts[1].ask, lost = A ? parts[1].ask : parts[0].ask;
      return { ...a, guarded: true, summary: '您一次問了兩件事。下面先回答「' + shown + '」的部分；「' + lost + '」這一部分小屏沒有把握，怕答錯，建議您電洽承辦人員，或把這一部分單獨再問一次。\n\n' + (a.summary || '') };
    }
    return null;
  }
  /* ── 理解把關第2輪（2026-11-27）──
     接在第1輪（比較題把關、一句問兩件事分開回答）後面：第1輪沒有接手的題目，再看一次「問句」和「答案」是不是同一件事。
     補的是：捐款抵稅一律請洽國稅局；大樓管委會改用既有的業務分流、學校家長會用固定用語；一句問兩件事而分不開回答時，
     答案沒談到其中一個問句的重點就出選單；「順便／同時」辦兩件事只答一件；問句的關鍵細節（颱風停班、住院、被罰）答案完全沒提到。
     每個條件都用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const group = (ask, ans) => ({ ask: new RegExp(ask.map(esc).join('|'), 'i'), ans: new RegExp((ans || ask).map(esc).join('|'), 'i') });
  // 細節主題：問句提到、答案完全沒提到 → 答案沒有在答這個細節
  const DETAILS = [
    group(['颱風', '停班', '停課', '天災', '地震', '豪雨', '停電', '淹水'], ['颱風', '停班', '停課', '天災', '地震', '豪雨', '停電', '淹水', '不可抗力', '緊急事故', '延期', '延後', '改期']),
    group(['住院', '中風', '開刀', '失智', '昏迷', '重病', '病倒'], ['住院', '中風', '開刀', '失智', '昏迷', '重病', '生病', '因故', '不能視事', '不能執行', '無法執行', '不能行使', '出缺', '請假', '代理', '代行', '辭職', '監護', '輔助宣告']),
    group(['典禮', '儀式', '布達', '剪綵', '揭牌']),
    group(['共用', '合用', '共同使用'], ['共用', '合用', '共同使用', '同一', '共同', '一起']),
    { ask: /(帶|拿).{1,10}(出國|去國外|到國外)|(出國|去國外).{0,6}(把|帶).{1,10}帶去/, ans: /帶|攜|保管|存放|放在|放家/ },
    group(['帶出國', '帶去國外', '帶到國外', '帶回家', '帶回去', '拿回家'], ['帶', '攜', '保管', '存放', '放在', '放家', '拿走', '取走', '交付', '影印', '副本', '抄錄', '閱覽']),
    { ask: /解散了?(之後|以後|後)(?!.{0,3}(剩|賸|財產|錢))|已經?解散了?/, ans: /解散|清算/ }, // 第6輪：問解散以後的事，答案完全沒談解散或清算
    group(['便當', '餐盒', '誤餐', '餐費'], ['便當', '餐盒', '誤餐', '餐費', '餐點', '膳']),
    group(['被罰', '罰款', '罰錢', '罰鍰', '受罰', '會罰', '開罰', '處罰'], ['罰', '處分', '警告', '撤銷', '限期', '整理', '廢止', '解散', '撤免', '停權', '沒有規定', '沒有明文', '註銷', '繳回', '追繳', '收回', '停止補助', '不予補助'])
  ];
  // 混合問題用的主題詞：每組第一個字串是代表名，其餘是同義說法
  const PART_TOPICS = [['連任', '連選', '續任'], ['任期', '任滿', '屆滿', '做幾年', '當幾年', '幾年一任'], ['兼任', '兼', '同時當', '同時擔任', '擔任', '充任'], ['會計', '出納', '財務人員'], ['總幹事', '秘書長', '工作人員', '幹事', '員工'],
    ['配偶', '親屬', '三等親', '三親等', '親戚', '夫妻', '老婆', '太太', '先生', '兒子', '女兒', '家人'], ['會址', '地址', '遷址', '搬家', '搬遷'], ['改名', '名稱', '會名', '名字', '更名'], ['收據'], ['捐款', '捐贈', '捐錢', '捐助'],
    ['剩餘財產', '剩下的錢', '賸餘', '剩餘', '餘款', '剩的錢'], ['解散', '清算'], ['章程'], ['通知'], ['出席', '到場', '法定人數', '流會'], ['委託', '代理出席', '委託書'], ['補選', '遞補', '候補'], ['辭職', '請辭'], ['改選', '選舉', '投票', '選票'],
    ['會費', '入會費', '常年會費', '年費'], ['補助', '核銷'], ['統編', '統一編號'], ['開戶', '帳戶', '存摺'], ['法人', '法院'], ['理事長'], ['常務理事'], ['常務監事'], ['監事', '理監事'], ['理事', '理監事'], ['會員大會', '社員大會', '大會'], ['理事會', '監事會', '理監事會'],
    ['圖記', '印信', '印章'], ['立案證書', '證書'], ['預算', '決算', '財務報表', '報表'], ['工作計畫', '工作報告'], ['薪水', '薪資', '酬勞', '車馬費', '出席費'], ['罷免'], ['除名', '開除', '退會', '出會'], ['入會', '加入'], ['成立', '籌組', '籌備', '設立', '立案'], ['視訊', '線上', '遠距'], ['紀錄', '記錄'], ['勸募', '募款'], ['股金', '股息', '盈餘', '結餘'], ['分會', '分支'], ['查帳', '查核', '稽核', '看帳', '審核帳'], ['稅'], ['名下', '登記在誰', '登記誰', '誰的名字', '過戶', '所有權'], ['土地', '房地', '不動產', '房子', '房屋', '購置']
  ].map(g => ({ name: g[0], re: new RegExp(g.map(esc).sort((x, y) => y.length - x.length).join('|')) }));
  const ACTIONS = [['會址', '地址', '遷址', '搬家', '搬遷'], ['改名', '名稱', '會名', '名字', '更名'], ['圖記', '印信'], ['立案證書'], ['統編', '統一編號'], ['開戶', '銀行帳戶', '存摺'], ['法人登記', '社團法人'], ['解散'], ['理事長變更', '換理事長', '理事長換人', '新理事長']]
    .map(g => ({ name: g[0], re: new RegExp(g.map(esc).join('|')) }));
  const QMARK = /[?？]|嗎|呢$|幾|多少|多久|誰|哪|可以|可不可以|能不能|能否|是否|要不要|需不需要|怎麼|如何|怎樣|還是|有沒有|會不會|算不算|什麼|甚麼/;
  const answerText = a => NFK([a.title, a.summary, (a.steps || []).join(''), (a.notes || []).join(''), (a.docs || []).join(''), (a.guide || []).join(''), (a.where || []).join('')].join('｜'));
  const topicsIn = s => { let t = NFK(s); const out = []; for (const g of PART_TOPICS) { if (g.re.test(t)) { out.push(g); t = t.replace(new RegExp(g.re.source, 'g'), '＿'); } } return out; };
  function splitParts(raw) {
    return String(raw || '').normalize('NFKC').split(/[，,；;。？?！!\n]+|另外|還有|順便|以及|同時也|然後/).map(s => s.replace(/\s+/g, '').replace(/^(也|又|再|那|那麼|請問|想問|想請問)+/, '')).filter(s => s.length >= 4);
  }
  // 從已驗證題庫挑「同一種團體、同一個主題」的問題當選單
  function pickByTopic(test, topics, n) {
    const list = (typeof window.keywordQuestions === 'function' && window.keywordQuestions()) || [];
    const sc = [];
    for (const c of list) { const t = NFK(c); if (!test(t)) continue; let k = 0; for (const g of topics) if (g.re.test(t)) k++; if (k) sc.push([k, t.length, c]); }
    sc.sort((x, y) => (y[0] - x[0]) || (x[1] - y[1]));
    const out = [], seen = new Set();
    for (const [, , c] of sc) { const h = NFK(c).slice(0, 7); if (seen.has(h)) continue; seen.add(h); out.push(c); if (out.length >= n) break; }
    return out;
  }
  function fixedPhrase2(q, rel) {
    let sf = [], line = '';
    try { sf = staffFor(detectType(q), detectCat(q)) || []; line = contactLine(sf) || ''; } catch (e) {}
    try { if (typeof reportUnanswered === 'function') reportUnanswered(q); } catch (e) {}
    return { category: '其他', title: '抱歉，這個問題難倒小屏了', summary: '目前無法確認答案，也不能保證何時能補上。若是團體會務，可補充團體類型和要辦的事項再問；請勿貼姓名、證號或完整公文。團體會務也可選「聯絡承辦」核對；其他業務，請洽原主辦機關。',
      staff: sf, related: rel || [], notes: [], steps: [], docs: [], laws: [], actions: [{ label: '聯絡承辦', view: 'contact', sub: '' }, { label: '回到常見問題', view: 'home', sub: '' }], unanswered: true, guarded: true, questionState: { focus: 'guard-menu' } };
  }
  function menu2(q, rel, why) {
    const seen = new Set(), list = [];
    const self = NFK(q); // 2026-11-28：選單不列民眾原句本身，避免點了又回到同一個選單
    for (const x of rel) { if (!x || seen.has(x) || NFK(x) === self) continue; seen.add(x); list.push(x); if (list.length >= 8) break; }
    if (list.length < 2) for (const x of similar(q, 3, 0.15)) { if (!seen.has(x) && NFK(x) !== self) { seen.add(x); list.push(x); } } // 找不到夠像的問題時放寬一點，仍然沒有才用固定用語
    if (!list.length) return fixedPhrase2(q, list);
    return { direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
      summary: (why || '小屏不確定有沒有聽懂您的問題，怕直接回答會答錯。') + '請點選下面最接近您想問的問題；都不是的話，請換個說法再問一次，或電洽承辦人員。',
      related: list, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'guard-menu' }, guarded: true };
  }
  function understandingGuard(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify') return null;
    if ((a.groups && a.groups.length) || a.category === '團體查詢' || a.category === '打招呼') return null;
    const raw = NFK(q); if (raw.length < 8) return null;
    const at = answerText(a);
    // 0. 捐款抵稅：只答「請洽國稅局」
    if (/捐/.test(raw) && /抵.{0,4}稅|節稅|扣除額|列舉扣除/.test(raw) && !/合作社|社員/.test(raw) && !/國稅局/.test(a.title)) {
      try { const tax = verifiedRoundAnswer('捐款可以抵稅嗎', {}); if (tax && /國稅局/.test(tax.title || '')) return Object.assign({}, tax, { direct: true, guarded: true }); } catch (e) {}
    }
    if (a.category === '業務分流') return null;
    // 1. 不是本櫃檯的對象（大樓管委會、學校家長會）：答案沒有在談它，就不拿協會的答案硬配
    const oos = raw.match(/公寓大廈|管委會|管理委員會|(?:大樓|社區)的?主委|家長會|家長委員/);
    if (oos) {
      const condo = !/家長/.test(oos[0]);
      if (!(condo ? /管委會|管理委員會|公寓大廈/.test(at) : /家長會|家長委員/.test(at))) {
        if (condo) { try { const r = verifiedRoundAnswer('公寓大廈管理委員會要怎麼成立', {}); if (r && r.category === '業務分流') return Object.assign({}, r, { direct: true, guarded: true }); } catch (e) {} }
        return fixedPhrase2(q, []);
      }
    }
    // 3. 一句問兩件事：每一個問句的重點，答案都要有談到
    const parts = splitParts(q).filter(p => QMARK.test(p)).map(p => ({ p, ts: topicsIn(p) })).filter(x => x.ts.length);
    if (parts.length >= 2) {
      const cov = x => x.ts.filter(g => g.re.test(at)).length / x.ts.length;
      const miss = parts.filter(x => cov(x) < 0.6);
      if (miss.length) {
        const rel = []; const per = Math.max(2, Math.floor(8 / parts.length));
        for (const x of parts) rel.push(...similar(x.p, per));
        return menu2(q, rel, '您一次問了不只一件事，小屏怕只答到其中一半。');
      }
    }
    // 3b. 「順便／一起／同時」辦兩件事（例如改名＋換會址）：兩件事答案都要有談到
    if (/順便|一起|同時|一併|另外|還有/.test(raw)) {
      const acts = ACTIONS.filter(g => g.re.test(raw));
      if (acts.length >= 2 && acts.some(g => !g.re.test(at))) { const rel = []; for (const g of acts) rel.push(...pickByTopic(t => !/合作社/.test(t) || /合作社/.test(raw), [g], 3)); return menu2(q, rel.length >= 2 ? rel : similar(q, 8), '您一次問了不只一件事，小屏怕只答到其中一半。'); }
    }
    // 4. 問句裡的關鍵細節，答案完全沒提到
    for (const d of DETAILS) if (d.ask.test(raw) && !d.ans.test(at)) return menu2(q, [a.title.length <= 30 && !a.direct ? a.title : '', ...similar(q, 7)], '');
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard2 = understandingGuard;
  /* ── 理解把關第3輪（2026-11-27）──
     A. 不是本櫃檯對象、本站也沒有已核對分流資料的組織（農會、漁會、農田水利會、公司的董事股東）：答案沒有在談它，
        就不拿協會的答案硬配，用固定用語。一般勞資糾紛（不是協會自己的員工）列出相近題讓民眾選。
     B. 條件加例外（「如果…但是他是理事，還能出席理事會嗎」）：最後真正在問的那一句，答案要有談到；沒談到就出選單。
     每個條件都用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  const OOS3 = [
    /* 農會、漁會當成存錢、開戶的金融機構（「理事長換人了農會帳戶要怎麼辦」）時，問的是協會的帳戶，不是農會組織，不擋 */
    { ask: /農會|漁會|農田水利會|水利會/, ans: /農會|漁會|水利會/, skip: /(農會|漁會).{0,4}(帳戶|戶頭|存款|存摺|印鑑|開戶|貸款|借)|(帳戶|戶頭|存款|存摺|開戶|存在|存到|存進|存放|貸款|借錢|借款).{0,6}(農會|漁會)|(協會|社團|我們).{0,12}(跟|和|與)(農會|漁會).{0,8}(一起|合辦|共同|聯合|合作)?(辦|舉辦)活動/ },
    // 第7輪：skip 加上「協會跟農會合辦活動」（協會自己的事，有既有答案）
    { ask: /(公司|股份有限|有限公司).{0,12}(董事|監察人|股東|資本額|公司登記)|(董事|監察人|股東會|資本額).{0,12}(公司|股份有限)/, ans: /公司|董事|股東/ }
  ];
  const LABOR3 = { ask: /勞資(糾紛|爭議|調解|問題)|勞資雙方/, ans: /勞資|勞工主管|勞動/ };
  const COND3 = /(如果|假如|要是|萬一|假設|雖然).{2,40}?(但是|可是|不過|但|卻)/;
  const STOP3 = /可不可以|可以|能不能|能否|是否|怎麼辦|怎麼|如何|怎樣|什麼|甚麼|要不要|需不需要|有沒有|會不會|還能|還要|還可以|還是|還有|的話|這樣|那樣|請問|幾|多少|多久|嗎|呢|或|和|跟|與|的|了|要|是|又|也|他|她|還|能|會|就/;
  const rate3 = (part, wt) => { const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOP3.source, 'g')).filter(x => x && x.length >= 2);
    const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); return g.length >= 2 ? g.filter(x => wt.includes(x)).length / g.length : 1; };
  function understandingGuard3(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify') return null;
    if (a.category === '業務分流' || a.category === '打招呼') return null;
    const raw = NFK(q); if (raw.length < 5) return null;
    const at = answerText(a);
    for (const o of OOS3) if (o.ask.test(raw) && !(o.skip && o.skip.test(raw)) && !o.ans.test(at)) return fixedPhrase2(q, []);
    if (LABOR3.ask.test(raw) && !LABOR3.ans.test(at)) return menu2(q, similar(q, 6), '');
    /* 第4輪：問刑責要關多久、判幾年，不是本櫃檯能回答的事；答案沒有講到刑期就用固定用語 */
    if (/(被|會|要)?(關|判)(多久|幾年|幾個月)|刑期(多久|多長|幾年)|(罰金|罰鍰)(多少|幾萬)/.test(raw) && /酒駕|肇事|打人|傷害|偷|竊|詐欺|詐騙|毒|賭|偽造|侵占|侵佔|背信|貪污|性騷|被抓|被捕|被起訴|犯罪|犯法/.test(raw) && !/(處|科)[^，。]{0,12}(以下|以上)(有期徒刑|罰金|拘役)|[0-9一二三四五六七八九十]+年以下有期徒刑/.test(at))
      return { direct: true, guarded: true, category: '業務分流', title: '刑事責任（會不會被關、判多久）不是這個櫃檯（人民團體）的業務',
        summary: '會不會被關、判多久、罰金多少，是司法機關依個案認定的事，不是這個櫃檯的業務，本站沒有這方面的資料，小屏不能亂回答。\n\n如果您想知道的是理事長或理事、監事被判刑以後，在協會的職務怎麼處理，可以點下面的相關問題。\n\n這個櫃檯辦理的是屏東縣的社會團體（協會）、職業團體（公會）、社區發展協會和合作社。',
        related: ['理事長被判刑還能當理事長嗎'], statutes: [], notes: [], steps: [], docs: [], laws: [], actions: [{ label: '回到常見問題', view: 'home', sub: '' }] };
    if ((a.groups && a.groups.length) || a.category === '團體查詢') return null;
    /* C. 前後兩句各問一種團體（「社區發展協會可以收會費嗎，合作社也是嗎」），答案只談到其中一種 → 選單 */
    const cl = String(q || '').normalize('NFKC').split(/[，,；;。？?！!]+/).map(x => NFK(x)).filter(x => x.length >= 3);
    if (cl.length >= 2 && !/兩件事|分別|分開/.test(a.title)) {
      const t1 = typesOf(cl[0]), k = cl.findIndex((x, i) => i > 0 && QMARK.test(x) && typesOf(x).length === 1 && t1.length === 1 && typesOf(x)[0] !== t1[0] && !/改成|變成|轉型|轉成|改制|加入|合併|成立|籌組|申請/.test(x));
      if (k > 0 && QMARK.test(cl[0])) { const need = [t1[0], typesOf(cl[k])[0]];
        if (!need.every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? at.replace(/社區發展協會|社區協會/g, '＿') : at))) return menu2(q, [...similar(cl[0], 3), ...similar(cl[k], 3), ...similar(q, 4)], '您一次問了兩種團體，小屏怕只答到其中一種。'); }
    }
    /* 第4輪 D. 兩種團體「共用／同一個」什麼（「協會和合作社的理事長可以同一個人嗎」）：答案只談其中一種 → 選單 */
    if (/共用|合用|同一個|同一人|共同使用/.test(raw) && !/兩件事|分別|分開/.test(a.title)) {
      const ty4 = typesOf(raw);
      if (ty4.length === 2 && !ty4.every(n => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? at.replace(/社區發展協會|社區協會/g, '＿') : at))) return menu2(q, similar(q, 7), '您一次問了兩種團體，小屏怕只答到其中一種。');
    }
    const m = raw.match(COND3);
    let known4 = false; try { known4 = typeof normalizeQuestion === 'function' && !COND3.test(NFK(normalizeQuestion(q))); } catch (e) {} // 第4輪：整句已被正規化成一個標準問法（理解層認得），就不再用字面比對擋它
    if (m && raw.length >= 14 && !known4) {
      const tail = raw.slice(m.index + m[0].length);
      const SHORT4 = /^(這樣|這樣子|那這樣)?(可以|行|合法|有效|算數|算|可不可以|能不能|對)(嗎|呢)?$/;
      const asks = tail.split(/[，,；;。？?！!]+/).filter(x => x.length >= 4 && QMARK.test(x) && !SHORT4.test(x));
      let last = asks[asks.length - 1];
      const cls4 = tail.split(/[，,；;。？?！!]+/).filter(Boolean);
      if (!last && cls4.length >= 2 && SHORT4.test(cls4[cls4.length - 1]) && cls4[cls4.length - 2].length >= 5) last = cls4[cls4.length - 2]; // 第4輪：「…但是大會決議延長一年，可以嗎」
      { const cls7 = tail.split(/[，,；;。？?！!]+/).filter(Boolean), li = last ? cls7.lastIndexOf(last) : -1; // 第7輪：最後一句太短（「可以先送嗎」）抓不到關鍵詞時，連同前一句一起比對（「要報預算，可以先送嗎」）
        if (li > 0 && rate3(last, '') === 1 && cls7[li - 1].length >= 3 && rate3(cls7[li - 1] + last, at) === 0) return menu2(q, [...similar(cls7[li - 1] + last, 3), ...similar(q, 6)], ''); } // 合起來完全沒談到才擋，避免「當天收到很多委託書，可以算嗎」這類已答對的題目被擋
      if (last && rate3(last, at) < 0.5) return menu2(q, [...similar(last, 3), ...similar(q, 6)], '');
    }
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard3 = understandingGuard3;
  /* ── 理解把關第5輪（2026-11-27）──
     A. 基金會（財團法人）的問題配到協會的答案 → 改用既有的「基金會不是這個櫃檯的業務」分流。
     B. 神明會、補習班、幼兒園、產銷班、教會、巡守隊等不是本櫃檯對象、本站也沒有已核對資料的組織 → 固定用語。
     C. 「路燈壞了要找誰」這類和人民團體無關的「找誰」→ 不列人民團體承辦人名單，用固定用語。
     D. 一句話把兩種團體並列（「合作社理事主席跟協會理事長都可以領薪水嗎」）：兩種團體各自答得出來就分開回答，否則出選單。
     E. 問句的關鍵名詞（統一編號、把位子讓給別人）答案完全沒提到 → 選單。
     每個條件都用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  const INSCOPE5 = /協會|社團|團體|公會|合作社|社區發展|儲蓄互助社/;
  const OOS5 = [/神明會/, /補習班|安親班/, /幼兒園|托嬰中心/, /產銷班/, /(?<![佛道宗])教會(?!員)/, /(巡守隊|守望相助隊).{0,6}(隊長|幹部|改選|任期|怎麼選|誰選)/, /(?<!祭祀)公業/];
  const WHO5 = /找誰|找哪|打給誰|問誰|跟誰|向誰|誰處理|誰管|哪個單位|哪一個單位/;
  const SCOPEWHO5 = /協會|社團|團體|公會|合作社|社區|會務|立案|承辦|籌組|成立|志工|志願服務|理事|監事|會員|社員|社會處|小屏|你|妳|您|櫃檯|這裡|這邊|業務|窗口|聯絡|電話|分機|補助|申請|登記|章程|改選|會議|開會|解散/;
  const FILL5 = /請問|我想|我要|想要|有問題|有事情|有事|問題|事情|不知道|不曉得|到底|應該|可以|需要|處理|找誰|找哪位|找哪個單位|找哪裡|找哪|打給誰|要問誰|問誰|跟誰|向誰|誰處理|誰管|哪個單位|哪一個單位|怎麼辦|要|該|去|我|的|了|嗎|呢|啊|啦|[^一-鿿0-9a-z]/gi;
  const DETAILS5 = [
    { ask: /統編|統一編號/, ans: /統編|統一編號/ },
    { ask: /((每|一)年|年度|例行|定期|一年到頭).{0,14}(送|報|繳交|交).{0,10}(哪些|那些|什麼|甚麼|啥)|(哪些|什麼|甚麼).{0,8}((每|一)年|年度).{0,6}(送|報)/, ans: /每年|每一年|年度/ },
    { ask: /(理事長|理事|監事|位子|位置|職位|職務|席次).{0,10}(讓給|讓位|讓渡|轉讓|頂讓|傳給|傳位)|(讓給|讓渡|轉讓給|傳給).{0,8}(當|做|接)?.{0,4}(理事長|理事|監事)/, ans: /讓給|讓位|轉讓|讓渡|遞補|互選|辭職/ }
  ];
  const coversType5 = (n, at) => TYPES.find(x => x[0] === n)[1].test(n === '協會' ? at.replace(/社區發展協會|社區協會/g, '＿') : at);
  function understandingGuard5(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事|兩種團體/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify' || fs === 'compound') return null;
    if (a.category === '業務分流' || a.category === '打招呼') return null;
    const raw = NFK(q); if (raw.length < 5) return null;
    const at = answerText(a);
    /* C */
    if (a.title === '人民團體業務承辦人' && WHO5.test(raw) && !SCOPEWHO5.test(raw) && raw.replace(FILL5, '').length >= 2) return fixedPhrase2(q, []);
    if ((a.groups && a.groups.length) || a.category === '團體查詢') return null;
    /* A0. 個人福利（敬老禮金、假牙、輔具…）被別的答案搶走 → 改用既有的「個人福利不是這個櫃檯」分流 */
    try { if (typeof personalWelfare === 'function' && personalWelfare(raw)) { const r = verifiedRoundAnswer('低收入戶怎麼申請', {}); if (r && r.category === '業務分流') return Object.assign({}, r, { direct: true, guarded: true }); } } catch (e) {}
    /* A */
    if (/基金會|財團法人/.test(raw) && !/基金會|財團法人/.test(at) && !INSCOPE5.test(raw)) {
      try { const r = verifiedRoundAnswer('基金會怎麼成立', {}); if (r && r.category === '業務分流' && /基金會/.test(r.title || '')) return Object.assign({}, r, { direct: true, guarded: true }); } catch (e) {}
      return fixedPhrase2(q, []);
    }
    /* B */
    if (!INSCOPE5.test(raw)) for (const re of OOS5) if (re.test(raw) && !re.test(at)) return fixedPhrase2(q, []);
    /* D */
    const m = raw.match(/^(.{2,16}?)(?:跟|和|與|及|、|還有)(.{2,16}?)(?:也都|都|各自|各)(.{3,})$/);
    if (m && !COMPARE.test(raw) && !/改成|變成|轉型|轉成|改制|合併|加入|互相|彼此|之間/.test(raw)) {
      let x1 = m[1], x2 = m[2]; const t1 = typesOf(x1), t2 = typesOf(x2);
      if (t1.length === 1 && t2.length === 1 && t1[0] !== t2[0] && !(coversType5(t1[0], at) && coversType5(t2[0], at))) {
        const strip = (x, n) => x.replace(new RegExp(TYPES.find(y => y[0] === n)[1].source, 'g'), '').replace(/^的/, '');
        const r1 = strip(x1, t1[0]), r2 = strip(x2, t2[0]);
        if (!r1 && r2) x1 = x1 + '的' + r2; else if (r1 && !r2) x2 = x2 + '的' + r1;
        const A = resolvePart(x1 + m[3]), B = resolvePart(x2 + m[3]);
        const okA = A && coversType5(t1[0], textOf(A)) && (t1[0] === '合作社' || !/^合作社/.test(A.category || '')), okB = B && coversType5(t2[0], textOf(B)) && (t2[0] === '合作社' || !/^合作社/.test(B.category || ''));
        if (okA && okB && A.title !== B.title) {
          const seen = new Set(); const st = [A, B].flatMap(x => x.statutes || []).filter(x => { const k = x && x.title; if (!k || seen.has(k)) return false; seen.add(k); return true; });
          return { ...A, direct: true, guarded: true, category: A.category === B.category ? A.category : '人民團體會務說明', title: '您問了兩種團體，小屏分開回答',
            summary: '您一次問了兩種團體，規定不一樣，小屏分開回答。\n\n' + t1[0] + '：' + A.title + '\n' + A.summary + '\n\n' + t2[0] + '：' + B.title + '\n' + B.summary,
            statutes: st, refs: [A, B].flatMap(x => x.refs || []), notes: [...new Set([A, B].flatMap(x => x.notes || []))], steps: [], docs: [], laws: [], actions: A.actions || [], questionState: { focus: 'compound' } };
        }
        return menu2(q, [...similar(x1 + m[3], 3), ...similar(x2 + m[3], 3), ...similar(q, 4)], '您一次問了兩種團體，小屏怕只答到其中一種。');
      }
    }
    /* D2. 「…，公會的呢」後半只有另一種團體的名稱：走到這裡表示沒能把兩種團體分開回答 → 選單 */
    { const cl = String(q || '').normalize('NFKC').split(/[，,；;。？?！!]+/).map(x => NFK(x)).filter(x => x.length >= 2);
      const lastc = cl[cl.length - 1] || '', mm = lastc.match(/^(?:那麼|那)?(合作社|社區發展協會|社區協會|協會|公會|工會)的?呢$/);
      if (cl.length >= 2 && mm) { const t1 = typesOf(cl[0]), t2 = typesOf(mm[1]);
        if (t1.length === 1 && t2.length === 1 && t1[0] !== t2[0] && !/分別|分開|兩件事|兩種/.test(a.title) && !(coversType5(t1[0], NFK(a.title)) && coversType5(t2[0], NFK(a.title)))) return menu2(q, [...similar(cl[0], 3), ...similar(cl[0].replace(new RegExp(TYPES.find(y => y[0] === t1[0])[1].source), mm[1]), 3), ...similar(q, 4)], '您一次問了兩種團體，小屏怕只答到其中一種。'); } }
    /* E */
    for (const d of DETAILS5) if (d.ask.test(raw) && !d.ans.test(at)) return menu2(q, similar(q, 7), '');
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard5 = understandingGuard5;
  /* 第4輪（使用者決定）：「幫我寫一份企劃書／新聞稿」這類代寫請求，小屏答不出來時不只說難倒，改導到書表下載頁 */
  const WRITE4 = /^(請問|請|可以|能不能|可不可以|麻煩)?(幫我|幫忙|請幫我|幫我們|代我|替我)(們)?(寫|擬|草擬|做|打|生|產生|準備|弄)(一|個|份|篇|封|張|下)?|代寫|幫寫/;
  function ghostwrite4(q, a) {
    if (!a || !WRITE4.test(NFK(q))) return null;
    if (!(a.unanswered || /難倒小屏|查無符合資料/.test(a.title || ''))) return null; // 已經有對題答案的照原本回答
    return { direct: true, guarded: true, category: '服務說明', title: '小屏沒辦法代寫文件，常用書表可以到「書表下載」頁下載',
      summary: '小屏是回答人民團體會務問題的櫃檯，沒辦法幫您代寫企劃書、新聞稿、信件這類文件。\n\n縣府提供的常用書表（成立、改選、會員大會、解散等）放在本站的「書表下載」頁，可以下載後自己填寫；找不到合適的書表，或不確定該用哪一份，請電洽承辦人員，縣府總機 08-7320415。',
      statutes: [], notes: [], steps: [], docs: [], laws: [], actions: [{ label: '到書表下載', view: 'forms', sub: '' }, { label: '聯絡承辦', view: 'contact', sub: '' }] };
  }
  if (typeof window !== 'undefined') window.__ghostwrite4 = ghostwrite4;
  /* ── 理解把關第6輪（2026-11-27）──
     一句問兩件事，其中一件答案完全沒談到、也找不到已核對的答案（「…可以兼任村長嗎，還有可以兼巡守隊隊長嗎」「會員大會多久開一次？會場可以放鞭炮嗎？」）
     → 保留原答案，開頭明講另一件小屏沒有把握，不讓民眾以為兩件都答了。
     用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會動到已答對的題目。 */
  const gramsOf6 = part => { const segs = NFK(part).replace(/[^一-鿿0-9a-z]/gi, '').split(new RegExp(STOP3.source, 'g')).filter(x => x && x.length >= 2); const g = []; for (const sg of segs) for (let k = 0; k < sg.length - 1; k++) g.push(sg.slice(k, k + 2)); return g; };
  function understandingGuard6(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事|兩種團體/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify' || fs === 'compound') return null;
    if (a.category === '業務分流' || a.category === '打招呼' || a.category === '團體查詢' || a.category === '聯絡承辦' || (a.groups && a.groups.length)) return null;
    if (/^您一次問了兩件事/.test(a.summary || '') || (a.steps && a.steps.length)) return null;
    const at = answerText(a);
    const parts = splitAsk(q);
    if (!parts || parts.length !== 2 || parts[0].bg || parts[1].bg) return null;
    if (/^(如果|假如|要是|萬一|假設|雖然)/.test(parts[0].ask)) return null;
    const g = parts.map(x => gramsOf6(x.ask)), r = g.map(x => x.length ? x.filter(y => at.includes(y)).length / x.length : 1);
    const low = i => (r[i] < 0.25 && g[i].length >= 4) || (r[i] === 0 && g[i].length >= 2);
    const lostI = r[0] >= 0.6 && low(1) ? 1 : (r[1] >= 0.6 && low(0) ? 0 : -1);
    if (lostI < 0) return null;
    const lost = parts[lostI].ask, shown = parts[1 - lostI].ask;
    if (/^(這樣|那這樣|這樣子)?(可以|行|合法|有效|算數|對)(嗎|呢)?$/.test(lost) || /^.{0,6}(也|一樣|同樣)/.test(lost)) return null;
    const role = (shown.match(/理事長|常務理事|常務監事|理事|監事|總幹事|會員代表|會員|社員/) || [''])[0];
    if (resolvePart(lost) || (role && !lost.includes(role) && resolvePart(role + lost))) return null; // 另一半其實有已核對的答案，交給分開回答的邏輯，不在這裡說沒有把握
    return { ...a, guarded: true, summary: '您一次問了兩件事。下面先回答「' + shown + '」的部分；「' + lost + '」這一部分小屏沒有把握，怕答錯，建議您電洽承辦人員，或把這一部分單獨再問一次。\n\n' + (a.summary || '') };
  }
  if (typeof window !== 'undefined') window.__understandingGuard6 = understandingGuard6;
  /* ── 理解把關第7輪（2026-11-27）──
     A. 「合作社的社員可以同時是協會的會員嗎」：跨兩種團體的「同時是／同時加入」，答案只談一種（或方向相反：協會加入合作社）→ 選單。
     （「如果理事會開不成，但是要報預算，可以先送嗎」改修在第3輪的條件句把關：最後一句太短時連同前一句比對。）
     C. 「協會成立三年了一直沒開大會」：已經成立的協會，答案卻是怎麼成立 → 選單。
     D. 「會員大會可以收費嗎，入場要繳錢」：問開會收費，答案沒談到開會 → 選單。
     E. 「我要申請房屋稅減免」：個人的稅，問句沒有提到任何團體 → 固定用語（不拿協會免稅的答案硬答）。
     用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  const TAX7 = /房屋稅|地價稅|牌照稅|綜所稅|綜合所得稅|所得稅|遺產稅|贈與稅|土地增值稅|契稅|燃料費/;
  function understandingGuard7(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事|兩種團體/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify' || fs === 'compound') return null;
    if (a.category === '業務分流' || a.category === '打招呼') return null;
    const raw = NFK(q); if (raw.length < 5) return null;
    const at = answerText(a), tt = NFK(a.title);
    const cross7 = /(同時|也)(是|當|加入|參加|成為|具有)/.test(raw) && /合作社|社員/.test(raw) && /協會|社團/.test(raw);
    if ((a.category === '團體查詢' || (a.groups && a.groups.length)) && !cross7) return null; // 第7輪：「我是合作社社員也可以同時是協會會員嗎」原本被當成名冊查詢
    /* E */
    if (TAX7.test(raw) && /^(我|我家|我的|我們家|自己|個人|本人|我爸|我媽)/.test(raw) && !/協會|社團|團體|公會|合作社|社區|會址|會館|本會|會所|理事|監事|會員|社員|捐/.test(raw)) return fixedPhrase2(q, []);
    /* A */
    if (cross7 && !(/合作社|社員/.test(tt) && /協會|社團/.test(tt.replace(/協會或法人可以加入合作社/, '')) && /同時|兩/.test(tt)))
      return menu2(q, [...similar(q, 6), '一個人可以同時參加兩個協會嗎'], '您問到兩種團體的身分，小屏怕答錯方向。');
    /* C */
    if (/成立(?:了|已經)?(?:[0-9一二三四五六七八九十兩幾好多]+)(?:年|個月)/.test(raw) && /怎麼成立|成立.{0,4}(流程|步驟|程序)|籌組/.test(tt) && !/怎麼成立|如何成立|要怎麼申請成立/.test(raw))
      return menu2(q, [...similar(raw.replace(/成立(?:了|已經)?(?:[0-9一二三四五六七八九十兩幾好多]+)(?:年|個月)(?:了)?/, ''), 6), '協會沒有依規定召開會員大會怎麼辦', '會員大會怎麼開'], '');
    /* D */
    if (/(會員大會|大會|開會|會議)/.test(raw) && /(收費|收錢|繳錢|交錢|付錢|入場費|報名費|門票|入場)/.test(raw) && !/會費|出席費|車馬費|便當|餐費|場地費|租金|講師費/.test(raw) && !/大會|開會|會議/.test(tt))
      return menu2(q, similar(q, 7), '');
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard7 = understandingGuard7;
  /* ── 理解把關第8輪（2026-11-27）──
     A. 「會員欠繳會費兩年，但他是候補理事，可以遞補嗎」：問的是欠費（停權）的人能不能遞補、出席、投票，答案完全沒談會費或停權 → 選單。
     B. 「新理事長想換一家銀行，存摺要怎麼處理」：問換往來銀行，答案只談原銀行的印鑑變更 → 選單。
     C. 「合作社社員大會跟協會會員大會可以同一天一起開嗎」：同一句同時講合作社和另一種團體，答案兩種都沒談到 → 選單。
     D. 「會員大會主席可以不讓會員發言嗎」：問開會發言的權利，答案沒談到發言 → 選單。
     E. 「講師費可以給多少，要扣稅嗎」：問金額標準，答案只談扣稅、沒有金額標準 → 保留答案，開頭明講金額這部分沒把握。
     用 scripts/site-smoke.mjs 全部 CHECKS 驗證過不會擋掉已答對的題目。 */
  function understandingGuard8(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事|兩種團體/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify' || fs === 'compound') return null;
    if (a.category === '業務分流' || a.category === '打招呼' || a.category === '團體查詢' || (a.groups && a.groups.length)) return null;
    const raw = NFK(q); if (raw.length < 6) return null;
    const at = answerText(a);
    /* A */
    if (/欠繳|欠費|欠會費|沒繳會費|未繳會費|沒有繳會費|會費沒繳|會費沒有繳|會費欠|停權/.test(raw) && /候補|遞補|理事|監事|投票|選舉權|被選舉|參選|出席|表決/.test(raw) && !((/會費|欠繳|欠費/.test(raw) ? /會費|欠繳|欠費/ : /停權/).test(at)))
      return menu2(q, ['沒繳會費的會員可以投票嗎', '欠繳會費的人可以參選理事嗎', '被停權的會員可以遞補理事嗎', ...similar(q, 5)], '');
    /* B */
    if (/(換|改|轉)(到|成|去)?(一家|別家|另一家|另外一家|其他|新的|別的)(往來)?銀行|(換|更換|改換)(往來)?銀行|銀行(要換|想換|換掉|換別家)/.test(raw) && !/印鑑|印章|負責人|簽名|簽章/.test(raw) && !/合作社/.test(raw) && !/開戶|新戶|結清|銷戶|換銀行|更換銀行|轉存/.test(at))
      return menu2(q, ['協會怎麼開銀行帳戶', ...similar(q, 6)], '');
    /* C */
    if (/合作社/.test(raw) && /(協會|公會|工會|社團)/.test(raw.replace(/合作社/g, '')) && !/合作社/.test(at) && !/(協會|公會|社團)/.test(NFK(a.title)))
      return menu2(q, similar(q, 7), '您問到兩種團體，小屏怕答錯方向。');
    /* D */
    if (/發言|講話|發表意見|表達意見|提問|麥克風/.test(raw) && /(不讓|不准|禁止|限制|打斷|不給|拒絕|關掉|不能|不要講|別講|不要說|不要再講|閉嘴|停止)/.test(raw) && !/發言|講話|意見/.test(at))
      return menu2(q, similar(q, 7), '');
    /* E */
    const fee = raw.match(/(講師費|鐘點費|出席費|車馬費|交通費|誤餐費|便當費|餐費|稿費|主持費|顧問費)(?:可以|要|能|最多|一次|一小時|一節)?.{0,8}(給多少|多少錢|多少|上限|最多|標準|行情)/);
    if (fee && !new RegExp(fee[1] + '.{0,20}(標準|上限|最高|以下|每(小時|節|次))').test(at) && !/金額.{0,6}(看|依|由|沒有規定)|沒有(規定|訂).{0,8}(金額|多少)|固定金額/.test(at)) {
      if (!new RegExp(/講師費|鐘點費/.test(fee[1]) ? '講師費|鐘點費' : fee[1]).test(at)) return menu2(q, similar(q, 7), '');
      return { ...a, guarded: true, summary: '您問的「' + fee[1] + '可以給多少」，本站查不到已核對的金額標準，建議您電洽承辦人員；下面先回答其他部分。\n\n' + (a.summary || '') };
    }
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard8 = understandingGuard8;
  /* ── 理解把關 2026-11-28 第1輪（接在第8輪之後）──
     A. 問「名稱可以跟別的協會一樣嗎」，答案沒談到名稱相同（例如被「改名程序」搶答）→ 選單，第一項是名稱限制。
     B. 駕照、行照、監理站、罰單、牌照稅等個人監理業務，答案沒談到 → 固定用語（不要配到「車子登記到協會」）。
     C. 東西壞了「誰要修、找誰修、維修費誰出」，答案沒談維修 → 選單（不要配到「財產報廢」）。 */
  function understandingGuard9(q, a) {
    if (!a || !a.title || a.unanswered || a.guarded) return null;
    if (/您是不是要問|難倒小屏|想先確認|暫時無法回覆|兩件事|兩種團體/.test(a.title)) return null;
    const fs = a.questionState && a.questionState.focus;
    if (fs === 'guard-menu' || fs === 'keyword-menu' || fs === 'clarify' || fs === 'compound') return null;
    if (a.category === '業務分流' || a.category === '打招呼' || a.category === '團體查詢' || (a.groups && a.groups.length)) return null;
    const raw = NFK(q); if (raw.length < 5) return null;
    const at = answerText(a);
    /* A */
    if (/(名稱|名字|會名|名號|同名|撞名|重名)/.test(raw) && (/(跟|和|與|同)(別的|其他|別人|別家|另一個|已經有的|現有的?|人家的?).{0,10}(一樣|相同|重複|同名)|同名|撞名|重名|名稱重複|名字重複/.test(raw)) && !/相同|同名|重複|一樣/.test(at))
      return menu2(q, ['協會的名稱可以跟別的協會一樣嗎', '協會想換名字', ...similar(q, 5)], '');
    /* B */
    if (/(駕照|考照|路考|行照|監理站|監理所|監理處|罰單|牌照稅|燃料稅|換照|驗車|汽車牌照|機車牌照)/.test(raw) && !/(駕照|行照|罰單|考照|牌照)/.test(at)) // 「車子要依監理機關規定」這種順帶一提不算有答到
      return fixedPhrase2(q, []);
    /* C */
    if (/(壞了|壞掉|故障|不能用|不會動|不動了|漏水|破掉|損壞)/.test(raw) && /(誰要?修|誰來修|誰負責修?|找誰修|誰出錢|修理費|維修費|修繕費|誰付|誰負擔)/.test(raw) && !/(維修|修理|修繕)/.test(at))
      return menu2(q, similar(q, 7), '');
    return null;
  }
  if (typeof window !== 'undefined') window.__understandingGuard9 = understandingGuard9;
  function guard(q, a) {
    try { const w4 = ghostwrite4(q, a); if (w4) return w4; } catch (e) {}
    try { const c = compareGuard(q, a) || compareTopic(q, a) || compound(q, a); if (c) return c; } catch (e) {}
    try { const u = understandingGuard(q, a); if (u) return u; } catch (e) {}
    try { const u3 = understandingGuard3(q, a); if (u3) return u3; } catch (e) {}
    try { const u4 = understandingGuard5(q, a); if (u4) return u4; } catch (e) {}
    try { const u7 = understandingGuard7(q, a); if (u7) return u7; } catch (e) {}
    try { const u8 = understandingGuard8(q, a); if (u8) return u8; } catch (e) {}
    try { const u9 = understandingGuard9(q, a); if (u9) return u9; } catch (e) {}
    try { const u6 = understandingGuard6(q, a); if (u6) return u6; } catch (e) {}
    try {
      if (!a || a.direct || a.questionState || a.unanswered || !a.title) return null;
      if ((typeof exactArticleAnswer === 'function' && exactArticleAnswer(q)) || (typeof focusedQuestionAnswer === 'function' && focusedQuestionAnswer(q))) return null; // 會被其他已核對答案取代
      if (typeof KB === 'undefined' || !KB.some(e => e.title === a.title)) return null; // 只把關內建流程型答案
      if (!(a.steps && a.steps.length >= 3)) return null;
      const t = NFK(q);
      if (t.length < 8 || !SPECIFIC.test(t) || HOWTO.test(t)) return null;
      let rel = [a.title, ...similar(q, 6).filter(x => x !== a.title)].slice(0, 7);
      if (rel.length < 2) rel = [a.title, ...similar(q, 3, 0.15).filter(x => x !== a.title)].slice(0, 4); // 找不到夠像的問題時，也不硬給流程答案：至少列出這則流程讓民眾自己選
      return { direct: true, category: '請選擇問題', title: '您是不是要問以下相關的問題？',
        summary: '小屏不確定有沒有聽懂您的問題，怕直接回答會答錯。請點選下面最接近您想問的問題；都不是的話，請換個說法再問一次，或電洽承辦人員。',
        related: rel, steps: [], docs: [], laws: [], notes: [], actions: [], questionState: { focus: 'guard-menu' }, guarded: true };
    } catch (e) { return null; }
  }
  const ENDPOINT = (document.querySelector('meta[name="unanswered-endpoint"]') || {}).content || '';
  function feedbackBar(q, a) {
    const board = document.getElementById('board'); if (!board || !a || a.unanswered) return;
    if (/您是不是要問|難倒小屏/.test(a.title || '')) return;
    const old = board.querySelector('.fb-bar'); if (old) old.remove();
    const bar = document.createElement('div');
    bar.className = 'fb-bar';
    bar.style.cssText = 'margin-top:18px;padding-top:12px;border-top:1px dashed rgba(128,128,128,.35);font-size:.92em;display:flex;gap:10px;align-items:center;flex-wrap:wrap';
    bar.innerHTML = '<span>這個答案有沒有幫到您？</span><button type="button" class="fb-yes" style="padding:6px 14px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer">有幫到</button><button type="button" class="fb-no" style="padding:6px 14px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer">沒有幫到我</button>';
    const yes = bar.querySelector('.fb-yes'), no = bar.querySelector('.fb-no');
    const status = document.createElement('span');
    status.setAttribute('role', 'status');
    bar.appendChild(status);
    const done = msg => { bar.textContent = ''; status.textContent = msg; bar.appendChild(status); };
    yes.onclick = () => done('謝謝您的回饋！');
    no.onclick = async () => {
      if (no.disabled) return;
      yes.disabled = no.disabled = true;
      status.textContent = '正在送出回報…';
      const key = 'fb-confirmed';
      let sent = [];
      try {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(cached)) sent = cached;
        } catch (e) {}
        if (!ENDPOINT || typeof scrubPII !== 'function') throw new Error('feedback unavailable');
        const text = ('〔答錯回報〕' + scrubPII(q) + '｜小屏答：' + scrubPII(a.title).slice(0, 60)).slice(0, 300);
        if (sent.includes(text)) {
          done('這則回報已送出，不用重複送。');
          return;
        }
        const res = await fetch(ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, page: location.pathname, at: new Date().toISOString() }), keepalive: true
        });
        if (!res.ok) throw new Error('feedback request failed');
        const ack = await res.json();
        if (ack?.ok !== true || !Number.isInteger(ack.issue) || ack.issue < 1) throw new Error('feedback not acknowledged');
        try { localStorage.setItem(key, JSON.stringify([...sent, text].slice(-100))); } catch (e) {}
        done('謝謝，回報已送出。急件請直接電洽承辦人員。');
      } catch (e) {
        status.textContent = '未能確認回報已送出，請稍後再試。急件請直接電洽承辦人員。';
        yes.disabled = no.disabled = false;
      }
    };
    board.appendChild(bar);
  }
  if (typeof renderAnswer === 'function') {
    const prev = renderAnswer;
    renderAnswer = function (q, a) {
      const corrected = typeof window !== 'undefined' && typeof window.verifiedLegacyPoliticalDonation === 'function' ? window.verifiedLegacyPoliticalDonation(q, a) : null;
      if (corrected) a = corrected; // replace the one obsolete citation before applying normal guard checks
      const g = guard(q, a);
      const out = prev(q, g || a);
      try { feedbackBar(q, g || a); } catch (e) {}
      return out;
    };
  }
})();
