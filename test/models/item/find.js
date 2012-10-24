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

  describe('.find', function() {

    it('should return an array', function(done) {
      Item.find({}, function(err, results) {
        results.should.be.an.instanceOf(Array);
        done();
      });
    });

    describe('by attribute', function() {

      beforeEach(function(done) {
        var item = new Item();
        item._resource.create({'name': 'test'}, function(err, result) {
          done(err);
        });
      });

      it('should return an array with matches', function(done) {
        Item.find({name: 'test'}, function(err, results) {
          results.should.be.an.instanceOf(Array);
          results.length.should.equal(1);
          results[0].get('name').should.equal('test');
          done();
        });
      });

    });
  });

});