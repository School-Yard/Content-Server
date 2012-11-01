var express = require('express'),
    client = require('scoped-http-client'),
    TK = require('trapperkeeper'),
    crypto = require('crypto'),
    app = express(),
    Support = module.exports;


var user = Support.User = {
  id: '12345',
  role: 2,
  name: 'Testing User',
  auth_key: 'insecure_key',
  email: 'testing@example.com',
  auth_secret: 'dirty_secret'
};

var bootUser = Support.bootUser = function(connection, callback) {
  var resource = connection.resource('users');

  resource.create(user, function(err, user) {
    if(err) throw err;
    return callback();
  });
};


var createServer = Support.createServer = function(callback) {
  var database = TK.connect('mongodb', 'mongodb://127.0.0.1', 27017, {database: 'txssc-content'});

  database.on('ready', function() {
    return bootUser(database, callback);
  });

  // Express settings
  app.use(express.bodyParser());
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/templates');
  app.set('view options', {layout: false});

  return app;
};


/**
 * Make a request to the content api
 *  - requires that environment variable content_uri is set
 */
var makeRequest = Support.makeRequest = function() {
  var timeBlock,
      computed;

  timeBlock = Math.floor(new Date().getTime() / 1000 / 60); // 60 seconds
  computed = crypto.createHmac('sha512', user.auth_secret).update(user.email + timeBlock).digest('base64');


  return client.create('http://localhost:3000')
    .header('Authorization', user.auth_key + ':' + computed);
};