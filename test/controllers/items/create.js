var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Items', function() {
  var app, bucket;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;

      app.before(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      // Create a bucket to use for item tests
      helpers.createBucket(app, { name: 'test' }, function(err, result) {
        bucket = result;
        done();
      });
    });
  });

  after(function() {
    helpers.clearData(app, ['buckets', 'items']);
  });

  describe('#create', function() {

    describe('with no body attributes', function() {
      it('should send a 400 status code', function(done) {
        request(app)
        .post('/api/v1/buckets/' + bucket.name + '/items')
        .set('content-type', 'application/json')
        .expect(400, done);
      });
    });

    describe('with valid attributes', function() {
      var response;

      // Make the request and store the response
      beforeEach(function(done) {
        request(app)
        .post('/api/v1/buckets/' + bucket.name + '/items')
        .send({ name: 'test item' })
        .set('content-type', 'application/json')
        .end(function(err, res) {
          response = res;
          done();
        });
      });

      it('should send a 201 status code', function() {
        response.status.should.equal(201);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should return a json object', function() {
        var obj = JSON.parse(response.text);
        obj.should.have.property('name');
        obj.should.have.property('id');
        obj.should.have.property('bucket_id');
        obj.should.have.property('published');
      });

      it('should slugify the slug attribute', function() {
        var obj = JSON.parse(response.text);
        obj.name.should.equal('test-item');
      });
    });

    describe('with invalid attributes', function() {
      var response;

      // Make the request and store the response
      beforeEach(function(done) {
        request(app)
        .post('/api/v1/buckets/' + bucket.name + '/items')
        .send({ name: '' })
        .set('content-type', 'application/json')
        .end(function(err, res){
          response = res;
          done();
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
        obj.error.should.equal('Invalid item data');
      });
    });

  });
});