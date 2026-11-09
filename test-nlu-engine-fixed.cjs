#!/usr/bin/env node
/**
 * NLU 引擎測試框架 (改進版)
 */

class ImprovedNLU {
  preprocess(q) {
    return String(q || '').trim().replace(/\s+/g, '').replace(/[呢嗎啦喔]/g, '');
  }

  identifyIntent(question) {
    const q = this.preprocess(question);
    
    // 更精確的意圖判斷邏輯
    // 通知期限：明確有「通知」、「寄」、「提前」等詞彙，且沒有「多少人」
    if (/(通知|寄|提前)/.test(q) && !(/(人|出席|幾個)/.test(q))) {
      return { intent: 'notice-deadline', confidence: 0.85 };
    }
    
    // 任期長度：「多久」「幾年」且沒有「改選」
    if (/((任期|做|最長).*?(幾年|多久))/.test(q) && !/(改選|選舉)/.test(q)) {
      return { intent: 'term-length', confidence: 0.9 };
    }
    
    // 開會人數：明確有「開會」「出席」「成會」「幾人」
    if (/(開會|成會|出席|幾人|多少人)/.test(q)) {
      return { intent: 'quorum-check', confidence: 0.9 };
    }
    
    // 改選期限：「改選」且「何時」「期限」「多久」
    if (/(改選|換屆|選舉)/.test(q) && /(何時|期限|多久|什麼時候)/.test(q)) {
      return { intent: 'reelection-window', confidence: 0.85 };
    }
    
    return { intent: 'unknown', confidence: 0 };
  }

  extractEntities(question) {
    const q = this.preprocess(question);
    const entities = {};
    
    const numberMatch = q.match(/(\d+|[一二三四五六七八九十]+)\s*人/);
    if (numberMatch) entities.number = numberMatch[0];
    
    const orgMatch = q.match(/(?:協會|合作社|工會|理事會|監事會|會員大會|社員大會)/);
    if (orgMatch) entities.organization = orgMatch[0];
    
    return entities;
  }

  detectAmbiguity(question) {
    const q = this.preprocess(question);
    const ambiguities = [];
    
    if (q.includes('可以')) ambiguities.push({ word: '可以', type: 'modal' });
    if (q.includes('剩')) ambiguities.push({ word: '剩', type: 'temporal' });
    
    return ambiguities;
  }
}

const nlu = new ImprovedNLU();
const assert = require('assert');

console.log('🧪 改進版 NLU 引擎測試\n');
console.log('=' . repeat(80));

let passed = 0;
let failed = 0;

const testCases = [
  {
    category: '開會人數要求',
    questions: [
      '理事會要幾人出席才能開會',
      '理事會要幾個人出席才能成會',
      '理事9人，要幾人到場才能開會',
      '理事會，幾人出席就可以開',
      '有9個理事，多少人出席可以開會',
    ],
    expectedIntent: 'quorum-check'
  },
  {
    category: '任期長度查詢',
    questions: [
      '理監事任期幾年',
      '理事做幾年就要改選',
      '監事的任期多久',
      '一屆理事最長做多久',
      '任期是幾年',
    ],
    expectedIntent: 'term-length'
  },
  {
    category: '改選期限',
    questions: [
      '什麼時候要改選',
      '改選期限是何時',
      '多久要改選一次',
      '改選要在屆滿前多久辦',
      '改選的窗口是多久',
    ],
    expectedIntent: 'reelection-window'
  },
  {
    category: '通知期限',
    questions: [
      '開會前要提前幾天通知',
      '會議通知要提前幾天寄',
      '寄開會通知要提前幾天',
      '多久前要寄開會通知',
      '最少要提前幾天通知',
    ],
    expectedIntent: 'notice-deadline'
  },
];

for (const testGroup of testCases) {
  console.log(`\n📋 ${testGroup.category}`);
  console.log('─' . repeat(80));
  
  for (const question of testGroup.questions) {
    const intent = nlu.identifyIntent(question);
    const pass = intent.intent === testGroup.expectedIntent;
    const icon = pass ? '✅' : '❌';
    
    console.log(`${icon} "${question}"`);
    console.log(`   → ${intent.intent} (${(intent.confidence * 100).toFixed(0)}%)`);
    
    if (pass) passed++;
    else failed++;
  }
}

console.log('\n' + '=' . repeat(80));
console.log('\n📊 測試結果');
console.log('─' . repeat(80));

const total = passed + failed;
const percentage = ((passed / total) * 100).toFixed(1);

console.log(`✅ 通過: ${passed}/${total}`);
console.log(`❌ 失敗: ${failed}/${total}`);
console.log(`🎯 成功率: ${percentage}%\n`);

if (failed === 0) {
  console.log('🎉 所有 NLU 改進測試通過！\n');
  process.exit(0);
} else {
  console.log('⚠️  還需要調整\n');
  process.exit(1);
}
