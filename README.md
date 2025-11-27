# Process-chart

一個以 React + Vite 建立的互動式 SOP 編輯器，提供自訂節點外觀、匯入/匯出 JSON，並且 **完全離線運作**：資料會自動存到瀏覽器的 LocalStorage，可在沒有帳號、沒有網路的狀態下使用。預設會載入「散驗」流程示例，適合拿來快速建立可攜式的流程文件。

## 環境需求
- Node.js 18+
- 建議使用 pnpm 或 npm 安裝依賴

## 本機開發
```bash
npm install
npm run dev -- --host
```
應用會啟動在 `http://localhost:4173`。

### 推到你的 GitHub（上架 & 供同事下載）
1. 在 GitHub 建立空白倉庫（例如 `https://github.com/zealot0722/Process-chart`）。
2. 在此目錄加入遠端並推送：
   ```bash
   git remote add origin https://github.com/zealot0722/Process-chart.git
   git branch -M main
   git push -u origin main
   ```
3. 要更新版本時，照常 `git add/commit/push`；GitHub 會提供 Zip 下載與 Release 發佈功能，方便同事直接抓取。 

### npm install 錯誤排除
常見的 `npm install` 失敗通常與 Proxy 或網路連線有關，可依下列步驟檢查：

1) 檢查代理設定是否是預設的 `http://proxy:8080`（此值在封閉環境中經常無效）：
   ```bash
   env | grep -i proxy
   ```
2) 如果你不需要 Proxy，先移除相關環境變數再重試：
   ```bash
   unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY npm_config_http_proxy npm_config_https_proxy YARN_HTTP_PROXY YARN_HTTPS_PROXY
   npm install --registry=https://registry.npmjs.org --progress=false
   ```
3) 如果你的環境必須經由 Proxy 上網，請將 Proxy 設定改成可用的位址與認證，例如：
   ```bash
   export http_proxy="http://<有效的 proxy>:<port>" 
   export https_proxy="http://<有效的 proxy>:<port>"
   npm install --registry=https://registry.npmjs.org --progress=false
   ```
4) 若仍遇到連線逾時，可降低重試次數並縮短等待時間，加速失敗回報：
   ```bash
   NPM_CONFIG_FETCH_TIMEOUT=15000 NPM_CONFIG_FETCH_RETRIES=1 npm install --registry=https://registry.npmjs.org --progress=false --verbose
   ```

遇到 `E403 403 Forbidden - GET https://registry.npmjs.org/@vitejs/plugin-react` 時，通常是 Proxy 或網路閘道阻擋了對 npm registry 的連線，請確認：

- 你所在的網路允許對 `registry.npmjs.org`（或你指定的 registry）發出 HTTPS 443 連線。
- 你設定的 Proxy（若需要）可以對外 `CONNECT`，且已設定正確的憑證/帳密。
- `.npmrc` 中沒有指向已失效或需要授權的私有 registry。你可以用下列最小化設定覆蓋（見下方範例檔案）：
  ```bash
  cp .npmrc.example .npmrc
  npm install --progress=false
  ```

在我們的環境中，清空 Proxy 後仍會得到 `E403`，顯示目前的網路或代理服務拒絕存取 npm 官方 registry；需改用有效 Proxy、開通外網或使用可用的私有鏡像才能完成安裝。

### 如果完全連不上官方 registry，可以怎麼做？
以下是幾個在封閉網路可行的替代安裝/上傳方式：

1) **改用內部或私有鏡像**  \
   若公司有 npm mirror（如 Verdaccio、Nexus、JFrog Artifactory），請將 `.npmrc` 的 `registry` 指向鏡像，例如：
   ```bash
   npm config set registry "https://your.internal.registry"
   npm install
   ```

2) **在可上網的機器預先打包依賴，帶回離線環境**  \
   在有網路的開發機：
   ```bash
   npm ci
   tar czf node_modules.tar.gz node_modules
   ```
   將 `node_modules.tar.gz` 複製到離線環境後解壓：
   ```bash
   tar xzf node_modules.tar.gz
   npm run dev -- --host
   ```

3) **用 npm pack 產生離線套件緩存**（適合需要重複安裝的情境）  \
   在有網路的環境執行：
   ```bash
   npm ci
   npm pack --pack-destination ./offline-cache
   ```
   這會在 `offline-cache/` 產出所有相依的 `.tgz`。離線環境：建立 `.npmrc` 指向本機目錄，再安裝：
   ```bash
   npm config set cache "$(pwd)/offline-cache"
   npm config set registry "file://$(pwd)/offline-cache"
   npm install --offline
   ```

4) **直接提供編譯好的 ZIP（不需要安裝）**  \
   在有網路的環境跑 `npm install && npm run bundle`，把產出的 `dist-offline.zip` 傳給同事。解壓後直接用瀏覽器開啟 `dist/index.html` 即可測試/使用，不需要 node 環境或額外安裝。

## 離線資料儲存與備份
- **自動儲存**：編輯內容會自動寫入瀏覽器 LocalStorage，key 為 `sop_tree_offline_v1`。
- **匯出/匯入**：隨時可匯出 JSON 備份檔，或從 JSON 匯入復原；兩者均不需要網路。
- **清除本機暫存**：點擊工具列的「清除本機暫存」會移除 LocalStorage 並重新載入預設流程。

## 發佈為可攜式（完全離線）套件
### 一鍵打包（適合非技術同事）
1. 安裝好 Node.js 18+（包含 npm）。
2. 在專案根目錄執行：
   ```bash
   ./scripts/offline-bundle.sh
   ```
   腳本會偵測是否已有 `node_modules`：若沒有會自動 `npm install`，接著執行 `npm run bundle`，最後在根目錄產出 `dist-offline.zip`。
3. 將 `dist-offline.zip` 傳給同事（或放到 GitHub Release）。同事解壓後直接開啟 `dist/index.html` 即可使用，不需要網路/帳號。

### 手動打包（若想看過程）
1. `npm install`
2. 建立靜態產物：
   ```bash
   npm run build
   ```
   或一次打包 Zip：
   ```bash
   npm run bundle
   ```
   會在專案根目錄產出 `dist-offline.zip`，解壓後用瀏覽器開啟 `dist/index.html` 即可（無需網路）。
3. 產物會輸出到 `dist/`，內容是純靜態檔案（HTML/CSS/JS）。直接放到 USB、檔案伺服器或任何靜態主機即可運作；資料仍會保存在使用者的瀏覽器 LocalStorage，中途無需帳號與網路。

## 自行下載/測試
- **最快的下載方式（非技術）**：到 GitHub 倉庫頁面點「Code → Download ZIP」，解壓後直接開啟 `dist/index.html`（若有上傳 `dist-offline.zip`）。如果只下載原始碼壓縮檔，解壓後需先依「一鍵打包」或「手動打包」產出 `dist/` 內容。
- **本機測試步驟（需 Node.js）**：
  1. `npm install`
  2. `npm run dev -- --host`
  3. 瀏覽器開啟 `http://localhost:4173`
  4. 測試重點：
     - 編輯任一節點，確認重新整理後內容仍在（LocalStorage 自動儲存）。
     - 點「匯出」產生 JSON，手動刪除資料後「匯入」即可復原。
     - 「清除本機暫存」會回到預設流程。
