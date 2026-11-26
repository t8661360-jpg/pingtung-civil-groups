const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(new URL('./answer-guard.js', 'file://' + __filename), 'utf8');
function node() {
  return {
    children: [], style: {}, disabled: false, _text: '',
    appendChild(child) { this.children.push(child); },
    setAttribute() {},
    set textContent(value) { this._text = value; this.children = []; },
    get textContent() { return this._text + this.children.map(x => x.textContent).join(''); }
  };
}
async function run() {
  const board = node(), clicks = [], sets = [];
  board.querySelector = () => null;
  const buttons = {'.fb-yes': {}, '.fb-no': {}};
  let response;
  const app = vm.createContext({
    document: {
      querySelector: () => ({content:'https://example.invalid/'}),
      getElementById: () => board,
      createElement: tag => Object.assign(node(), tag === 'div' ? {querySelector:k=>buttons[k]} : {})
    },
    location: { pathname:'/pingtung-civil-groups/' },
    scrubPII: s => s.replace('替換測試字串','[已遮蔽]'),
    renderAnswer: () => {},
    localStorage: { getItem: () => sets.at(-1), setItem: (_,v) => sets.push(v) },
    fetch: async (_, opts) => {
      clicks.push(JSON.parse(opts.body).q);
      if (response instanceof Error) throw response;
      return response;
    }
  });
  vm.runInContext(source, app);
  const q = '測試題目 替換測試字串';
  const ans = {direct:true,title:'測試答案 替換測試字串'};
  app.renderAnswer(q, ans);
  for (const result of [new Error('offline'), {ok:false}, {ok:true,json:async()=>({ok:true})}]) {
    response = result;
    await buttons['.fb-no'].onclick();
    assert.match(board.textContent,/未能確認/);
    assert.equal(buttons['.fb-no'].disabled,false);
    assert.equal(sets.length,0);
  }
  response = {ok:true,json:async()=>({ok:true,issue:42})};
  await buttons['.fb-no'].onclick();
  assert.match(board.textContent,/回報已送出/);
  assert.equal(sets.length,1);
  assert.equal(clicks.length,4);
  assert(clicks.every(x=>x==='〔答錯回報〕測試題目 [已遮蔽]｜小屏答：測試答案 [已遮蔽]'));
  // Re-render the same question to confirm only acknowledged reports are deduplicated.
  app.renderAnswer(q, ans);
  buttons['.fb-no'].disabled = false; // fresh real DOM buttons are initially enabled
  await buttons['.fb-no'].onclick();
  assert.match(board.textContent,/不用重複送/);
  assert.equal(clicks.length,4);
}
run().then(()=>console.log('answer-guard feedback ok')).catch(e=>{console.error(e);process.exitCode=1;});
