/**
 * GGF receipt register: Google Sheet + Apps Script.
 *
 * What it does
 *  1. The website's founding-member and donation forms POST here (doPost). Each one becomes a row.
 *  2. If the person gave an email, an acknowledgement is emailed at once. It says clearly that it is NOT a receipt.
 *  3. When the money is confirmed (bank statement, or cash at the office), staff check the two yellow
 *     cells on that row (amount and UTR) and tick the green "Send receipt" box. A numbered PDF receipt
 *     is made, saved in Drive, emailed to the person, and a "Send on WhatsApp" link appears on the row.
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
  // Receipt links look like https://rkpm.org/receipt/GGF-2026-27-0001-K7QD9XW2MA and open the PDF from the site.
  SITE_URL: 'https://rkpm.org',
};
// ──────────────────────────────────────────────────────────────────────────────────────────────

// The order staff see. The three steps come right after who the person is.
var AMOUNT = '① Amount received (check bank)';
var UTR = '② UTR (check bank statement)';
var TICK = '③ Tick to send receipt';
var WA = 'WhatsApp';
var COLUMNS = [
  'Reference', 'Name', 'Type', 'Phone', 'Email',
  AMOUNT, UTR, TICK, WA, 'Status',
  'Receipt no.', 'Receipt link', 'Receipt PDF', 'Receipt sent to', 'Receipt date', 'Acknowledgement', 'Received at',
  'Amount (stated)', 'Mode', 'UTR (stated)', 'Purpose', 'Donor PAN', 'Town or district', 'Wants to visit', 'Note', 'Language',
];
// Older registers used these names; setup() moves their data into the new columns.
var OLD_NAMES = { 'Amount received': AMOUNT, 'UTR / reference (confirmed)': UTR, 'WhatsApp receipt': WA };
var HEADER_NOTES = {};
HEADER_NOTES[AMOUNT] = 'Filled in from the form. Change it if the bank or cash amount is different.';
HEADER_NOTES[UTR] = 'Filled in from the form if the person gave one. Check it against the bank statement. Not needed for cash.';
HEADER_NOTES[TICK] = 'Tick only when the money is in the bank (or cash is in hand). The receipt is made and emailed at once, and a WhatsApp link appears next to it.';
HEADER_NOTES[WA] = 'Click to open WhatsApp with the message already typed. Before the receipt it sends a thank-you; after, the receipt.';
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
    // Anyone on the internet can post here, so cap it: 60 submissions an hour in all.
    if (overLimit('posts', 60, 3600)) return json({ ok: false, error: 'busy' });

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
    // Pre-fill the two cells staff check, so most rows need only the tick.
    row[AMOUNT] = row['Amount (stated)'];
    row[UTR] = row['UTR (stated)'];
    sheet.appendRow(COLUMNS.map(function (c) { return row[c] === undefined ? '' : row[c]; }));
    var r = sheet.getLastRow();
    // Phone numbers and UTRs stay text (no lost leading zeros, no scientific notation).
    sheet.getRange(r, COL['Phone']).setNumberFormat('@').setValue(row['Phone']);
    sheet.getRange(r, COL[TICK]).insertCheckboxes();

    // Acknowledgements go out from the foundation's Gmail, so nobody can use the form to flood an inbox:
    // one per address a day, 20 an hour in all, and never the last few of the daily Gmail quota.
    var mailBlocked = email && (overLimit('ack-' + email.toLowerCase(), 1, 86400) || overLimit('acks', 20, 3600) || MailApp.getRemainingDailyQuota() < 10);
    if (email && mailBlocked) {
      sheet.getRange(r, COL['Acknowledgement']).setValue('Not emailed (limit reached): use the WhatsApp link');
    } else if (email) {
      try {
        sendAcknowledgement(row);
        sheet.getRange(r, COL['Acknowledgement']).setValue('Emailed ' + fmtDateTime(new Date()));
      } catch (err) {
        sheet.getRange(r, COL['Acknowledgement']).setValue('Email failed: ' + err.message);
      }
    } else {
      sheet.getRange(r, COL['Acknowledgement']).setValue('No email: use the WhatsApp link');
    }
    setWhatsApp(sheet, r, row['Phone'], ackWhatsAppText(row), 'Send thank-you');
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// The website asks here for a receipt PDF (?r=<link id>), to serve it at rkpm.org/receipt/<link id>.
// Only ids this script issued are answered; the PDFs stay private in Drive.
// A plain browser visit shows that the web app is running.
function doGet(e) {
  var id = String((e && e.parameter && e.parameter.r) || '').toUpperCase();
  if (!id) return ContentService.createTextOutput('GGF receipt register is running.' + (CONFIG.DEMO ? ' (DEMO mode)' : ''));
  // Links carry 50 random bits, so guessing is hopeless; as a backstop, after 200 wrong ones in 10 minutes
  // every lookup is refused for a while. (The website also limits each visitor to 30 lookups in 10 minutes.)
  var cache = CacheService.getScriptCache();
  var misses = Number(cache.get('link-misses') || 0);
  if (misses >= 200) return json({ ok: false, busy: true });
  var fileId = /^[A-Z0-9-]{8,40}-[A-Z0-9]{10}$/.test(id) && PropertiesService.getScriptProperties().getProperty('link-' + id);
  if (!fileId) { cache.put('link-misses', String(misses + 1), 600); return json({ ok: false }); }
  var file = DriveApp.getFileById(fileId);
  return json({ ok: true, name: file.getName(), data: Utilities.base64Encode(file.getBlob().getBytes()) });
}

/** A link id: the receipt number plus 10 random characters, so links can't be guessed. */
function newLinkId(number) {
  var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + number + Date.now());
  for (var i = 0; i < 10; i++) s += a[(bytes[i] + 256) % a.length];
  return number.replace(/\//g, '-') + '-' + s;
}

