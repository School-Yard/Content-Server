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

  describe('.create', function() {

    describe('with invalid record', function() {
      var attrs = { title: '', slug: '' };

      it('should return an error', function(done) {
        Article.create(attrs, function(err, article) {
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.message.should.equal('Invalid Article data');
          done();
        });
      });
    });

    describe('with valid record', function() {
      var attrs = { page_id: 'abc', title: 'test', slug: 'test slug' },
          article;

      before(function(done) {
        Article.create(attrs, function(err, result) {
          if(err) return done(err);
          article = result;
          done();
        });
      });

      it('should return an Article instance', function() {
        article.should.be.an.instanceOf(Article);
      });

      it('should slugify the slug attribute', function() {
        article.get('slug').should.equal('test-slug');
      });

      it('should set the ctime attribute', function() {
        article.get('ctime').should.not.equal('');
      });
    });

  });

});