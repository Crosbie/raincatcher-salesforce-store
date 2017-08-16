// var GoogleSpreadsheet = require('google-spreadsheet');
sf = require('jsforce'),
var _ = require('lodash');
var config = require('./config');
var Promise = require('bluebird');
// name of the Salesforce collection to interact with
var STORE_COLLECTION = 'Case';

// spreadsheet key is the long id in the sheets URL

// var sheet, sheetDocument;

/**
 *
 * Authenticating to SalesForce to be able to read/write to it.
 *
 * @param {function} cb
 */
function authenticate(cb) {

  // getSheetDocument().useServiceAccountAuth(config.get('credentials'), cb);

  var conn = new sf.Connection({
		loginUrl: 'https://login.salesforce.com'
	});

  // password should consist of SF password and Security Token
  var creds = config.get('credentials');
	conn.login(creds.user, creds.password, function(err) {
		if (err) {
			console.error('Error connecting to Salesforce', err);
			return cb('Error connecting to Salesforce', err);
		}
		console.log('Logged in as:', creds.user);

		// store auth info
		creds.accessObj = {
			accessToken: conn.accessToken,
			instanceUrl: conn.instanceUrl
		};
		// save back to config
		config.set({credentials: creds})

		return cb();
	});
}



function create(data,cb){
	var conn = new sf.Connection(config.get('credentials').accessObj),
	conn.sobject(STORE_COLLECTION).create(data, cb);
}

function read(id,cb){
	var conn = new sf.Connection(config.get('credentials').accessObj),
	conn.sobject(STORE_COLLECTION).retrieve(id, cb);
}

function update(data,cb){
	var conn = new sf.Connection(config.get('credentials').accessObj),
	conn.sobject(STORE_COLLECTION).update(data, cb);
}

function remove(id,cb){
	var conn = new sf.Connection(config.get('credentials').accessObj),
	conn.sobject(STORE_COLLECTION).del(id, cb);	
}


/**
 * Get the relevant details from cases objects.
 *
 * @param {Function} cb The act callback.
 */
function list(fields,filter,cb){
  var conn = new sf.Connection(config.get('credentials').accessObj);
  conn.query("SELECT " + fields + " FROM " + STORE_COLLECTION, cb);
}



module.exports = {
  authenticate: Promise.promisify(authenticate),
  create: Promise.promisify(create),
  read: Promise.promisify(read),
  update: Promise.promisify(update),
  remove: Promise.promisify(remove),
  list: Promise.promisify(list)
};