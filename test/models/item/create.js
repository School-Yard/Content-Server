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

  describe('.create', function() {

    describe('with invalid record', function() {
      var attrs = { bucket_id: '', name: '' };

      it('should return an error', function(done) {
        Item.create(attrs, function(err, item) {
          should.exist(err);
          err.should.be.an.instanceOf(Error);
          err.message.should.equal('Invalid item data');
          done();
        });
      });
    });

    describe('with valid record', function() {
      var attrs = { bucket_id: '123', name: 'test slugify' },
          item;

      before(function(done) {
        Item.create(attrs, function(err, result) {
          if(err) return done(err);
          item = result;
          done();
        });
      });

      it('should return a Item instance', function() {
        item.should.be.an.instanceOf(Item);
      });

      it('should slugify the name attribute', function() {
        item.get('name').should.equal('test-slugify');
      });

      it('should set the ctime attribute', function() {
        item.get('ctime').should.not.equal('');
      });
    });

  });

});