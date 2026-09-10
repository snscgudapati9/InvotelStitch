/**
 * InvotelStitch — Google Sheets Backend (Google Apps Script)
 * ------------------------------------------------------------
 * This turns a Google Sheet into a free key-value database for the app,
 * AND lets the app send real emails to the owner (via your Gmail, free,
 * using Apps Script's built-in MailApp — no SendGrid/AWS needed).
 *
 * SETUP:
 * 1. Go to https://sheets.google.com and create a new blank spreadsheet.
 *    Name it something like "InvotelStitch Database".
 * 2. In the sheet, go to Extensions -> Apps Script.
 * 3. Delete any starter code in Code.gs, paste this whole file in, and
 *    save (Ctrl+S / Cmd+S). Give the project a name when asked.
 * 4. Click Deploy -> New deployment.
 *    - Click the gear icon next to "Select type" -> choose "Web app".
 *    - Description: InvotelStitch API (or anything).
 *    - Execute as: Me.
 *    - Who has access: Anyone.
 *    - Click Deploy.
 * 5. Google will ask you to authorize. Click "Authorize access", pick your
 *    account, then on the "Google hasn't verified this app" screen click
 *    "Advanced" -> "Go to <project name> (unsafe)" -> "Allow".
 *    (This warning is normal for personal scripts you wrote yourself.
 *    This authorization is also what lets MailApp send email as you.)
 * 6. Copy the Web app URL it gives you (ends in /exec).
 * 7. In InvotelStitch, go to Settings -> "Google Sheets Backend" and paste
 *    that URL, then click "Save & Connect". Refresh the page once.
 *
 * EMAIL QUOTA: A free personal Gmail account can send ~100 emails/day via
 * MailApp. That's plenty for digests/summaries, not for emailing on every
 * single transaction — the app only sends on manual "Email to Owner"
 * button clicks, never automatically per-entry, to respect this.
 *
 * IMPORTANT: Whenever you edit this script later, you must go to
 * Deploy -> Manage deployments -> Edit (pencil icon) -> New version -> Deploy,
 * otherwise your changes won't take effect on the live URL.
 */

const SHEET_NAME = "KV_Store";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Key", "Value", "UpdatedAt"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(sheet, key) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

// GET /exec?key=purchases  -> { value: "...json string..." | null }
function doGet(e) {
  const key = e.parameter.key;
  const sheet = getSheet_();
  if (!key) {
    // No key provided: return list of all keys (handy for debugging)
    const data = sheet.getDataRange().getValues();
    const keys = data.slice(1).map((r) => r[0]);
    return jsonOut_({ keys: keys });
  }
  const row = findRow_(sheet, key);
  if (row === -1) return jsonOut_({ value: null });
  const value = sheet.getRange(row, 2).getValue();
  return jsonOut_({ value: value === "" ? null : value });
}

// POST /exec
// - Normal storage write: form body key=..., value=...
// - Email send: form body action=sendEmail, to=..., subject=..., body=...
function doPost(e) {
  const action = e.parameter.action;

  if (action === "sendEmail") {
    const to = e.parameter.to;
    const subject = e.parameter.subject || "InvotelStitch Notification";
    const body = e.parameter.body || "";
    if (!to) return jsonOut_({ ok: false, error: "missing recipient" });
    try {
      MailApp.sendEmail({ to: to, subject: subject, body: body });
      return jsonOut_({ ok: true, sent: true });
    } catch (err) {
      return jsonOut_({ ok: false, error: String(err) });
    }
  }

  const key = e.parameter.key;
  const value = e.parameter.value;
  if (!key) return jsonOut_({ ok: false, error: "missing key" });

  const sheet = getSheet_();
  const row = findRow_(sheet, key);
  const now = new Date().toISOString();
  if (row === -1) {
    sheet.appendRow([key, value, now]);
  } else {
    sheet.getRange(row, 2, 1, 2).setValues([[value, now]]);
  }
  return jsonOut_({ ok: true });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
