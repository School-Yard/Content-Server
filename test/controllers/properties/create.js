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

  describe('#create', function() {

    describe('with no body attributes', function() {
      it('should send a 400 status code', function(done) {
	request(app)
	.post('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
	.set('content-type', 'application/json')
	.expect(400, done);
      });
    });

    describe('with valid attributes', function() {
      describe('and a single property object', function() {
	var response;

	// Make the request and store the response
	beforeEach(function(done) {
	  request(app)
	  .post('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
	  .send({ key: 'key', value: 'val' })
	  .set('content-type', 'application/json')
	  .end(function(err, res) {
	    response = res;
	    done();
	  });
	});

	it('should send a 201 status code', function() {
	  response.status.should.equal(201);
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
      });

      describe('and an array of property objects', function() {
	var response;

	// Make the request and store the response
	beforeEach(function(done) {
	  request(app)
	  .post('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
	  .send([{ key: 'key', value: 'val' }, { key: 'key2', val: 'val2'}])
	  .set('content-type', 'application/json')
	  .end(function(err, res) {
	    response = res;
	    done();
	  });
	});

	it('should send a 201 status code', function() {
	  response.status.should.equal(201);
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
      });
    });

    describe('with invalid attributes', function() {
      var response;

      // Make the request and store the response
      beforeEach(function(done) {
	request(app)
	.post('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
	.send({ key: '', value: 'val' })
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

      it('should respond with an error', function() {
	var obj = JSON.parse(response.text);
	obj.error.should.equal('Invalid item property data');
      });
    });

  });
});