var fixtures = require('./support/fixtures'),
    should = require('should');

describe('Article', function() {
  var Article;

  before(function(done) {
    fixtures.Article(function(model) {
      Article = model;
      done();
    });
  });

  describe('.get', function() {

    describe('with invalid id', function() {

      it('should return null', function(done) {
        Article.get(123, function(err, article) {
          should.not.exist(article);
          done();
        });
      });

    });

    describe('with valid id', function() {
      var id;

      beforeEach(function(done) {
        var article = new Article();
        article._resource.create({page_id: 'abc', title: 'test', slug: 'test'}, function(err, result) {
          id = result.id;
          done(err);
        });
      });

      it('should return an article', function(done) {
        Article.get(id, function(err, result) {
          result.should.be.an.instanceOf(Article);
          result.get('title').should.equal('test');
          done();
        });
      });

    });
  });

});