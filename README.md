## 🌿 Grown with Purpose & Hunger at Home

True growth isn't just about what we build—it's about how deeply we care for the community around us. That is why our hearts and support belong to **[Hunger at Home](https://hungerathome.org/)**, a local San Jose nonprofit that brings dignity, nourishment, and hope to Silicon Valley tables every single day.

### Why Hunger at Home Stole Our Hearts

* **Nourishing Our Neighbors:** In a valley filled with innovation, it is heartbreaking that 1 in 4 of our neighbors quietly wonders where their next meal will come from. Hunger at Home steps into that gap with immense compassion, ensuring over 75% of their weekly grocery distributions reach families with young children and seniors.
* **Respecting What the Earth Gives Us:** Hunger at Home looks at excess food not as waste, but as an opportunity to care for both people and the planet. By rescuing fresh, chef-prepared meals from local kitchens and convention halls before they are discarded, they have kept tens of millions of pounds of food out of landfills and saved billions of gallons of precious water.
* **A Heartfelt Solution to a Broken System:** Their mission was sparked by an eight-year-old boy who simply saw people in need and asked how to help. They don't just hand out canned goods; their culinary team crafts wholesome, dignified, and delicious meals, proving every day that hunger isn't a lack of food—it’s about connecting abundance to the people who need it most.

> *"Hunger isn’t about scarcity, it’s about logistics."*  
> — **Ewell Sterner**, Founder & CEO, Hunger at Home

---

### Lend a Helping Hand

If their mission resonates with you, consider taking a moment to support their work. Whether it’s sharing a little of your time, spreading the word, or contributing what you can, every small act ripples outward:

* **[Visit Hunger at Home](https://hungerathome.org/)** to learn more about their story.
* **[Make a Direct Donation](https://hungerathome.org/donate/)** to help turn surplus ingredients into wholesome, comforting meals for our neighbors.

## Donation and pickup tracking

The nursery site does not receive or verify payments. Donations go directly to Hunger at Home, and the nursery has no integration with its donation processor. The tracking flow therefore distinguishes:

- **Pickup request / donation started:** a Google Form submission before the donor visits Hunger at Home. This counts submitted requests, not payment attempts confirmed by Hunger at Home.
- **Donor-reported donation:** a second form submission after the donor gives. The reported amount is not verified automatically.
- **Verified at pickup:** staff check the donor's confirmation in person and record the verified amount and pickup status in the private spreadsheet.

Do not collect payment-card details or upload/store donation receipts. A report is not proof of payment, and the nursery should not issue a tax receipt for a donation processed by Hunger at Home.

### Set up the private Google Sheet and forms

1. In your Google account, create a new Apps Script project at [script.google.com](https://script.google.com/).
2. Copy the contents of [`google-sheets-tracker.gs`](./google-sheets-tracker.gs) into the Apps Script editor and run `setupNurseryDonationTracker` once. Review and approve Google's requested permissions. The script creates a spreadsheet, a pickup-request form, and a donor-report form in your account; rerunning it creates additional copies.
3. Open the Apps Script execution log and copy the JSON configuration it prints. Keep the spreadsheet private and share it only with staff who verify pickups. The public forms intentionally do not collect email addresses.
4. In [`plant.html`](./plant.html), replace the empty `trackingForms.start` and `trackingForms.report` values with the corresponding `baseUrl` and `fields` values from that JSON. The `fields` values are the Google Form `entry.*` identifiers. Save and publish the site.
5. Test with a form submission. Submit the pickup-request form and verify it appears in the spreadsheet; follow its confirmation link to Hunger at Home. Then submit the donor-report form and verify the reported amount appears. Remove test rows before launch. The form response tabs show the number of submitted requests/reports and reported amounts; those are not counts of unique people or processor-verified donations.
6. At pickup, find the request ID in the form responses and add a row for it in **Pickup verification**. Check the donor's Hunger at Home confirmation in person, then record whether it was checked, the amount verified, and whether the plant was picked up. Do not retain the receipt.

The request ID is stored in the visitor's current browser tab session so the two form submissions can be matched. If they use a different tab session or device, they may get a different ID. Repeated or false public form submissions are possible; reconcile requests against the donor's confirmation at pickup. No spreadsheet or form credentials belong in this repository.
