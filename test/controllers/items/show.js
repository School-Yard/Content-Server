var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Items', function(done) {
  var app, Bucket, Item;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;

      app.before(function(req, res, next) {
	req.user = {role: 10}; // don't test access control here
	next();
      });

      // Create a bucket to use for item tests
      helpers.createBucket(app, { name: 'test' }, function(err, result) {
	Bucket = result;

	// Create an item to use in the show tests
	helpers.createItem(app, { bucket_name: Bucket.name, bucket_id: Bucket.id, name: 'test' }, function(err, item_res) {
	  Item = item_res;
	  done();
	});
      });
    });

    after(function() {
      helpers.clearData(app, ['buckets', 'items', 'item_properties']);
    });
  });

  describe('#show', function() {
    describe('with valid name', function() {
      var response;

      before(function(done) {
	request(app)
	.get('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name)
	.end(function(err, res) {
	  if(err) return callback(err);
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

      it('should return a json object', function() {
	var obj = JSON.parse(response.text);
	obj.should.have.property('name');
	obj.should.have.property('id');
	obj.should.have.property('properties');
      });
    });

    describe('with an invalid id', function() {
      var response;

      before(function(done) {
	request(app)
	.get('/api/v1/buckets/' + Bucket.name + '/items/100')
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
	obj.error.should.equal("No item exists with that name");
      });
    });

    describe('with properties set', function() {
      var response;

      before(function(done) {
	var props = [
	  { key: 'key1', value: 'value1'},
	  { key: 'key2', value: 'value2'}
	];

	// Hack to get around before/after issues
	helpers.createBucket(app, { name: 'test-prop' }, function(err, bucket) {
	  helpers.createItem(app, { bucket_name: bucket.name, bucket_id: bucket.id, name: 'test-prop' }, function(err, item) {
	    helpers.createItemProperties(app, { bucket_name: bucket.name, item_name: item.name, body: props }, function(err, result) {
	      if(err) return done(err);

	      request(app)
	      .get('/api/v1/buckets/' + bucket.name + '/items/' + item.name)
	      .end(function(err, res) {
		if(err) return callback(err);
		response = res;
		done();
	      });
	    });
	  });
	});
      });

      it('should send a 200 status code', function() {
	response.status.should.equal(200);
      });

      it('should set the content-type header', function() {
	response.should.be.json;
      });

      it('should return item properties by key', function() {
	var obj = JSON.parse(response.text);
	Object.keys(obj.properties).length.should.equal(2);
	obj.properties.key1.value.should.equal('value1');
	obj.properties.key2.value.should.equal('value2');
      });
    });
  });
});