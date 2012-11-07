var app,
    adapters,
    express = require('express'),
    TK = require('trapperkeeper'),
    addons = require('./lib/utils/addons'),
    cors_middleware = require('./lib/middleware/cors'),
    hmac_middleware = require('./lib/middleware/hmac_check');

// Define database adapters
adapters = {
  mongo: TK.connect('mongodb', 'mongodb://127.0.0.1', 27017, { database: 'txssc-content'})
};

// Create an app instance
app = express();

// Add `app.map` to the app
addons.map.call(app);

//Set the adapters on the app instance
app.set('adapters', adapters);

// Middleware
app.use(cors_middleware);
app.use(hmac_middleware(adapters.mongo));
app.use(express.json());
app.use(express.urlencoded());

// Add routes
app.map({
  '/api': {
    '/v1': require('./lib/').v1(app)
  }
});

waitForReady(adapters.mongo, function() {
  // Start listening once the mongo adapter is ready
  app.listen(process.env.PORT || 3000);
  console.log('Listening on port ' + (process.env.PORT || 3000));
});

/**
 * Helper function to start the server once `what`
 *  has fired a `ready` event.
 */

function waitForReady(what, callback) {
  var ready = false;

  what.on('ready', function() {
    ready = true;
  });

  (function checkReady(callback) {
    if(ready) return callback();
    process.nextTick(checkReady.bind(null, callback));
  }).call(null, callback);
}