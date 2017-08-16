var GoogleSpreadsheet = require('google-spreadsheet');
var _ = require('lodash');
var config = require('./config');
var Promise = require('bluebird');
// spreadsheet key is the long id in the sheets URL

var sheet, sheetDocument;

/**
 *
 * Authenticating to google drive to be able to read/write to the sheets.
 *
 * @param {function} cb
 */
function authenticate(cb) {

  getSheetDocument().useServiceAccountAuth(config.get('credentials'), cb);
}

/**
 *
 * Getting a single google sheet to work with
 *
 * @returns {GoogleSpreadsheet|exports|module.exports}
 */
function getSheetDocument() {

  if (sheetDocument) {
    return sheetDocument;
  }

  sheetDocument = new GoogleSpreadsheet(config.get("documentId"));
  return sheetDocument;
}


/**
 *
 * Getting a worksheet by title
 *
 * @param {string} title
 * @param {function} cb
 */
function getWorksheet(title, cb) {
  getSheetDocument().getInfo(function(err, info) {
    if (err) {
      return cb(err);
    }
    sheet = _.find(info.worksheets, {title: title});

    sheet ? cb(undefined, sheet) : cb(new Error("No sheet exists with title " + title));
  });
}


/**
 *
 * Adding a new worksheet to a document
 *
 * @param {string} title
 * @param {function} cb
 */
function addWorksheet(title, cb) {
  getSheetDocument().addWorksheet({
    title: title
  }, cb);
}


module.exports = {
  authenticate: Promise.promisify(authenticate),
  getSheet: getSheetDocument,
  getWorksheet: Promise.promisify(getWorksheet),
  addWorksheet: Promise.promisify(addWorksheet)
};