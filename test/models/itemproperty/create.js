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

  describe('.create', function() {

    describe('with invalid record', function() {
      var attrs = { item_id: '', key: '' };

      it('should return an error', function(done) {
        ItemProperty.create(attrs, function(err, record) {
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.message.should.equal('Invalid item property data');
          done();
        });
      });
    });

    describe('with valid record', function() {
      var attrs = { item_id: '123', key: 'name', value: ''},
          record;

      before(function(done) {
        ItemProperty.create(attrs, function(err, result) {
          if(err) return done(err);
          record = result;
          done();
        });
      });

      it('should return a ItemProperty instance', function() {
        record.should.be.an.instanceOf(ItemProperty);
      });

      it('should slugify the name attribute', function() {
        record.get('key').should.equal('name');
      });

      it('should set the ctime attribute', function() {
        record.get('ctime').should.not.equal('');
      });
    });
  });
});