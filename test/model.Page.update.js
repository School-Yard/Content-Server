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

  describe('.update', function() {
    var page;

    before(function(done) {
      var attrs = { name: 'test', slug: 'test-record' };
      page = new Page(attrs);
      page.save(done);
    });

    describe('valid attributes', function() {
      it('should update properties', function(done) {
        page.update({ name: 'test-update' }, function(err, result) {
          should.not.exist(err);
          result.get('name').should.equal('test-update');
          done();
        });
      });
    });

    describe('invalid attributes', function() {
      before(function(done) {
        Page.create({ name: 'test', slug: 'otherpage'}, done);
      });

      it('should validate slug', function(done) {
        page.update({ slug: 'otherpage'}, function(error, data) {
          should.exist(error);
          error.message.should.equal('Slug must be unique');
          done();
        });
      });
    });

  });
});