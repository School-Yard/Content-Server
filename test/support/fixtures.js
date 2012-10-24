/**
 * Fixtures
 *
 * Returns a new Model instance
 */

var db = require('./utils').db,
    BucketModel = require('../../lib/v1/models/bucket'),
    ItemModel = require('../../lib/v1/models/item');

exports.Bucket = function Page(callback) {
  db(function(conn) {
    var options = {
      adapters: {
        mongo: conn // fake a mongo connection with a memory adapter
      }
    };

    var model = new BucketModel(options);
    callback(model);
  });
};

exports.Item = function Item(callback) {
  db(function(conn) {
    var options = {
      adapters: {
        mongo: conn // fake a mongo connection with a memory adapter
      }
    };

    var model = new ItemModel(options);
    callback(model);
  });
};