var sfAPI = require('./sfAPI')
var _ = require('lodash');
var Promise = require('bluebird');
var Topic = require('fh-wfm-mediator/lib/topics');


/**
 *
 * A single google sheet store for a single data set (e.g. workorders etc)
 *
 * @param {string} datasetId - The ID of the data set for this store
 * @param {string} sheetId - The ID of the google sheet to use for this data set.
 * @param {object} entitySchema - The schema for the data set
 * @param {object} entitySchema.fields
 * @param {object} entitySchema.fields.common
 * @param {object} entitySchema.fields.sheet
 * @param {object} entitySchema.fields.json
 *
 * E.g.
 *
 *
 * {
 *   common: [//common fields between the JSON object and Sheet headers]
 *   sfQueryFields: [//list of field names to pull from Cases]
 *   json: {
 *     ...
 *     location: {
 *       //Use an array if the fields are an array
 *       sheetFields: [{
            path: 'lat',
            convert: function(val) {
              return parseFloat(val);
            }
          }, {
            path: 'long',
            convert: function(val) {
              return parseFloat(val);
            }
          }]
 *     }
 *     ...
 *   },
 *   sheet: {
 *    //Mapping the fields to the
 *    lat: {
        path: 'location[0]'
      },
      long: {
        path: 'location[1]'
      }
 *   }
 * }
 *
 * @constructor
 */
function SalesForceStore(datasetId, entitySchema) {
  this.datasetId = datasetId;
  this.entitySchema = entitySchema;
  _.bindAll(this, ['convertJSONEntityToRow', 'convertSFtoWFM']);
}

/**
 *
 * Converting a JSON entity to a Row entry
 *
 * @param jsonEntity
 * @returns {Object}
 */
SalesForceStore.prototype.convertJSONEntityToRow = function convertJSONEntityToRow(jsonEntity) {
  //pick out the common entities

  var rowObject = _.pick(jsonEntity, this.entitySchema.fields.common);

  rowObject = _.mapKeys(rowObject, function(value, key) {
    return key.toLowerCase();
  });

  //For each of the sheet-specific fields, pick out and convert the specific objects
  _.each(this.entitySchema.fields.sheet, function(metadata, key) {
    if (!_.has(jsonEntity, metadata.path)) {
      return;
    }

    var valueFromJSON = _.get(jsonEntity, metadata.path);

    rowObject[key.toLowerCase()] = metadata.convert ? metadata.convert(valueFromJSON) : valueFromJSON;
  });


  //ID and title are reserved fields, prepending _ will allow adding entries under the correct headings.
  if (rowObject.id) {
    rowObject._id = rowObject.id;
  }

  if (rowObject.title) {
    rowObject._title = rowObject.title;
  }

  return rowObject;
};


/**
 *
 * Converting a row entity to the JSON entity
 *
 * The row entities all come back as Camel case, so we have to convert to the keys to the
 * expected JSON
 *
 * @param sfEntity
 * @returns {Object}
 */
SalesForceStore.prototype.convertSFtoWFM = function convertSFtoWFM(sfEntity) {

  var allSheetKeys = _.union(this.entitySchema.fields.common, _.keys(this.entitySchema.fields.sheet));

  var allSheetEntries = _.map(allSheetKeys, function(key) {
    return key.toLowerCase();
  });

  var allSFEntities = _.map(_.keys(sfEntity), function(key) {
  	return key.toLowerCase();
  })

  var rowObject = _.pick(allSFEntities, allSheetEntries);

  //Now we have all of the lower case properties of Salesforce.

  var jsonEntity = {};

  _.each(this.entitySchema.fields.common, function(commonKey) {
    jsonEntity[commonKey] = rowObject[commonKey.toLowerCase()];
  });

  /**
   *
   * Getting a single value from SalesForce value metadata
   *
   * @param valueMetadata
   * @param valueMetadata.path - The path to the value from the salesForce entry
   * @param valueMetadata.convert - An optional convertion function for the value
   * @returns {*|Function}
   */
  function getValueFromMetadata(valueMetadata) {
    var value = _.get(rowObject, valueMetadata.path.toLowerCase());
    return valueMetadata.convert ? valueMetadata.convert(value) : value;
  }

  _.each(this.entitySchema.fields.json, function(metadata, jsonKey) {
    var value;
    if (_.isArray(metadata.sheetFields)) {
      value = _.map(metadata.sheetFields, getValueFromMetadata);
    } else if (_.isObject(metadata.sheetFields)) {
      value = getValueFromMetadata(metadata.sheetFields);
    }

    if (value ) {
      jsonEntity[jsonKey] = value;
    }
  });

  return jsonEntity;
};

