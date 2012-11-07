var Utils = require('../../support/utils'),
    request = require('supertest'),
    should = require('should');

describe('Access Control', function() {
  describe('Buckets#destroy', function() {

    describe('authorized', function() {
      var app;

      before(function(done) {
        Utils.createApplication(function(server) {
          app = server;

          app.use(function(req, res, next) {
            req.user = {role: 2};
            next();
          });

          app.initializeRoutes();
          done();
        });
      });

      it('should require role 2', function(done) {
        request(app)
        .del('/api/v1/buckets/100')
        .end(function(err, res){
          res.status.should.not.equal(401);
          done();
        });
      });
    });

    describe('unauthorized', function() {
      var app;

      before(function(done) {
        Utils.createApplication(function(server) {
          app = server;

          app.use(function(req, res, next) {
            req.user = {role: 1};
            next();
          });

          app.initializeRoutes();
          done();
        });
      });

      it('should require role 2', function(done) {
        request(app)
        .del('/api/v1/buckets/100')
        .end(function(err, res){
          res.status.should.equal(401);
          done();
        });
      });
    });
  });
});