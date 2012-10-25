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

helpers.createItem = function(app, attrs, callback) {
  if(!attrs.bucket_id) {
    return callback(new Error('A bucket_id attribute is required for the createItem helper'));
  }

  request(app)
  .post('/api/v1/buckets/' + attrs.bucket_id + '/items')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};