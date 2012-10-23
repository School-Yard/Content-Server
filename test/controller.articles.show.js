var setup = require('./support/setup'),
    helpers = require('./support/helpers'),
    request = require('supertest'),
    should = require('should');

var app, Page;

beforeEach(function(done) {
  setup.Setup(function(result) {
    app = result;

    app.on('ready', function() {
      helpers.createPage(app, { name: 'test', slug: 'test-slug' }, function(err, page) {
        Page = page;
        done();
      });
    });

    app.create();
  });
});

afterEach(function() {
  setup.Teardown(app, ['pages', 'articles']);
});

describe('Articles', function() {
  describe('#show', function() {
    describe('with valid id', function() {
      var api_response;

      beforeEach(function(done) {
        helpers.createArticle(app, { page_id: Page.id, title: 'test', slug: 'test' }, function(err, article) {
          request(app)
          .get('/api/v1/pages/' + Page.id + '/articles/' + article.id)
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
        obj.should.have.property('title');
        obj.should.have.property('slug');
        obj.should.have.property('id');
      });
    });

    describe('with an invalid id', function() {
      var api_response;

      beforeEach(function(done) {
        request(app)
        .get('/api/v1/pages/' + Page.id + '/articles/100')
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
        obj.error.should.equal('No article found with that ID');
      });
    });

  });
});