/**
 * Blackline Motors – website lead receiver (Google Apps Script)
 *
 * Paste this into Extensions > Apps Script on the "Blackline Leads" Google Sheet.
 * Then set two Script Properties (Project Settings > Script properties):
 *   SECRET       – a long random string; the same value goes in Vercel as LEADS_WEBHOOK_SECRET
 *   ALERT_EMAIL  – where new-lead alerts go (e.g. mike@blacklinemotorsco.com)
 * Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 * Copy the Web app URL into Vercel as LEADS_WEBHOOK_URL.
 *
 * Only the fields the website sends are stored. Never add ID, SSN, pay stub or
 * bank fields to this sheet.
 */

var RTO_SHEET = "RTO Leads";
var OTHER_SHEET = "Other Inquiries";

var RTO_HEADERS = [
  "Received (Denver)", "Status", "Name", "Phone", "Monthly income", "Time at job",
  "Time at address", "Vehicle wanted", "Language", "Source", "Medium", "Campaign",
  "Ad / post", "Referrer", "Landing page", "First contact (time)", "Minutes to respond",
  "Notes",
];

var OTHER_HEADERS = ["Received (Denver)", "Form", "Status", "Name", "Phone", "Email", "Details (JSON)", "Notes"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var props = PropertiesService.getScriptProperties();
    var body = JSON.parse(e.postData.contents);
    if (!body || body.secret !== props.getProperty("SECRET")) {
      return json({ ok: false, error: "unauthorized" });
    }
    lock.waitLock(10000);

    var f = body.fields || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = Utilities.formatDate(new Date(), "America/Denver", "yyyy-MM-dd HH:mm");

    if (body.form === "RTO Pre-Qualification") {
      var sheet = getSheet(ss, RTO_SHEET, RTO_HEADERS);
      var row = sheet.getLastRow() + 1;
      sheet.appendRow([
        now, "New", clean(f.name), clean(f.phone), clean(f.monthlyIncome), clean(f.timeAtJob),
        clean(f.timeAtAddress), clean(f.vehicleWanted), clean(f.language), clean(f.utmSource),
        clean(f.utmMedium), clean(f.utmCampaign), clean(f.utmContent), clean(f.referrer),
        clean(f.landingPage), "", "", "",
      ]);
      // Minutes to respond = First contact minus Received, once you fill in column P.
      sheet.getRange(row, 17).setFormula('=IF(P' + row + '="","",ROUND((P' + row + '-A' + row + ')*1440,0))');
      sendAlert(props.getProperty("ALERT_EMAIL"), "New RTO lead: " + clean(f.name) + " – " + clean(f.monthlyIncome), [
        "Name: " + clean(f.name),
        "Phone: " + clean(f.phone) + "  (tap to call: tel:" + digits(f.phone) + ")",
        "Monthly income: " + clean(f.monthlyIncome),
        "Time at job: " + clean(f.timeAtJob),
        "Time at address: " + clean(f.timeAtAddress),
        "Vehicle wanted: " + clean(f.vehicleWanted),
        "Language: " + (f.language === "es" ? "Spanish" : "English"),
        "Source: " + (clean(f.utmSource) || "direct / unknown"),
        "",
        "Goal: respond within 1 hour.",
        "Sheet: " + ss.getUrl(),
      ]);
    } else {
      var other = getSheet(ss, OTHER_SHEET, OTHER_HEADERS);
      var name = f.name || f.contactName || f.sellerName || "";
      other.appendRow([now, clean(body.form), "New", clean(name), clean(f.phone), clean(f.email), JSON.stringify(f).slice(0, 4000), ""]);
      sendAlert(props.getProperty("ALERT_EMAIL"), "New website inquiry (" + clean(body.form) + "): " + clean(name), [
        "Form: " + clean(body.form),
        "Name: " + clean(name),
        "Phone: " + clean(f.phone),
        "Email: " + clean(f.email),
        "",
        JSON.stringify(f, null, 2),
        "",
        "Sheet: " + ss.getUrl(),
      ]);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function getSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function sendAlert(to, subject, lines) {
  if (!to) return;
  MailApp.sendEmail({ to: to, subject: subject, body: lines.join("\n") });
}

// Stops spreadsheet formula injection and trims long values.
function clean(value) {
  var s = value == null ? "" : String(value).slice(0, 300);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function digits(value) {
  return String(value || "").replace(/[^0-9+]/g, "");
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor to approve permissions and test the alert email.
function testSetup() {
  var to = PropertiesService.getScriptProperties().getProperty("ALERT_EMAIL");
  sendAlert(to, "Blackline lead alerts are working", ["This is a test from the Blackline Leads sheet."]);
  getSheet(SpreadsheetApp.getActiveSpreadsheet(), RTO_SHEET, RTO_HEADERS);
  getSheet(SpreadsheetApp.getActiveSpreadsheet(), OTHER_SHEET, OTHER_HEADERS);
}
