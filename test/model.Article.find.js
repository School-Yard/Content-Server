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

  describe('.find', function() {

    it('should return an array', function(done) {
      Article.find({}, function(err, results) {
        results.should.be.an.instanceOf(Array);
        done();
      });
    });

    describe('by attribute', function() {

      beforeEach(function(done) {
        var article = new Article();
        article._resource.create({page_id: 'abc', title: 'test', slug: 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with matches', function(done) {
        Article.find({page_id: 'abc'}, function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          results[0].get('title').should.equal('test');
          done();
        });
      });

    });
  });

});