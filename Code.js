// ─── Config ───────────────────────────────────────────────────────────────────
const SHEET_ID     = '1FhaRqzKcbvwBNMj1gN0yqpSHs5zSDPU2sp3OHe_luUI';
const NOTIFY_EMAIL = 'panyinlun@gmail.com';
const WEDDING_DATE = 'Saturday, 13th March 2027 · 6pm – late · Sydney';

const COMMENTS_SHEET = 'Comments';
const MAX_NAME = 60;
const MAX_CAT  = 30;
const MAX_MSG  = 800;

// ─── Web app entry points ─────────────────────────────────────────────────────
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'comments') {
    return jsonOut(getComments());
  }
  return ContentService.createTextOutput('ok');
}

function doPost(e) {
  // Guest-wall comment
  if (e && e.parameter && e.parameter.action === 'comment') {
    return addComment(e);
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('RSVP');

  const name         = e.parameter.name         || '';
  const email        = e.parameter.email        || '';
  const mobile       = e.parameter.mobile       || '';
  const guests       = e.parameter.guests       || '';
  const partner      = e.parameter.partner      || '';
  const origin       = e.parameter.origin       || '';
  const dietary      = e.parameter.dietary      || '';
  const dietary_note = e.parameter.dietary_note || '';
  const song         = e.parameter.song         || '';
  const dietaryFull  = dietary + (dietary_note ? ': ' + dietary_note : '');

  Logger.log('doPost received: name=%s email=%s guests=%s', name, email, guests);

  // Deduplication — silently succeed if already registered
  if (isDuplicate(sheet, email)) {
    Logger.log('Duplicate submission for %s — skipping', email);
    return ContentService.createTextOutput('ok');
  }

  sheet.appendRow([new Date(), name, email, mobile, guests, partner, origin, dietaryFull, song, '']);
  const rowNum = sheet.getLastRow();
  Logger.log('Row appended for %s at row %s', email, rowNum);

  let calSent = false;
  try {
    sendCalendarInvite(email);
    calSent = true;
    Logger.log('Calendar invite sent to %s', email);
  } catch(err) {
    Logger.log('ERROR sending calendar invite to %s: %s', email, err.message);
  }
  sheet.getRange(rowNum, 10).setValue(calSent);

  try {
    notifyCouple(name, email, mobile, guests, partner, origin, dietaryFull, song);
    Logger.log('Couple notified about %s', name);
  } catch(err) {
    Logger.log('ERROR notifying couple: %s', err.message);
  }

  return ContentService.createTextOutput('ok');
}

// ─── Guest wall (comments) ────────────────────────────────────────────────────
function commentsSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(COMMENTS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(COMMENTS_SHEET);
    sh.appendRow(['timestamp', 'name', 'category', 'message', 'approved', 'private']);
  } else if (!sh.getRange(1, 6).getValue()) {
    sh.getRange(1, 6).setValue('private'); // backfill header on older sheets
  }
  return sh;
}

function isTruthy(v) {
  return v === true || v === 'TRUE' || v === 'Yes' || v === 'yes' || v === 1 || v === '1';
}

function addComment(e) {
  const name     = String(e.parameter.name     || '').trim().slice(0, MAX_NAME) || 'Guest';
  const category = String(e.parameter.category || '').trim().slice(0, MAX_CAT);
  const message  = String(e.parameter.message  || '').trim().slice(0, MAX_MSG);
  const isPrivate = isTruthy(e.parameter.private);
  if (!message) return jsonOut({ ok: false, error: 'empty' });

  // Serialise writes so simultaneous posts can't clobber each other
  const lock = LockService.getScriptLock();
  try { lock.waitLock(8000); }
  catch (err) { return jsonOut({ ok: false, error: 'busy' }); }
  try {
    commentsSheet().appendRow([new Date(), name, category, message, true, isPrivate]);
  } finally {
    lock.releaseLock();
  }
  Logger.log('Comment added by %s [%s]%s', name, category, isPrivate ? ' (private)' : '');

  if (isPrivate) {
    try { notifyPrivateNote(name, category, message); }
    catch (err) { Logger.log('ERROR emailing private note: %s', err.message); }
  }
  return jsonOut({ ok: true });
}

function notifyPrivateNote(name, category, message) {
  const subject = 'Private note from ' + name + ' 💛';
  const body =
    name + ' left you a private note on the wall' +
    (category ? ' [' + category + ']' : '') + ':\n\n' +
    message + '\n\n' +
    '(Only the two of you can see this — it is not shown publicly.)';
  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, { name: 'The Wall' });
}

