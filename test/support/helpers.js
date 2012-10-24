var setup = require('./setup'),
    db = require('./utils').db,
    request = require('supertest'),
    BucketModel = require('../../lib/v1/models/bucket');

var helpers = module.exports = {};

helpers.buildServer = function(callback) {
  db(function(conn) {
    setup.Setup(conn, function(connection, result) {
      var app = result;
      app.on('ready', function() {
	callback(conn, app);
      });
      app.create();
    });
  });
};

helpers.clearData = function(app, namespace) {
  setup.Teardown(app, namespace);
};

helpers.createBucket = function(app, attrs, callback) {
  request(app)
  .post('/api/v1/buckets')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};
  request(app)
  .post('/api/v1/pages/')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};

helpers.createArticle = function(app, attrs, callback) {
  if(!attrs.page_id) {
    return callback(new Error('A page_id attribute is required for the createArticle helper'));
  }

  request(app)
  .post('/api/v1/pages/' + attrs.page_id + '/articles')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};