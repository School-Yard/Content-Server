var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Buckets', function() {
  var app;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;
      done();
    });
  });

  after(function() {
    helpers.clearData(app, 'buckets');
  });

  describe('#show', function() {
    describe('with valid id', function() {
      var response;

      before(function(done) {
        helpers.createBucket(app, { name: 'test' }, function(err, result) {
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

  });
});