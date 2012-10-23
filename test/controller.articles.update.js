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
  describe('#update', function() {
    describe('with no body attributes', function() {
      var api_response;

      // Make the request and store the response
      beforeEach(function(done) {
        helpers.createArticle(app, { page_id: Page.id, title: 'test', slug: 'test' }, function(err, article) {
          request(app)
          .put('/api/v1/pages/' + Page.id + '/articles/' + article.id)
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
      beforeEach(function(done) {
        helpers.createArticle(app, { page_id: Page.id, title: 'test', slug: 'test' }, function(err, article) {
          request(app)
          .put('/api/v1/pages/' + Page.id + '/articles/' + article.id)
          .send({ title: 'test updated' })
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
        obj.title.should.equal('test updated');
      });
    });

    describe('with invalid attributes', function() {
      var api_response;

      // Make the request and store the response
      beforeEach(function(done) {
        helpers.createArticle(app, { page_id: Page.id, title: 'test', slug: 'test' }, function(err) {
          helpers.createArticle(app, { page_id: Page.id, title: 'test', slug: 'test2' }, function(err, article) {
            request(app)
            .put('/api/v1/pages/' + Page.id + '/articles/' + article.id)
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