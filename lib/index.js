var sfAPI = require('./sfAPI');
var config = require('./config');

/**
 *
 * Connecting and authenticating to the Salesforce.
 *
 * @param {object} _config
 * @returns {Promise}
 */
function connect(_config) {

  config.set(_config);
  return sfAPI.authenticate();
}

module.exports = {
  connect: connect,
  SalesforceStore: require('./salesforce-store')
};