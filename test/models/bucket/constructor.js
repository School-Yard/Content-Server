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

  describe('constructor', function() {

    it('should setup a db connection', function() {
      var bucket = new Bucket();
      should.exist(bucket._resource);
    });

    it('should set default attributes', function() {
      var bucket = new Bucket(),
          attrs = {
            name: '',
            ctime: '',
            mtime: ''
          };

      bucket._attributes.should.eql(attrs);
    });

  });

  describe('setter', function() {
    it('should set attributes', function() {
      var bucket = new Bucket();
      bucket.set({'name': 'value'});
      bucket._attributes.name.should.equal('value');
    });
  });

  describe('getter', function() {
    var bucket;

    before(function() {
      bucket = new Bucket();
      bucket.set({name: 'test slug'});
    });

    it('should get string values', function() {
      bucket.get('name').should.equal('test-slug');
    });

    it('should get an array of values', function() {
      var val = bucket.get(['name']);
      val.name.should.equal('test-slug');
    });
  });
});