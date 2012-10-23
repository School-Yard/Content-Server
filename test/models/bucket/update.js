var fixtures = require('../../support/fixtures'),
    should = require('should');

describe('Bucket', function() {
  var Bucket;

  before(function(done) {
    fixtures.Bucket(function(model) {
      Bucket = model;
      done();
    });
  });

  describe('.update', function() {
    var bucket;

    before(function(done) {
      var attrs = { name: 'test' };
      bucket = new Bucket(attrs);
      bucket.save(done);
    });

    describe('valid attributes', function() {
      it('should update properties', function(done) {
        bucket.update({ name: 'test-update' }, function(err, result) {
          should.not.exist(err);
          result.get('name').should.equal('test-update');
          done();
        });
      });
    });

    describe('invalid attributes', function() {
      before(function(done) {
        Bucket.create({ name: 'otherpage'}, done);
      });

      it('should validate name', function(done) {
        bucket.update({ name: 'otherpage'}, function(error, data) {
          should.exist(error);
          error.message.should.equal('Name must be unique');
          done();
        });
      });
    });

  });
});