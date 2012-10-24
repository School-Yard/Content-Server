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

  describe('.destroy', function() {
    var item;

    before(function(done) {
      item = new Item({ bucket_id: '123', name: 'test' });
      item.save(done);
    });

    it('should remove the record from the datastore', function(done) {
      var id = item.get('id');

      item.destroy(function(err, status) {
        status.should.equal(1);

        Item.get(id, function(err, result) {
          should.not.exist(err);
          should.not.exist(result);
          done();
        });

      });
    });

  });
});