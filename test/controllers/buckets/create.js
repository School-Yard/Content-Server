var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Buckets', function() {
  var app;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;
      done();
    });
  });

  after(function() {
    helpers.clearData(app, 'buckets');
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
      beforeEach(function(done) {
        request(app)
        .post('/api/v1/buckets')
        .send({ name: 'test-slugify' })
        .set('content-type', 'application/json')
        .end(function(err, res){
          api_response = res;
          done();
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
      beforeEach(function(done) {
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