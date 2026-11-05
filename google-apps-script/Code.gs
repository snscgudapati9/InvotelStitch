/**
 * InvotelStitch — Google Sheets backend + email (MailApp).
 * Setup: Sheet -> Extensions -> Apps Script -> paste this -> Deploy -> New deployment
 * -> Web app (Execute as: Me, Access: Anyone) -> authorize -> copy the /exec URL.
 * After any edit: Deploy -> Manage deployments -> Edit -> New version -> Deploy.
 */
const SHEET_NAME = "KV_Store";
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.appendRow(["Key","Value","UpdatedAt"]); sheet.setFrozenRows(1); }
  return sheet;
}
function findRow_(sheet, key) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) { if (data[i][0] === key) return i + 1; }
  return -1;
}
function doGet(e) {
  const key = e.parameter.key;
  const sheet = getSheet_();
  if (!key) { return jsonOut_({ keys: sheet.getDataRange().getValues().slice(1).map((r) => r[0]) }); }
  const row = findRow_(sheet, key);
  if (row === -1) return jsonOut_({ value: null });
  const value = sheet.getRange(row, 2).getValue();
  return jsonOut_({ value: value === "" ? null : value });
}
function doPost(e) {
  if (e.parameter.action === "sendEmail") {
    const to = e.parameter.to;
    if (!to) return jsonOut_({ ok: false, error: "missing recipient" });
    try {
      MailApp.sendEmail({ to: to, subject: e.parameter.subject || "InvotelStitch Notification", body: e.parameter.body || "" });
      return jsonOut_({ ok: true, sent: true });
    } catch (err) { return jsonOut_({ ok: false, error: String(err) }); }
  }
  const key = e.parameter.key, value = e.parameter.value;
  if (!key) return jsonOut_({ ok: false, error: "missing key" });
  const sheet = getSheet_();
  const row = findRow_(sheet, key);
  const now = new Date().toISOString();
  if (row === -1) sheet.appendRow([key, value, now]); else sheet.getRange(row, 2, 1, 2).setValues([[value, now]]);
  return jsonOut_({ ok: true });
}
function jsonOut_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
