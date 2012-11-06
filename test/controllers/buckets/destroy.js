var Utils = require('../../support/utils'),
    request = require('supertest'),
    should = require('should');

describe('Buckets', function() {
  var app;

  before(function(done) {
    Utils.createApplication(function(server) {
      app = server;

      app.use(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      app.initializeRoutes();
      done();
    });
  });

  describe('#destroy', function() {
    describe('with invalid name', function() {
      var response;

      before(function(done) {
        request(app)
        .del('/api/v1/buckets/invalid_name')
        .end(function(err, res){
          response = res;
          done();
        });
      });

      it('should send a 404 status code', function() {
        response.status.should.equal(404);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should send an error message', function() {
        var obj = JSON.parse(response.text);
        obj.error.should.equal("Can't find that bucket");
      });
    });

    describe('with valid id', function() {
      var response;

      before(function(done) {
        Utils.createBucket(app, { name: 'test' }, function(err, result) {
          request(app)
          .del('/api/v1/buckets/' + result.name)
          .end(function(err, res){
            response = res;
            done();
          });
        });
      });

      it('should send a 200 status code', function() {
        response.status.should.equal(200);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should send a status message', function() {
        var obj = JSON.parse(response.text);
        obj.status.should.equal(1);
      });
    });

  });
});