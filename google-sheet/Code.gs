/**
 * Gousamuh Gramaya Foundation: donation sheet for rkpm.org
 *
 * 1. rkpm.org sends two kinds of entry here, and the foundation gets an email about each:
 *    money donations from the Donate page go to the "Donations" tab, and land offers
 *    from the "Become a founding partner" page go to the "Founding partners" tab.
 * 2. When someone at GGF has found the money in the bank statement (or counted the
 *    cash), they tick "Verified" on that row. The script then gives it a receipt
 *    number (GGF/2026-27/0001 and so on, starting again each April), makes a PDF
 *    receipt, saves it in Drive, emails it to the donor, and puts a
 *    "Send on WhatsApp" link in the row. Tap the link to send the receipt on WhatsApp.
 * 3. Founding partners (people giving land) get no receipt: a gift of land is completed
 *    only by a registered deed. Use the Status column to keep track, and the WhatsApp
 *    link to contact them.
 *
 * Set-up steps are in google-sheet/SETUP.md in the website repository.
 * The foundation is not registered under Section 80G, so receipts make no tax claim.
 */

// ── Foundation details printed on every receipt. Edit here if anything changes. ──
const CONFIG = {
  orgName: 'Gousamuh Gramaya Foundation',
  orgShort: 'GGF',
  legalForm: 'A Section 8 company incorporated under the Companies Act, 2013',
  cin: 'U72200AS2025NPL027736',
  pan: 'AALCG8370M',
  address: 'Horucharai Ali, Pulibor, P.O. Probotia, Jorhat – 785006, Assam, India',
  phone: '+91 98645 22165',
  email: 'gokulgramaya@gmail.com',
  website: 'rkpm.org',
  project: 'Shri Shri Radha-Krishna Prem Mandir',
  receiptPrefix: 'GGF',
  receiptFolder: 'GGF donation receipts',
  taxNote:
    'Gousamuh Gramaya Foundation is not registered under Section 80G of the Income-tax Act, 1961, ' +
    'so this donation does not qualify for an income-tax deduction.',
  // Email the foundation about every new entry from the website.
  notifyNewEntries: true,
  timeZone: 'Asia/Kolkata',
  // More entries than this in one minute are refused, to stop a flood of junk.
  maxEntriesPerMinute: 30,
};

const MONEY_SHEET = 'Donations';
const LAND_SHEET = 'Founding partners';
const LAND_STATUSES = ['New', 'Contacted', 'Papers checked', 'Deed registered', 'Not going ahead'];

// [field from the website, column heading]. Columns are found by their heading,
// so they can be moved around in the sheet, but keep the headings as they are.
const MONEY_COLUMNS = [
  ['submitted', 'Submitted'],
  ['verified', 'Verified'],
  ['receiptNo', 'Receipt no.'],
  ['receiptDate', 'Receipt date'],
  ['receiptStatus', 'Receipt status'],
  ['whatsapp', 'WhatsApp receipt'],
  ['pdf', 'Receipt PDF'],
  ['name', 'Name'],
  ['relative', "Father's / spouse's name"],
  ['organisation', 'Organisation'],
  ['mobile', 'Phone'],
  ['email', 'Email'],
  ['address', 'Address'],
  ['district', 'District'],
  ['state', 'State'],
  ['pin', 'PIN'],
  ['pan', 'PAN'],
  ['method', 'Given by'],
  ['amount', 'Amount (Rs.)'],
  ['purpose', 'Purpose'],
  ['paidOn', 'Paid on'],
  ['paidFrom', 'Paid from'],
  ['reference', 'UTR / reference'],
  ['note', 'Note'],
  ['locale', 'Language'],
  ['id', 'ID'],
];

