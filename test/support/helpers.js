var request = require('supertest');

var helpers = module.exports = {};

helpers.createPage = function(app, attrs, callback) {
  request(app)
  .post('/api/v1/pages/')
  .send(attrs)
  .set('content-type', 'application/json')
  .end(function(err, res) {
    if(err) return callback(err);
    callback(null, JSON.parse(res.text));
  });
};