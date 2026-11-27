# 離線實測：用 bge-m3 語意向量判斷「問題」與「小屏給的答案標題」是否對得上。
# 只用固定測試題（verify/sem-eval-pairs.json），不含民眾提問，不需要任何金鑰。
import json, re, random, numpy as np
from sentence_transformers import SentenceTransformer
d = json.load(open('verify/sem-eval-pairs.json'))
pos, real = d['pos'], d['real_neg']
random.seed(7)
def grams(s):
    s = re.sub(r'[^一-鿿0-9a-zA-Z]', '', s); return {s[i:i+2] for i in range(len(s)-1)}
titles = sorted({p['t'] for p in pos}); tg = {t: grams(t) for t in titles}
# 困難負例：用字最像、但不是正確答案的標題；隨機負例：任意其他標題
hard, rnd = [], []
for p in pos:
    qg = grams(p['q']); best, bs = None, 0
    for t in titles:
        if t == p['t']: continue
        s = len(qg & tg[t]) / ((len(qg) * len(tg[t])) ** .5 or 1)
        if s > bs: best, bs = t, s
    if best and bs >= 0.25: hard.append((p['q'], best))
    rnd.append((p['q'], random.choice([t for t in titles if t != p['t']])))
m = SentenceTransformer('BAAI/bge-m3')
texts = sorted({p['q'] for p in pos} | set(titles) | {a for a, b in real} | {b for a, b in real})
E_ = dict(zip(texts, m.encode(texts, batch_size=32, normalize_embeddings=True, show_progress_bar=False)))
sim = lambda a, b: float(np.dot(E_[a], E_[b]))
P = np.array([sim(p['q'], p['t']) for p in pos]); H = np.array([sim(a, b) for a, b in hard]); R = np.array([sim(a, b) for a, b in rnd])
RN = [(a, b, sim(a, b)) for a, b in real]
out = ['# 語意把關離線實測（bge-m3）', '', f'- 已知答對的配對：{len(P)} 組', f'- 困難錯配（用字很像但不是正確答案）：{len(H)} 組', f'- 隨機錯配：{len(R)} 組', f'- 實際發生過的錯配（使用者截圖）：{len(RN)} 組', '',
       '| 門檻 | 誤擋正確答案 | 擋下困難錯配 | 擋下隨機錯配 | 擋下實際錯配 |', '|---|---|---|---|---|']
for th in [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65]:
    out.append(f'| {th} | {(P<th).mean()*100:.1f}% | {(H<th).mean()*100:.1f}% | {(R<th).mean()*100:.1f}% | {sum(1 for *_, s in RN if s<th)}/{len(RN)} |')
out += ['', '## 實際發生過的錯配，相似度', ''] + [f'- {s:.2f}｜{a} → {b}' for a, b, s in sorted(RN, key=lambda x: x[2])]
idx = np.argsort(P)[:40]
out += ['', '## 正確答案中相似度最低的 40 組（最容易被誤擋）', ''] + [f'- {P[i]:.2f}｜{pos[i]["q"]} → {pos[i]["t"]}' for i in idx]
hi = sorted(zip(H, hard), key=lambda x: -x[0])[:30]
out += ['', '## 困難錯配中相似度最高的 30 組（最難擋下）', ''] + [f'- {s:.2f}｜{a} → {b}' for s, (a, b) in hi]
txt = '\n'.join(out); open('sem-eval-result.md', 'w').write(txt); print(txt)
import os
if os.environ.get('GITHUB_STEP_SUMMARY'): open(os.environ['GITHUB_STEP_SUMMARY'], 'a').write(txt + '\n')
