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

  describe('.update', function() {
    var record;

    before(function(done) {
      var attrs = { item_id: '123', key: 'name', value: 'test' };
      record = new Property(attrs);
      record.save(done);
    });

    describe('valid attributes', function() {
      it('should update properties', function(done) {
        record.update({ key: 'new name' }, function(err, result) {
          should.not.exist(err);
          result.get('key').should.equal('new name');
          result.get('value').should.equal('test');
          done();
        });
      });
    });

    describe('invalid attributes', function() {
      before(function(done) {
        Property.create({ item_id: '123', key: 'name' }, done);
      });

      it('should validate with error', function(done) {
        record.update({ key: ''}, function(error, data) {
          should.exist(error);
          error.message.should.equal('Invalid item property data');
          done();
        });
      });
    });
  });
});