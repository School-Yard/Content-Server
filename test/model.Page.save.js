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

  describe('.save', function() {

    describe('with no id set', function() {
      var page;

      before(function(done) {
        var attrs = { name: 'test', slug: 'test-record' };
        page = new Page(attrs);
        page.save(done);
      });

      it('should set an id property', function() {
        should.exist(page.get('id'));
      });

      it('should set a ctime', function() {
        page.get('ctime').should.not.equal('');
      });
    });

    describe('with an id set', function() {
      var page;

      before(function() {
        var attrs = { id: 2, name: 'test', slug: 'test-record-2' };
        page = new Page(attrs);
      });

      describe('and no conflicts', function() {

        before(function(done) {
          page.save(done);
        });

        it('should set an mtime', function() {
          page.get('mtime').should.not.equal('');
        });
      });

      describe('and a conflict', function() {

        before(function() {
          page.set({ slug: 'test-record' });
        });

        it('should respond with an error', function(done) {
          page.save(function(err, result) {
            should.exist(err);
            err.message.should.equal('Slug must be unique');
            done();
          });
        });
      });
    });

  });
});