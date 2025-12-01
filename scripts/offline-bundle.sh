#!/usr/bin/env bash
set -euo pipefail
# 一鍵產出 dist-offline.zip（若缺套件自動安裝）
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

log(){ echo "[offline-bundle] $*"; }

if ! command -v npm >/dev/null 2>&1; then
  log "找不到 npm，請先安裝 Node.js 18+（含 npm）再重試。"
  exit 1
fi

# 只有在缺少 node_modules 時才安裝，避免已安裝的環境重複下載。
if [ ! -d node_modules ]; then
  log "偵測到缺少 node_modules，開始安裝依賴..."
  npm install --progress=false
else
  log "偵測到已存在 node_modules，略過安裝。"
fi

log "開始建立離線包 (npm run bundle)..."
npm run bundle

log "完成！產物位於 $REPO_ROOT/dist-offline.zip，可直接分發給同事，解壓後用瀏覽器開啟 dist/index.html。"