// ─────────────────────────────────────── Sheet menu ───────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Receipts')
    .addItem('Send receipt for selected row', 'issueReceiptForSelectedRow')
    .addSeparator()
    .addItem('Add a test donation row', 'addTestDonation')
    .addItem('Set up the sheet (run once)', 'setup')
    .addToUi();
}

/**
 * Run once after pasting the code. Names the file, lays out and colours the Register, turns on the
 * "tick to send receipt" box, and makes the Drive folder. Safe to run again.
 */
function setup() {
  var ss = SpreadsheetApp.getActive();
  if (/^Untitled/i.test(ss.getName())) ss.rename('GGF Receipt Register');
  var sheet = getSheet();
  layout(sheet);
  getFolder();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onSheetEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(ss).onEdit().create();
  ss.toast('Ready. Tick the green box on a row to send its receipt.', 'Receipts', 8);
}

/** Runs on every edit (installed by setup). Ticking the green box sends that row's receipt. */
function onSheetEdit(e) {
  var range = e && e.range;
  if (!range || range.getSheet().getName() !== CONFIG.SHEET_NAME) return;
  if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;
  if (range.getColumn() !== COL[TICK] || range.getRow() < 2 || range.getValue() !== true) return;
  var sheet = range.getSheet();
  var result = issueReceipt(sheet, range.getRow());
  if (!result.ok && !result.already) range.setValue(false);
  range.setNote(result.ok ? '' : result.message);
  e.source.toast(result.message, result.ok ? 'Receipt sent' : 'Not sent yet', 12);
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
  if (result.ok) sheet.getRange(r, COL[TICK]).setValue(true);
  if (!result.whatsapp) { ui.alert(result.message); return; }
  // A small window with a button, because a plain alert cannot hold a link.
  var html = '<div style="font:14px/1.5 Arial,sans-serif;white-space:pre-wrap">' + esc(result.message) + '</div>' +
    '<p style="margin-top:18px"><a href="' + esc(result.whatsapp) + '" target="_blank" ' +
    'style="background:#1f8f4e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font:bold 14px Arial,sans-serif">Send on WhatsApp</a></p>';
  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(260), 'Receipt issued');
}

/** A wa.me link that opens WhatsApp to this phone number with the receipt message typed in. Empty if the number is unusable. */
function whatsappLink(phone, text) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
  if (digits.length === 10) digits = '91' + digits;
  if (digits.length < 11 || digits.length > 15) return '';
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
}

