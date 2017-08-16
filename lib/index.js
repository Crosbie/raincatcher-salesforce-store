var sfAPI = require('./sfAPI');
var config = require('./config');

var getSheetPromise;

/**
 *
 * Connecting and authenticating to the Salesforce.
 *
 * @param {object} _config
 * @returns {Promise}
 */
function connect(_config) {
  if (getSheetPromise) {
    return getSheetPromise;
  }

  config.set(_config);

  return sfAPI.authenticate();
}

module.exports = {
  connect: connect,
  // GoogleSheetStore: require('./sheet-store')
  SalesforceStore: require('./salesforce-store');
};