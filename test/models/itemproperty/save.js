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

  describe('.save', function() {

    describe('with no id set', function() {
      var record;

      before(function(done) {
	var attrs = { item_id: '123', key: 'name' };
	record = new ItemProperty(attrs);
	record.save(done);
      });

      it('should set an id property', function() {
	should.exist(record.get('id'));
      });

      it('should set a ctime', function() {
	record.get('ctime').should.not.equal('');
      });
    });

    describe('with an id set', function() {
      var record;

      beforeEach(function(done) {
	ItemProperty.create({ item_id: '123', key: 'name' }, function(err, result) {
	  var attrs = { id: 2, item_id: '123', key: 'name' };
	  record = new ItemProperty(attrs);
	  done();
	});
      });

      describe('and no conflicts', function() {

	beforeEach(function(done) {
	  record.save(done);
	});

	it('should set an mtime', function() {
	  record.get('mtime').should.not.equal('');
	});
      });

      describe('and a conflict', function() {

	beforeEach(function() {
	  record.set({ key: '' });
	});

	it('should respond with an error', function(done) {
	  record.save(function(err, result) {
	    should.exist(err);
	    err.message.should.equal('Invalid item property data');
	    done();
	  });
	});
      });
    });

  });
});