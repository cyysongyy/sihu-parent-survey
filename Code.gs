/**
 * 四湖國中親職教育 問卷後端（Google Apps Script）
 * 部署：擴充功能 → Apps Script → 貼上 → 部署為「網頁應用程式」
 *       執行身分：我；誰可以存取：所有人
 * 把部署後的網址（結尾 /exec）貼到 index.html 最上面的 API_URL
 */
const SHEET_NAME = '回覆';
const HEADERS = ['時間', '情緒', '行為', '人際'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// 家長送出
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    getSheet_().appendRow([
      new Date(),
      (d.emotion || []).join('|'),
      (d.behavior || []).join('|'),
      (d.social || []).join('|')
    ]);
    return json_({ ok: true });
  } finally {
    lock.release();
  }
}

// 讀取統計：每個選項被勾選的人數
function doGet() {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const count = (idx) => {
    const m = {};
    rows.forEach(r => String(r[idx]).split('|').filter(Boolean).forEach(k => m[k] = (m[k] || 0) + 1));
    return m;
  };
  return json_({
    total: rows.length,
    emotion: count(1),
    behavior: count(2),
    social: count(3)
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
