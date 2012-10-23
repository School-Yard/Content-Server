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

  describe('.all', function() {
    describe('without data', function() {
      it('should return an empty array', function(done) {
        Bucket.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(0);
          done();
        });
      });
    });

    describe('with data', function() {
      beforeEach(function(done) {
        var bucket = new Bucket();
        bucket._resource.create({'name': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with records', function(done) {
        Bucket.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          done();
        });
      });

      it('should return results as a Bucket instance', function(done) {
        Bucket.all(function(err, results) {
          var item = results[0];
          item.should.be.an.instanceOf(Bucket);
          done();
        });
      });
    });
  });

});