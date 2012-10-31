var tk = require('trapperkeeper'),
    adapters = {};

exports.connect = function connect(callback) {

  adapters.mongo = tk.connect('mongodb', 'mongodb://127.0.0..1', 27017, { database: 'txssc-content'});

  adapters.mongo.on('ready', function() {
    callback(null, adapters);
  });
};