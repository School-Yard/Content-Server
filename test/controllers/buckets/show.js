var Utils = require('../../support/utils'),
    request = require('supertest'),
    should = require('should');

describe('Buckets', function() {
  var app;

  before(function(done) {
    Utils.createApplication(function(server) {
      app = server;

      app.use(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      app.initializeRoutes();
      done();
    });
  });

  describe('#show', function() {
    describe('with valid id', function() {
      var response;

      before(function(done) {
        Utils.createBucket(app, { name: 'test' }, function(err, result) {
          request(app)
          .get('/api/v1/buckets/' + result.name)
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
        obj.should.have.property('name');
        obj.should.have.property('id');
      });
    });

    describe('with an invalid id', function() {
      var response;

      before(function(done) {
        request(app)
        .get('/api/v1/buckets/100')
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
        obj.error.should.equal("Can't find that bucket");
      });
    });

    describe('with items in the bucket', function() {
      var response;

      before(function(done) {
        Utils.createBucket(app, { name: 'test' }, function(err, bucket) {
          Utils.createItem(app, { bucket_name: bucket.name, bucket_id: bucket.id, name: 'test' }, function(err, result) {
            request(app)
            .get('/api/v1/buckets/' + result.name)
            .end(function(err, res) {
              if(err) return callback(err);
              response = res;
              done();
            });
          });
        });
      });

      it('should return an array of items', function() {
        var obj = JSON.parse(response.text);
        obj.should.have.property('items');
        obj.items.should.be.an.instanceOf(Array);
        obj.items.length.should.equal(1);
      });

    });
  });
});