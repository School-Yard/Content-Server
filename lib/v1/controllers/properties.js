/**
 * RESTFul Methods for Item Properties
 */

var ItemProperties = module.exports,
    async = require('async');

/**
 * GET - All properties for an item
 *
 * Returns all the properties for an item.
 */

ItemProperties.index = function index(req, res, params) {
  var self = this,
      props;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });

  async.waterfall([
    // Find Bucket
    function(callback) {
      findBucket.call(self, params.bucket_name, function(err, bucket) {
	if(err) return callback(err);
	callback(null, bucket);
      });
    },

    // Find Item
    function(bucket, callback) {
      self.Item.find({ bucket_id: bucket._id }, function(err, items) {
	if(err) return callback(err);
	if(items.length === 0) return callback(new Error('No item exists with that name'));
	callback(null, items[0]);
      });
    },

    // Find Properties
    function(item, callback) {
      self.ItemProp.find({ item_id: item._id }, function(err, results) {
	if(err) return callback(err);
	callback(null, results);
      });
    }
  ],

  // Async Callback, return error or properties
  function(err, properties) {
    if(err) return res.json(500, { error: err.message });

    // Collect just the property attributes
    props = properties.map(function(prop) {
      return prop.attributes();
    });

    res.json(props);
  });
};

/**
 * POST - Create an Item Property
 *
 * Creates a new item property and returns the new record.
 *
 * Accepts as body data either an array of properties or a single
 * property object.
 *
 * Will always return an array.
 */

ItemProperties.create = function create(req, res, params) {
  var self = this,
      data,
      properties = [];

  // If incomplete parameters return a 500 error
  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Accept an array of properties or a single property and normalize to an array
  data = req.body instanceof Array ? req.body : [req.body];

  // Find the bucket and item so we ensure the property belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    findItem.call(self, params.item_name, function(err, item) {
      if(err) return res.json(500, { error: err.message });

      // Function to run in the async forEach method
      // Creates a property for an existing item
      var createProperty = function(prop, callback) {
	prop.item_id = item._id;

	self.ItemProp.create(prop, function(err, item_prop) {
	  if(err) return callback(err);
	  properties.push(item_prop.attributes());
	  callback(null);
	});
      };

      async.forEach(data, createProperty, function(err) {
	if(err) return res.json(500, { error: err.message });
	res.json(201, properties);
      });
    });
  });
};

/**
 * PUT - Update properties for an item
 *
 * Allows multiple properties to be updated at once.
 * This allows for form submits and other stuff to process
 * all property updates in one http request.
 *
 * Accepts as body data either an array of properties or a single
 * property object.
 *
 * If any of the updated properties fail a validation check nothing
 * will be written to the data store and an error message will be returned.
 *
 * Will always return an array of the updated properties.
 *
 * If an error is found when validating it will return an error object
 * with an error message for each key that didn't validate.
 */

ItemProperties.update = function update(req, res, params) {
  var self = this,
      data,
      validation_errors = {},
      properties = [];

  // If incomplete parameters return a 500 error
  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Accept an array of properties or a single property and normalize to an array
  data = req.body instanceof Array ? req.body : [req.body];

  // Find the bucket and item so we ensure the property belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    findItem.call(self, params.item_name, function(err, item) {
      if(err) return res.json(500, { error: err.message });

      // Function to run in an async forEach function
      // updates the property with the new values
      var updateProperty = function(prop, callback) {
	self.ItemProp.find({ key: prop.key }, function(err, props) {
	  if(err) return callback(err);

	  // Note: don't need to check for empty props here,
	  // would have been caught by the validation process

	  props[0].update(prop, function(err, result) {
	    properties.push(result.attributes());
	    callback(null);
	  });
	});
      };

      // Function to run in an async forEach function
      // Validates the property and if there's an error add
      // the error to the validation_errors object
      var validateProperty = function(prop, callback) {
	// Find the property
	self.ItemProp.find({ key: prop.key }, function(err, props) {
	  if(err) return callback(err);

	  if(props.length === 0) {
	    validation_errors[prop.key] = "Property doesn't exist";

	    // Don't return an error so we can collect all the validation
	    // errors and return them to the client
	    return callback(null);
	  }

	  // Set the attributes
	  props[0].set(prop);

	  // Run the validation process and if an error happens add it
	  // to the validation_errors object
	  props[0].validate(function(err) {
	    if(err) { validation_errors[prop.key] = err; }
	    callback(null);
	  });
	});
      };

      async.waterfall([
	// Validate all the properties being updated
	function(callback) {
	  async.forEach(data, validateProperty, function(err) {
	    if(err) return callback(err.message);
	    callback(null, validation_errors);
	  });
	},

	// If no validation errors, update each property,
	// if there were errors we can return the errors now.
	function(errors, callback) {
	  if(Object.keys(validation_errors).length > 0) return callback(validation_errors);

	  async.forEach(data, updateProperty, function(err) {
	    if(err) return callback(err);
	    callback(null);
	  });
	}
      ],
      function(err) {
	if(err) return res.json(500, { error: err });
	res.json(200, properties);
      });
    });
  });
};

/**
 * Private Functions for this controller
 */

function findBucket(name, callback) {
  this.Bucket.find({ name: name }, function(err, buckets) {
    if(err) return callback(err);
    if(buckets.length === 0) return callback(new Error('No bucket found with that name'));
    callback(null, buckets[0]);
  });
}

function findItem(name, callback) {
  this.Item.find({ name: name }, function(err, items) {
    if(err) return callback(err);
    if(items.length === 0) return callback(new Error('No item found with that name'));
    callback(null, items[0]);
  });
}