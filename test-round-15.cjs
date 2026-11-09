#!/usr/bin/env node

// 第15輪規則測試 (無法確認類)
// 運行: node test-round-15.cjs

const api = require('./round-fixes.js');

const testCases = [
  {
    q: "合作社收廣告費要繳營業稅嗎?",
    expect: "coopAdvertisingTaxability",
    tags: ["15-1", "合作社", "稅務"]
  },
  {
    q: "合作社向社員貸款，利息收入如何認列?",
    expect: "coopLoanToMemberTax",
    tags: ["15-2", "合作社", "稅務"]
  },
  {
    q: "合作社向銀行借貸要辦什麼手續?",
    expect: "coopBankLoanProcedure",
    tags: ["15-3", "合作社", "融資"]
  },
  {
    q: "社區發展協會要報公所哪些事項?",
    expect: "communityReportingRequirements",
    tags: ["15-4", "社區", "報送"]
  },
  {
    q: "社區協會年度計畫的送件期限是?",
    expect: "communityYearlyPlanDeadline",
    tags: ["15-5", "社區", "計畫"]
  },
  {
    q: "社區發展協會和一般協會有什麼差別?",
    expect: "communityVsAssociationDifferences",
    tags: ["15-6", "社區", "差別"]
  },
];

console.log("===== 第15輪規則測試 (Round 15) =====\n");

let passed = 0;
let failed = 0;

testCases.forEach((tc, idx) => {
  const result = api.verifiedRoundAnswer(tc.q);
  const hasResult = result && result.title;
  const passed_this = hasResult;
  
  console.log(`\n[Test ${idx + 1}] ${tc.tags[0]} - ${tc.q}`);
  console.log(`  期望: ${tc.expect}`);
  console.log(`  結果: ${hasResult ? '✓ PASS' : '✗ FAIL'}`);
  
  if (hasResult) {
    console.log(`  標題: ${result.title.substring(0, 60)}...`);
    console.log(`  摘要: ${result.summary.substring(0, 80)}...`);
    passed++;
  } else {
    console.log(`  無法匹配規則`);
    failed++;
  }
});

console.log("\n===== 測試摘要 =====");
console.log(`通過: ${passed}/${testCases.length}`);
console.log(`失敗: ${failed}/${testCases.length}`);
console.log(`\n${failed === 0 ? '✓ 全部通過!' : '✗ 有測試失敗'}`);

process.exit(failed > 0 ? 1 : 0);
