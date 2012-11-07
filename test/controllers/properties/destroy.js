var Utils = require('../../support/utils'),
    request = require('supertest'),
    should = require('should');

describe('Properties', function() {
  var app, Bucket, Item, Property;

  before(function(done) {
    Utils.createApplication(function(server) {
      app = server;

      app.use(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      app.initializeRoutes();

      // Create a bucket to use for item tests
      Utils.createBucket(app, { name: 'test' }, function(err, bucket) {
        Utils.createItem(app, { name: 'test', bucket_id: bucket.id, bucket_name: bucket.name }, function(err, item) {
          Bucket = bucket;
          Item = item;
          done();
        });
      });
    });
  });

  describe('#destroy', function() {
    var Property;

    before(function(done) {
      var props = { key: 'key1', value: 'value1'};

      Utils.createProperty(app, { bucket_name: Bucket.name, item_name: Item.name, body: props }, function(err, prop) {
        if(err) return done(err);
        Property = prop;
        done();
      });
    });

    describe('with invalid id', function() {
      var response;

      before(function(done) {
        request(app)
        .del('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties/invalid')
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