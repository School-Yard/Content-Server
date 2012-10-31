var fixtures = require('../../support/fixtures'),
    should = require('should');

describe('ItemProperty', function() {
  var ItemProperty;

  before(function(done) {
    fixtures.ItemProperty(function(model) {
      ItemProperty = model;
      done();
    });
  });

  describe('constructor', function() {

    it('should setup a db connection', function() {
      var record = new ItemProperty();
      should.exist(record._resource);
    });

    it('should set default attributes', function() {
      var record = new ItemProperty(),
      attrs = {
        item_id: '',
        key: '',
        value: '',
        ctime: '',
        mtime: ''
      };

      record._attributes.should.eql(attrs);
    });

  });

  describe('setter', function() {
    it('should set attributes', function() {
      var record = new ItemProperty();
      record.set({ key: 'name', value: 'test' });
      record._attributes.key.should.equal('name');
    });
  });

  describe('getter', function() {
    var record;

    before(function() {
      record = new ItemProperty();
      record.set({key: 'name', value: 'test'});
    });

    it('should get string values', function() {
      record.get('key').should.equal('name');
    });

    it('should get an array of values', function() {
      var val = record.get(['key', 'value']);
      val.key.should.equal('name');
      val.value.should.equal('test');
    });
  });
});