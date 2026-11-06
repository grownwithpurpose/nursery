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

## Donation contact and pickup tracking

The plant page collects the visitor's name and optional phone/email. With the visitor's consent, it posts those details and the plant ID to a Google Apps Script web app that appends a row to the private Sheet. After the Sheet write succeeds, the page displays Hunger at Home's public donation page in an iframe. The Apps Script response uses `window.top.postMessage` because Apps Script wraps its response in a nested Google-hosted frame; the page accepts only Google-hosted messages with the matching one-time request ID.

The contact details are sent only to the nursery's Google Sheet; they are not forwarded to Hunger at Home. The embedded page is `https://hungerathome.org/donate/`; it does not receive plant or contact details. The current page loads Hunger at Home's donation form through its Kindful provider and uses Stripe for card entry. Those providers may process browser data under their own privacy notices. The nursery does not verify donations or record donation amounts. Do not collect card details or retain donation receipts.

### Configure the private Google Sheet endpoint

1. Keep the Google Sheet private. Create or use a spreadsheet you control and copy its spreadsheet ID from its URL.
2. At [script.google.com](https://script.google.com/), create or open an Apps Script project and replace the old Forms script with [`google-sheets-tracker.gs`](./google-sheets-tracker.gs).
3. In Apps Script **Project Settings → Script properties**, add `DONATION_SPREADSHEET_ID` with your spreadsheet ID as its value. Do not put this ID in the public website.
4. Run `setupDonationSheet` and approve the requested Sheets access. It creates or checks a **Donations** tab with columns for Visitor ID, Name, Phone number, Email address, Plant id, and Submitted at (date and time). If the tab has the previous six-column header including **In honor/memory of**, setup removes that column and its values before adding the timestamp column. Existing rows get the new header but no historical timestamp.
5. To publish for the first time, choose **Deploy → New deployment → Web app**. If an earlier version is already deployed, choose **Deploy → Manage deployments → Edit**, select **New version**, and deploy the update. In either case, set it to **Execute as me** and access **Anyone** so visitors can submit without signing in. Copy the public `/exec` URL. This public endpoint accepts form submissions, so keep the spreadsheet private and monitor submissions for spam. The script validates fields and includes a honeypot, but a public endpoint cannot establish that a submitted identity is genuine. The Submitted at timestamp uses the spreadsheet's timezone.
6. Copy the web app `/exec` URL into `DONATION_TRACKER_URL` in [`plant.html`](./plant.html), then publish the site.
7. Publish the updated Apps Script as a new deployment version; its response must be allowed to load in the hidden iframe and send the save result to the plant page. Test a submission using non-sensitive test details and verify the row appears in the **Donations** tab and the embedded donation page appears only after the row is recorded. Remove the test row afterward.

The generated Visitor ID distinguishes a browser-tab session, not a verified person. Phone and email are optional; the donor's name and consent are required. Tell visitors these details are stored in the nursery's Sheet for pickup coordination, restrict Sheet access to people who need it, and delete records when they are no longer needed. Existing Google Forms created by the previous setup are not used by this flow; stop accepting responses or remove those forms separately in your Google account if desired. No credentials or private Sheet IDs belong in this repository.

## Website analytics

The site includes the Google Tag Manager container `GTM-TRGRJS7Z`. Its script loads only after a visitor chooses **Accept analytics**. Visitors can reject analytics or change their choice later using **Privacy settings**. Rejecting after acceptance revokes analytics consent and reloads the page so the container is no longer active.

To collect GA4 reports, configure a Google tag and GA4 event tags in the GTM account for this container. The site pushes these custom events to the data layer after consent:

- `view_plant_catalog`
- `view_plant_category` (with category name)
- `view_plant_detail` (with plant ID)
- `enlarge_plant_photo` (with plant ID and photo index)
- `pickup_details_submit_attempt` (with plant ID; this is not proof of a successful save or donation)

Page views require a Google tag configured in GTM. Custom events require corresponding GA4 Event tags and Custom Event triggers in GTM. The site does not send names, phone numbers, email addresses, form contents, or the pickup form's Visitor ID to analytics. Review tags configured in GTM before publishing; the container can run any tags enabled in that account.

### Adding plant photos

Add image filenames to a plant's `pictures` property in `plants.json`; it may be an array or an object whose values are image paths. The plant detail page displays every listed image in a responsive gallery. Upload or copy the image files into the `pictures/` directory, then use paths relative to `plant.html` such as `pictures/yellow-rose-1.jpg`. Publish both the JSON and image files. Missing or unreadable images are omitted from the gallery.

### Adding market comparisons

For a plant with a relevant market example, add a `marketReference` object in `plants.json` with `text` and `url` fields. The plant page displays it as “Similar options elsewhere” with a link to the example listing; plants without this data omit the comparison.
