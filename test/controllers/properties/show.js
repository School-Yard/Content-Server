var Utils = require('../../support/utils'),
    request = require('supertest'),
    should = require('should');

describe('Items', function(done) {
  var app, Bucket, Item;

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

  describe('#show', function() {
    describe('with valid id', function() {
      var response;

      before(function(done) {
        var props = { key: 'key1', value: 'value1'};

        Utils.createProperty(app, { bucket_name: Bucket.name, item_name: Item.name, body: props }, function(err, property) {
          if(err) return done(err);

          request(app)
          .get('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties/' + property[0].id)
          .end(function(err, res) {
            if(err) return callback(err);
            response = res;
            done();
          });
        });
      });

      it('should send a 200 status code', function() {
        response.status.should.equal(200);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should return a json object', function() {
        var obj = JSON.parse(response.text);
        obj.should.have.property('key');
        obj.should.have.property('value');
        obj.should.have.property('id');
      });
    });

    describe('with an invalid id', function() {
      var response;

      before(function(done) {
        request(app)
        .get('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties/invalid')
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
  });
});