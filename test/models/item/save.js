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

  describe('.save', function() {

    describe('with no id set', function() {
      var item;

      before(function(done) {
        var attrs = { bucket_id: '123', name: 'test' };
        item = new Item(attrs);
        item.save(done);
      });

      it('should set an id property', function() {
        should.exist(item.get('id'));
      });

      it('should set a ctime', function() {
        item.get('ctime').should.not.equal('');
      });
    });

    describe('with an id set', function() {
      var item;

      beforeEach(function(done) {
        Item.create({ bucket_id: '123', name: 'conflict' }, function(err, record) {
          var attrs = { id: 2, bucket_id: '123', name: 'test record' };
          item = new Item(attrs);
          done();
        });
      });

      describe('and no conflicts', function() {

        beforeEach(function(done) {
          item.save(done);
        });

        it('should set an mtime', function() {
          item.get('mtime').should.not.equal('');
        });
      });

      describe('and a conflict', function() {

        beforeEach(function() {
          item.set({ name: 'conflict' });
        });

        it('should respond with an error', function(done) {
          item.save(function(err, result) {
            should.exist(err);
            err.message.should.equal('Name must be unique');
            done();
          });
        });
      });
    });

  });
});