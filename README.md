# 四湖國中親職教育：陪孩子一起長大

- `deck.html`　簡報（方向鍵 / 點擊 / 滑動換頁，N 看講者備註，F 全螢幕）。第 6 頁自動產生問卷 QR Code，第 8 頁即時顯示家長選項長條圖。
- `index.html`　家長掃 QR Code 後填的問卷，送出後直接顯示長條圖。網址加 `?results` 只看統計。
- `config.js`　**只改這裡**：貼上 Apps Script 網址（`API_URL`），簡報與問卷同步生效。
- `Code.gs`　貼到 Google Sheets 的 Apps Script，部署為網頁應用程式（執行身分：我；存取：所有人）。
- `survey-qr.png`　問卷 QR Code 圖檔（備用）。

網址：`https://cyysongyy.github.io/sihu-parent-survey/`（簡報：`.../deck.html`）
