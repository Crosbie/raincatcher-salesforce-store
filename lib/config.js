var _ = require('lodash');
var config = {};

module.exports = {
  get: function(path) {
    return _.get(config, path);
  },
  set: function(_config) {
    return _.extend(config, _config);
  }
};