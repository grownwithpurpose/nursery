function setupNurseryDonationTracker() {
  const spreadsheet = SpreadsheetApp.create("Little Garden Nursery - Donation and Pickup Tracker");
  const verificationSheet = spreadsheet.getSheets()[0];
  verificationSheet.setName("Pickup verification");
  verificationSheet.getRange(1, 1, 1, 7).setValues([[
    "Pickup request ID",
    "Plant ID",
    "Expected donation (USD)",
    "Amount verified at pickup (USD)",
    "Donation confirmation checked",
    "Plant picked up",
    "Pickup date"
  ]]);
  verificationSheet.setFrozenRows(1);
  verificationSheet.autoResizeColumns(1, 7);

  const startForm = FormApp.create("Nursery Pickup Request - Donation Started")
    .setDescription("Log your pickup request before donating directly to Hunger at Home.")
    .setCollectEmail(false)
    .setConfirmationMessage(
      "Your pickup request is logged. Donate directly to Hunger at Home at https://hungerathome.org/donate/. " +
      "After donating, return to the nursery page and submit the donation report. Your gift is not verified until confirmation is checked at pickup."
    )
    .setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  startForm.addTextItem().setTitle("Pickup request ID").setRequired(true);
  startForm.addTextItem().setTitle("Plant ID").setRequired(true);
  addMoneyItem(startForm, "Expected donation amount (USD)");

  const reportForm = FormApp.create("Nursery Donation Report - Donor Reported")
    .setDescription("Report your donation amount. This report is not payment verification.")
    .setCollectEmail(false)
    .setConfirmationMessage(
      "Thank you. Your donation amount is recorded as donor-reported and will be checked at pickup. " +
      "Please show your Hunger at Home confirmation to the nursery at pickup."
    )
    .setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  reportForm.addTextItem().setTitle("Pickup request ID").setRequired(true);
  reportForm.addTextItem().setTitle("Plant ID").setRequired(true);
  addMoneyItem(reportForm, "Expected donation amount (USD)");
  addMoneyItem(reportForm, "Donation amount reported (USD)");

  Logger.log(JSON.stringify({
    spreadsheetUrl: spreadsheet.getUrl(),
    startForm: getPrefillConfig(startForm, {
      "Pickup request ID": "SAMPLE_REQUEST_ID",
      "Plant ID": "SAMPLE_PLANT_ID",
      "Expected donation amount (USD)": "11.11"
    }),
    reportForm: getPrefillConfig(reportForm, {
      "Pickup request ID": "SAMPLE_REQUEST_ID",
      "Plant ID": "SAMPLE_PLANT_ID",
      "Expected donation amount (USD)": "11.11",
      "Donation amount reported (USD)": "22.22"
    })
  }, null, 2));
}

function addMoneyItem(form, title) {
  const validation = FormApp.createTextValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setHelpText("Enter a non-negative amount in US dollars.")
    .build();
  form.addTextItem()
    .setTitle(title)
    .setRequired(true)
    .setValidation(validation);
}

function getPrefillConfig(form, sampleValues) {
  let response = form.createResponse();
  const fields = {};

  form.getItems(FormApp.ItemType.TEXT).forEach(function(item) {
    const textItem = item.asTextItem();
    const title = textItem.getTitle();
    response = response.withItemResponse(textItem.createResponse(sampleValues[title]));
  });

  const query = response.toPrefilledUrl().split("?")[1] || "";
  const parameters = query.split("&").filter(Boolean).map(function(parameter) {
    const parts = parameter.split("=");
    return [
      decodeURIComponent(parts[0].replace(/\+/g, " ")),
      decodeURIComponent((parts[1] || "").replace(/\+/g, " "))
    ];
  });
  Object.entries(sampleValues).forEach(function(entry) {
    const [title, sampleValue] = entry;
    const field = parameters.find(function(parameter) {
      return parameter[1] === sampleValue;
    });
    if (!field) {
      throw new Error("Could not locate the prefilled field for: " + title);
    }
    fields[title] = field[0];
  });

  return {
    baseUrl: form.getPublishedUrl(),
    fields: fields
  };
}
