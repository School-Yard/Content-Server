var setup = require('./support/setup'),
    helpers = require('./support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Pages', function() {
  describe('#index', function() {
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

    describe('with records', function() {
      var api_response;

      before(function(done) {
        helpers.createPage(app, { name: 'test', slug: 'test' }, function(err, page) {
          request(app)
          .get('/api/v1/pages')
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

      it('should return an array', function() {
        var obj = JSON.parse(api_response.text);
        obj.should.be.an.instanceOf(Array);
        obj.length.should.equal(1);
      });

      it('should return a a single record', function() {
        var obj = JSON.parse(api_response.text)[0];
        obj.should.have.property('name');
        obj.should.have.property('slug');
        obj.should.have.property('id');
      });
    });
  });
});