const LAND_COLUMNS = [
  ['submitted', 'Submitted'],
  ['status', 'Status'],
  ['contact', 'WhatsApp donor'],
  ['name', 'Name'],
  ['relative', "Father's / spouse's name"],
  ['organisation', 'Organisation'],
  ['mobile', 'Phone'],
  ['email', 'Email'],
  ['address', 'Address'],
  ['district', 'District'],
  ['state', 'State'],
  ['pin', 'PIN'],
  ['pan', 'PAN'],
  ['owner', 'Owner as in land records'],
  ['ownerRelation', 'Relation to owner'],
  ['landDistrict', 'Land: district'],
  ['circle', 'Revenue circle'],
  ['mouza', 'Mouza'],
  ['village', 'Village'],
  ['dag', 'Dag no.'],
  ['patta', 'Patta no.'],
  ['pattaType', 'Patta type'],
  ['bigha', 'Bigha'],
  ['katha', 'Katha'],
  ['lessa', 'Lessa'],
  ['landUse', 'Land type'],
  ['papers', 'Papers'],
  ['claims', 'Loan / dispute / claim'],
  ['note', 'Note'],
  ['locale', 'Language'],
  ['id', 'ID'],
];

// Fields kept as plain text so Sheets doesn't turn them into numbers or dates.
const TEXT_FIELDS = ['mobile', 'pin', 'pan', 'reference', 'dag', 'patta', 'paidOn', 'id', 'receiptNo'];

// Every field the website may send, with its longest allowed length.
const FIELDS = {
  kind: 10, name: 120, relative: 120, organisation: 160, mobile: 20, email: 200,
  address: 300, district: 80, state: 80, pin: 10, pan: 12,
  method: 40, amount: 12, purpose: 80, paidOn: 10, paidFrom: 120, reference: 60,
  owner: 200, ownerRelation: 60, landDistrict: 80, circle: 80, mouza: 80, village: 120,
  dag: 80, patta: 80, pattaType: 60, bigha: 10, katha: 10, lessa: 10, landUse: 60,
  papers: 200, claims: 20, note: 1000, locale: 5,
};

// ─────────────────────────────── Website entries ───────────────────────────────

/** The Donate form on rkpm.org posts here. Replies with {"ok": true} or {"ok": false, "error": "…"}. */
function doPost(e) {
  try {
    const raw = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    // A hidden field people never see. Bots fill it in; pretend all went well.
    if (raw.website) return reply_({ ok: true });
    if (!underRateLimit_()) return reply_({ ok: false, error: 'busy' });
    const entry = clean_(raw);
    const problem = validate_(entry);
    if (problem) return reply_({ ok: false, error: problem });

    entry.id = Utilities.getUuid().slice(0, 8);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      save_(entry);
    } finally {
      lock.releaseLock();
    }
    if (CONFIG.notifyNewEntries) {
      try {
        notifyFoundation_(entry);
      } catch (err) {
        console.error('Could not email the foundation: ' + err);
      }
    }
    return reply_({ ok: true });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return reply_({ ok: false, error: 'server' });
  }
}

/** Opening the web-app address in a browser shows this, which confirms it is deployed. */
function doGet() {
  return reply_({ ok: true, service: CONFIG.orgShort + ' donations' });
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function underRateLimit_() {
  const cache = CacheService.getScriptCache();
  const key = 'entries_' + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 120);
  return count <= CONFIG.maxEntriesPerMinute;
}

/** Keeps only known fields, trims them to length, and stops text being read as a spreadsheet formula. */
function clean_(raw) {
  const out = {};
  Object.keys(FIELDS).forEach(function (key) {
    let value = raw[key];
    if (Array.isArray(value)) value = value.join(', ');
    value = value === undefined || value === null ? '' : String(value);
    value = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, FIELDS[key]);
    out[key] = value;
  });
  out.kind = out.kind === 'Land' ? 'Land' : 'Money';
  out.pan = out.pan.toUpperCase();
  out.amount = out.kind === 'Money' ? Math.floor(Number(out.amount.replace(/[^\d.]/g, ''))) || 0 : '';
  return out;
}

/** Returns a short reason when an entry can't be saved, or '' when it is fine. */
function validate_(entry) {
  if (!entry.name) return 'name';
  if (!/^[6-9]\d{9}$/.test(mobileDigits_(entry.mobile))) return 'mobile';
  if (entry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(entry.email)) return 'email';
  if (entry.kind === 'Money') {
    if (!(entry.amount >= 1 && entry.amount <= 1e9)) return 'amount';
  } else if (!entry.owner || !entry.village || !entry.dag) {
    return 'land';
  }
  return '';
}

