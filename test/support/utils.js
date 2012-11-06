var Utils = module.exports,
    TK = require('trapperkeeper'),
    express = require('express'),
    request = require('supertest'),
    addons = require('../../lib/utils/addons');

Utils.connectDb = function(callback) {
  var connection = TK.connect('memory'),
      connected = false;

  connection.on('ready', function() {
    connected = true;
  });

  (function checkReady(callback) {
    if(connected) return callback(connection);
    process.nextTick(checkReady.bind(null, callback));
  }).call(null, callback);
};

/**
 * Build the application stack for testing
 */
Utils.createApplication = function(callback) {
  var app = express(),
      adapters = {};

  // Middleware to test controllers
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // Set up map functionality
  addons.map.call(app);

  // Forward errors back to the client
  app.use(function(err, req, res, next) {
    res.send(err.status, err.message);
  });

  // Fix an issue with middleware not executing if routes are added
  app.initializeRoutes = function() {
    app.map({
      '/api': {
        '/v1': require('../../lib').v1(app)
      }
    });
  };

  Utils.connectDb(function(connection) {
    adapters.mongo = connection;
    app.set('adapters', adapters);

    return callback(app);
  });
};

/**
 * Controller test helpers
 */

Utils.createBucket = function(app, attrs, callback) {
  request(app)
  .post('/api/v1/buckets')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};

Utils.createItem = function(app, attrs, callback) {
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

Utils.createItemProperties = function(app, attrs, callback) {
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