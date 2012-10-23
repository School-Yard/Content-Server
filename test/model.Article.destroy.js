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

  describe('.destroy', function() {
    var article;

    before(function(done) {
      article = new Article({ page_id: 'abc', title: 'test', slug: 'test' });
      article.save(done);
    });

    it('should remove the record from the datastore', function(done) {
      var id = article.get('id');

      article.destroy(function(err, status) {
        status.should.equal(1);

        Article.get(id, function(err, result) {
          should.not.exist(err);
          should.not.exist(result);
          done();
        });

      });
    });

  });
});