function save_(entry) {
  const ss = SpreadsheetApp.getActive();
  const land = entry.kind === 'Land';
  const columns = land ? LAND_COLUMNS : MONEY_COLUMNS;
  const sheet = ss.getSheetByName(land ? LAND_SHEET : MONEY_SHEET) || ensureSheet_(ss, land ? LAND_SHEET : MONEY_SHEET, columns);
  const at = headerIndex_(sheet);
  const row = new Array(sheet.getLastColumn()).fill('');
  const values = Object.assign({}, entry, { submitted: new Date(), status: land ? 'New' : '' });
  columns.forEach(function (c) {
    const col = at[c[1]];
    if (!col || !(c[0] in values)) return;
    row[col - 1] = cellValue_(c[0], values[c[0]]);
  });
  sheet.appendRow(row);
  const r = sheet.getLastRow();
  if (land) {
    sheet.getRange(r, at['Status']).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(LAND_STATUSES, true).build()
    );
    setLink_(sheet.getRange(r, at['WhatsApp donor']), 'Message on WhatsApp', whatsappUrl_(entry.mobile, landGreeting_(entry)));
  } else {
    sheet.getRange(r, at['Verified']).insertCheckboxes().setValue(false);
  }
}

/** What goes into a cell: plain text for words, a real number for the amount, a date for the time. */
function cellValue_(key, value) {
  if (value instanceof Date || typeof value === 'number') return value;
  value = String(value);
  // Text starting with = + - @ would be run as a formula; the leading ' keeps it as plain text.
  if (/^[=+\-@]/.test(value)) return "'" + value;
  if (TEXT_FIELDS.indexOf(key) !== -1 && value) return "'" + value;
  return value;
}

function notifyFoundation_(entry) {
  const land = entry.kind === 'Land';
  const subject = land
    ? 'New founding partner on rkpm.org: ' + entry.name + ' offers land in ' + entry.village + ' (dag ' + entry.dag + ')'
    : 'New donation on rkpm.org: Rs. ' + formatIndian_(entry.amount) + ' from ' + entry.name + ' (' + entry.method + ')';
  const columns = land ? LAND_COLUMNS : MONEY_COLUMNS;
  const lines = columns
    .filter(function (c) { return entry[c[0]] !== undefined && entry[c[0]] !== ''; })
    .map(function (c) { return c[1] + ': ' + entry[c[0]]; });
  const next = land
    ? 'Contact them about the land. Keep track with the Status column in the "' + LAND_SHEET + '" tab.'
    : 'When the money is in the bank (or the cash is counted), tick "Verified" on this row in the "' +
      MONEY_SHEET + '" tab. The receipt then goes to the donor.';
  MailApp.sendEmail({
    to: CONFIG.email,
    subject: subject,
    body: lines.join('\n') + '\n\n' + next + '\n\n' + SpreadsheetApp.getActive().getUrl(),
    name: CONFIG.orgName + ' website',
  });
}

// ──────────────────────────────────── Receipts ────────────────────────────────────

/**
 * Runs on every edit (installed by setup). Ticking "Verified" on a row in the
 * Donations tab sends that row's receipt, once.
 */
function onVerifiedTicked(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== MONEY_SHEET) return;
  const col = headerIndex_(sheet)['Verified'];
  if (!col || e.range.getColumn() > col || e.range.getLastColumn() < col) return;
  for (let r = Math.max(2, e.range.getRow()); r <= e.range.getLastRow(); r++) {
    if (sheet.getRange(r, col).getValue() === true) issueReceipt_(sheet, r);
  }
}

/** Menu: send receipts for the selected rows (ticks Verified for them). */
function menuSendReceipts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== MONEY_SHEET) return toast_('Select rows in the "' + MONEY_SHEET + '" tab first.');
  const col = headerIndex_(sheet)['Verified'];
  forSelectedRows_(sheet, function (r) {
    sheet.getRange(r, col).setValue(true);
    issueReceipt_(sheet, r);
  });
}

