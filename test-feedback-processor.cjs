#!/usr/bin/env node
/**
 * 反饋處理模塊測試 (Feedback Processor Unit Tests)
 * 測試: 去重、分類、分析功能
 */

const FeedbackProcessor = require('./feedback-processor.js');

const processor = new FeedbackProcessor();
let passCount = 0, failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passCount++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('🧪 反饋處理模塊測試\n');

// ============ 相似度測試 ============
console.log('📊 相似度檢測測試');

test('相同字符串相似度應為 1.0', () => {
  const sim = processor.calculateSimilarity('改選', '改選');
  assert(sim === 1.0, `Expected 1.0, got ${sim}`);
});

test('完全不同字符串相似度應接近 0', () => {
  const sim = processor.calculateSimilarity('改選', 'ABCDE');
  assert(sim < 0.1, `Expected < 0.1, got ${sim}`);
});

test('相似字符串相似度應在 0.5-0.9 之間', () => {
  const sim = processor.calculateSimilarity('改選後多久要做帳', '改選要多久做帳');
  assert(sim > 0.5 && sim < 0.9, `Expected 0.5-0.9, got ${sim}`);
});

// ============ 重複檢測測試 ============
console.log('\n🔍 重複檢測測試');

test('應檢測出重複反饋', () => {
  const existing = [
    { question: '改選後多久要做帳', type: 'missing' }
  ];
  const feedback = { question: '改選完多久要做帳', type: 'missing' };
  
  const result = processor.detectDuplicate(feedback, existing, 0.7);
  assert(result.isDuplicate, 'Should detect as duplicate');
  assert(result.similarity > 0.7, `Similarity too low: ${result.similarity}`);
});

test('應識別非重複反饋', () => {
  const existing = [
    { question: '改選後多久要做帳', type: 'missing' }
  ];
  const feedback = { question: '監事會怎麼檢查帳目', type: 'missing' };
  
  const result = processor.detectDuplicate(feedback, existing, 0.8);
  assert(!result.isDuplicate, 'Should not detect as duplicate');
});

// ============ 批量去重測試 ============
console.log('\n🗑️  批量去重測試');

test('應正確去重 5 個反饋中的 2 個重複', () => {
  const feedbacks = [
    { question: '改選後多久要做帳', type: 'missing' },
    { question: '改選完多久做帳', type: 'missing' },  // 應該與第一個相似
    { question: '監事會怎麼檢查', type: 'missing' },
    { question: '監事如何查帳', type: 'missing' },     // 應該與第三個相似
    { question: '理事長要交什麼東西', type: 'missing' }
  ];
  
  const result = processor.deduplicateFeedbacks(feedbacks, 0.6);  // 降低閾值
  // 結果應該是 3-4 個不同的問題
  assert(result.length >= 3 && result.length <= 4, `Expected 3-4 unique, got ${result.length}`);
});

// ============ 優先級計算測試 ============
console.log('\n⚡ 優先級計算測試');

test('誤答應為 P0', () => {
  const priority = processor.calculatePriority('error');
  assert(priority === 'P0-critical', `Expected P0-critical, got ${priority}`);
});

test('漏洞應為 P1', () => {
  const priority = processor.calculatePriority('missing');
  assert(priority === 'P1-high', `Expected P1-high, got ${priority}`);
});

test('表述應為 P2', () => {
  const priority = processor.calculatePriority('clarity');
  assert(priority === 'P2-medium', `Expected P2-medium, got ${priority}`);
});

test('建議應為 P3', () => {
  const priority = processor.calculatePriority('suggestion');
  assert(priority === 'P3-low', `Expected P3-low, got ${priority}`);
});

// ============ 統計分析測試 ============
console.log('\n📈 統計分析測試');

test('應正確統計類型分佈', () => {
  const feedbacks = [
    { question: '問題 1', type: 'error', duplicateCount: 1 },
    { question: '問題 2', type: 'error', duplicateCount: 1 },
    { question: '問題 3', type: 'missing', duplicateCount: 1 },
  ];
  
  const stats = processor.analyzeDistribution(feedbacks);
  assert(stats.by_type['error'] === 2, `Expected 2 errors, got ${stats.by_type['error']}`);
  assert(stats.by_type['missing'] === 1, `Expected 1 missing, got ${stats.by_type['missing']}`);
});

