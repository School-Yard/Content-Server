var setup = require('./support/setup'),
    helpers = require('./support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Pages', function() {
  describe('#show', function() {
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

    describe('with valid id', function() {
      var api_response;

      before(function(done) {
        helpers.createPage(app, { name: 'test', slug: 'test' }, function(err, page) {
          request(app)
          .get('/api/v1/pages/' + page.id)
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

      it('should return a json object', function() {
        var obj = JSON.parse(api_response.text);
        obj.should.have.property('name');
        obj.should.have.property('slug');
        obj.should.have.property('id');
      });
    });

    describe('with an invalid id', function() {
      var api_response;

      before(function(done) {
        request(app)
        .get('/api/v1/pages/100')
        .end(function(err, res){
          api_response = res;
          done();
        });
      });

      it('should send a 404 status code', function() {
        api_response.status.should.equal(404);
      });

      it('should set the content-type header', function() {
        api_response.should.be.json;
      });

      it('should send an error message', function() {
        var obj = JSON.parse(api_response.text);
        obj.error.should.equal('No record found with that ID');
      });
    });

  });
});