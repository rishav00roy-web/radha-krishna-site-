# Donation sheet: setting it up

This connects rkpm.org to a Google Sheet in the foundation's Google account. Each money donation (from the Donate page) and each land offer (from the "Become a founding member" page) arrives as a row in the sheet, and the foundation gets an email about it. When someone ticks **Verified**, the donor is emailed a PDF receipt, and the row gets a **Send on WhatsApp** link that sends the same receipt on WhatsApp.

It takes about 15 minutes and costs nothing.

## 1. Choose the Google account

The sheet can live in any Google account. Starting with your own and moving it to the foundation's later is fine (see **Moving to another Google account** below).

- Receipts are emailed from the account that owns the sheet, so donors see that address as the sender. The sender name is "Gousamuh Gramaya Foundation", and replies go to gokulgramaya@gmail.com.
- New-entry alerts go to the account that owns the sheet.
- The receipt itself always shows the foundation's details, not the account's.

## 2. Make the sheet and add the script

1. Go to [sheets.new](https://sheets.new) to make a new spreadsheet. Name it **GGF donations**.
2. Choose **Extensions → Apps Script**. A new tab opens.
3. Delete everything in the `Code.gs` box. Paste in the whole of [`google-sheet/Code.gs`](./Code.gs) from this repository. On GitHub, open the file and use **Copy raw file**.
4. Click the save icon. If asked, name the project **GGF donations**.

## 3. Run the setup once

1. In the bar above the code, pick **setup** in the function list, then click **Run**.
2. Google asks for permission. Click **Review permissions** and choose the foundation's account.
3. Google may warn that it **hasn't verified this app**. That is normal for a script you wrote yourself. Click **Advanced**, then **Go to GGF donations (unsafe)**, then **Allow**.

   The script asks for permission to:
   - edit this spreadsheet
   - make the receipts folder and save PDFs in Google Drive
   - send email as you (the receipts and the new-entry alerts)
   - run when the sheet is edited (to notice the Verified tick)
4. Go back to the spreadsheet tab and reload it. It now has two tabs, **Donations** and **Founding members**, and a **GGF receipts** menu. A **GGF donation receipts** folder appears in Google Drive.

## 4. Put the sheet online for the website

1. Back in Apps Script, click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Fill in:
   - Description: `rkpm.org donate form`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** and copy the **Web app URL**. It starts with `https://script.google.com/macros/s/` and ends with `/exec`.

"Anyone" means the website can send entries to the sheet. It does not let anyone read the sheet. Only people you share the spreadsheet with can see it.

## 5. Connect the website

Put the URL in `src/lib/content.ts`:

```ts
export const donationSheetUrl: string | null = "https://script.google.com/macros/s/…/exec";
```

Commit it and let Hostinger redeploy. Until this is set, the form still works the old way: it opens the donor's email app or WhatsApp with the details filled in.

## 6. Test it

1. On rkpm.org/en/donate, fill in the form with your own details. Use a small amount and your own email.
2. A new row appears in **Donations**, and an alert arrives in the inbox of the account that owns the sheet.
3. Tick **Verified** on that row. Within a few seconds:
   - **Receipt no.** fills in (for example `GGF/2026-27/0001`)
   - **Receipt status** says "Emailed …"
   - the PDF arrives in your inbox
   - **Receipt PDF** links to the copy in Drive
4. Tap **Send on WhatsApp** in the row. WhatsApp opens with the receipt typed out for the donor. Press send.

Delete the test row afterwards. Receipt numbers carry on from the last one used, so the first real receipt will be 0002. That is fine.

## Using it day to day

**Money**
- A new row means a donor says they have paid. Check the bank statement for the amount, date and UTR. For cash, count it first.
- Once the money is really there, tick **Verified**. The donor gets the receipt by email. Then tap **Send on WhatsApp** in the row.
- If the money never arrived, leave Verified unticked and write in **Note**. No receipt goes out.
- To send a receipt again, select the row and choose **GGF receipts → Resend receipt for selected rows**. The receipt number stays the same.
- Don't delete rows that have a receipt number. Write a note instead, so the numbers stay accounted for.
- Receipt numbers restart at 0001 every April (2026-27, 2027-28 and so on).

**Founding members (land)**
- Land offers from the "Become a founding member" page go to the **Founding members** tab. There is no receipt, because land is only given through a registered deed.
- Use **Message on WhatsApp** to contact them. Track progress in **Status**: New, Contacted, Papers checked, Deed registered or Not going ahead.

**Privacy**
- The sheet holds donors' phone numbers, addresses and PAN numbers. Share it only with the people who handle donations.

## Moving to another Google account

For example, from your own account to gokulgramaya@gmail.com:

1. In the current sheet, choose **Share** and add the new account as an editor.
2. Signed in as the new account, open the sheet and choose **File → Make a copy**. The copy keeps all the rows and the script.
3. In the copy, do steps 3 and 4 again: run **setup**, then **Deploy → New deployment → Web app**. You get a new web-app URL.
4. Put the new URL in `donationSheetUrl` in `src/lib/content.ts` and redeploy the site.
5. In the old account, remove the old deployment (**Deploy → Manage deployments → Archive**), so nothing more arrives there.

Receipt numbers carry on from the highest number already in the copy, so there are no duplicates.

## Good to know

- A free Gmail account can send about 100 emails a day from a script. That covers receipts plus new-entry alerts. To stop the alerts, set `notifyNewEntries: false` in `CONFIG` at the top of the script. To send them somewhere other than the owner's inbox, put an address in `alertsTo`.
- The foundation's details on the receipt (address, phone, CIN, PAN) are in `CONFIG` at the top of the script. If they change, edit them there.
- **After changing the script:** choose **Deploy → Manage deployments**, click the pencil, set Version to **New version**, then **Deploy**. The web-app URL stays the same.
- The receipt states that the foundation is not registered under Section 80G. If it registers later, change `taxNote` in `CONFIG` and add the 80G registration number to the receipt.
