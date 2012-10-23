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

  describe('.all', function() {
    describe('without data', function() {
      it('should return an empty array', function(done) {
        Page.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(0);
          done();
        });
      });
    });

    describe('with data', function() {
      beforeEach(function(done) {
        var page = new Page();
        page._resource.create({'name': 'test', 'slug': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with records', function(done) {
        Page.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          done();
        });
      });

      it('should return results as a page instance', function(done) {
        Page.all(function(err, results) {
          var item = results[0];
          item.should.be.an.instanceOf(Page);
          done();
        });
      });
    });
  });

});