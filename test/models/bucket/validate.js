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

  describe('.validate', function() {

    describe('invalid data', function() {
      describe('with empty properties', function() {
        var bucket;

        before(function() {
          bucket = new Bucket();
        });

        it('should return an error', function(done) {
          bucket.set({ name: '' });
          bucket.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Invalid Bucket data');
            done();
          });
        });
      });

      describe('with duplicate name', function() {
        var bucket;

        before(function(done) {
          bucket = new Bucket();
          Bucket.create({name: 'test'}, done);
        });

        it('should return an error', function(done) {
          bucket.set({ name: 'test'});
          bucket.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Name must be unique');
            done();
          });
        });
      });
    });

    describe('valid data', function() {
      var bucket;

      before(function() {
        bucket = new Bucket();
      });

      it('should not return an error', function(done) {
        bucket.set({ name: 'a-test'});
        bucket.validate(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });

  });
});