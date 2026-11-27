# Receipt register (Google Sheet + Apps Script)

The website's **founding member** form and **donation** form send each submission to a Google Sheet.

1. Each submission becomes a row, with a reference number like `FM-261127-K7QD` or `DN-261127-K7QD`.
2. If the person gave an email, an **acknowledgement** goes out within a minute. It says clearly that it is not a receipt. The row's **WhatsApp** column also gets a **Send thank-you** link.
3. When the money is in the bank (or cash is in hand), staff look at the two **yellow** cells on that row, amount and UTR, which are already filled in from the form, and correct them if needed. Then they tick the **green** box, **③ Tick to send receipt**.
4. That makes a numbered **PDF receipt**, such as `GGF/2026-27/0001`, saves it in Drive, and emails it if the row has an email. The WhatsApp link changes to **Send receipt on WhatsApp**: one click opens WhatsApp to the person's number with the receipt link typed in. The row turns pale green. If something is missing, the box unticks itself and a message says what to fill in.

To make the WhatsApp link open on the person's phone, each receipt PDF (only that file, not the folder) can be viewed by anyone who has the link.

Receipt numbers run from 0001 in each financial year (April to March) and never repeat. Founding-member payments are accepted by bank transfer only. The script also refuses cash of ₹2 lakh or more from one person (section 269ST).

While `DEMO: true` is set at the top of `Code.gs`, every email and receipt is stamped **SAMPLE**, and numbers look like `GGF/DEMO/2026-27/0001`.

## One-time setup (about 10 minutes)

Do this signed in to the **foundation's own Google account**, because emails are sent from the account that owns the script.

1. Go to [sheets.new](https://sheets.new) and name the sheet **GGF receipt register**.
2. Choose **Extensions → Apps Script**. Delete what is in `Code.gs` and paste in the whole of [`Code.gs`](./Code.gs). Save.
3. In the function menu at the top, pick **setup** and press **Run**. It names the file **GGF Receipt Register**, lays out and colours the columns, and turns on the tick box. Google asks for permission to use Sheets, Gmail and Drive. Choose the account, then **Advanced → Go to project (unsafe) → Allow**. This warning is normal for your own scripts.
4. Choose **Deploy → New deployment**, click the gear, and pick **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   Press **Deploy** and copy the **Web app URL** (it ends in `/exec`).
5. Put that URL in `DEFAULT_ENDPOINT` in `src/lib/receipts.ts` (or set it as the environment variable `NEXT_PUBLIC_RECEIPTS_ENDPOINT` in Vercel and Hostinger, which overrides it), then redeploy. Setting the variable to `off` puts the forms back in demo mode, where they send nothing.
6. Reload the sheet. Use **Receipts → Add a test donation row** to try the whole flow on yourself.

After pasting a new `Code.gs` later: Save, run **setup** again, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. That keeps the same URL. Skipping the new version leaves the website writing rows in the old layout.

## To fill in before going live

At the top of `Code.gs`:

| Setting | What to put |
|---|---|
| `ORG_EMAIL` | The foundation's email, used for replies and printed on receipts. Also replace `info@example.org` in `src/lib/content.ts`. |
| `SIGNATORY_NAME`, `SIGNATORY_TITLE` | Who signs receipts. |
| `EIGHTY_G_REG` | Set to GGF's PAN, which is its 80G reference. If the 80G approval letter (Form 10AC) gives a longer registration number, use that. It is printed on donation receipts only. Founding-member receipts say they are not 80G-eligible, and so do cash gifts above ₹2,000. |
| `MEMBER_PAYMENT_FOR` | What a founding member's payment to GGF covers. If members pay the land sellers directly, GGF only receipts what it receives itself. |
| `DEMO` | Set it to `false` when ready. Real numbering then starts at 0001. |

Then **Deploy → Manage deployments → Edit → New version**.
