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

  describe('constructor', function() {

    it('should setup a db connection', function() {
      var article = new Article();
      should.exist(article._resource);
    });

    it('should set default attributes', function() {
      var article = new Article(),
          attrs = {
            page_id: '',
            title: '',
            slug: '',
            published: 0,
            ctime: '',
            mtime: ''
          };

      article._attributes.should.eql(attrs);
    });

  });

  describe('setter', function() {
    it('should set attributes', function() {
      var article = new Article();
      article.set({'title': 'value'});
      article._attributes.title.should.equal('value');
    });
  });

  describe('getter', function() {
    var article;

    before(function() {
      article = new Article();
      article.set({title: 'test', slug: 'test-slug'});
    });

    it('should get string values', function() {
      article.get('title').should.equal('test');
    });

    it('should get an array of values', function() {
      var val = article.get(['title', 'slug']);
      val['title'].should.equal('test');
      val['slug'].should.equal('test-slug');
    });
  });
});