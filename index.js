var gUser = process.argv[2]
var auth = require('./utils/auth').auth;
var getEntries = require('./utils/crossposting').getEntries;
var config = require('./config');
Promise = require('bluebird');

// if geoweek is the command, find which of the 
if (gUser === 'geoweek') {
  Promise.map(['geoweek', 'mm'], (gUser) => {
    return auth(gUser)
    .then(auth => {
      const spreadsheetId = config[spreadsheet][gUser];
      return getEntries(auth, shreadsheetId, 'main!A:XX')
    })
  })
  .then()
  .catch()
}