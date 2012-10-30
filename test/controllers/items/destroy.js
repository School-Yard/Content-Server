var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Items', function() {
  var app, Bucket, Item, Props;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;

      app.before(function(req, res, next) {
	req.user = {role: 10}; // don't test access control here
	next();
      });

      var props = [{ key: 'key1', value: 'value1' }, { key: 'key2', value: 'value2'}];

      // Create a bucket to use for item tests
      helpers.createBucket(app, { name: 'test' }, function(err, bucket) {
	helpers.createItem(app, { name: 'test', bucket_id: bucket.id, bucket_name: bucket.name }, function(err, item) {
	  helpers.createItemProperties(app, { bucket_name: bucket.name, item_name: item.name, body: props }, function(err, props) {
	    Bucket = bucket;
	    Item = item;
	    Props = props;
	    done();
	  });
	});
      });
    });
  });

  after(function() {
    helpers.clearData(app, ['buckets', 'items', 'item_properties']);
  });

  describe('#destroy', function() {
    describe('with invalid id', function() {
      var response;

      before(function(done) {
	request(app)
	.del('/api/v1/buckets/' + Bucket.name + '/items/100')
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
	obj.error.should.equal("No item exist with that name");
      });
    });

    describe('with valid id', function() {
      var response;

      before(function(done) {
	request(app)
	.del('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name)
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