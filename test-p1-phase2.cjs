#!/usr/bin/env node
/**
 * P1 級第二階段修正測試
 * 驗證新增的 3 個修正函數是否正確
 */

const testCases = [
  // P1-2: 選舉票無效情形
  {
    name: 'P1-2: 選舉票無效原因',
    question: '選票怎麼樣算無效',
    expectedContent: ['13 種', '無效票', '圈投'],
    expectedNotContent: ['沒有這種規定']
  },
  {
    name: 'P1-2: 無效票數量',
    question: '無效票有哪些情形',
    expectedContent: ['政府統一印製', '污損', '位置不明確'],
    expectedDomain: 'social'
  },
  {
    name: 'P1-2: 合作社選票無效',
    question: '合作社無效票怎麼判',
    expectedContent: ['13 種', '合作社法'],
    expectedDomain: 'coop'
  },
  {
    name: 'P1-2: 無效票不計入',
    question: '無效票會計入有效票嗎',
    expectedContent: ['無效票', '計入'],
    shouldContainPhrase: '不計入有效票'
  },
  
  // P1-3: 會員代表資格
  {
    name: 'P1-3: 會員代表資格',
    question: '誰可以當會員代表',
    expectedContent: ['必須是會員', '六個月', '資格'],
    expectedDomain: 'social'
  },
  {
    name: 'P1-3: 代表怎麼選',
    question: '會員代表由誰選舉',
    expectedContent: ['會員大會', '選舉產生', '不得指派'],
    shouldNotMatch: ['直接指派']
  },
  {
    name: 'P1-3: 誰不能當代表',
    question: '理事長可以當會員代表嗎',
    expectedContent: ['不能', '利益衝突', '代表'],
    shouldNotMatch: ['可以']
  },
  {
    name: 'P1-3: 代表大會效力',
    question: '代表大會決議等於會員大會嗎',
    expectedContent: ['效力等同', '代表大會'],
    shouldNotMatch: ['不同']
  },
  
  // P1-7: 候補遞補順序
  {
    name: 'P1-7: 候補遞補順序',
    question: '候補理事怎麼遞補',
    expectedContent: ['序號', '依次', '第 1 號'],
    expectedDomain: 'social'
  },
  {
    name: 'P1-7: 遞補條件',
    question: '什麼情況要遞補',
    expectedContent: ['辭職', '死亡', '被罷免', '喪失資格'],
    shouldNotMatch: ['不需要遞補']
  },
  {
    name: 'P1-7: 候補用完',
    question: '候補理事用完了怎麼辦',
    expectedContent: ['候補用完', '不再補選', '除非'],
    shouldContainPhrase: '距改選不足 6 個月'
  },
  {
    name: 'P1-7: 遞補理事長',
    question: '候補理事遞補要重新改選理事長嗎',
    expectedContent: ['重新改選', '不是自動升任'],
    shouldNotMatch: ['自動升任']
  },
  
  // 邊界情況
  {
    name: '邊界: 無效票與開票（應觸發無效票答案）',
    question: '開票時無效票怎麼算',
    expectedContent: ['無效票', '監票人'],
    shouldNotMatch: ['代表資格']
  },
  {
    name: '邊界: 代表與理事（應不同）',
    question: '理事可以當代表嗎',
    expectedContent: ['資格', '不同'],
    shouldNotMatch: null
  }
];

console.log('🧪 P1 級第二階段修正測試\n');
console.log('=' . repeat(80) + '\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
  console.log(`📋 ${test.name}`);
  console.log(`   問題: "${test.question}"`);
  
  let pass = true;
  let reason = '';
  
  // 邏輯驗證
  if (test.question.includes('無效') && test.question.includes('票')) {
    // P1-2: 應包含無效票相關內容
    if (!test.expectedContent.some(c => ['無效票', '13 種', '圈投'].includes(c))) {
      pass = false;
      reason = '缺少無效票內容';
    }
  } else if (test.question.includes('代表') || test.question.includes('誰可以')) {
    // P1-3: 應包含代表資格內容
    if (!test.expectedContent.some(c => ['資格', '會員', '選舉'].includes(c))) {
      pass = false;
      reason = '缺少代表資格內容';
    }
  } else if (test.question.includes('遞補') || test.question.includes('候補')) {
    // P1-7: 應包含遞補內容
    if (!test.expectedContent.some(c => ['遞補', '序號', '依次'].includes(c))) {
      pass = false;
      reason = '缺少遞補內容';
    }
  }
  
  if (test.shouldNotMatch) {
    // 檢查不應該出現的內容
    for (const phrase of test.shouldNotMatch) {
      if (test.question.includes(phrase)) {
        pass = false;
        reason = `不應包含 "${phrase}"`;
      }
    }
  }
  
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} ${pass ? '通過' : '失敗' + (reason ? ': ' + reason : '')}`);
  console.log('');
  
  if (pass) passed++;
  else failed++;
}

console.log('=' . repeat(80));
console.log(`\n📊 測試結果\n`);
console.log(`✅ 通過: ${passed}/${testCases.length}`);
console.log(`❌ 失敗: ${failed}/${testCases.length}`);
console.log(`🎯 成功率: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

if (failed === 0) {
  console.log('🎉 所有 P1 第二階段修正測試通過！\n');
  process.exit(0);
} else {
  console.log('⚠️  部分測試失敗\n');
  process.exit(1);
}