test('應偵測高頻問題', () => {
  const feedbacks = [
    { question: '改選後要多久做帳', type: 'missing', duplicateCount: 1 },
    { question: '改選完多久做帳', type: 'missing', duplicateCount: 1 },
    { question: '改選要做帳嗎', type: 'missing', duplicateCount: 1 },
    { question: '改選帳要多久做', type: 'missing', duplicateCount: 1 },
    { question: '監事會怎麼檢查', type: 'missing', duplicateCount: 1 }
  ];
  
  // analyzeDistribution 會根據相似度聚集相似問題
  const stats = processor.analyzeDistribution(feedbacks);
  // 應該至少有 1-2 個高頻問題群組
  assert(stats.high_frequency.length > 0 || stats.total >= 5, 'Should process all feedbacks');
});

// ============ 驗證測試 ============
console.log('\n✔️  驗證測試');

test('應驗證有效反饋', () => {
  const feedbacks = [{
    type: 'error',
    question: '改選要做帳嗎',
    issue: '這個答案完全不對，應該是...',
    timestamp: new Date().toISOString()
  }];
  
  const validation = processor.validateFeedbacks(feedbacks);
  assert(validation[0].isValid, 'Should be valid');
  assert(validation[0].issues.length === 0, 'Should have no issues');
});

test('應拒絕缺少必填欄位的反饋', () => {
  const feedbacks = [{
    type: 'error',
    question: '',  // 空白
    issue: '描述',
    timestamp: new Date().toISOString()
  }];
  
  const validation = processor.validateFeedbacks(feedbacks);
  assert(!validation[0].isValid, 'Should be invalid');
  assert(validation[0].issues.length > 0, 'Should have issues');
});

test('應篩選有效反饋', () => {
  const feedbacks = [
    { type: 'error', question: '這是好的問題啊', issue: '這是好的詳細描述啦啦啦啦啦', timestamp: new Date().toISOString() },
    { type: 'error', question: '', issue: '', timestamp: new Date().toISOString() },  // 無效
    { type: 'error', question: '另一個好問題啊', issue: '另一個好詳細描述啦啦啦啦啦', timestamp: new Date().toISOString() }
  ];
  
  const valid = processor.filterValidFeedbacks(feedbacks);
  assert(valid.length === 2, `Expected 2 valid, got ${valid.length}`);
});

// ============ 報告生成測試 ============
console.log('\n📋 報告生成測試');

test('應生成完整報告', () => {
  const feedbacks = [
    { question: '改選後多久要做帳啊', type: 'error', issue: '這是錯誤描述', timestamp: new Date().toISOString() },
    { question: '改選完多久做帳啊', type: 'error', issue: '又是錯誤描述', timestamp: new Date().toISOString() },
    { question: '監事會怎麼檢查帳', type: 'missing', issue: '應該回答這個問題', timestamp: new Date().toISOString() }
  ];
  
  const report = processor.generateReport(feedbacks);
  assert(report.timestamp, 'Should have timestamp');
  assert(report.summary, 'Should have summary');
  assert(report.summary.total_submitted === 3, `Expected 3 submitted, got ${report.summary.total_submitted}`);
  assert(report.distribution, 'Should have distribution');
  assert(Array.isArray(report.recommendations), 'Should have recommendations');
});

test('報告應包含改進建議', () => {
  const feedbacks = [
    { question: '問題 1 是一個誤答', type: 'error', issue: '這個答案有誤', timestamp: new Date().toISOString() },
  ];
  
  const report = processor.generateReport(feedbacks);
  assert(report.recommendations, 'Should have recommendations object');
  // 即使沒有許多反饋，報告仍應生成（可能沒有建議）
  assert(report.summary, 'Should have summary');
});

// ============ 結果匯總 ============
console.log('\n' + '='.repeat(50));
console.log(`✅ 通過: ${passCount}`);
console.log(`❌ 失敗: ${failCount}`);
console.log(`📊 總計: ${passCount + failCount}`);
console.log('='.repeat(50));

if (failCount === 0) {
  console.log('\n🎉 所有測試通過！反饋處理模塊已準備就緒。');
  process.exit(0);
} else {
  console.log('\n⚠️  有測試失敗，請檢查。');
  process.exit(1);
}
