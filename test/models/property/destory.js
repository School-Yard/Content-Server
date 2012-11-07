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

  describe('.destroy', function() {
    var record;

    before(function(done) {
      record = new Property({ item_id: '123', key: 'test' });
      record.save(done);
    });

    it('should remove the record from the datastore', function(done) {
      var id = record.get('id');

      record.destroy(function(err, status) {
        status.should.equal(1);

        Property.get(id, function(err, result) {
          should.not.exist(err);
          should.not.exist(result);
          done();
        });
      });
    });
  });
});