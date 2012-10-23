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

  describe('.get', function() {

    describe('with invalid id', function() {

      it('should return null', function(done) {
        Bucket.get(123, function(err, bucket) {
          should.not.exist(bucket);
          done();
        });
      });

    });

    describe('with valid id', function() {
      var id;

      beforeEach(function(done) {
        var bucket = new Bucket();
        bucket._resource.create({'name': 'test'}, function(err, result) {
          id = result.id;
          done(err);
        });
      });

      it('should return a bucket', function(done) {
        Bucket.get(id, function(err, result) {
          result.should.be.an.instanceOf(Bucket);
          result.get('name').should.equal('test');
          done();
        });
      });

    });
  });

});