/** Menu: make the PDF again and re-send the email for selected rows that already have a receipt number. */
function menuResendReceipts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== MONEY_SHEET) return toast_('Select rows in the "' + MONEY_SHEET + '" tab first.');
  forSelectedRows_(sheet, function (r) {
    const entry = readRow_(sheet, r, MONEY_COLUMNS);
    if (!entry.receiptNo) return;
    deliverReceipt_(sheet, r, entry);
  });
}

function forSelectedRows_(sheet, fn) {
  const range = sheet.getActiveRange();
  if (!range) return;
  for (let r = Math.max(2, range.getRow()); r <= range.getLastRow(); r++) fn(r);
}

/** Gives the row a receipt number (only once), then makes and sends the receipt. */
function issueReceipt_(sheet, row) {
  const at = headerIndex_(sheet);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let entry;
  try {
    entry = readRow_(sheet, row, MONEY_COLUMNS);
    if (entry.receiptNo) return; // already has one; use "Resend" to send it again
    if (!entry.name || !(Number(entry.amount) >= 1)) {
      sheet.getRange(row, at['Receipt status']).setValue('Not sent: name or amount missing');
      return;
    }
    const now = new Date();
    entry.receiptNo = nextReceiptNo_(now);
    entry.receiptDate = now;
    sheet.getRange(row, at['Receipt no.']).setValue(cellValue_('receiptNo', entry.receiptNo));
    sheet.getRange(row, at['Receipt date']).setValue(now);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  deliverReceipt_(sheet, row, entry);
}

/** Makes the PDF, emails it, and writes the PDF and WhatsApp links into the row. */
function deliverReceipt_(sheet, row, entry) {
  const at = headerIndex_(sheet);
  const status = sheet.getRange(row, at['Receipt status']);
  try {
    const pdf = receiptPdf_(entry);
    const file = receiptFolder_().createFile(pdf);
    setLink_(sheet.getRange(row, at['Receipt PDF']), file.getName(), file.getUrl());
    setLink_(sheet.getRange(row, at['WhatsApp receipt']), 'Send on WhatsApp', whatsappUrl_(entry.mobile, whatsappReceipt_(entry)));

    if (entry.email) {
      MailApp.sendEmail({
        to: entry.email,
        subject: 'Receipt ' + entry.receiptNo + ' for your donation to ' + CONFIG.orgName,
        htmlBody: receiptEmailHtml_(entry),
        body: whatsappReceipt_(entry),
        attachments: [pdf],
        name: CONFIG.orgName,
        replyTo: CONFIG.email,
      });
      status.setValue('Emailed ' + formatDateTime_(new Date()));
    } else {
      status.setValue('No email given: send on WhatsApp');
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    status.setValue('Error: ' + (err && err.message ? err.message : err) + ' (use GGF receipts → Resend)');
  }
}

/** Next number in this financial year (April to March), e.g. GGF/2026-27/0007. */
function nextReceiptNo_(date) {
  const fy = financialYear_(date);
  const props = PropertiesService.getDocumentProperties();
  const key = 'receiptSeq_' + fy;
  const next = Number(props.getProperty(key) || 0) + 1;
  props.setProperty(key, String(next));
  return CONFIG.receiptPrefix + '/' + fy + '/' + ('000' + next).slice(-4);
}

function financialYear_(date) {
  const year = Number(Utilities.formatDate(date, CONFIG.timeZone, 'yyyy'));
  const month = Number(Utilities.formatDate(date, CONFIG.timeZone, 'M'));
  const start = month >= 4 ? year : year - 1;
  return start + '-' + String((start + 1) % 100).padStart(2, '0');
}

function receiptPdf_(entry) {
  const name = entry.receiptNo.replace(/\//g, '-') + ' ' + entry.name;
  return Utilities.newBlob(receiptHtml_(entry), 'text/html', name + '.html')
    .getAs('application/pdf')
    .setName(name + '.pdf');
}

// Receipt colours, from the website: night blue, temple gold, ivory.
const INK = '#2a2118';
const SOFT = '#6b5d4d';
const NIGHT = '#101b29';
const GOLD = '#a87a26';
const GOLD_LIGHT = '#e2c486';
const IVORY = '#fbf7ef';
const LINE = '#e5d7bb';
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Arial, Helvetica, sans-serif';

/**
 * The PDF receipt. Built from tables with inline styles, because Google's HTML-to-PDF
 * conversion ignores most modern CSS.
 */
function receiptHtml_(e) {
  const esc = escapeHtml_;
  const amount = Number(e.amount);
  const bank = /bank/i.test(e.method);
  const label = function (text) {
    return '<div style="font-family:' + SANS + ';font-size:9px;letter-spacing:1px;color:' + SOFT + ';text-transform:uppercase;">' + esc(text) + '</div>';
  };
  const item = function (name, value) {
    if (!String(value || '').trim()) return '';
    return '<div style="margin-top:11px;">' + label(name) +
      '<div style="font-family:' + SANS + ';font-size:12px;color:' + INK + ';margin-top:2px;line-height:1.4;">' + esc(value) + '</div></div>';
  };
  const heading = function (text) {
    return '<div style="font-family:' + SANS + ';font-size:10px;font-weight:bold;letter-spacing:2px;color:' + GOLD +
      ';border-bottom:1px solid ' + LINE + ';padding-bottom:6px;">' + esc(text) + '</div>';
  };
  const donorAddress = [e.address, e.district, e.state, e.pin].filter(String).join(', ');
  const donor = [
    item("Father's / spouse's name", e.relative),
    item('On behalf of', e.organisation),
    item('Address', donorAddress),
    item('Phone', e.mobile),
    item('Email', e.email),
    item('PAN', e.pan),
  ].join('');
  const payment = [
    item('Mode of payment', e.method),
    item('Paid on', bank ? formatPaidOn_(e.paidOn) : ''),
    item('Paid from', bank ? e.paidFrom : ''),
    item('Transaction reference (UTR)', bank ? e.reference : ''),
    item('Checked and received by the foundation', formatDate_(e.receiptDate)),
  ].join('');

  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body style="margin:24px;font-family:' + SANS + ';color:' + INK + ';">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ' + LINE + ';">' +

    // Header: foundation name on night blue, receipt number on the right.
    '<tr><td bgcolor="' + NIGHT + '" style="background:' + NIGHT + ';padding:22px 28px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="middle">' +
    '<div style="font-family:' + SERIF + ';font-size:22px;color:' + GOLD_LIGHT + ';">' + esc(CONFIG.orgName) + '</div>' +
    '<div style="font-size:10.5px;color:#cdbf9f;margin-top:5px;">Implementing the ' + esc(CONFIG.project) + ' (proposed), Jorhat, Assam</div>' +
    '</td>' +
    '<td valign="middle" align="right" style="text-align:right;">' +
    '<div style="font-size:9.5px;letter-spacing:2px;color:#cdbf9f;">DONATION RECEIPT</div>' +
    '<div style="font-family:' + SERIF + ';font-size:15px;color:#f2e5d0;margin-top:4px;">' + esc(e.receiptNo) + '</div>' +
    '<div style="font-size:10.5px;color:#cdbf9f;margin-top:3px;">' + esc(formatDate_(e.receiptDate)) + '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +
    '<tr><td bgcolor="' + GOLD + '" style="background:' + GOLD + ';height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>' +

    // Who gave.
    '<tr><td bgcolor="' + IVORY + '" style="background:' + IVORY + ';padding:24px 28px 4px;">' +
    label('Received with thanks from') +
    '<div style="font-family:' + SERIF + ';font-size:24px;color:' + INK + ';margin-top:4px;">' + esc(e.name) + '</div>' +
    '</td></tr>' +

    // The amount, large, with the purpose beside it.
    '<tr><td bgcolor="' + IVORY + '" style="background:' + IVORY + ';padding:16px 28px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border:1px solid ' + LINE + ';border-collapse:collapse;"><tr>' +
    '<td valign="top" style="padding:16px 20px;">' + label('Amount') +
    '<div style="font-family:' + SERIF + ';font-size:30px;color:#7c5424;margin-top:4px;">Rs. ' + formatIndian_(amount) + '/-</div>' +
    '<div style="font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + SOFT + ';margin-top:4px;">Rupees ' + esc(rupeesInWords_(amount)) + ' only</div>' +
    '</td>' +
    '<td valign="top" width="38%" style="padding:16px 20px;border-left:1px solid ' + LINE + ';">' + label('Purpose') +
    '<div style="font-family:' + SERIF + ';font-size:15px;color:' + INK + ';margin-top:5px;line-height:1.35;">' + esc(e.purpose || 'Wherever it is most needed') + '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // Donor and payment details side by side.
    '<tr><td bgcolor="' + IVORY + '" style="background:' + IVORY + ';padding:8px 28px 20px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="top" width="50%" style="padding-right:16px;">' + heading('DONOR') + donor + '</td>' +
    '<td valign="top" width="50%" style="padding-left:16px;">' + heading('PAYMENT') + payment + '</td>' +
    '</tr></table>' +
    '</td></tr>' +

    // Tax status and validity.
    '<tr><td bgcolor="' + IVORY + '" style="background:' + IVORY + ';padding:0 28px 18px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3ecdc" style="background:#f3ecdc;"><tr><td style="padding:12px 16px;font-size:10.5px;line-height:1.55;color:#4a3f33;">' +
    esc(CONFIG.taxNote) + '<br>This receipt was issued electronically by ' + esc(CONFIG.orgName) +
    ' after the donation was checked, and is valid without a signature.' +
    '</td></tr></table>' +
    '</td></tr>' +

    '<tr><td bgcolor="' + IVORY + '" align="center" style="background:' + IVORY + ';text-align:center;padding:2px 28px 22px;font-family:' + SERIF +
    ';font-style:italic;font-size:14px;color:#7c5424;">Thank you for your generosity.</td></tr>' +

    // Footer: the foundation's registration and contact details.
    '<tr><td bgcolor="' + NIGHT + '" style="background:' + NIGHT + ';padding:14px 28px;font-size:9.5px;line-height:1.7;color:#cdbf9f;">' +
    esc(CONFIG.orgName) + ' · ' + esc(CONFIG.legalForm) + '<br>' +
    'CIN ' + esc(CONFIG.cin) + ' · PAN ' + esc(CONFIG.pan) + '<br>' +
    esc(CONFIG.address) + '<br>' +
    esc(CONFIG.phone) + ' · ' + esc(CONFIG.email) + ' · ' + esc(CONFIG.website) +
    '</td></tr>' +
    '</table></body></html>'
  );
}

/** The email that carries the PDF: the same look, short. */
function receiptEmailHtml_(e) {
  const esc = escapeHtml_;
  return (
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-collapse:collapse;border:1px solid ' + LINE + ';font-family:' + SANS + ';color:' + INK + ';">' +
    '<tr><td bgcolor="' + NIGHT + '" style="background:' + NIGHT + ';padding:18px 22px;">' +
    '<div style="font-family:' + SERIF + ';font-size:19px;color:' + GOLD_LIGHT + ';">' + esc(CONFIG.orgName) + '</div>' +
    '<div style="font-size:11px;color:#cdbf9f;margin-top:4px;">' + esc(CONFIG.project) + '</div>' +
    '</td></tr>' +
    '<tr><td bgcolor="' + GOLD + '" style="background:' + GOLD + ';height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td bgcolor="' + IVORY + '" style="background:' + IVORY + ';padding:22px;font-size:14px;line-height:1.6;">' +
    '<p style="margin:0 0 12px;">Namaskar ' + esc(e.name) + ',</p>' +
    '<p style="margin:0 0 16px;">Thank you for your donation to the ' + esc(CONFIG.project) + '. We have received it, and your receipt is attached as a PDF.</p>' +
    '<table cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border:1px solid ' + LINE + ';"><tr><td style="padding:14px 18px;">' +
    '<div style="font-size:10px;letter-spacing:1px;color:' + SOFT + ';">RECEIPT ' + esc(e.receiptNo) + '</div>' +
    '<div style="font-family:' + SERIF + ';font-size:24px;color:#7c5424;margin-top:4px;">Rs. ' + formatIndian_(Number(e.amount)) + '/-</div>' +
    '<div style="font-size:12px;color:' + SOFT + ';margin-top:2px;">' + esc(e.purpose || '') + '</div>' +
    '</td></tr></table>' +
    '<p style="margin:16px 0 0;font-size:12px;color:' + SOFT + ';">' + esc(CONFIG.taxNote) + '</p>' +
    '<p style="margin:16px 0 0;">With gratitude,<br>' + esc(CONFIG.orgName) + '</p>' +
    '</td></tr>' +
    '<tr><td bgcolor="' + NIGHT + '" style="background:' + NIGHT + ';padding:12px 22px;font-size:11px;color:#cdbf9f;">' +
    esc(CONFIG.phone) + ' · ' + esc(CONFIG.email) + ' · ' + esc(CONFIG.website) +
    '</td></tr></table>'
  );
}

/** The receipt as a WhatsApp message (no attachment is possible through a link). */
function whatsappReceipt_(e) {
  const bank = /bank/i.test(e.method);
  return [
    'Namaskar ' + e.name + ',',
    '',
    'Thank you for your donation to ' + CONFIG.orgName + ' for the ' + CONFIG.project + '. We have received it.',
    '',
    'Receipt no.: ' + e.receiptNo,
    'Date: ' + formatDate_(e.receiptDate),
    'Amount: Rs. ' + formatIndian_(Number(e.amount)) + ' (Rupees ' + rupeesInWords_(Number(e.amount)) + ' only)',
    'Mode: ' + e.method + (bank && e.reference ? ', UTR ' + e.reference : ''),
    e.purpose ? 'Purpose: ' + e.purpose : '',
    '',
    e.email ? 'The PDF receipt has been emailed to ' + e.email + '.' : '',
    'This donation is not eligible for a tax deduction under Section 80G.',
    '',
    CONFIG.orgName + ', Jorhat · ' + CONFIG.website,
  ].filter(function (line, i, all) { return line !== '' || (all[i - 1] !== '' && i > 0); }).join('\n').trim();
}

function landGreeting_(e) {
  return 'Namaskar ' + e.name + ', this is ' + CONFIG.orgName + '. Thank you for offering land as a founding partner of the ' +
    CONFIG.project + ' (dag ' + e.dag + ', ' + e.village + '). ';
}

function whatsappUrl_(mobile, text) {
  return 'https://wa.me/91' + mobileDigits_(mobile) + '?text=' + encodeURIComponent(text);
}

/** The last 10 digits of a phone number, so "+91 98640-12345" becomes "9864012345". */
function mobileDigits_(mobile) {
  return String(mobile || '').replace(/\D/g, '').slice(-10);
}

// ───────────────────────────── Numbers, dates, text ─────────────────────────────

/** 1234567 → "12,34,567" */
function formatIndian_(n) {
  const s = String(Math.floor(Math.abs(Number(n) || 0)));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return rest + ',' + last3;
}

/** 1100 → "One Thousand One Hundred", 250000 → "Two Lakh Fifty Thousand" */
function rupeesInWords_(n) {
  n = Math.floor(Number(n) || 0);
  if (n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = function (x) { return x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : ''); };
  const three = function (x) {
    const h = Math.floor(x / 100);
    const r = x % 100;
    return (h ? ones[h] + ' Hundred' : '') + (h && r ? ' ' : '') + (r ? two(r) : '');
  };
  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(rupeesInWords_(crore) + ' Crore');
  if (lakh) parts.push(two(lakh) + ' Lakh');
  if (thousand) parts.push(two(thousand) + ' Thousand');
  if (rest) parts.push(three(rest));
  return parts.join(' ');
}

function formatDate_(d) {
  return d instanceof Date ? Utilities.formatDate(d, CONFIG.timeZone, 'd MMMM yyyy') : String(d || '');
}

function formatDateTime_(d) {
  return Utilities.formatDate(d, CONFIG.timeZone, 'd MMM yyyy, h:mm a');
}

/** "2026-11-20" from the website's date box → "20 November 2026" */
function formatPaidOn_(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').replace(/^'/, ''));
  if (!m) return String(value || '');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return Number(m[3]) + ' ' + months[Number(m[2]) - 1] + ' ' + m[1];
}

