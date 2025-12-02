# Process-chart

A lightweight client-side editor for the receiving station process tree. Open `index.html` directly in a browser (or serve the folder) to explore and edit the nodes without any build step.

## 功能
- 按 Enter 於編輯區新增的換行，於檢視時可正確分行呈現。
- 每個節點皆可個別選擇欄位版面配置（標題 → 說明 → 注意事項的直向欄位順序）。
- 內建流程資料，可展開/收合節點並直接在卡片內編輯標題、類型、描述、備註與「圖片/網址」欄位。
- 分層縮排與色條讓階層像 Word 大綱般清晰，卡片之間界線更乾淨。

## 開啟方式
直接點擊 `index.html` 即可瀏覽，若想以本機伺服器開啟：

```bash
python -m http.server 4173
# 然後在瀏覽器開啟 http://localhost:4173
```

## 直接下載使用
- 下載 `process-chart-standalone.html` 後雙擊開啟即可離線使用，無須額外的 `src` 目錄或伺服器。
- 若需分享給他人，可直接提供這支單一檔案；所有樣式與資料皆已內嵌。

## 在 GitHub 上瀏覽
- 直接於 GitHub 介面點選 `index.html` 後選擇「View Raw」即可載入完整頁面（所有腳本皆為相對路徑，不需額外設定）。
- 若要發布 GitHub Pages，可在專案設定中啟用 Pages 並指定根目錄，即可透過 `https://<your-account>.github.io/Process-chart/` 瀏覽。
