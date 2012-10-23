var utils = require('./utils'),
    recess = require('schoolyard-recess'),
    cards = require('../../lib'),
    connect = require('connect');

exports.Setup = function(callback) {
  var db,
      app;

  app = recess();

  utils.db(function(conn) {

    app.set('connection', conn);
    app.set('namespace', 'test');
    app.set('adapters', { mongo: conn });

    // Middleware to test controllers
    app.before(connect.bodyParser());
    app.before(connect.methodOverride());

    // Include the API Card
    app.card(cards.v1);

    app.conn = conn;

    // Create a category at /api/v1
    create_category(conn, function() {
      return callback(app);
    });

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
  for(var i = 0; i < keys.length; i++) {
    if(keys[i].split(':')[0] === namespace) {
      delete app.conn.store[keys[i]];
    }
  }
};