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

  describe('.destroy', function() {
    var record;

    before(function(done) {
      record = new ItemProperty({ item_id: '123', key: 'test' });
      record.save(done);
    });

    it('should remove the record from the datastore', function(done) {
      var id = record.get('id');

      record.destroy(function(err, status) {
        status.should.equal(1);

        ItemProperty.get(id, function(err, result) {
          should.not.exist(err);
          should.not.exist(result);
          done();
        });
      });
    });
  });
});