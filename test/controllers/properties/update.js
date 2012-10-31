var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Properties', function() {
  var app, Bucket, Item;

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

  describe('#update', function() {

    describe('with no body attributes', function() {
      it('should send a 400 status code', function(done) {
        request(app)
        .put('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
        .set('content-type', 'application/json')
        .expect(400, done);
      });
    });

    describe('with valid attributes', function() {
      before(function(done) {
        var props = [
          { key: 'key1', value: 'value1'},
          { key: 'key2', value: 'value2'}
        ];

        helpers.createItemProperties(app, { bucket_name: Bucket.name, item_name: Item.name, body: props }, function(err, result) {
          if(err) return done(err);
          done();
        });
      });

      describe('and a single property object', function() {
        var response;

        // Make the request and store the response
        before(function(done) {
          request(app)
          .put('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
          .send({ key: 'key1', value: 'value1 updated' })
          .set('content-type', 'application/json')
          .end(function(err, res) {
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

        it('should return an array with a single json object', function() {
          var obj = JSON.parse(response.text);
          obj.should.be.an.instanceOf(Array);
          obj[0].should.have.property('key');
          obj[0].should.have.property('value');
          obj[0].should.have.property('item_id');
        });

        it('should update the value attribute of the property', function() {
          var obj = JSON.parse(response.text);
          obj[0].value.should.equal('value1 updated');
        });
      });

      describe('and an array of property objects', function() {
        var response;

        // Make the request and store the response
        beforeEach(function(done) {
          request(app)
          .put('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
          .send([{ key: 'key1', value: 'value1 updated' }, { key: 'key2', value: 'value2 updated'}])
          .set('content-type', 'application/json')
          .end(function(err, res) {
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

        it('should return an array with two json objects', function() {
          var obj = JSON.parse(response.text);
          obj.should.be.an.instanceOf(Array);
          obj.length.should.equal(2);
          obj[0].should.have.property('key');
          obj[0].should.have.property('value');
          obj[0].should.have.property('item_id');
        });

        it('should update the value attributes of the properties', function() {
          var obj = JSON.parse(response.text);
          obj[0].value.should.equal('value1 updated');
          obj[1].value.should.equal('value2 updated');
        });
      });
    });

    describe('with invalid attributes', function() {
      var response;

      // Make the request and store the response
      beforeEach(function(done) {
        request(app)
        .put('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
        .send([{ key: 'key0', value: 'value1 updated' }, { key: 'key2', value: 'value2 updated'}])
        .set('content-type', 'application/json')
        .end(function(err, res) {
          response = res;
          done();
        });
      });

      it('should send a 500 status code', function() {
        response.status.should.equal(500);
      });

      it('should set the content-type header', function() {
        response.should.be.json;
      });

      it('should respond with an error array', function() {
        var obj = JSON.parse(response.text);
        obj.error.key0.should.equal("Property doesn't exist");
      });
    });
  });
});