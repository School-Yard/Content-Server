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

  describe('.validate', function() {

    describe('invalid data', function() {
      describe('with empty properties', function() {
        var page;

        before(function() {
          page = new Page();
        });

        it('should return an error', function(done) {
          page.set({ name: 'test', slug: ''});
          page.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Invalid Page data');
            done();
          });
        });
      });

      describe('with duplicate slug', function() {
        var page;

        before(function(done) {
          page = new Page();
          Page.create({name: 'test', slug: 'test'}, done);
        });

        it('should return an error', function(done) {
          page.set({ name: 'test', slug: 'test'});
          page.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Slug must be unique');
            done();
          });
        });
      });
    });

    describe('valid data', function() {
      var page;

      before(function() {
        page = new Page();
      });

      it('should not return an error', function(done) {
        page.set({ name: 'test', slug: 'a-test'});
        page.validate(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });

  });
});