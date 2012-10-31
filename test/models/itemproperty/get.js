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

  describe('.get', function() {

    describe('with invalid id', function() {

      it('should return null', function(done) {
        ItemProperty.get(123, function(err, record) {
          should.not.exist(record);
          done();
        });
      });

    });

    describe('with valid id', function() {
      var id;

      beforeEach(function(done) {
        var record = new ItemProperty();
        record._resource.create({item_id: '123', key: 'name'}, function(err, result) {
          id = result.id;
          done(err);
        });
      });

      it('should return a record', function(done) {
        ItemProperty.get(id, function(err, result) {
          result.should.be.an.instanceOf(ItemProperty);
          result.get('key').should.equal('name');
          done();
        });
      });
    });
  });
});