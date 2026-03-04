function doGet() {
  return HtmlService.createHtmlOutputFromFile('ewart-save-the-date')
    .setTitle('Charlotte & Charles Ewart — Save the Date')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

const SHEET_ID = '1FhaRqzKcbvwBNMj1gN0yqpSHs5zSDPU2sp3OHe_luUI'; // ← Replace with your Sheet ID

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const name = e.parameter.name || '';
  const email = e.parameter.email || '';
  const mobile = e.parameter.mobile || '';
  const guests = e.parameter.guests || '';
  const partner = e.parameter.partner || '';
  const origin = e.parameter.origin || '';
  const dietary = e.parameter.dietary || '';
  const dietary_note = e.parameter.dietary_note || '';
  const song = e.parameter.song || '';
  sheet.appendRow([new Date(), name, email, mobile, guests, partner, origin, dietary + (dietary_note ? ': ' + dietary_note : ''), song]);
  return ContentService.createTextOutput('ok');
}
