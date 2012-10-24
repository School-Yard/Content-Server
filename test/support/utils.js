
var utils = module.exports = {};

utils.db = function(callback) {
  var trapper_keeper = require('trapperkeeper');
  var conn = trapper_keeper.connect('memory');
  conn.on('ready', function() {
    callback(conn);
  });
};