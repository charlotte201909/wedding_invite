// ─── Config ───────────────────────────────────────────────────────────────────
const SHEET_ID     = '1FhaRqzKcbvwBNMj1gN0yqpSHs5zSDPU2sp3OHe_luUI';
const NOTIFY_EMAIL = 'panyinlun@gmail.com';
const WEDDING_DATE = 'Saturday, 13th March 2027 · 6pm – late · Sydney';

// ─── Web app entry points ─────────────────────────────────────────────────────
function doGet() {
  return ContentService.createTextOutput('ok');
}

function doPost(e) {
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

  sheet.appendRow([new Date(), name, email, mobile, guests, partner, origin, dietaryFull, song]);
  Logger.log('Row appended for %s', email);

  try {
    sendConfirmation(name, email);
    Logger.log('Confirmation email sent to %s', email);
  } catch(err) {
    Logger.log('ERROR sending confirmation to %s: %s', email, err.message);
  }

  try {
    notifyCouple(name, email, mobile, guests, partner, origin, dietaryFull, song);
    Logger.log('Couple notified about %s', name);
  } catch(err) {
    Logger.log('ERROR notifying couple: %s', err.message);
  }

  return ContentService.createTextOutput('ok');
}

// ─── Deduplication ────────────────────────────────────────────────────────────
function isDuplicate(sheet, email) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if ((values[i][2] || '').toLowerCase() === email.toLowerCase()) return true;
  }
  return false;
}

// ─── Confirmation email + calendar invite to guest ────────────────────────────
function sendConfirmation(name, email) {
  const firstName = name.split(' ')[0] || name;

  const subject = 'You\u2019re invited \u00B7 Charlotte & Charles \u00B7 13 March 2027';

  const plainBody =
    'Hi ' + firstName + ',\n\n' +
    'We\u2019re so happy you\u2019ll be there!\n\n' +
    'Save the date:\n' +
    'Saturday, 13th March 2027 \u00B7 6pm \u2013 late \u00B7 Sydney, Australia\n\n' +
    'Venue and all the details to follow closer to the date.\n\n' +
    'Can\u2019t wait to celebrate with you.\n\n' +
    'All our love,\nCharlotte & Charles\n(and Gingie & Meg)';

  const htmlBody =
    '<p>Hi ' + firstName + ', &#x1F970;</p>' +
    '<p>We\u2019re so happy you\u2019ll be there!</p>' +
    '<p><strong>Save the date:</strong><br>' +
    'Saturday, 13th March 2027 &middot; 6pm &ndash; late &middot; Sydney, Australia &#x1F973;</p>' +
    '<p>Venue and all the details to follow closer to the date.</p>' +
    '<p>Can\u2019t wait to celebrate with you. &#x1F942;</p>' +
    '<p>All our love,<br>Charlotte &amp; Charles<br>(and Gingie &amp; Meg &#x1F43E;)</p>';

  GmailApp.sendEmail(email, subject, plainBody, {
    name: 'Charlotte & Charles',
    htmlBody: htmlBody
  });

  // Calendar invite
  const start = new Date('2027-03-13T18:00:00+11:00');
  const end   = new Date('2027-03-14T00:00:00+11:00');
  CalendarApp.getDefaultCalendar().createEvent(
    'Charlotte & Charles\u2019 Wedding',
    start, end,
    {
      description: 'We can\u2019t wait to celebrate with you! All venue details to follow.',
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

    const subject = 'You\'re invited \uD83E\uDD42 · Charlotte & Charles · 13 March 2027';
    const body =
      'Hi ' + firstName + ',\n\n' +
      'The time has come \u2014 we\'d love for you to join us.\n\n' +
      'Date:    Saturday, 13th March 2027\n' +
      'Time:    6pm \u2013 late\n' +
      'Venue:   ' + VENUE + '\n\n' +
      'Please RSVP at: ' + RSVP_URL + '\n\n' +
      'All our love,\n' +
      'Charlotte & Charles\n' +
      '(and Gingie & Meg \uD83D\uDC3E)';

    GmailApp.sendEmail(email, subject, body, { name: 'Charlotte & Charles' });
    sent++;
    Utilities.sleep(200); // stay within Gmail send limits
  }

  Logger.log('Sent ' + sent + ' invites.');
}
