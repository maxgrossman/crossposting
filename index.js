var gUser = process.argv[2]
var auth = require('./utils/auth').auth;
var getEntries = require('./utils/crossposting').getEntries;
var spreadsheetId = require('./spreadsheet')[gUser]

// use command line argument to decide which google drive acct to access
if (gUser === 'geoweek') {
  auth('geoweek')
  .then(auth => {
    getEntries(auth, spreadsheetId, 'main!A:XX')
    .then(rows => console.log(rows))
  })
}