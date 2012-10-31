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

  describe('.all', function() {
    describe('without data', function() {
      it('should return an empty array', function(done) {
        ItemProperty.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(0);
          done();
        });
      });
    });

    describe('with data', function() {
      beforeEach(function(done) {
        var record = new ItemProperty();
        record._resource.create({ key: 'name', value: 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with records', function(done) {
        ItemProperty.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          done();
        });
      });

      it('should return results as a ItemProperty instance', function(done) {
        ItemProperty.all(function(err, results) {
          var record = results[0];
          record.should.be.an.instanceOf(ItemProperty);
          done();
        });
      });
    });
  });
});