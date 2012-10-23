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

  describe('.destroy', function() {
    var page;

    before(function(done) {
      page = new Page({ name: 'test', slug: 'test' });
      page.save(done);
    });

    it('should remove the record from the datastore', function(done) {
      var id = page.get('id');

      page.destroy(function(err, status) {
        status.should.equal(1);

        Page.get(id, function(err, result) {
          should.not.exist(err);
          should.not.exist(result);
          done();
        });

      });
    });

  });
});