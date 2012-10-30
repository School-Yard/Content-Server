var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Access Control', function() {
  describe('Properties#update', function() {

    describe('authorized', function() {
      var app;

      before(function(done) {
	helpers.buildServer(function(connection, server) {
	  app = server;

	  app.before(function(req, res, next) {
	    req.user = {role: 2};
	    next();
	  });

	  done();
	});
      });

      it('should require role 2', function(done) {
	request(app)
	.put('/api/v1/buckets/test/items/test/properties')
	.send({ name: 'test item' })
	.set('content-type', 'application/json')
	.end(function(err, res) {
	  res.status.should.not.equal(401);
	  done();
	});
      });
    });

    describe('unauthorized', function() {
      var app;

      before(function(done) {
	helpers.buildServer(function(connection, server) {
	  app = server;

	  app.before(function(req, res, next) {
	    req.user = {role: 1};
	    next();
	  });

	  done();
	});
      });

      it('should require role 2', function(done) {
	request(app)
	.put('/api/v1/buckets/test/items/test/properties')
	.send({ name: 'test item' })
	.set('content-type', 'application/json')
	.end(function(err, res) {
	  res.status.should.equal(401);
	  done();
	});
      });
    });
  });
});
