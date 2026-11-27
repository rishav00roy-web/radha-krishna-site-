/**
 * GGF receipt register: Google Sheet + Apps Script.
 *
 * What it does
 *  1. The website's founding-member and donation forms POST here (doPost). Each one becomes a row.
 *  2. If the person gave an email, an acknowledgement is emailed at once. It says clearly that it is NOT a receipt.
 *  3. When the money is confirmed (bank statement, or cash at the office), staff fill in "Amount received"
 *     (and the UTR for a transfer) on that row, set Status to "Received", select the row and choose
 *     Receipts → Issue receipt for selected row. A numbered PDF receipt is made, saved in Drive,
 *     emailed to the person, and its number and link are written on the row.
 *
 * Setup: see receipts/README.md. Emails are sent from the Google account that owns this script,
 * so it should be the foundation's own account.
 */

// ─────────────────────────── Fill these in (the foundation's answers) ───────────────────────────
var CONFIG = {
  // While true, every email and receipt is marked SAMPLE / DEMO and receipt numbers start GGF/DEMO/.
  DEMO: true,

  ORG_NAME: 'Gousamuh Gramaya Foundation',
  ORG_ADDRESS: 'Horucharai Ali, Pulibor, P.O. Probotia, Jorhat – 785006, Assam, India',
  ORG_PHONE: '9864522165',
  ORG_IDS: 'CIN U72200AS2025NPL027736 · PAN AALCG8370M · CSR Reg. CSR00091344 · NGO Darpan AS/2025/0586563',
  ORG_EMAIL: '',            // TO FILL: the foundation's email, used as reply-to and printed on receipts
  SIGNATORY_NAME: '',       // TO FILL: who signs receipts, e.g. the CEO's name
  SIGNATORY_TITLE: '',      // TO FILL: their title
  // GGF holds 80G; its 80G reference is the PAN (Rishav, 2026-11-27). If the 80G approval (Form 10AC) gives a
  // longer registration number, put it here. Printed on donation receipts only, never on founding-member receipts,
  // and not on cash gifts above ₹2,000 (those do not qualify).
  EIGHTY_G_REG: 'AALCG8370M',
  MEMBER_PAYMENT_FOR: '',   // TO FILL: what a founding member's payment to GGF covers (e.g. "site development")
  RECEIPT_PREFIX: 'GGF',    // receipt numbers look like GGF/2026-27/0001 (GGF/DEMO/... while DEMO is true)
  DRIVE_FOLDER: 'GGF receipts',
  SHEET_NAME: 'Register',
  WHATSAPP: '919864522165',
};
// ──────────────────────────────────────────────────────────────────────────────────────────────

var COLUMNS = [
  'Received at', 'Reference', 'Type', 'Name', 'Phone', 'Email', 'Town or district', 'Wants to visit',
  'Amount (stated)', 'Purpose', 'Mode', 'UTR (stated)', 'Donor PAN', 'Note', 'Language', 'Acknowledgement',
  'Status', 'Amount received', 'UTR / reference (confirmed)', 'Receipt no.', 'Receipt date', 'Receipt PDF', 'Receipt sent to',
];
var STATUSES = ['New', 'Contacted', 'Received', 'Receipt sent', 'Not proceeding'];
var COL = {};
COLUMNS.forEach(function (c, i) { COL[c] = i + 1; });

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ─────────────────────────────────────── Web app ───────────────────────────────────────

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = (e && e.parameter) || {};
    var kind = p.kind === 'member' ? 'member' : p.kind === 'donation' ? 'donation' : '';
    var ref = clip(p.ref, 24);
    if (!kind || !/^(FM|DN)-\d{6}-[A-Z0-9]{4}$/.test(ref)) return json({ ok: false, error: 'bad request' });
    if (p.website) return json({ ok: true }); // honeypot: bots fill every field

    var sheet = getSheet();
    if (findRow(sheet, ref)) return json({ ok: true, duplicate: true });

    var email = clip(p.email, 160);
    if (email && !EMAIL_RE.test(email)) email = '';
    var amount = Math.floor(Number(p.amount) || 0);
    var row = {
      'Received at': new Date(),
      'Reference': ref,
      'Type': kind === 'member' ? 'Founding member' : 'Donation',
      'Name': clip(p.name, 120),
      'Phone': clip(p.phone, 20),
      'Email': email,
      'Town or district': clip(p.place, 120),
      'Wants to visit': clip(p.visit, 5),
      'Amount (stated)': amount || '',
      'Purpose': clip(p.purpose, 80),
      'Mode': clip(p.mode, 40),
      'UTR (stated)': clip(p.utr, 40),
      'Donor PAN': /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clip(p.pan, 10).toUpperCase()) ? clip(p.pan, 10).toUpperCase() : '',
      'Note': clip(p.note, 1000),
      'Language': clip(p.lang, 4),
      'Acknowledgement': '',
      'Status': 'New',
    };
    sheet.appendRow(COLUMNS.map(function (c) { return row[c] === undefined ? '' : row[c]; }));
    var r = sheet.getLastRow();
    // Phone numbers and UTRs stay text (no lost leading zeros, no scientific notation).
    sheet.getRange(r, COL['Phone']).setNumberFormat('@').setValue(row['Phone']);

    if (email) {
      try {
        sendAcknowledgement(row);
        sheet.getRange(r, COL['Acknowledgement']).setValue('Emailed ' + fmtDateTime(new Date()));
      } catch (err) {
        sheet.getRange(r, COL['Acknowledgement']).setValue('Email failed: ' + err.message);
      }
    } else {
      sheet.getRange(r, COL['Acknowledgement']).setValue('No email: reply on WhatsApp');
    }
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// A browser visit to the web app URL shows that it is running.
function doGet() {
  return ContentService.createTextOutput('GGF receipt register is running.' + (CONFIG.DEMO ? ' (DEMO mode)' : ''));
}