/** Puts a clickable "label" link in the WhatsApp column. Returns the link, or '' if the number can't be used. */
function setWhatsApp(sheet, r, phone, text, label) {
  var link = whatsappLink(phone, text);
  var cell = sheet.getRange(r, COL[WA]);
  if (link) cell.setFormula('=HYPERLINK("' + link.replace(/"/g, '""') + '","' + label + '")');
  else cell.setValue('No usable phone number');
  return link;
}

function ackWhatsAppText(row) {
  var member = row['Type'] === 'Founding member';
  return (CONFIG.DEMO ? '[SAMPLE] ' : '') + 'Namaskar ' + plain(row['Name']) + ', thank you. ' + CONFIG.ORG_NAME + ' has received your ' +
    (member ? 'founding member registration' : 'donation details') + '. Your reference is ' + row['Reference'] + '. ' +
    (member ? 'Someone from the foundation will call you soon.' : 'We will send your receipt once the gift reaches our account.');
}

/** Issues the receipt for one row. Returns { ok, message }. Kept separate from the UI so it can be tested. */
function issueReceipt(sheet, r) {
  var values = sheet.getRange(r, 1, 1, COLUMNS.length).getValues()[0];
  var v = {};
  COLUMNS.forEach(function (c, i) { v[c] = values[i]; });

  if (v['Receipt no.']) return { ok: false, already: true, message: 'This row already has receipt ' + v['Receipt no.'] + '. Nothing was done.' };
  if (v['Status'] === 'Not proceeding') return { ok: false, message: 'This row is marked "Not proceeding". Change its Status first.' };
  var amount = Math.floor(Number(String(v[AMOUNT]).replace(/[,\s₹]/g, '')) || 0);
  if (amount < 1) return { ok: false, message: 'Fill in the yellow "Amount received" cell first, then tick again.' };
  var isMember = v['Type'] === 'Founding member';
  var mode = isMember ? 'Bank transfer' : (v['Mode'] || 'Bank transfer');
  var utr = String(v[UTR] || '').trim();
  if (mode === 'Bank transfer' && !utr) return { ok: false, message: 'Fill in the yellow "UTR" cell from the bank statement, then tick again.' };
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
  // The PDF stays private. The person gets a link on the foundation's own site, which fetches it from here.
  var linkId = newLinkId(number);
  PropertiesService.getScriptProperties().setProperty('link-' + linkId, file.getId());
  var link = CONFIG.SITE_URL.replace(/\/$/, '') + '/receipt/' + linkId;
  var waText = (CONFIG.DEMO ? '[SAMPLE] ' : '') + 'Namaskar ' + v['Name'] + ', thank you. Your receipt ' + number +
    ' from ' + CONFIG.ORG_NAME + ' for ' + inr(amount) + ' is here: ' + link;

  var sentTo = '';
  if (EMAIL_RE.test(String(v['Email']))) {
    var subject = (CONFIG.DEMO ? '[SAMPLE] ' : '') + 'Your receipt ' + number + ' from ' + CONFIG.ORG_NAME;
    MailApp.sendEmail(mailOptions(v['Email'], subject, receiptEmailHtml(data), [pdf]));
    sentTo = v['Email'];
  }

  sheet.getRange(r, COL['Receipt no.']).setValue(number);
  sheet.getRange(r, COL['Receipt date']).setValue(now);
  sheet.getRange(r, COL['Receipt PDF']).setValue(file.getUrl());
  sheet.getRange(r, COL['Receipt link']).setValue(link);
  sheet.getRange(r, COL['Receipt sent to']).setValue(sentTo ? 'Emailed to ' + sentTo : 'No email: use the WhatsApp link');
  var wa = setWhatsApp(sheet, r, v['Phone'], waText, 'Send receipt on WhatsApp');
  sheet.getRange(r, COL['Status']).setValue('Receipt sent');

  return {
    ok: true,
    whatsapp: wa,
    message: 'Receipt ' + number + ' issued.\n\n' + (sentTo
      ? 'It was emailed to ' + sentTo + ' and saved in Drive.'
      : 'There is no email on this row.') + (wa
      ? '\n\nTo send it on WhatsApp, click "Send receipt on WhatsApp" in the WhatsApp column.'
      : '\n\nThe phone number could not be used for WhatsApp. The PDF link is in the "Receipt PDF" column.'),
  };
}

/** For trying the flow without the website: adds a donation row as if the form had been sent. */
function addTestDonation() {
  var me = Session.getActiveUser().getEmail();
  var ref = 'DN-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMdd') + '-TEST';
  doPost({ parameter: { kind: 'donation', ref: ref.slice(0, 10) + randomTail(), name: 'Test Donor', phone: '9864522165', email: me, amount: '1100', purpose: 'Gau seva (gaushala)', mode: 'Bank transfer', utr: '', lang: 'en' } });
  SpreadsheetApp.getActive().toast('Added a test row' + (me ? ' and emailed the acknowledgement to ' + me : '') + '. Its UTR is blank: type any number in the yellow UTR cell, then tick the green box.', 'Receipts', 10);
}

// ─────────────────────────────────────── Emails ───────────────────────────────────────

