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

  describe('.find', function() {

    it('should return an array', function(done) {
      Bucket.find({}, function(err, results) {
        results.should.be.an.instanceOf(Array);
        done();
      });
    });

    describe('by attribute', function() {

      beforeEach(function(done) {
        var bucket = new Bucket();
        bucket._resource.create({'name': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with matches', function(done) {
        Bucket.find({name: 'test'}, function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          results[0].get('name').should.equal('test');
          done();
        });
      });

    });
  });

});