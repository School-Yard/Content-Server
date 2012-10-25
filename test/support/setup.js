var recess = require('schoolyard-recess'),
    cards = require('../../lib'),
    connect = require('connect');

exports.Setup = function(connection, callback) {
  var app;

  app = recess();

  app.set('connection', connection);
  app.set('namespace', 'test');
  app.set('adapters', { mongo: connection });

  // Middleware to test controllers
  app.before(connect.bodyParser());
  app.before(connect.methodOverride());

  // Include the API Card
  app.card(cards.v1);

  app.adapters = { mongo: connection };
  app.conn = connection;

  // Create a category at /api/v1
  create_category(connection, function() {
    callback(connection, app);
  });
};

function create_category(db, cb) {
  var test_category = {
    name: 'api',
    slug: 'api',
    published: true,
    plugins: [{ 'API V1' : { published: true }} ]
  };

  var resource = db.resource('test');
  resource.create(test_category, function() {
    cb();
  });
}

exports.Teardown = function(app, namespace) {
  var keys = Object.keys(app.conn.store);

  var keyspace = (namespace instanceof Array) ? namespace : [namespace];

  for(var i = 0; i < keys.length; i++) {
    if(keyspace.indexOf(keys[i].split(':')[0]) >= -1) {
      delete app.conn.store[keys[i]];
    }
  }
};