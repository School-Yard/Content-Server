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

  describe('.get', function() {

    describe('with invalid id', function() {

      it('should return null', function(done) {
        Item.get(123, function(err, item) {
          should.not.exist(item);
          done();
        });
      });

    });

    describe('with valid id', function() {
      var id;

      beforeEach(function(done) {
        var item = new Item();
        item._resource.create({bucket_id: '123', name: 'test'}, function(err, result) {
          id = result.id;
          done(err);
        });
      });

      it('should return a item', function(done) {
        Item.get(id, function(err, result) {
          result.should.be.an.instanceOf(Item);
          result.get('name').should.equal('test');
          done();
        });
      });

    });
  });

});