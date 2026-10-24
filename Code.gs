/**
 * 四湖國中親職教育 問卷後端（Google Apps Script）
 * 部署：擴充功能 → Apps Script → 貼上 → 部署為「網頁應用程式」
 *       執行身分：我；誰可以存取：所有人
 * 把部署後的網址（結尾 /exec）貼到 config.js 的 API_URL
 *
 * 改程式後要「管理部署作業 → 編輯 → 新版本」才會生效。
 */
const ADMIN_PIN = '2026';   // ← 清除紀錄用的密碼，請改成你自己的
const SHEET_NAME = '回覆';
const ARCHIVE_NAME = '已清除';
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

// 讀取統計；加 ?action=clear&pin=密碼 可清除紀錄
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'clear') {
    return clear_(e.parameter.pin);
  }
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const count = (idx) => {
    const m = {};
    rows.forEach(r => String(r[idx]).split('|').filter(Boolean).forEach(k => m[k] = (m[k] || 0) + 1));
    return m;
  };
  return json_({
    total: rows.length,
    round: round_(),
    emotion: count(1),
    behavior: count(2),
    social: count(3)
  });
}

// 清除：先把舊回覆搬到「已清除」工作表備份，再清空「回覆」，並讓 round 加 1
function clear_(pin) {
  if (String(pin) !== ADMIN_PIN) return json_({ ok: false, error: 'pin' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getSheet_();
    const last = sh.getLastRow();
    if (last > 1) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let ar = ss.getSheetByName(ARCHIVE_NAME);
      if (!ar) { ar = ss.insertSheet(ARCHIVE_NAME); ar.appendRow(HEADERS.concat(['清除時間'])); ar.setFrozenRows(1); }
      const vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
      const now = new Date();
      ar.getRange(ar.getLastRow() + 1, 1, vals.length, HEADERS.length + 1)
        .setValues(vals.map(r => r.concat([now])));
      sh.deleteRows(2, last - 1);
    }
    const next = round_() + 1;
    PropertiesService.getScriptProperties().setProperty('round', String(next));
    return json_({ ok: true, round: next });
  } finally {
    lock.release();
  }
}

function round_() {
  return Number(PropertiesService.getScriptProperties().getProperty('round') || 0);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