function getComments() {
  const vals = commentsSheet().getDataRange().getValues();
  const out = [];
  for (let i = 1; i < vals.length; i++) {
    const ts = vals[i][0], name = vals[i][1], category = vals[i][2],
          message = vals[i][3], approved = vals[i][4], isPrivate = vals[i][5];
    if (!message) continue;
    if (isTruthy(isPrivate)) continue;                                   // private — couple only
    if (approved === false || approved === 'FALSE' || approved === 'No') continue; // hidden
    out.push({
      t: ts instanceof Date ? ts.getTime() : Date.parse(ts) || 0,
      name: String(name || 'Guest'),
      category: String(category || ''),
      message: String(message)
    });
  }
  return out;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Deduplication ────────────────────────────────────────────────────────────
function isDuplicate(sheet, email) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if ((values[i][2] || '').toLowerCase() === email.toLowerCase()) return true;
  }
  return false;
}

// ─── Calendar invite to guest ─────────────────────────────────────────────────
function sendCalendarInvite(email) {
  const start = new Date('2027-03-13T18:00:00+11:00');
  const end   = new Date('2027-03-14T00:00:00+11:00');
  CalendarApp.getDefaultCalendar().createEvent(
    'Charlotte and Charles\u2019 Wedding',
    start, end,
    {
      description: 'We can\u2019t wait to celebrate with you!\n\nWe\u2019ll keep updating this invite with venue details and anything else you need to know \u2014 so keep an eye on it.\n\nIn the meantime, check back at our website:\nhttps://charles-and-charlotte.love/\n\nAll our love,\nCharlotte and Charles (and Gingie and Meg)',
      location: 'Sydney, Australia',
      guests: email,
      sendInvites: true
    }
  ).setVisibility(CalendarApp.Visibility.PRIVATE);
}

// ─── Notification to couple ───────────────────────────────────────────────────
function notifyCouple(name, email, mobile, guests, partner, origin, dietary, song) {
  const guestLine = guests === 'solo'  ? 'just themselves' :
                    guests === 'plus1' ? '+1 (' + (partner || 'name TBC') + ')' :
                    guests === 'group' ? 'a group (' + (partner || 'names TBC') + ')' : guests;

  const subject = name + ' just saved the date!';
  const body =
    name + ' just signed up.\n\n' +
    'Email:       ' + email + '\n' +
    'Mobile:      ' + (mobile || '\u2014') + '\n' +
    'Coming:      ' + guestLine + '\n' +
    'Travelling:  ' + origin + '\n' +
    'Dietary:     ' + (dietary || 'everything') + '\n' +
    'Song req:    ' + (song || '\u2014') + '\n';

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, { name: 'Wedding Sign-ups' });
}

// ─── Phase 2: batch invite sender (run manually when venue is confirmed) ───────
// 1. Fill in VENUE and RSVP_URL below
// 2. Open Apps Script editor → run sendInvites()
// 3. Everyone in the sheet gets a personalised invite email
function sendInvites() {
  const VENUE    = 'YOUR VENUE HERE';          // ← fill in when confirmed
  const RSVP_URL = 'YOUR RSVP PAGE URL HERE';  // ← fill in for Phase 2

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('RSVP');
  const rows  = sheet.getDataRange().getValues();

  let sent = 0;
  for (let i = 1; i < rows.length; i++) {
    const [, name, email] = rows[i];
    if (!email) continue;
    const firstName = name.split(' ')[0] || name;

    const subject = 'You\'re invited \uD83E\uDD42 · Charlotte and Charles · 13 March 2027';
    const body =
      'Hi ' + firstName + ',\n\n' +
      'The time has come \u2014 we\'d love for you to join us.\n\n' +
      'Date:    Saturday, 13th March 2027\n' +
      'Time:    6pm \u2013 late\n' +
      'Venue:   ' + VENUE + '\n\n' +
      'Please RSVP at: ' + RSVP_URL + '\n\n' +
      'All our love,\n' +
      'Charlotte and Charles\n' +
      '(and Gingie and Meg \uD83D\uDC3E)';

    GmailApp.sendEmail(email, subject, body, { name: 'Charlotte and Charles' });
    sent++;
    Utilities.sleep(200); // stay within Gmail send limits
  }

  Logger.log('Sent ' + sent + ' invites.');
}
