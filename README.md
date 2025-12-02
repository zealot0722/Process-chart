# Process-chart

A lightweight client-side editor for the receiving station process tree. Open `index.html` in a browser (or serve the folder) to explore and edit the nodes.

## 功能
- 按 Enter 於編輯區新增的換行，於檢視時可正確分行呈現。
- 每個節點皆可個別選擇欄位版面配置（單欄、雙欄、備註加寬），適合依內容調整。
- 內建流程資料，可展開/收合節點並立即編輯標題、類型、描述與備註。

## 開啟方式
```bash
python -m http.server 4173
# 然後在瀏覽器開啟 http://localhost:4173
```
