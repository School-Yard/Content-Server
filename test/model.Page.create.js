var fixtures = require('./support/fixtures'),
    should = require('should');

describe('Page', function() {
  var Page;

  before(function(done) {
    fixtures.Page(function(model) {
      Page = model;
      done();
    });
  });

  describe('.create', function() {

    describe('with invalid record', function() {
      var attrs = { name: '', slug: '' };

      it('should return an error', function(done) {
        Page.create(attrs, function(err, page) {
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.message.should.equal('Invalid Page data');
          done();
        });
      });
    });

    describe('with valid record', function() {
      var attrs = { name: 'test', slug: 'test slug' },
          page;

      before(function(done) {
        Page.create(attrs, function(err, result) {
          if(err) return done(err);
          page = result;
          done();
        });
      });

      it('should return a Page instance', function() {
        page.should.be.an.instanceOf(Page);
      });

      it('should slugify the slug attribute', function() {
        page.get('slug').should.equal('test-slug');
      });

      it('should set the ctime attribute', function() {
        page.get('ctime').should.not.equal('');
      });
    });

  });

});