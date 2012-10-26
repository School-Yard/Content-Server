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

  describe('.find', function() {

    it('should return an array', function(done) {
      ItemProperty.find({}, function(err, results) {
	results.should.be.an.instanceOf(Array);
	done();
      });
    });

    describe('by attribute', function() {

      before(function(done) {
	var record = new ItemProperty();
	record._resource.create({ key: 'name', value: 'test'}, function(err, result) {
	  done(err);
	});
      });

      it('should return an array with matches', function(done) {
	ItemProperty.find({ key: 'name'}, function(err, results) {
	  results.should.be.an.instanceOf(Array);
	  results.length.should.equal(1);
	  results[0].get('key').should.equal('name');
	  results[0].get('value').should.equal('test');
	  done();
	});
      });

    });
  });

});