function sendAcknowledgement(row) {
  var member = row['Type'] === 'Founding member';
  var subject = (CONFIG.DEMO ? '[SAMPLE] ' : '') + (member ? "We've received your founding member registration" : "We've received your donation details") + ' (' + row['Reference'] + ')';
  var body = member
    ? '<p>Thank you for your interest in becoming a founding member of the proposed Shri Shri Radha-Krishna Prem Mandir. Your registration has reached ' + esc(CONFIG.ORG_NAME) + '. Someone from the foundation will call you to answer your questions and share the full details.</p>'
    : '<p>Thank you for your gift' + (row['Amount (stated)'] ? ' of <strong>' + inr(row['Amount (stated)']) + '</strong>' : '') + (row['Mode'] ? ' by ' + esc(String(row['Mode']).toLowerCase()) : '') + '. Your details have reached ' + esc(CONFIG.ORG_NAME) + '.</p>';
  var html = shell(
    '<p>Namaskar ' + esc(plain(row['Name'])) + ',</p>' + body +
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

/** The gold lotus logo (the site mark), small PNG so the receipt needs no outside files. */
var LOGO_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAAB4CAMAAACuCWxLAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGUExURf///9inWSWpdIgAAAABdFJOUwBA5thmAAAAAWJLR0QAiAUdSAAAAAd0SU1FB+oLGw8kE/XJlI4AAALDSURBVHja7ZhbduQgDESt/W968pOMbfQGPbqP6i+4kOoaYkiuazQajUaj0Wg0Go1Go/+CH51ydROAJrfO1U4AcnCNp6VATq6wNBWI0WVHW4GUXTT0FYAQXjQ0FgjhpeetBXx6+CY4sDxtr9/QaP7b4EfDYXT3oc+GW+keAx8Od1Fwb9/n6B76SYf9VJ12A+5a9+HrUXXaHbhrhcN9LULLRxT1awYWOG2zEDCm6Wv8DUf5XL1i2ZCm7zHKS8/NpQNRJ+BMXTLhsH2Izb5Im6lHNtz762+DM3UooXtcS9DZ66C5fPHqWeCqV40FXAetcGLBDDCCj3z12CT+RRF7NIuMbn4Crh4NSUCE5eEIezXZGgLPa4Jjyjaho7MJu1KcX4rHjclw0uzg8CA6kDEOzoN2ZF2BEW1dh95GfCL/Vox5/GD0fnsOKzozk+TT0AeoqbQU5BZPzSZV3uczFBOCCU1NJQ7RGesBcvAulfg+FJs3yVG49cqkWTqJzZ1DC6eH51+9Ao6uZcgjwqnceGeSjiuB9LQsio1Nf0zKW4StIa6TNYKGzTJHyKSEc5K5Lyv6eV46DduhiEJmH54O7gCa/Y55AI+hE9ki0awliIQinIPs0B/qlp7Aas/tzZSF57aGoaE5fHhOoztKLp7dlYBGpNmhc7CFkZ3CUxv8vQ/iaf6FY4Db65rF9/cItb4HFYXiyZi3Ttgu7LxdRtgSiWhMV+Rbj7jR2wU+u4CMba7eWh57DpmYWe10lywGvAdyG8rAVLn2VUcWDFjNFQZYzRNFWE0RRVidPYaxOm0EZXW20Wg0GgXrKw+5b72f7Ny9OhPuc/UkPMnVizCGrAHfbsC+gCcz9eKLSdKCLzRBKV5K6xq+xJ7ZeNlvM7Ffye9BTtO6D1h857JPc0b3QrIFL654CVpwhHK00BD1aH1SjEaj0Wg0Go1w/QO/yBZhp0Tb5QAAAABJRU5ErkJggg==';

/**
 * Optional letterhead: put an image named "letterhead" (PNG or JPG, A4 portrait) in the receipts Drive folder,
 * and every new receipt is printed on it. Without it, the receipt draws its own gold border and header.
 */
function letterheadDataUri() {
  var it = getFolder().getFiles();
  while (it.hasNext()) {
    var f = it.next();
    if (/^letterhead\.(png|jpe?g)$/i.test(f.getName())) {
      var b = f.getBlob();
      return 'data:' + b.getContentType() + ';base64,' + Utilities.base64Encode(b.getBytes());
    }
  }
  return '';
}

function receiptHtml(d) {
  var INK = '#2a2118', SOFT = '#6b5b48', GOLD = '#b07a35', LINE = '#dcc597', MID = '#101B29', IVORY = '#F2E5D0';
  var site = CONFIG.SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  var blank = '<span style="background:#fff1c7;border:1px dashed #c08a1e;padding:0 4px">to be filled in</span>';
  var letterhead = letterheadDataUri();
  var row = function (k, val) {
    return '<tr><td style="color:' + SOFT + ';padding:9px 16px 9px 0;border-bottom:1px solid #efe4cc;width:36%;vertical-align:top">' + k +
      '</td><td style="padding:9px 0;border-bottom:1px solid #efe4cc">' + val + '</td></tr>';
  };

  var header = letterhead
    // On his letterhead the header is printed in ink, inside the artwork's blank centre.
    ? '<div style="text-align:center">' +
      '<div style="font-size:25px;color:' + INK + '">' + esc(CONFIG.ORG_NAME) + '</div>' +
      '<div style="font-size:10.5px;color:' + SOFT + ';margin-top:6px;line-height:1.5">A Section 8 company · ' + esc(CONFIG.ORG_ADDRESS) + '<br>' + esc(CONFIG.ORG_IDS) + '</div></div>'
    : '<div style="background:' + MID + ';color:' + IVORY + ';text-align:center;padding:22px 26px 18px">' +
      '<img src="' + LOGO_PNG + '" width="78" style="display:block;margin:0 auto 10px">' +
      '<div style="font-size:27px;letter-spacing:0.5px">' + esc(CONFIG.ORG_NAME) + '</div>' +
      '<div style="font-size:10.5px;color:#d9c49a;margin-top:7px;line-height:1.55">A Section 8 company · ' + esc(CONFIG.ORG_ADDRESS) + '<br>' + esc(CONFIG.ORG_IDS) + '</div></div>';

  var title = CONFIG.DEMO
    ? '<div style="text-align:center;margin:20px 0 4px;font-size:15px;letter-spacing:5px;color:' + GOLD + '">SAMPLE RECEIPT</div>' +
      '<div style="text-align:center;margin:0 auto 4px;font-size:10.5px;color:#b3261e;letter-spacing:1px">DEMO ONLY · NOT A VALID RECEIPT</div>'
    : '<div style="text-align:center;margin:20px 0 4px;font-size:15px;letter-spacing:6px;color:' + GOLD + '">RECEIPT</div>';

  var meta = '<table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:12.5px"><tr>' +
    [['Receipt no.', d.number], ['Date', fmtDate(d.date)], ['Reference', d.ref]].map(function (m, i) {
      return '<td style="border:1px solid ' + LINE + ';padding:9px 12px;' + (i ? 'text-align:center' : '') + '"><div style="color:' + SOFT + ';font-size:10.5px;letter-spacing:1px">' +
        m[0].toUpperCase() + '</div><div style="font-weight:bold;margin-top:3px">' + esc(m[1]) + '</div></td>';
    }).join('') + '</tr></table>';

  var amount = '<table style="width:100%;border-collapse:collapse;margin-top:16px"><tr><td style="background:' + IVORY + ';border-left:4px solid ' + GOLD + ';padding:16px 20px">' +
    '<div style="color:' + SOFT + ';font-size:11px;letter-spacing:1.5px">RECEIVED WITH THANKS FROM</div>' +
    '<div style="font-size:20px;margin-top:3px">' + esc(d.name) + '</div>' +
    '<div style="color:' + SOFT + ';font-size:11px;letter-spacing:1.5px;margin-top:12px">THE SUM OF</div>' +
    '<div style="font-size:30px;color:' + MID + ';margin-top:2px">' + inr(d.amount) + '</div>' +
    '<div style="font-size:12.5px;color:' + SOFT + ';font-style:italic">' + rupeesInWords(d.amount) + '</div></td></tr></table>';

  var details = '<table style="width:100%;font-size:13.5px;margin-top:14px;border-collapse:collapse">' +
    row('Towards', esc(d.towards) + (d.towards === 'Founding membership' ? ': ' + blank : '')) +
    row('Mode of payment', esc(d.mode) + (d.utr ? '<br><span style="font-size:12px;color:' + SOFT + '">UTR ' + esc(d.utr) + '</span>' : '')) +
    (d.pan ? row('Donor PAN', esc(d.pan)) : '') +
    '</table>';

  var tax = '<div style="margin-top:16px;padding:10px 14px;border:1px solid ' + LINE + ';font-size:11.5px;color:' + INK + ';line-height:1.5">' + esc(taxLine(d)) + '</div>';

  var sign = '<table style="width:100%;margin-top:34px;font-size:11px"><tr>' +
    '<td style="color:' + SOFT + ';vertical-align:bottom;width:55%;line-height:1.55">Issued after the payment was confirmed in the foundation\'s account.<br>' +
    'With gratitude for your support.</td>' +
    '<td style="text-align:center;vertical-align:bottom"><div style="border-top:1px solid ' + INK + ';width:190px;margin:0 auto 5px"></div>' +
    (CONFIG.SIGNATORY_NAME ? esc(CONFIG.SIGNATORY_NAME) + (CONFIG.SIGNATORY_TITLE ? ', ' + esc(CONFIG.SIGNATORY_TITLE) : '') : 'Authorised signatory: ' + blank) +
    '<br><span style="color:' + SOFT + '">For ' + esc(CONFIG.ORG_NAME) + '</span></td></tr></table>';

  var footer = '<div style="margin-top:26px;padding-top:12px;border-top:1px solid ' + LINE + ';text-align:center;font-size:11px;color:' + SOFT + '">' +
    'Shri Shri Radha-Krishna Prem Mandir (proposed) · <b style="color:' + GOLD + '">' + esc(site) + '</b> · ' + esc(CONFIG.ORG_PHONE) +
    (CONFIG.ORG_EMAIL ? ' · ' + esc(CONFIG.ORG_EMAIL) : '') + '</div>';

  if (letterhead) return letterheadReceipt(d, letterhead, site, blank);

  var body = header + '<div style="padding:0 30px 26px">' + title + meta + amount + details + tax + sign + footer + '</div>';
  return '<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:Georgia,serif;color:' + INK + '">' +
    '<div style="border:2px solid ' + GOLD + ';padding:4px;margin:18px"><div style="border:1px solid ' + LINE + '">' + body + '</div></div></body></html>';
}

/**
 * The receipt on the foundation's letterhead (A4 at 794 x 1123 px), laid out like a formal 80G receipt:
 * text between the artwork's top lotus and bottom divider, signature and seal just above the divider,
 * the site line just below it, all clear of the corner peacocks.
 */
function letterheadReceipt(d, letterhead, site, blank) {
  var INK = '#231b13', SOFT = '#6f5d47', GOLD = '#a8722f', LINE = '#d6bd8a', SHADE = '#f6ead2';
  var cap = 'font-size:9.5px;letter-spacing:1.6px;color:' + SOFT;
  var abs = function (top, left, width, html) {
    return '<div style="position:absolute;z-index:1;top:' + top + 'px;left:' + left + 'px;width:' + width + 'px">' + html + '</div>';
  };
  var kind = d.member ? 'PAYMENT RECEIPT' : 'DONATION RECEIPT';

  var head = '<div style="text-align:center">' +
    '<div style="font-size:24px;letter-spacing:0.4px">' + esc(CONFIG.ORG_NAME) + '</div>' +
    '<div style="font-size:10px;color:' + SOFT + ';margin-top:5px;line-height:1.55">(A Section 8 company) · ' + esc(CONFIG.ORG_ADDRESS) + '</div>' +
    '</div>';

  var title = '<table style="width:100%;border-collapse:collapse;margin-top:16px"><tr>' +
    '<td style="width:28%;vertical-align:middle"><div style="border-top:1px solid ' + LINE + '"></div></td>' +
    '<td style="text-align:center;font-size:15px;font-weight:bold;letter-spacing:4px;color:' + GOLD + ';padding:0 12px;white-space:nowrap;vertical-align:middle">' + kind + '</td>' +
    '<td style="width:28%;vertical-align:middle"><div style="border-top:1px solid ' + LINE + '"></div></td></tr></table>' +
    (CONFIG.DEMO ? '<div style="text-align:center;font-size:9.5px;letter-spacing:1.5px;color:#a32a1f;margin-top:5px">SAMPLE · FOR DEMONSTRATION ONLY · NOT VALID</div>' : '');

  var meta = '<table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:12px"><tr>' +
    '<td><span style="' + cap + '">RECEIPT NO.</span><br><b style="font-size:13px">' + esc(d.number) + '</b></td>' +
    '<td style="text-align:right"><span style="' + cap + '">DATE</span><br><b style="font-size:13px">' + fmtDate(d.date) + '</b></td></tr></table>';

  var cell = 'border:1px solid ' + LINE + ';padding:8px 11px;font-size:12px;vertical-align:top';
  var tr = function (k, v) {
    return '<tr><td style="' + cell + ';background:' + SHADE + ';color:' + SOFT + ';width:34%">' + k + '</td><td style="' + cell + '">' + v + '</td></tr>';
  };
  var details = '<table style="width:100%;border-collapse:collapse;margin-top:12px">' +
    tr('Received with thanks from', '<b>' + esc(d.name) + '</b>') +
    (d.pan ? tr(d.member ? 'PAN' : 'Donor PAN', esc(d.pan)) : '') +
    tr(d.member ? 'Towards' : 'Purpose of donation', esc(d.towards) + (d.towards === 'Founding membership' ? ': ' + blank : '')) +
    tr('Mode of payment', esc(d.mode)) +
    (d.utr ? tr('Transaction reference (UTR)', esc(d.utr)) : '') +
    tr('Website reference', esc(d.ref)) +
    '</table>';

  var amount = '<table style="width:100%;border-collapse:collapse;margin-top:16px"><tr>' +
    '<td style="border:1.5px solid ' + GOLD + ';background:#fbf3e2;padding:10px 14px;width:34%;vertical-align:middle">' +
    '<div style="' + cap + '">AMOUNT</div><div style="font-size:24px;margin-top:2px">' + inr(d.amount) + '<span style="font-size:13px">.00</span></div></td>' +
    '<td style="border:1.5px solid ' + GOLD + ';border-left:none;background:#fbf3e2;padding:10px 14px;vertical-align:middle">' +
    '<div style="' + cap + '">AMOUNT IN WORDS</div><div style="font-size:12.5px;font-style:italic;margin-top:4px">' + rupeesInWords(d.amount) + '</div></td>' +
    '</tr></table>';

  var tax = '<table style="width:100%;border-collapse:collapse;margin-top:16px"><tr>' +
    '<td style="border-left:3px solid ' + GOLD + ';padding:6px 0 6px 12px;font-size:10.5px;line-height:1.6;color:' + INK + '">' +
    '<b>' + (d.member ? 'Please note' : 'Tax exemption under section 80G') + '.</b> ' + esc(taxLine(d)) + '<br>' +
    '<span style="color:' + SOFT + '">' + esc(CONFIG.ORG_IDS) + '</span></td></tr></table>' +
    '<div style="text-align:center;font-size:13px;font-style:italic;color:' + GOLD + ';margin-top:26px">With heartfelt gratitude for your support of the Shri Shri Radha-Krishna Prem Mandir.</div>';

  var sign = '<table style="width:100%;border-collapse:collapse"><tr>' +
    '<td style="width:50%;vertical-align:bottom"><div style="width:84px;height:84px;border:1px dashed ' + LINE + ';border-radius:42px;text-align:center;font-size:9px;letter-spacing:1px;color:' + SOFT + ';line-height:84px">SEAL</div></td>' +
    '<td style="text-align:center;vertical-align:bottom;font-size:11px">' +
    '<div style="border-top:1px solid ' + INK + ';width:220px;margin:0 auto 5px"></div>' +
    (CONFIG.SIGNATORY_NAME ? '<b>' + esc(CONFIG.SIGNATORY_NAME) + '</b>' + (CONFIG.SIGNATORY_TITLE ? '<br>' + esc(CONFIG.SIGNATORY_TITLE) : '') : 'Authorised signatory: ' + blank) +
    '<br><span style="color:' + SOFT + '">For ' + esc(CONFIG.ORG_NAME) + '</span></td></tr></table>';

  var note = '<div style="text-align:center;font-size:9.5px;color:' + SOFT + ';font-style:italic">This is a computer-generated receipt, issued after the payment was confirmed in the foundation\'s account.</div>';

  var foot = '<div style="text-align:center;font-size:10.5px;color:' + SOFT + ';line-height:1.6">' +
    '<b style="color:' + GOLD + ';font-size:12.5px;letter-spacing:1.5px">' + esc(site) + '</b><br>' + esc(CONFIG.ORG_PHONE) +
    (CONFIG.ORG_EMAIL ? ' · ' + esc(CONFIG.ORG_EMAIL) : '') + '</div>';

  return '<html><head><meta charset="utf-8"></head><body style="margin:0;font-family:Georgia,\'Times New Roman\',serif;color:' + INK + '">' +
    '<div style="position:relative;width:794px;height:1123px;overflow:hidden">' +
    '<img src="' + letterhead + '" style="position:absolute;top:0;left:0;width:794px;height:1123px;z-index:0">' +
    abs(190, 100, 594, head + title + meta + details + amount + tax) +
    abs(790, 130, 534, sign) +
    abs(918, 190, 414, note) +
    abs(976, 247, 300, foot) +
    '</div></body></html>';
}

// ─────────────────────────────────────── Helpers ───────────────────────────────────────

/** The 80G line for a receipt. Founding-member payments are not donations; cash gifts above ₹2,000 do not qualify. */
function taxLine(d) {
  if (d.member) return 'This is a founding-member payment, not a donation, and is not eligible for deduction under section 80G.';
  if (d.mode !== 'Bank transfer' && d.amount > 2000) return 'Cash donations above ₹2,000 are not eligible for deduction under section 80G.';
  return 'This donation is eligible for deduction under section 80G of the Income Tax Act, 1961. 80G registration: ' + CONFIG.EIGHTY_G_REG + '.';
}

/** The Register tab, with its columns in the current order (older layouts are converted first). */
function getSheet() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME, 0);
  var width = Math.max(sheet.getLastColumn(), 1);
  var have = sheet.getLastRow() ? sheet.getRange(1, 1, 1, width).getValues()[0] : [];
  if (have.slice(0, COLUMNS.length).join('|') !== COLUMNS.join('|')) {
    convertLayout(sheet, have);
    layout(sheet);
  }
  return sheet;
}

