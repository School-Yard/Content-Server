var connectDb = require('./utils').connectDb,
    BucketModel = require('../../lib/v1/models/bucket'),
    ItemModel = require('../../lib/v1/models/item'),
    PropertyModel = require('../../lib/v1/models/property');

/**
 * Fixtures
 *
 * Returns a new Model instance
 */

exports.Bucket = function(callback) {
  connectDb(function(connection) {
    var model = new BucketModel(connection);
    return callback(model);
  });
};

exports.Item = function(callback) {
  connectDb(function(connection) {
    var model = new ItemModel(connection);
    return callback(model);
  });
};

exports.Property = function(callback) {
  connectDb(function(connection) {
    var model = new PropertyModel(connection);
    return callback(model);
  });
};