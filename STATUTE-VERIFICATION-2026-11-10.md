# 法條核對紀錄 2026-11-10

對照來源：data/statutes.json.gz（verifiedAt 2026-11-05，law.moj.gov.tw）

## 發現：P1 修正（14e1b0c、ffffb5c）寫入的 5 個函數中 4 個法條錯誤

| 函數 | 錯誤 | 正確依據 | 處置 |
|---|---|---|---|
| chairReelection | 協會理事長「法律無限制」、合作社「一次為限」 | 人團法§20 理事長連任以一次為限；合作社法§33 連選得連任（除法律或章程另有規定） | 刪除；保留原 chairmanReelectionLimit，新增 coopChairReelection |
| invalidBallotReason | 13 款內容自編、引 D0050108（教育會法） | 人團選罷辦法§10（D0050093）、合作社選罷辦法§31（D0050022） | 以條文原文重寫 |
| delegateQualification | 「入會滿六個月，§17」捏造 | 人團法§13 定義、§28 逾300人分區選代表、§12第9款由章程訂 | 重寫 |
| substitutionOrder | 「15日內當選證明書」「候補用完不再補選」捏造 | 選罷辦法§17 遞補後未達章程名額2/3補選足額；理事長出缺1個月內補選；§27 辭職不得退為候補 | 重寫 |
| reelectionProportion | 「改選三分之二用ceil」—人團法無此制度 | 2/3 實為§17 補選門檻 | 刪除，改為 byElectionThreshold |

## 教訓
1. 任何寫入櫃檯的法條數字、條號、pcode，必須先從 statutes.json.gz 查出原文再寫。
2. 測試必須真正呼叫 verifiedRoundAnswer（test-round-fixes-live.cjs），不能只比對問題字串。
3. 先前文件中「準確率 85%→97%」為估計值，無量測依據，不得對外引用。

## 法規 pcode 速查（正確值）
人民團體法 D0050091｜人民團體選舉罷免辦法 D0050093｜會務輔導辦法 D0020094｜社會團體財務處理辦法 D0050097｜合作社法 D0050112｜合作社選舉罷免辦法 D0050022｜合作社財務報表及經費處理準則 D0050114
