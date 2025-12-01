# Process-chart (純 HTML 離線版)

這是一個 **不需要安裝任何套件、也不需要帳戶與網路** 的 SOP 樹狀編輯工具。所有資料都會自動儲存在瀏覽器的 LocalStorage，並支援匯出/匯入 JSON 備份，方便同事在離線環境互傳或集中整理。

## 下載與使用（最簡方式）
1. 從 GitHub 下載這個專案的 ZIP（或直接複製 `index.html`）。
2. 在你的電腦解壓後，直接雙擊/開啟 `index.html`。
3. 編輯任一節點後，資料會自動儲存到瀏覽器（key: `sop_tree_standalone_v2`）。
4. 若要分享或交付，點「匯出 JSON」把檔案交給同事；同事在自己的瀏覽器點「匯入 JSON」即可恢復。
5. 「清除本機資料」會刪除 LocalStorage 並回到預設的「散驗」流程。

> 💡 整個工具就是一個 HTML 檔，不需要 Node.js、npm 或任何安裝步驟。只要有瀏覽器即可使用，完全離線。

## 功能總覽
- 新增/刪除/編輯節點（支援子區塊、同級區塊）。
- 展開/收合樹狀流程，內文支援多行。
- 可以填入圖片網址、外部連結與注意事項。
- 自動存入瀏覽器 LocalStorage；匯出/匯入 JSON 方便跨人員整合。
- 預設載入「散驗作業流程」示例，可直接修改成自己的流程。

## 給想推上 GitHub 的同事
1. 在 GitHub 建立空白倉庫（例如 `https://github.com/zealot0722/Process-chart`）。
2. 在專案目錄執行：
   ```bash
   git remote add origin <你的 repo url>
   git branch -M main
   git push -u origin main
   ```
3. 同事可以在 GitHub 下載 ZIP，解壓後直接用 `index.html`。不需要額外 build 或安裝。

## 不會用 git 也能在 GitHub 更新檔案（點選上傳即可）
如果你不熟悉指令，可以直接用 GitHub 網頁版更新 `index.html`：
1. 先在 GitHub 建立/進入你的倉庫。
2. 點右上角 **Add file → Upload files**。
3. 把目前資料夾的 `index.html` 拖曳進上傳區（或按「choose your files」選取）。
4. 在下方的 *Commit changes* 輸入簡短描述（例如「更新離線 SOP 工具」），不用開分支，直接按 **Commit changes**。
5. 完成後，頁面會自動顯示新版 `index.html`；同事可點右上角 **Code → Download ZIP** 下載最新版本。

> 若要同時附上你的流程資料，可先在工具裡點「匯出 JSON」，把 JSON 檔和 `index.html` 一起上傳（拖曳兩個檔案即可）。

## 若要自行客製化程式碼
- 這個版本為純原生 HTML/CSS/JavaScript，檔案在根目錄的 `index.html`。
- 你可以直接修改此檔案並重新推送。若要開發便利的套件管理/打包流程，可自行加入 Node/Vite，但預設不需要。

## 手動測試重點（無需命令列）
- 開啟 `index.html` 後，展開流程並點任一節點的「編輯」，修改內容後儲存。
- 重新整理頁面，確認內容仍在（代表 LocalStorage 生效）。
- 點「匯出 JSON」下載備份，然後按「清除本機資料」回到預設流程；再用剛剛的 JSON 匯入，確認能復原。
- 若需要共享給他人，直接傳送 `index.html` 或導出的 JSON 即可。
