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

  describe('.validate', function() {

    describe('invalid data', function() {
      describe('with empty properties', function() {
        var record;

        before(function() {
          record = new ItemProperty();
        });

        it('should return an error', function(done) {
          record.set({ key: 'name' });
          record.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Invalid item property data');
            done();
          });
        });
      });

    });

    describe('valid data', function() {
      var record;

      before(function() {
        record = new ItemProperty();
      });

      it('should not return an error', function(done) {
        record.set({ item_id: '123', key: 'name'});
        record.validate(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });

  });
});