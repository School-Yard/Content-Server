var trapper_keeper = require('trapperkeeper'),
    request = require('supertest');

var utils = module.exports = {};

utils.db = function(callback) {
  var conn = trapper_keeper.connect('memory');
  conn.on('ready', function() {
    callback(conn);
  });
};