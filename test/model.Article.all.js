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

  describe('.all', function() {
    describe('without data', function() {
      it('should return an empty array', function(done) {
        Article.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(0);
          done();
        });
      });
    });

    describe('with data', function() {
      beforeEach(function(done) {
        var article = new Article();
        article._resource.create({'title': 'test', 'slug': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with records', function(done) {
        Article.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          done();
        });
      });

      it('should return results as a article instance', function(done) {
        Article.all(function(err, results) {
          var item = results[0];
          item.should.be.an.instanceOf(Article);
          done();
        });
      });
    });
  });

});