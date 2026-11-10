#!/bin/bash
# 提交前必跑：所有 JS 語法檢查
set -e
for f in round-fixes.js answer-arbiter.js nlu-engine.js nlu-integration.js feedback-collector.js feedback-github-poster.js feedback-processor.js question-understanding.js counter-upgrade.js; do
  [ -f "$f" ] && node --check "$f" && echo "OK  $f"
done
node test-round-fixes-live.cjs && node eval-arbiter.cjs | grep -c "^OK" 
