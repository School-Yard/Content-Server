var setup = require('./support/setup'),
    request = require('supertest'),
    should = require('should');

describe('Pages', function() {
  var app;

  before(function(done) {
    setup.Setup(function(result) {
      app = result;

      app.on('ready', function() {
        done();
      });

      app.create();
    });
  });

  afterEach(function() {
    setup.Teardown(app, 'pages');
  });

  describe('#create', function() {

    describe('with no body attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .post('/api/v1/pages')
        .set('content-type', 'application/json')
        .end(function(err, res){
          api_response = res;
          done();
        });
      });

      it('should send a 400 status code', function() {
        api_response.status.should.equal(400);
      });

    });

    describe('with valid attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .post('/api/v1/pages')
        .send({ name: 'test', slug: 'test slug' })
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
        obj.should.have.property('slug');
        obj.should.have.property('id');
      });

      it('should slugify the slug attribute', function() {
        var obj = JSON.parse(api_response.text);
        obj.slug.should.equal('test-slug');
      });
    });

    describe('with invalid attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .post('/api/v1/pages')
        .send({ name: 'test' })
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
        obj.error.should.equal('Invalid Page data');
      });
    });

  });
});