// ─────────────────────────────────────── Sheet menu ───────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Receipts')
    .addItem('Issue receipt for selected row', 'issueReceiptForSelectedRow')
    .addSeparator()
    .addItem('Add a test donation row', 'addTestDonation')
    .addItem('Set up the sheet', 'setup')
    .addToUi();
}

/** Creates the Register tab, its headers, the Status dropdown and the Drive folder. Safe to run again. */
function setup() {
  getSheet();
  getFolder();
  SpreadsheetApp.getActive().toast('Register is ready.', 'Receipts', 5);
}

function issueReceiptForSelectedRow() {
  var ui = SpreadsheetApp.getUi();
  var sheet = getSheet();
  var range = sheet.getActiveRange();
  var r = range ? range.getRow() : 0;
  if (sheet.getName() !== CONFIG.SHEET_NAME || r < 2) {
    ui.alert('Select a row on the "' + CONFIG.SHEET_NAME + '" tab first.');
    return;
  }
  var result = issueReceipt(sheet, r);
  ui.alert(result.message);
}

/** Issues the receipt for one row. Returns { ok, message }. Kept separate from the UI so it can be tested. */
function issueReceipt(sheet, r) {
  var values = sheet.getRange(r, 1, 1, COLUMNS.length).getValues()[0];
  var v = {};
  COLUMNS.forEach(function (c, i) { v[c] = values[i]; });

  if (v['Receipt no.']) return { ok: false, message: 'This row already has receipt ' + v['Receipt no.'] + '. Nothing was done.' };
  if (v['Status'] !== 'Received') return { ok: false, message: 'Set Status to "Received" once the money is confirmed, then try again.' };
  var amount = Math.floor(Number(String(v['Amount received']).replace(/[,\s₹]/g, '')) || 0);
  if (amount < 1) return { ok: false, message: 'Fill in "Amount received" (the amount confirmed in the bank or in cash).' };
  var isMember = v['Type'] === 'Founding member';
  var mode = isMember ? 'Bank transfer' : (v['Mode'] || 'Bank transfer');
  var utr = String(v['UTR / reference (confirmed)'] || '').trim();
  if (mode === 'Bank transfer' && !utr) return { ok: false, message: 'Fill in "UTR / reference (confirmed)" from the bank statement.' };
  if (mode !== 'Bank transfer' && amount >= 200000) {
    return { ok: false, message: 'Cash of ₹2 lakh or more from one person is not allowed (section 269ST). No receipt was issued.' };
  }

  var now = new Date();
  var number = nextReceiptNumber(now);
  var data = {
    number: number, date: now, name: v['Name'], amount: amount, mode: mode, utr: utr, ref: v['Reference'], pan: v['Donor PAN'], member: isMember,
    towards: isMember ? ('Founding membership' + (CONFIG.MEMBER_PAYMENT_FOR ? ': ' + CONFIG.MEMBER_PAYMENT_FOR : '')) : (v['Purpose'] || 'Wherever it is most needed'),
  };
  var pdf = Utilities.newBlob(receiptHtml(data), MimeType.HTML, 'receipt.html')
    .getAs(MimeType.PDF)
    .setName(number.replace(/\//g, '-') + ' ' + v['Name'] + '.pdf');
  var file = getFolder().createFile(pdf);

  var sentTo = '';
  if (EMAIL_RE.test(String(v['Email']))) {
    var subject = (CONFIG.DEMO ? '[SAMPLE] ' : '') + 'Your receipt ' + number + ' from ' + CONFIG.ORG_NAME;
    MailApp.sendEmail(mailOptions(v['Email'], subject, receiptEmailHtml(data), [pdf]));
    sentTo = v['Email'];
  }

  sheet.getRange(r, COL['Receipt no.']).setValue(number);
  sheet.getRange(r, COL['Receipt date']).setValue(now);
  sheet.getRange(r, COL['Receipt PDF']).setValue(file.getUrl());
  sheet.getRange(r, COL['Receipt sent to']).setValue(sentTo || 'Not emailed: share the PDF on WhatsApp');
  sheet.getRange(r, COL['Status']).setValue('Receipt sent');

  return {
    ok: true,
    message: 'Receipt ' + number + ' issued.\n\n' + (sentTo
      ? 'It was emailed to ' + sentTo + ' and saved in Drive.'
      : 'There is no email on this row, so send the PDF on WhatsApp to ' + v['Phone'] + '. Its link is in the "Receipt PDF" column.'),
  };
}

/** For trying the flow without the website: adds a donation row as if the form had been sent. */
function addTestDonation() {
  var me = Session.getActiveUser().getEmail();
  var ref = 'DN-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMdd') + '-TEST';
  doPost({ parameter: { kind: 'donation', ref: ref.slice(0, 10) + randomTail(), name: 'Test Donor', phone: '9864522165', email: me, amount: '1100', purpose: 'Gau seva (gaushala)', mode: 'Bank transfer', utr: '', lang: 'en' } });
  SpreadsheetApp.getActive().toast('Added a test row' + (me ? ' and emailed the acknowledgement to ' + me : '') + '.', 'Receipts', 6);
}

// ─────────────────────────────────────── Emails ───────────────────────────────────────

function sendAcknowledgement(row) {
  var member = row['Type'] === 'Founding member';
  var subject = (CONFIG.DEMO ? '[SAMPLE] ' : '') + (member ? "We've received your founding member registration" : "We've received your donation details") + ' (' + row['Reference'] + ')';
  var body = member
    ? '<p>Thank you for your interest in becoming a founding member of the proposed Shri Shri Radha-Krishna Prem Mandir. Your registration has reached ' + esc(CONFIG.ORG_NAME) + '. Someone from the foundation will call you to answer your questions and share the full details.</p>'
    : '<p>Thank you for your gift' + (row['Amount (stated)'] ? ' of <strong>' + inr(row['Amount (stated)']) + '</strong>' : '') + (row['Mode'] ? ' by ' + esc(String(row['Mode']).toLowerCase()) : '') + '. Your details have reached ' + esc(CONFIG.ORG_NAME) + '.</p>';
  var html = shell(
    '<p>Namaskar ' + esc(row['Name']) + ',</p>' + body +
    '<p>Your reference number is <strong>' + esc(row['Reference']) + '</strong>. Please quote it when you contact us' + (member ? '' : ', and in your bank transfer remark') + '.</p>' +
    '<p style="background:#f4eee2;padding:10px 12px;border-radius:4px">This email is an acknowledgement, <strong>not a receipt</strong>. The foundation sends an official numbered receipt once ' +
    (member ? 'a payment reaches its account. Payments are made only by bank transfer, to an account the foundation confirms in writing.' : 'your gift reaches its account or is handed over at its office.') + '</p>'
  );
  MailApp.sendEmail(mailOptions(row['Email'], subject, html));
}

function receiptEmailHtml(d) {
  return shell(
    '<p>Namaskar ' + esc(d.name) + ',</p>' +
    '<p>' + esc(CONFIG.ORG_NAME) + ' has received <strong>' + inr(d.amount) + '</strong> from you, towards ' + esc(d.towards) + '. With thanks, your receipt <strong>' + esc(d.number) + '</strong> is attached.</p>' +
    '<p>Please keep it for your records.</p>'
  );
}

function shell(inner) {
  var demo = CONFIG.DEMO
    ? '<p style="border:2px dashed #c08a1e;background:#fff6dc;color:#5b3f0b;padding:10px 12px;border-radius:4px;margin:0 0 18px">SAMPLE: this message comes from the demo of the foundation\'s receipt system. It is not a real acknowledgement or receipt.</p>'
    : '';
  return '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#2a2118;max-width:560px">' + demo + inner +
    '<p>With gratitude,<br>' + esc(CONFIG.ORG_NAME) + '<br><span style="color:#6b5b48;font-size:14px">' + esc(CONFIG.ORG_ADDRESS) + ' · ' + esc(CONFIG.ORG_PHONE) + '</span></p></div>';
}

function mailOptions(to, subject, html, attachments) {
  var o = { to: to, subject: subject, htmlBody: html, name: CONFIG.ORG_NAME };
  if (CONFIG.ORG_EMAIL) o.replyTo = CONFIG.ORG_EMAIL;
  if (attachments) o.attachments = attachments;
  return o;
}

// ─────────────────────────────────────── Receipt PDF ───────────────────────────────────────

function receiptHtml(d) {
  var blank = '<span style="background:#fff1c7;border:1px dashed #c08a1e;padding:0 4px">to be filled in</span>';
  var row = function (k, val) {
    return '<tr><td style="color:#6b5b48;padding:7px 14px 7px 0;vertical-align:top;width:34%">' + k + '</td><td style="padding:7px 0">' + val + '</td></tr>';
  };
  return '<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:Georgia,serif;color:#2a2118">' +
    '<div style="border:1px solid #c9a24a;padding:5px;margin:24px"><div style="border:1px solid #e3cf9c;padding:28px 34px;position:relative">' +
    (CONFIG.DEMO ? '<div style="position:absolute;z-index:0;top:42%;left:0;right:0;text-align:center;font-size:64px;letter-spacing:8px;color:#f8e9e7">SAMPLE · DEMO</div>' : '') +
    '<div style="position:relative;z-index:1">' +
    '<div style="text-align:center;border-bottom:1px solid #e3cf9c;padding-bottom:14px">' +
    '<div style="font-size:26px">' + esc(CONFIG.ORG_NAME) + '</div>' +
    '<div style="font-size:11px;color:#6b5b48;margin-top:6px">A Section 8 company · ' + esc(CONFIG.ORG_ADDRESS) + '<br>' + esc(CONFIG.ORG_IDS) +
    (CONFIG.ORG_EMAIL ? ' · ' + esc(CONFIG.ORG_EMAIL) : '') + '</div>' +
    '<div style="font-size:15px;letter-spacing:3px;margin-top:12px">' + (CONFIG.DEMO ? '<span style="color:#b3261e">SAMPLE RECEIPT · NOT VALID</span>' : 'RECEIPT') + '</div></div>' +
    '<table style="width:100%;font-size:13px;margin-top:14px"><tr><td>Receipt no. <b>' + esc(d.number) + '</b></td><td style="text-align:right">Date <b>' + fmtDate(d.date) + '</b></td></tr></table>' +
    '<table style="width:100%;font-size:14px;margin-top:14px;border-collapse:collapse">' +
    row('Received with thanks from', '<b>' + esc(d.name) + '</b>') +
    row('Amount', '<b>' + inr(d.amount) + '</b><br><span style="font-size:12px">' + rupeesInWords(d.amount) + '</span>') +
    row('Towards', esc(d.towards) + (d.towards === 'Founding membership' ? ': ' + blank : '')) +
    row('Mode of payment', esc(d.mode) + (d.utr ? ', UTR ' + esc(d.utr) : '')) +
    (d.pan ? row('Donor PAN', esc(d.pan)) : '') +
    row('Website reference', esc(d.ref)) +
    '</table>' +
    '<table style="width:100%;margin-top:34px;border-top:1px solid #e3cf9c;font-size:11px"><tr>' +
    '<td style="color:#6b5b48;padding-top:12px;vertical-align:bottom;width:55%">Issued by ' + esc(CONFIG.ORG_NAME) + ' after the payment was confirmed.' +
    '<br>' + esc(taxLine(d)) + '</td>' +
    '<td style="text-align:center;padding-top:30px;vertical-align:bottom"><div style="border-top:1px solid #2a2118;width:180px;margin:0 auto 4px"></div>' +
    (CONFIG.SIGNATORY_NAME ? esc(CONFIG.SIGNATORY_NAME) + (CONFIG.SIGNATORY_TITLE ? ', ' + esc(CONFIG.SIGNATORY_TITLE) : '') : 'Authorised signatory: ' + blank) +
    '<br><span style="color:#6b5b48">For ' + esc(CONFIG.ORG_NAME) + '</span></td></tr></table>' +
    '</div></div></div></body></html>';
}

// ─────────────────────────────────────── Helpers ───────────────────────────────────────

/** The 80G line for a receipt. Founding-member payments are not donations; cash gifts above ₹2,000 do not qualify. */
function taxLine(d) {
  if (d.member) return 'This is a founding-member payment, not a donation, and is not eligible for deduction under section 80G.';
  if (d.mode !== 'Bank transfer' && d.amount > 2000) return 'Cash donations above ₹2,000 are not eligible for deduction under section 80G.';
  return 'This donation is eligible for deduction under section 80G of the Income Tax Act, 1961. 80G registration: ' + CONFIG.EIGHTY_G_REG + '.';
}

function getSheet() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME, 0);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#f4eee2');
    sheet.setFrozenRows(1);
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
    sheet.getRange(2, COL['Status'], 1000, 1).setDataValidation(rule);
    sheet.getRange(2, COL['UTR / reference (confirmed)'], 1000, 1).setNumberFormat('@');
    sheet.getRange(2, COL['UTR (stated)'], 1000, 1).setNumberFormat('@');
  }
  return sheet;
}