function escapeHtml_(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ──────────────────────────────────── Sheet set-up ────────────────────────────────────

/** Adds the "GGF receipts" menu when the sheet opens. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GGF receipts')
    .addItem('Send receipt for selected rows', 'menuSendReceipts')
    .addItem('Resend receipt for selected rows', 'menuResendReceipts')
    .addSeparator()
    .addItem('Set up this sheet', 'setup')
    .addToUi();
}

/**
 * Run once from the Apps Script editor (choose "setup", then Run). Creates the two tabs,
 * the receipts folder in Drive, and the trigger that sends a receipt when "Verified" is ticked.
 * Safe to run again.
 */
function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(CONFIG.timeZone);
  const money = ensureSheet_(ss, MONEY_SHEET, MONEY_COLUMNS);
  const land = ensureSheet_(ss, LAND_SHEET, LAND_COLUMNS);

  const at = headerIndex_(money);
  money.getRange(2, at['Amount (Rs.)'], money.getMaxRows() - 1, 1).setNumberFormat('#,##,##0');
  [at['Submitted'], at['Receipt date']].forEach(function (c) {
    money.getRange(2, c, money.getMaxRows() - 1, 1).setNumberFormat('d mmm yyyy, h:mm am/pm');
  });
  land.getRange(2, headerIndex_(land)['Submitted'], land.getMaxRows() - 1, 1).setNumberFormat('d mmm yyyy, h:mm am/pm');

  receiptFolder_();
  const exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'onVerifiedTicked';
  });
  if (!exists) ScriptApp.newTrigger('onVerifiedTicked').forSpreadsheet(ss).onEdit().create();
  toast_('Set-up done. Next: Deploy → New deployment → Web app.');
}

