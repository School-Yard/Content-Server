/**
 * Fixtures
 *
 * Returns a new Model instance
 */

var db = require('./utils').db,
    BucketModel = require('../../lib/v1/models/bucket'),
    ArticleModel = require('../../lib/v1/models/article');

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

exports.Article = function Article(callback) {
  db(function(conn) {
    var options = {
      adapters: {
        mongo: conn // fake a mongo connection with a memory adapter
      }
    };

    var model = new ArticleModel(options);
    callback(model);
  });
};