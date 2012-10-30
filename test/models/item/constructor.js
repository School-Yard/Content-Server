var fixtures = require('../../support/fixtures'),
    should = require('should');

describe('Item', function() {
  var Item;

  before(function(done) {
    fixtures.Item(function(model) {
      Item = model;
      done();
    });
  });

  describe('constructor', function() {

    it('should setup a db connection', function() {
      var item = new Item();
      should.exist(item._resource);
    });

    it('should set default attributes', function() {
      var item = new Item(),
          attrs = {
            bucket_id: '',
            name: '',
            ctime: '',
            mtime: ''
          };

      item._attributes.should.eql(attrs);
    });

  });

  describe('setter', function() {
    it('should set attributes', function() {
      var item = new Item();
      item.set({'name': 'value'});
      item._attributes.name.should.equal('value');
    });
  });

  describe('getter', function() {
    var item;

    before(function() {
      item = new Item();
      item.set({name: 'test slug'});
    });

    it('should get string values', function() {
      item.get('name').should.equal('test-slug');
    });

    it('should get an array of values', function() {
      var val = item.get(['name', 'ctime']);
      val.name.should.equal('test-slug');
      should.exist(val.ctime);
    });
  });
});