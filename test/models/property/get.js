var fixtures = require('../../support/fixtures'),
    should = require('should');

describe('Property', function() {
  var Property;

  before(function(done) {
    fixtures.Property(function(model) {
      Property = model;
      done();
    });
  });

  describe('.get', function() {

    describe('with invalid id', function() {

      it('should return null', function(done) {
        Property.get(123, function(err, record) {
          should.not.exist(record);
          done();
        });
      });

    });

    describe('with valid id', function() {
      var id;

      beforeEach(function(done) {
        var record = new Property();
        record._resource.create({item_id: '123', key: 'name'}, function(err, result) {
          id = result.id;
          done(err);
        });
      });

      it('should return a record', function(done) {
        Property.get(id, function(err, result) {
          result.should.be.an.instanceOf(Property);
          result.get('key').should.equal('name');
          done();
        });
      });
    });
  });
});