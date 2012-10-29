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

  describe('#update', function() {
    describe('with no body attributes', function() {
      var response;

      // Make the request and store the response
      before(function(done) {
        helpers.createBucket(app, { name: 'test' }, function(err, result) {
          request(app)
          .put('/api/v1/buckets/' + result.name)
          .set('content-type', 'application/json')
          .end(function(err, res){
            response = res;
            done();
          });
        });
      });

      it('should send a 400 status code', function() {
        response.status.should.equal(400);
      });

      it('should send a 400 status code', function() {
        response.text.should.equal('invalid json');
      });

    });

    describe('with valid attributes', function() {
      var response;

      // Make the request and store the response
      before(function(done) {
        helpers.createBucket(app, { name: 'test' }, function(err, result) {
          request(app)
          .put('/api/v1/buckets/' + result.name)
          .send({ name: 'test updated' })
          .set('content-type', 'application/json')
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

      it('should return the updated json object', function() {
        var obj = JSON.parse(response.text);
        obj.name.should.equal('test-updated');
      });
    });

    describe('with invalid attributes', function() {
      var response;

      // Make the request and store the response
      before(function(done) {
        helpers.createBucket(app, { name: 'test' }, function(err, result) {
          helpers.createBucket(app, { name: 'test2' }, function(err, bucket) {
            request(app)
            .put('/api/v1/buckets/' + bucket.name)
            .send({ name: 'test' })
            .set('content-type', 'application/json')
            .end(function(err, res){
              response = res;
              done();
            });
          });
        });
      });

      it('should send a 500 status code', function() {
        response.status.should.equal(500);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should respond with an error', function() {
        var obj = JSON.parse(response.text);
        obj.error.should.equal('Name must be unique');
      });
    });

  });
});