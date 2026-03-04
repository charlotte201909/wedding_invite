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
  sheet.appendRow([new Date(), name, email, mobile]);
  return ContentService.createTextOutput('ok');
}
