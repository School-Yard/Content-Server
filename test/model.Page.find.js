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

  describe('.find', function() {

    it('should return an array', function(done) {
      Page.find({}, function(err, results) {
        results.should.be.an.instanceOf(Array);
        done();
      });
    });

    describe('by attribute', function() {

      beforeEach(function(done) {
        var page = new Page();
        page._resource.create({'name': 'test', 'slug': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with matches', function(done) {
        Page.find({name: 'test'}, function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          results[0].get('name').should.equal('test');
          done();
        });
      });

    });
  });

});