var google = require('googleapis');
var parse = require('csv-parse')
Promise = require('bluebird')
/**
 * gets entries from provided spreadsheet in the provided range of columns/rows
 * @param {object} auth oauth2Client needed to access the spreadsheet
 * @param {string} spreadsheetId the spreadsheet's unique id
 * @param {string} range string representation of the range of rows desired
 * @return 
 */
exports.getEntries = function(auth, spreadsheetId, range) {
  return new Promise((resolve, reject) => {
    var sheets = google.sheets('v4');
    var promiseGet = Promise.promisify(sheets.spreadsheets.values.get);
    promiseGet({auth: auth, spreadsheetId: spreadsheetId, range: range})
    .then(res => {
      var rows = res.values;
      resolve(rows);
    })
    .catch(e => {
      throw new Error(`The API returned an error: ${e}`);
      reject()
    })
  })
}
  