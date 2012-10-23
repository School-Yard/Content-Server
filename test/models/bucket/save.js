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

  describe('.save', function() {

    describe('with no id set', function() {
      var bucket;

      before(function(done) {
        var attrs = { name: 'test' };
        bucket = new Bucket(attrs);
        bucket.save(done);
      });

      it('should set an id property', function() {
        should.exist(bucket.get('id'));
      });

      it('should set a ctime', function() {
        bucket.get('ctime').should.not.equal('');
      });
    });

    describe('with an id set', function() {
      var bucket;

      beforeEach(function() {
        var conflictBucket = Bucket.create({ name: 'conflict' }, function(err, record) {
          var attrs = { id: 2, name: 'test record' };
          bucket = new Bucket(attrs);
        });
      });

      describe('and no conflicts', function() {

        beforeEach(function(done) {
          bucket.save(done);
        });

        it('should set an mtime', function() {
          bucket.get('mtime').should.not.equal('');
        });
      });

      describe('and a conflict', function() {

        beforeEach(function() {
          bucket.set({ name: 'conflict' });
        });

        it('should respond with an error', function(done) {
          bucket.save(function(err, result) {
            should.exist(err);
            err.message.should.equal('Name must be unique');
            done();
          });
        });
      });
    });

  });
});