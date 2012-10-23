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

  describe('.destroy', function() {
    var bucket;

    before(function(done) {
      bucket = new Bucket({ name: 'test' });
      bucket.save(done);
    });

    it('should remove the record from the datastore', function(done) {
      var id = bucket.get('id');

      bucket.destroy(function(err, status) {
        status.should.equal(1);

        Bucket.get(id, function(err, result) {
          should.not.exist(err);
          should.not.exist(result);
          done();
        });

      });
    });

  });
});