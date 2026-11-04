const DONATION_SHEET_PROPERTY = "DONATION_SPREADSHEET_ID";
const DONATION_SHEET_NAME = "Donations";
const DONATION_HEADERS = [
  "Visitor ID",
  "Name",
  "Phone number",
  "Email address",
  "Plant id",
  "Submitted at"
];

function setupDonationSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty(DONATION_SHEET_PROPERTY);
  if (!spreadsheetId) {
    throw new Error(
      "Set the DONATION_SPREADSHEET_ID script property to your private Google Sheet ID first."
    );
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(DONATION_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(DONATION_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, DONATION_HEADERS.length).setValues([DONATION_HEADERS]);
    sheet.getRange(2, DONATION_HEADERS.length, sheet.getMaxRows() - 1, 1)
      .setNumberFormat("yyyy-mm-dd hh:mm:ss");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, DONATION_HEADERS.length);
    return;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), DONATION_HEADERS.length))
    .getDisplayValues()[0];
  const baseHeadersMatch = DONATION_HEADERS.slice(0, 5).every(function(header, index) {
    return existingHeaders[index] === header;
  });
  const hasLegacyDedicationColumn =
    existingHeaders[5] === "In honor/memory of";
  if (!baseHeadersMatch) {
    throw new Error(
      'The "Donations" tab has unexpected headers. Review it before running setup.'
    );
  }
  if (hasLegacyDedicationColumn) {
    sheet.deleteColumn(6);
  } else if (existingHeaders[5] &&
      existingHeaders[5] !== DONATION_HEADERS[5]) {
    throw new Error(
      'The "Donations" tab has an unexpected sixth column. Review it before running setup.'
    );
  }
  sheet.getRange(1, 1, 1, DONATION_HEADERS.length).setValues([DONATION_HEADERS]);
  sheet.getRange(2, DONATION_HEADERS.length, Math.max(sheet.getMaxRows() - 1, 1), 1)
    .setNumberFormat("yyyy-mm-dd hh:mm:ss");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, DONATION_HEADERS.length);
}

function doPost(event) {
  const values = event && event.parameter ? event.parameter : {};
  if (values.website) {
    return donationResponse();
  }

  const visitorId = getText(values.visitorId, 80);
  const name = getText(values.name, 120);
  const phone = getText(values.phone, 40);
  const email = getText(values.email, 254);
  const plantId = getText(values.plantId, 80);
  const consent = getText(values.consent, 10);

  if (!/^[a-zA-Z0-9-]{16,80}$/.test(visitorId) ||
      !name ||
      consent !== "yes" ||
      !/^[a-z0-9-]{1,80}$/.test(plantId) ||
      (phone && (!/^\+?[0-9][0-9\s().-]*[0-9]$/.test(phone) ||
        phone.replace(/\D/g, "").length < 7 ||
        phone.replace(/\D/g, "").length > 15)) ||
      (email && !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i.test(email))) {
    return errorResponse();
  }

  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty(DONATION_SHEET_PROPERTY);
  if (!spreadsheetId) {
    console.error("Missing script property: " + DONATION_SHEET_PROPERTY);
    return errorResponse();
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(DONATION_SHEET_NAME);
    if (!sheet) {
      throw new Error('Missing "Donations" tab. Run setupDonationSheet first.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        asSheetText(visitorId),
        asSheetText(name),
        asSheetText(phone),
        asSheetText(email),
        asSheetText(plantId),
        new Date()
      ]);
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error("Unable to record donation contact:", error);
    return errorResponse();
  }

  return donationResponse();
}

function getText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function asSheetText(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function donationResponse() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Details saved</title><body style="font:16px/1.6 Arial,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#29372f;min-height:70vh;display:flex;flex-direction:column">' +
    '<h1 style="color:#244638">Your details are saved</h1>' +
    '<p>Your name and optional contact details were saved to the nursery’s private sheet for pickup coordination. They were not sent to Hunger at Home.</p>' +
    '<p>This does not confirm or process a donation.</p>' +
    '<div style="flex:1"></div>' +
    '<a href="https://hungerathome.org/donate/" target="_blank" rel="noopener noreferrer" style="display:block;box-sizing:border-box;width:100%;padding:14px;border-radius:10px;background:#244638;color:#fff;text-align:center;text-decoration:none;font-weight:600">Donate &amp; Arrange Pickup</a>' +
    '</body></html>'
  );
}

function errorResponse() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Details not saved</title><body style="font:16px/1.6 Arial,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#29372f">' +
    '<h1 style="color:#244638">We could not save your details</h1>' +
    '<p>Please return to the nursery page and try again, or contact the nursery to arrange pickup.</p></body></html>'
  );
}