/**
 *
 * Initialising the data set with a set of seed data.
 *
 * @param seedData
 * @returns {*}
 */
SalesForceStore.prototype.init = function init(seedData) {
  var self = this;
  seedData = seedData || [];

  return Promise.each(seedData, function(mockDataEntry) {
    return self.create(mockDataEntry);
  });
};

/**
 *
 * Creating a single entity
 *
 * @param entity
 * @returns {Promise}
 */
SalesForceStore.prototype.create = function create(entity) {
  var self = this;
  // entity = self.convertJSONEntityToRow(entity);
  // return this.getSheet().then(function(sheet) {
  //   return createEntityRow(sheet, entity).then(self.convertRowEntityToJSON);
  // });

  return sfAPI.create(entity).then(self.convertSFtoWFM);
};

/**
 *
 * Reading a single entity from the sheet
 *
 * @param id
 * @returns {Promise}
 */
SalesForceStore.prototype.read = function read(id) {
  var self = this;
  // return this.getSheet().then(function(sheet) {
  //   return getEntityFromSheet(sheet, id).then(self.convertRowEntityToJSON);
  // });

  return sfAPI.read(id).then(self.convertSFtoWFM);
};

/**
 *
 * Updating a single entity
 *
 * @param entity
 * @returns {Promise}
 */
SalesForceStore.prototype.update = function update(entity) {
  var self = this;
  // entity = self.convertJSONEntityToRow(entity);
  // return this.getSheet().then(function(sheet) {
  //   return updateEntityRow(sheet, entity).then(self.convertRowEntityToJSON);
  // });

  return sfAPI.update(entity).then(self.convertSFtoWFM);
};

/**
 *
 * Removing a single entity
 *
 * @param id
 * @returns {Promise}
 */
SalesForceStore.prototype.remove = function remove(id) {
  // return this.getSheet().then(function(sheet) {
  //   return removeRowFromSheet(sheet, id);
  // });

  return sfAPI.remove(id);
};

/**
 *
 * Filtering data elements
 *
 * @param filter
 * @returns {Promise}
 */
SalesForceStore.prototype.list = function list(filter) {
  filter = filter || {};
  var self = this;
  // return this.getSheet().then(function(sheet) {
  //   return listEntityRows(sheet, filter).then(function(entityRowArray) {
  //     return _.map(entityRowArray, self.convertRowEntityToJSON);
  //   });
  // });

  var returnFields = this.entitySchema.fields.sfQueryFields;

  return sfAPI.list(returnFields, filter).then(self.convertSFtoWFM);
};

/**
 *
 * Setting up subscribers for the topics related to this entity store.
 *
 * @param {string} topicPrefix - The prefix for this data set (e.g. wfm:cloud:data)
 * @param {Mediator} mediator
 */
SalesForceStore.prototype.listen = function(topicPrefix, mediator) {

  var entityDataSubscribers = new Topic(mediator).prefix(topicPrefix).entity(this.datasetId);

  entityDataSubscribers
    .on('create', _.bind(this.create, this))
    .on('list', _.bind(this.list, this))
    .on('update', _.bind(this.update, this))
    .on('read', _.bind(this.read, this))
    .on('remove', _.bind(this.remove, this));
};

module.exports = SalesForceStore;