function ensureSheet_(ss, name, columns) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    // Reuse the empty first tab of a new spreadsheet instead of leaving a blank "Sheet1".
    const blank = ss.getSheets().filter(function (s) {
      return /^(Sheet1|Sheet 1)$/.test(s.getName()) && s.getLastRow() === 0;
    })[0];
    sheet = blank ? blank.setName(name) : ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    const headings = columns.map(function (c) { return c[1]; });
    sheet.getRange(1, 1, 1, headings.length).setValues([headings]).setFontWeight('bold').setBackground('#f3ecdc');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function receiptFolder_() {
  const props = PropertiesService.getDocumentProperties();
  const id = props.getProperty('receiptFolderId');
  if (id) {
    try {
      return DriveApp.getFolderById(id);
    } catch (err) {
      // The folder was deleted; make a new one below.
    }
  }
  const folder = DriveApp.createFolder(CONFIG.receiptFolder);
  props.setProperty('receiptFolderId', folder.getId());
  return folder;
}

// ──────────────────────────────────── Helpers ────────────────────────────────────

/** { "Heading": column number } for row 1. */
function headerIndex_(sheet) {
  const width = sheet.getLastColumn();
  const map = {};
  if (!width) return map;
  sheet.getRange(1, 1, 1, width).getValues()[0].forEach(function (h, i) {
    if (h !== '') map[String(h)] = i + 1;
  });
  return map;
}

function readRow_(sheet, row, columns) {
  const at = headerIndex_(sheet);
  const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const out = {};
  columns.forEach(function (c) {
    const col = at[c[1]];
    const value = col ? values[col - 1] : '';
    // A leading ' only marks a cell as text; never let it reach a receipt.
    out[c[0]] = typeof value === 'string' ? value.replace(/^'/, '') : value;
  });
  return out;
}

function setLink_(range, text, url) {
  range.setRichTextValue(SpreadsheetApp.newRichTextValue().setText(text).setLinkUrl(url).build());
}

function toast_(message) {
  try {
    SpreadsheetApp.getActive().toast(message, CONFIG.orgShort, 8);
  } catch (err) {
    console.log(message);
  }
}