function getFolder() {
  var name = CONFIG.DRIVE_FOLDER + (CONFIG.DEMO ? ' (demo)' : '');
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function findRow(sheet, ref) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var refs = sheet.getRange(2, COL['Reference'], last - 1, 1).getValues();
  for (var i = 0; i < refs.length; i++) if (refs[i][0] === ref) return i + 2;
  return 0;
}

/** Numbers run 0001, 0002, ... within each financial year (April to March) and never repeat. */
function nextReceiptNumber(date) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var fy = financialYear(date);
    var props = PropertiesService.getScriptProperties();
    var key = 'receipt-' + (CONFIG.DEMO ? 'demo-' : '') + fy;
    var n = Number(props.getProperty(key) || 0) + 1;
    props.setProperty(key, String(n));
    return CONFIG.RECEIPT_PREFIX + (CONFIG.DEMO ? '/DEMO' : '') + '/' + fy + '/' + ('000' + n).slice(-4);
  } finally {
    lock.releaseLock();
  }
}

function financialYear(d) {
  var ist = new Date(Utilities.formatDate(d, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ss"));
  var y = ist.getMonth() >= 3 ? ist.getFullYear() : ist.getFullYear() - 1;
  return y + '-' + String(y + 1).slice(2);
}

var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function below1000(n) {
  var h = Math.floor(n / 100), r = n % 100;
  var rest = r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? ' ' + ONES[r % 10] : '');
  return [h ? ONES[h] + ' Hundred' : '', rest].filter(Boolean).join(' ');
}
function rupeesInWords(amount) {
  var n = Math.floor(Math.abs(amount));
  if (!n) return 'Rupees Zero Only';
  var parts = [];
  var crore = Math.floor(n / 1e7); n %= 1e7;
  var lakh = Math.floor(n / 1e5); n %= 1e5;
  var thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(below1000(crore) + ' Crore');
  if (lakh) parts.push(below1000(lakh) + ' Lakh');
  if (thousand) parts.push(below1000(thousand) + ' Thousand');
  if (n) parts.push(below1000(n));
  return 'Rupees ' + parts.join(' ') + ' Only';
}

function inr(n) {
  var s = String(Math.floor(Number(n) || 0));
  var last3 = s.slice(-3), rest = s.slice(0, -3);
  return '₹' + (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last3;
}
function fmtDate(d) { return Utilities.formatDate(d, 'Asia/Kolkata', 'd MMMM yyyy'); }
function fmtDateTime(d) { return Utilities.formatDate(d, 'Asia/Kolkata', 'd MMM yyyy, HH:mm'); }
function clip(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }
function esc(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function randomTail() {
  var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
  for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
