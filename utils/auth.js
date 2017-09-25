var readline = require('readline');
var googleAuth = require('google-auth-library');
Promise = require('bluebird');
var fs = require('fs');
var promiseRead = Promise.promisify(fs.readFile);

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

/**
 * given a basename (denoting here either the geoweek or mm credentials),
 * return the oauth2Client to access that app's google sheet
 * @func auth
 * @param baseName the baseName of the credentials objects that denotes a given application
 * @return the oauth2Client needed to access the application
 */
exports.auth = function(baseName) {
  return new Promise((resolve, reject) => {
    // read in client credentials from a local file.
    promiseRead(`client_secret-${baseName}.json`)
    .then((credentials) => {
      // parse the credentials
      credentials = JSON.parse(credentials);
      // take important properties of the object and set them to variables to make code readable
      var clientSecret = credentials.installed.client_secret;
      var clientId = credentials.installed.client_id;
      var redirectUrl = credentials.installed.redirect_uris[0];
      // make a new googleAuth object.
      var auth = new googleAuth();
      // make a new oAuth2 object.
      var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
      // read in the TOKEN_PATH (where a token will live after this client app has been authorized)
      promiseRead(TOKEN_PATH)
      // if the token path is found, go ahead and list the entries
      .then((token) => {
        // set the oauth2Client credentials as the token
        oauth2Client.credentials = JSON.parse(token);
        // resolve the promise, returning the fully loaded oauth2Client
        resolve(oauth2Client)
      })
      // if the token path is not, then have the user generate a new one for the application
      .catch(e => {
        // get the new token
        getNewToken(oauth2Client)
        .then(oauth2Client => {
          // resolve the promise, returning the NEW fully loaded oauth2Client
          resolve(oauth2Client);
        })
      })
    })
    .catch(e => {
      // if there was any error when loading the initial client secrets, throw an error.
      throw new Error (`Error loading client secret file: ${e}`)
      reject()
    })
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
  // generate a url for the new token.
  var authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  // then begin a prompt that asks the user to visit the url with the new token...
  console.log('Authorize this app by visiting this url: ', authUrl);
  // then create an interface with readlines for the user to proivde the authorization token
  var rl = readline.createInterface({ input: process.stdin,output: process.stdout });
  // in a promise, ask to enter the code, when the code is added, the promise is resolved
  return new Promise((resolve) => { 
    rl.question('Enter the code from that page here: ', (code) => { resolve(code) })
  })
  // then with that code, get the token from the code added. do this, per usual in this util, in a promise
  .then(code => {
    rl.close();
    return new Promise((resolve, reject) => {
      oauth2Client.getToken(code, (err, token) => {
        if (err) { reject(err) }
        resolve(token)
      })
    })
    .then(token => {
      // once the token is had, set the oauth2Client object's credentials to it
      oauth2Client.credentials = token;
      // make sure then to write the token to the local ./credentials folder
      storeToken(token);
      // return the new oauth2Client object
      return oauth2Client
    })
  })
  .then(oauth2Client => {
    // at top most leve, return the oauth2Client object again.
    return oauth2Client;
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  // first try to make the token directory
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  // now write the token to its path in the token directory.
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

