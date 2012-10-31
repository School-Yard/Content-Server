var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Buckets', function() {
  var app;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;

      app.before(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      done();
    });
  });

  after(function() {
    helpers.clearData(app, 'buckets');
  });

  describe('#index', function() {
    describe('with records', function() {
      var response;

      before(function(done) {
        helpers.createBucket(app, { name: 'test' }, function(err, result) {
          request(app)
          .get('/api/v1/buckets')
          .end(function(err, res) {
            if(err) return callback(err);
            response = res;
            done();
          });
        });
      });

      it('should return a 200 status code', function() {
        response.status.should.equal(200);
      });

      it('should return a json content-type header', function() {
        response.should.be.json;
      });

      it('should return an array', function() {
        var obj = JSON.parse(response.text);
        obj.should.be.an.instanceOf(Array);
        obj.length.should.equal(1);
      });

      it('should return a a single record', function() {
        var obj = JSON.parse(response.text)[0];
        obj.should.have.property('name');
        obj.should.have.property('id');
      });
    });
  });
});