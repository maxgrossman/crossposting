var google = require('googleapis');
Promise = require('bluebird');

/**
 * gets entries from provided spreadsheet in the provided range of columns/rows
 * @param {object} auth oauth2Client needed to access the spreadsheet
 * @param {string} spreadsheetId the spreadsheet's unique id
 * @param {string} range string representation of the range of rows desired
 * @return 
 */
exports.getEntries = function(auth, spreadsheetId, range) {
  return new Promise((resolve, reject) => {
    // promisify the google sheets method for getting data from a sheet
    var sheets = google.sheets('v4');
    var promiseGet = Promise.promisify(sheets.spreadsheets.values.get);
    // get the data for sheet with spreadsheetId for ranges defined by range
    promiseGet({auth: auth, spreadsheetId: spreadsheetId, range: range})
    .then(res => {
      // with a result, first grab the non-column header data and set it to rows variable  
      var rows = res.values.slice(1, res.values.lenght);
      // still grab the columnheadres from the res.values
      var columnHeaders = res.values[0]
      // use rows and column headers to transform the data from a list of lists with strings
      // to a list of lists with objects where each elemenet in a nested list 
      // is relatable by key to others of same type in other rows
      rows = rows.map(row => mapRow(row, columnHeaders));
      resolve(rows);
    })
    .catch(e => {
      throw new Error(`The API returned an error: ${e}`);
      reject()
    })
  })
}
 
/**
 * interal utility that given a row, returns each row's cell 
 * as a json where the key is that cell's column header and value=cell value
 * @func mapRow
 * @param {array} row an array representation of a row
 * @return {array} an array of objects, each object a cell with k=column header v=cell vlaue
 */
function mapRow(row, columnHeaders) {
  return row.map((c, i )=> {
    const cellObj = {};
    const header = columnHeaders[i];
    cellObj[header] = c;
    return cellObj
  });
};