/** Rewrites the tab in the current column order, keeping every row's data (and links) by column name. */
function convertLayout(sheet, have) {
  var rows = [];
  var last = sheet.getLastRow();
  if (last >= 2 && have.length) {
    var range = sheet.getRange(2, 1, last - 1, have.length);
    var values = range.getValues(), formulas = range.getFormulas();
    rows = values.map(function (vals, i) {
      var byName = {};
      have.forEach(function (h, j) {
        var name = OLD_NAMES[h] || h;
        if (name) byName[name] = formulas[i][j] || vals[j];
      });
      if (!byName[AMOUNT]) byName[AMOUNT] = byName['Amount (stated)'];
      if (!byName[UTR]) byName[UTR] = byName['UTR (stated)'];
      return COLUMNS.map(function (c) { return byName[c] === undefined ? '' : byName[c]; });
    });
  }
  sheet.clear();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  if (rows.length) {
    sheet.getRange(2, COL['Phone'], rows.length, 1).setNumberFormat('@');
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
  }
}

/** Colours, notes, checkboxes and dropdowns. Safe to run again. */
function layout(sheet) {
  var n = 1000;
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#f4eee2').setWrap(true).setVerticalAlignment('middle');
  sheet.setRowHeight(1, 46);
  sheet.getRange(1, COL[AMOUNT], 1, 2).setBackground('#ffe58a');
  sheet.getRange(1, COL[TICK]).setBackground('#8fd19e');
  sheet.getRange(1, COL[WA]).setBackground('#c6efce');
  // Details nobody needs to touch are greyed.
  sheet.getRange(1, COL['Receipt no.'], 1, COLUMNS.length - COL['Receipt no.'] + 1).setBackground('#ece9e3').setFontColor('#6b5b48');
  Object.keys(HEADER_NOTES).forEach(function (k) { sheet.getRange(1, COL[k]).setNote(HEADER_NOTES[k]); });

  sheet.getRange(2, COL[AMOUNT], n, 2).setBackground('#fff6cc');
  sheet.getRange(2, COL[UTR], n, 1).setNumberFormat('@');
  sheet.getRange(2, COL['UTR (stated)'], n, 1).setNumberFormat('@');
  sheet.getRange(2, COL[TICK], n, 1).setBackground('#e3f4e6').setHorizontalAlignment('center');
  // Checkboxes only on rows that exist: an empty checkbox counts as data and would push new rows down.
  if (sheet.getLastRow() >= 2) sheet.getRange(2, COL[TICK], sheet.getLastRow() - 1, 1).insertCheckboxes();
  sheet.getRange(2, COL['Status'], n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());

  // A row whose receipt has gone out turns pale green.
  var all = sheet.getRange(2, 1, n, COLUMNS.length);
  var statusCol = String.fromCharCode(64 + COL['Status']);
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$' + statusCol + '2="Receipt sent"').setBackground('#e6f4ea').setRanges([all]).build(),
  ]);
  sheet.setColumnWidth(COL['Reference'], 130);
  sheet.setColumnWidth(COL['Name'], 170);
  sheet.setColumnWidths(COL[AMOUNT], 2, 150);
  sheet.setColumnWidth(COL[TICK], 110);
  sheet.setColumnWidth(COL[WA], 190);
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
/**
 * Trims and shortens what a visitor typed, and makes sure the Sheet stores it as plain text:
 * a value starting with = + - @ (or a tab / line break) would otherwise run as a formula.
 */
function clip(v, n) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n);
  return /^[=+\-@\t\r\n]/.test(s) ? "'" + s : s;
}
/** The visitor's value without the apostrophe clip() may add (for emails, links and checks, not for the Sheet). */
function plain(v) { return String(v == null ? '' : v).replace(/^'/, ''); }

/** Counts events in a time window; returns true once the limit is passed. */
function overLimit(key, limit, seconds) {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), seconds);
  return n > limit;
}
function esc(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function randomTail() {
  var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
  for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}
