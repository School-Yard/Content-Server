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

  if(!attrs.bucket_name) {
    return callback(new Error('A bucket_name attribute is required for the createItem helper'));
  }

  var bucket_name = attrs.bucket_name;
  delete attrs.bucket_name;

  request(app)
  .post('/api/v1/buckets/' + bucket_name + '/items')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};

helpers.createItemProperties = function(app, attrs, callback) {
  if(!attrs.bucket_name) {
    return callback(new Error('A bucket_name attribute is required for the createItemProperties helper'));
  }

  if(!attrs.item_name) {
    return callback(new Error('A item_name attribute is required for the createItemProperties helper'));
  }

  if(!attrs.body) {
    return callback(new Error('A body attribute is required for the createItemProperties helper'));
  }

  request(app)
  .post('/api/v1/buckets/' + attrs.bucket_name + '/items/' + attrs.item_name + '/properties')
  .send(attrs.body)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};