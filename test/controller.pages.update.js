var setup = require('./support/setup'),
    helpers = require('./support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Pages', function() {
  describe('#update', function() {
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

    describe('with no body attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        helpers.createPage(app, { name: 'test', slug: 'test' }, function(err, page) {
          request(app)
          .put('/api/v1/pages/' + page.id)
          .set('content-type', 'application/json')
          .end(function(err, res){
            api_response = res;
            done();
          });
        });
      });

      it('should send a 400 status code', function() {
        api_response.status.should.equal(400);
      });

      it('should send a 400 status code', function() {
        api_response.text.should.equal('invalid json');
      });

    });

    describe('with valid attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        helpers.createPage(app, { name: 'test', slug: 'test' }, function(err, page) {
          request(app)
          .put('/api/v1/pages/' + page.id)
          .send({ name: 'test updated' })
          .set('content-type', 'application/json')
          .end(function(err, res){
            api_response = res;
            done();
          });
        });
      });

      it('should send a 200 status code', function() {
        api_response.status.should.equal(200);
      });

      it('should set the content-type header', function() {
        api_response.should.be.json;
      });

      it('should return the updated json object', function() {
        var obj = JSON.parse(api_response.text);
        obj.name.should.equal('test updated');
      });
    });

    describe('with invalid attributes', function() {
      var api_response;

      // Make the request and store the response
      before(function(done) {
        helpers.createPage(app, { name: 'test', slug: 'test' }, function(err) {
          helpers.createPage(app, { name: 'test', slug: 'test2' }, function(err, page) {
            request(app)
            .put('/api/v1/pages/' + page.id)
            .send({ slug: 'test' })
            .set('content-type', 'application/json')
            .end(function(err, res){
              api_response = res;
              done();
            });
          });
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
        obj.error.should.equal('Slug must be unique');
      });
    });

  });
});