var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Properties', function() {
  var app, Bucket, Item, Property;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;

      app.before(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      // Create a bucket to use for item tests
      helpers.createBucket(app, { name: 'test' }, function(err, bucket) {
        helpers.createItem(app, { name: 'test', bucket_id: bucket.id, bucket_name: bucket.name }, function(err, item) {
          Bucket = bucket;
          Item = item;
          done();
        });
      });
    });
  });

  after(function() {
    helpers.clearData(app, ['buckets', 'items', 'item_properties']);
  });

  describe('#destroy', function() {
    var Property;

    before(function(done) {
      var props = { key: 'key1', value: 'value1'};

      helpers.createItemProperties(app, { bucket_name: Bucket.name, item_name: Item.name, body: props }, function(err, prop) {
        if(err) return done(err);
        Property = prop;
        done();
      });
    });

    describe('with invalid id', function() {
      var response;

      before(function(done) {
        request(app)
        .del('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties/100')
        .end(function(err, res){
          response = res;
          done();
        });
      });

      it('should send a 404 status code', function() {
        response.status.should.equal(404);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should send an error message', function() {
        var obj = JSON.parse(response.text);
        obj.error.should.equal("No item property exist with that ID");
      });
    });

    describe('with valid id', function() {
      var response;

      before(function(done) {
        request(app)
        .del('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties/' + Property[0].id)
        .end(function(err, res){
          response = res;
          done();
        });
      });

      it('should send a 200 status code', function() {
        response.status.should.equal(200);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should send an status message', function() {
        var obj = JSON.parse(response.text);
        obj.status.should.equal(1);
      });
    });

  });
});