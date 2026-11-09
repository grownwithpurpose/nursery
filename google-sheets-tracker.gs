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

function doGet() {
  return HtmlService.createHtmlOutput(
    "Donation tracker is available. Submit details from the nursery plant page."
  );
}

function doPost(event) {
  const values = event && event.parameter ? event.parameter : {};
  if (values.website) {
    return HtmlService.createHtmlOutput("")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  const visitorId = getText(values.visitorId, 80);
  const name = getText(values.name, 120);
  const phone = getText(values.phone, 40);
  const email = getText(values.email, 254);
  const plantId = getText(values.plantId, 80);
  const consent = getText(values.consent, 10);
  const requestId = getText(values.requestId, 80);

  if (!/^[a-zA-Z0-9-]{16,80}$/.test(visitorId) ||
      !name ||
      consent !== "yes" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(requestId) ||
      !/^[a-z0-9-]{1,80}$/.test(plantId) ||
      (phone && (!/^\+?[0-9][0-9\s().-]*[0-9]$/.test(phone) ||
        phone.replace(/\D/g, "").length < 7 ||
        phone.replace(/\D/g, "").length > 15)) ||
      (email && !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i.test(email))) {
    return errorResponse(requestId);
  }

  const spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty(DONATION_SHEET_PROPERTY);
  if (!spreadsheetId) {
    console.error("Missing script property: " + DONATION_SHEET_PROPERTY);
    return errorResponse(requestId);
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
    return errorResponse(requestId);
  }

  return donationResponse(requestId);
}

function getText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function asSheetText(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function donationResponse(requestId) {
  return postMessageResponse(requestId, "saved");
}

function errorResponse(requestId) {
  return postMessageResponse(requestId, "error");
}

function postMessageResponse(requestId, status) {
  const safeRequestId = /^[a-zA-Z0-9-]{16,80}$/.test(requestId || "")
    ? requestId
    : "";
  const message = JSON.stringify({
    type: "nursery-pickup-details",
    status: status,
    requestId: safeRequestId
  });
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>Save status</title>' +
    '<script>window.top.postMessage(' + message + ', "*");</script></html>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
