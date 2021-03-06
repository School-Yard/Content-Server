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

  describe('#create', function() {

    describe('with no body attributes', function() {
      it('should send a 400 status code', function(done) {
        request(app)
        .post('/api/v1/buckets')
        .set('content-type', 'application/json')
        .expect(400, done);
      });
    });

    describe('with valid attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .post('/api/v1/buckets')
        .send({ name: 'test-slugify' })
        .set('content-type', 'application/json')
        .end(function(err, res){
          api_response = res;

          // Hack to get around crazy before/after stuff
          request(app)
          .del('/api/v1/buckets/' + JSON.parse(res.text).name)
          .end(function(err, res){
            done();
          });
        });
      });

      it('should send a 201 status code', function() {
        api_response.status.should.equal(201);
      });

      it('should set the content-type header', function() {
        api_response.should.be.json;
      });

      it('should return a json object', function() {
        var obj = JSON.parse(api_response.text);
        obj.should.have.property('name');
        obj.should.have.property('id');
      });

      it('should slugify the slug attribute', function() {
        var obj = JSON.parse(api_response.text);
        obj.name.should.equal('test-slugify');
      });
    });

    describe('with invalid attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .post('/api/v1/buckets')
        .send({ name: '' })
        .set('content-type', 'application/json')
        .end(function(err, res){
          api_response = res;
          done();
        });
      });

      it('should send a 500 status code', function() {
        api_response.status.should.equal(500);
      });

      it('should set the content-type header', function() {
        api_response.should.be.json;
      });

      it('should respond with an error', function() {
        var obj = JSON.parse(api_response.text);
        obj.error.should.equal('Invalid Bucket data');
      });
    });

  });
});