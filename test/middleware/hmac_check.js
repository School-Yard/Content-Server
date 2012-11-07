var Utils = require('../support/utils'),
    request = require('supertest'),
    should = require('should');
    crypto = require('crypto'),
    hmac = require('../../lib/middleware/hmac_check');

describe('middleware', function() {
  var app;

  before(function(done) {
    Utils.createApplication(function(server) {
      var adapters = server.get('adapters');

      app = server;

      // Use HMAC middleware
      app.use(hmac(adapters.mongo));
      app.use(function(req, res, next) {
        req.user.role.should.equal(1);
        next();
      });

      app.initializeRoutes();

      done();
    });
  });

  describe('HMAC middleware', function() {
    var User;

    before(function(done) {
      // Create a user
      var connection = app.get('adapters').mongo;
      var user = connection.resource('users');
      var data = {
        email: 'test@test.com',
        role: '1',
        auth_key: '123abc',
        auth_secret: 'qwerty'
      };

      user.create(data, function(err, response) {
        if(err) return done(err);
        User = response;
        done();
      });
    });

    describe('when missing Authorization header', function() {
      it('should respond with 401 and Unauthorized', function(done) {
        request(app)
        .get('/api/v1/buckets')
        .end(function(err, res) {
          res.statusCode.should.equal(401);
          res.text.should.equal('Unauthorized');
          done();
        });
      });
    });

    describe('when invalid access_key is supplied', function() {
      it('should respond with 401 and Unauthorized', function(done) {
        request(app)
        .get('/api/v1/buckets')
        .set('Authorization', '123:abc')
        .end(function(err, res) {
          res.statusCode.should.equal(401);
          res.text.should.equal('Unauthorized');
          done();
        });
      });
    });

    describe('with invalid computed hash', function() {
      it('should respond with 401 and Unauthorized', function(done) {
        var hash = crypto.createHmac('sha512', User.auth_secret).digest('base64');
        request(app)
        .get('/api/v1/buckets')
        .set('Authorization', '123abc:' + hash)
        .end(function(err, res) {
          res.statusCode.should.equal(401);
          res.text.should.equal('Unauthorized');
          done();
        });
      });
    });

    describe('with valid authorization header', function() {
      it('should respond with 200', function(done) {
        var data = User.email;
        var timeBlock = Math.floor(new Date().getTime() / 1000 / 60);
        var hash = crypto.createHmac('sha512', User.auth_secret).update(data + timeBlock).digest('base64');

        request(app)
        .get('/api/v1/buckets')
        .set('Authorization', User.auth_key + ':' + hash)
        .end(function(err, res) {
          res.statusCode.should.equal(200);
          done();
        });
      });
    });

    describe('with expired timeBlock', function() {
      it('should respond with 401 and Unauthorized', function(done) {
        var data = User.email;
        var timeBlock = Math.floor((new Date().getTime() / 1000 / 2));
        var hash = crypto.createHmac('sha512', User.auth_secret).update(data + timeBlock).digest('base64');

        request(app)
        .get('/api/v1/buckets')
        .set('Authorization', User.auth_key + ':' + hash)
        .end(function(err, res) {
          res.statusCode.should.equal(401);
          res.text.should.equal('Unauthorized');
          done();
        });
      });
    });

    describe('with authorization header is malformed', function() {
      it('should respond with 401 and Unauthorized', function(done) {
        request(app)
        .get('/api/v1/buckets')
        .set('Authorization', '123abc')
        .end(function(err, res) {
          res.statusCode.should.equal(401);
          res.text.should.equal('Unauthorized');
          done();
        });
      });
    });
  });
});