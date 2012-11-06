var Utils = require('../../support/utils'),
    request = require('supertest'),
    should = require('should');

describe('Items', function() {
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
      Utils.createBucket(app, { name: 'test' }, function(err, result) {
        if(err) return done(err);

        Bucket = result;

        // Create an item to use in the show tests
        Utils.createItem(app, { bucket_name: Bucket.name, bucket_id: Bucket.id, name: 'test' }, function(err, item_res) {
          Item = item_res;
          done();
        });
      });
    });
  });

  describe('#update', function() {
    describe('with no body attributes', function() {
      var response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .put('/api/v1/buckets/' +  Bucket.name + '/items/' + Item.name)
        .set('content-type', 'application/json')
        .end(function(err, res){
          response = res;
          done();
        });
      });

      it('should send a 400 status code', function() {
        response.status.should.equal(400);
      });

      it('should send a 400 status code', function() {
        response.text.should.equal('invalid json');
      });

    });

    describe('with valid attributes', function() {
      var response;

      // Make the request and store the response
      before(function(done) {
        request(app)
        .put('/api/v1/buckets/' +  Bucket.name + '/items/' + Item.name)
        .send({ name: 'test updated' })
        .set('content-type', 'application/json')
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

      it('should return the updated json object', function() {
        var obj = JSON.parse(response.text);
        obj.name.should.equal('test-updated');
      });
    });

    describe('with invalid attributes', function() {
      var response;

      // Make the request and store the response
      before(function(done) {
        // Hack for before/after nonsense
        Utils.createItem(app, { bucket_name: Bucket.name, bucket_id: Bucket.id, name: 'test' }, function(err, item) {
          Utils.createItem(app, { bucket_id: Bucket.id, bucket_name: Bucket.name, name: 'test2' }, function(err, result) {
            request(app)
            .put('/api/v1/buckets/' +  Bucket.name + '/items/' + item.name)
            .send({ name: 'test2' })
            .set('content-type', 'application/json')
            .end(function(err, res){
              response = res;
              done();
            });
          });
        });
      });

      it('should send a 500 status code', function() {
        response.status.should.equal(500);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should respond with an error', function() {
        var obj = JSON.parse(response.text);
        obj.error.should.equal('Name must be unique');
      });
    });

  });
});