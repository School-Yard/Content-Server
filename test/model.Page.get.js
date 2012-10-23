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

  describe('.get', function() {

    describe('with invalid id', function() {

      it('should return null', function(done) {
        Page.get(123, function(err, page) {
          should.not.exist(page);
          done();
        });
      });

    });

    describe('with valid id', function() {
      var id;

      beforeEach(function(done) {
        var page = new Page();
        page._resource.create({'name': 'test', 'slug': 'test'}, function(err, result) {
          id = result.id;
          done(err);
        });
      });

      it('should return a page', function(done) {
        Page.get(id, function(err, result) {
          result.should.be.an.instanceOf(Page);
          result.get('name').should.equal('test');
          done();
        });
      });

    });
  });

});