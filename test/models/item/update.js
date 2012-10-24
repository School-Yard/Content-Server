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

  describe('.update', function() {
    var item;

    before(function(done) {
      var attrs = { bucket_id: '123', name: 'test' };
      item = new Item(attrs);
      item.save(done);
    });

    describe('valid attributes', function() {
      it('should update properties', function(done) {
        item.update({ name: 'test-update' }, function(err, result) {
          should.not.exist(err);
          result.get('name').should.equal('test-update');
          done();
        });
      });
    });

    describe('invalid attributes', function() {
      before(function(done) {
        Item.create({ bucket_id: '123', name: 'otherpage'}, done);
      });

      it('should validate name', function(done) {
        item.update({ name: 'otherpage'}, function(error, data) {
          should.exist(error);
          error.message.should.equal('Name must be unique');
          done();
        });
      });
    });

  });
});