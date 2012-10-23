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

  describe('.create', function() {

    describe('with invalid record', function() {
      var attrs = { name: '' };

      it('should return an error', function(done) {
        Bucket.create(attrs, function(err, bucket) {
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.message.should.equal('Invalid Bucket data');
          done();
        });
      });
    });

    describe('with valid record', function() {
      var attrs = { name: 'test slugify' },
          bucket;

      before(function(done) {
        Bucket.create(attrs, function(err, result) {
          if(err) return done(err);
          bucket = result;
          done();
        });
      });

      it('should return a Bucket instance', function() {
        bucket.should.be.an.instanceOf(Bucket);
      });

      it('should slugify the name attribute', function() {
        bucket.get('name').should.equal('test-slugify');
      });

      it('should set the ctime attribute', function() {
        bucket.get('ctime').should.not.equal('');
      });
    });

  });

});