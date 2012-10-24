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

  describe('.validate', function() {

    describe('invalid data', function() {
      describe('with empty properties', function() {
        var item;

        before(function() {
          item = new Item();
        });

        it('should return an error', function(done) {
          item.set({ name: '' });
          item.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Invalid item data');
            done();
          });
        });
      });

      describe('with duplicate name', function() {
        var item;

        before(function(done) {
          item = new Item();
          Item.create({bucket_id: '123', name: 'test'}, done);
        });

        it('should return an error', function(done) {
          item.set({ name: 'test'});
          item.validate(function(err) {
            should.exist(err);
            err.message.should.equal('Invalid item data');
            done();
          });
        });
      });
    });

    describe('valid data', function() {
      var item;

      before(function() {
        item = new Item();
      });

      it('should not return an error', function(done) {
        item.set({ bucket_id: '123', name: 'a-test'});
        item.validate(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });

  });
});