#!/usr/bin/env node
/**
 * NLU 引擎測試框架
 * 驗證自然語言理解能力
 */

// 簡化版 NLU 引擎用於測試
class SimpleNLU {
  preprocess(q) {
    return String(q || '').trim().replace(/\s+/g, '').replace(/[呢嗎啦喔]/g, '');
  }

  identifyIntent(question) {
    const q = this.preprocess(question);
    
    if (/(開會|成會|出席|幾人|多少人)/.test(q)) {
      return { intent: 'quorum-check', confidence: 0.9 };
    }
    if (/(任期|幾年|多久|做幾年)/.test(q) && !/(改選|選舉)/.test(q)) {
      return { intent: 'term-length', confidence: 0.85 };
    }
    if (/(改選|換屆|選舉|何時|期限)/.test(q)) {
      return { intent: 'reelection-window', confidence: 0.8 };
    }
    if (/(通知|寄發|提前|幾天)/.test(q)) {
      return { intent: 'notice-deadline', confidence: 0.75 };
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

const nlu = new SimpleNLU();
const assert = require('assert');

console.log('🧪 NLU 引擎測試\n');
console.log('=' . repeat(80));

let passed = 0;
let failed = 0;

// 測試集合：各種表述同一個問題
const testCases = [
  {
    category: '開會人數要求 (同義詞變化)',
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
    category: '任期長度查詢 (多種說法)',
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
    category: '改選期限 (時間相關)',
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
    category: '通知期限 (提前通知)',
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

// 執行測試
for (const testGroup of testCases) {
  console.log(`\n📋 ${testGroup.category}`);
  console.log('─' . repeat(80));
  
  for (const question of testGroup.questions) {
    const intent = nlu.identifyIntent(question);
    const entities = nlu.extractEntities(question);
    const ambiguities = nlu.detectAmbiguity(question);
    
    const pass = intent.intent === testGroup.expectedIntent;
    const icon = pass ? '✅' : '❌';
    
    console.log(`${icon} "${question}"`);
    console.log(`   意圖: ${intent.intent} (信心: ${(intent.confidence * 100).toFixed(0)}%)`);
    
    if (Object.keys(entities).length > 0) {
      console.log(`   實體: ${JSON.stringify(entities)}`);
    }
    
    if (ambiguities.length > 0) {
      console.log(`   ⚠️  警告: ${ambiguities.map(a => a.word).join(', ')}`);
    }
    
    if (pass) {
      passed++;
    } else {
      failed++;
    }
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

// 實體提取測試
console.log('=' . repeat(80));
console.log('\n🔍 實體提取測試\n');

const entityTests = [
  { input: '理事9人，要幾人出席', expected: { number: '9人' } },
  { input: '監事5人，成會要幾人', expected: { number: '5人' } },
  { input: '協會理事會要幾人開會', expected: { organization: '協會' } },
  { input: '合作社社員大會幾人開會', expected: { organization: '合作社' } },
];

let entityPassed = 0;
for (const test of entityTests) {
  const entities = nlu.extractEntities(test.input);
  let pass = true;
  
  for (const [key, expectedValue] of Object.entries(test.expected)) {
    if (entities[key] !== expectedValue) {
      pass = false;
      break;
    }
  }
  
  console.log(`${pass ? '✅' : '❌'} "${test.input}"`);
  console.log(`   提取: ${JSON.stringify(entities)}\n`);
  
  if (pass) entityPassed++;
}

console.log('=' . repeat(80));
console.log(`\n✨ NLU 測試摘要\n`);
console.log(`意圖辨識: ${passed}/${total} 通過 (${percentage}%)`);
console.log(`實體提取: ${entityPassed}/${entityTests.length} 通過 (${(entityPassed/entityTests.length*100).toFixed(1)}%)`);
console.log(`總體通過率: ${((passed + entityPassed) / (total + entityTests.length) * 100).toFixed(1)}%\n`);

if (failed === 0 && entityPassed === entityTests.length) {
  console.log('🎉 所有 NLU 測試通過！\n');
  process.exit(0);
} else {
  console.log('⚠️  部分測試失敗，需要調整 NLU 引擎\n');
  process.exit(1);
}
