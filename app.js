var connect = require('connect'),
    recess = require('schoolyard-recess'),
    db = require('./lib/utils/dbConnect'),
    bootstrap = require('./lib/utils/bootstrapCategory'),
    cors_middleware = require('./lib/middleware/cors'),
    hmac_middleware = require('./lib/middleware/hmac_check'),
    api_v1_card = require('./lib/v1'),
    app;

db.connect(function(err, adapters) {

  // Create an app instance
  app = recess();

  // Card Catalog Options
  app.set('connection', adapters.mongo);
  app.set('namespace', 'categories');
  app.set('adapters', adapters);

  // Middleware
  app.before(cors_middleware);
  app.before(hmac_middleware(adapters.mongo));
  app.before(connect.json());
  app.before(connect.urlencoded());

  // API Card
  app.card(api_v1_card);

  app.on('ready', function() {
    app.listen(process.env.PORT || 3000);
    console.log('Listening on port ' + (process.env.PORT || 3000));
  });

  bootstrap(adapters.mongo, function(err) {
    if(err) throw error(err);

    // Create the card catalog
    app.create();
  });
});