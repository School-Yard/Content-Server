/**
 * Fixtures
 *
 * Returns a new Model instance
 */

var db = require('./utils').db,
    PageModel = require('../../lib/v1/models/page'),
    ArticleModel = require('../../lib/v1/models/article');

exports.Page = function Page(callback) {
  db(function(conn) {
    var options = {
      adapters: {
        mongo: conn // fake a mongo connection with a memory adapter
      }
    };

    var model = new PageModel(options);
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