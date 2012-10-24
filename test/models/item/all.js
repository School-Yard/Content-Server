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

  describe('.all', function() {
    describe('without data', function() {
      it('should return an empty array', function(done) {
        Item.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(0);
          done();
        });
      });
    });

    describe('with data', function() {
      beforeEach(function(done) {
        var item = new Item();
        item._resource.create({'name': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with records', function(done) {
        Item.all(function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          done();
        });
      });

      it('should return results as a Item instance', function(done) {
        Item.all(function(err, results) {
          var item = results[0];
          item.should.be.an.instanceOf(Item);
          done();
        });
      });
    });
  });

});