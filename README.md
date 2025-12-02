# Process-chart

A lightweight client-side editor for the receiving station process tree. Open `index.html` directly in a browser (or serve the folder) to explore and edit the nodes without any build step.

## 功能
- 按 Enter 於編輯區新增的換行，於檢視時可正確分行呈現。
- 每個節點皆可個別選擇欄位版面配置（標題 → 說明 → 注意事項的直向欄位順序）。
- 內建流程資料，可展開/收合節點並立即編輯標題、類型、描述與備註。

## 開啟方式
直接點擊 `index.html` 即可瀏覽，若想以本機伺服器開啟：

```bash
python -m http.server 4173
# 然後在瀏覽器開啟 http://localhost:4173
```
