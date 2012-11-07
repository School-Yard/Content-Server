/**
 * RESTFul Methods for Item Properties
 */

var Bucket,
    Item,
    ItemProp,
    ItemProperties = {},
    async = require('async');

/**
 * 'Boot' models
 *  - used to pass the adapters to the models
 */

module.exports = function(app) {
  var adapters = app.get('adapters');

  Bucket = require('../models/bucket')(adapters.mongo);
  Item = require('../models/item')(adapters.mongo);
  ItemProp = require('../models/itemproperty')(adapters.mongo);

  return ItemProperties;
};

/**
 * GET - All properties for an item
 *
 * Returns all the properties for an item.
 */

ItemProperties.index = function index(req, res) {
  var props,
      params = req.params;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });

  async.waterfall([
    // Find Bucket
    function(callback) {
      findBucket(params.bucket_name, function(err, bucket) {
        if(err) return callback(err);
        callback(null, bucket);
      });
    },

    // Find Item
    function(bucket, callback) {
      Item.find({ bucket_id: bucket._id }, function(err, items) {
        if(err) return callback(err);
        if(items.length === 0) return callback(new Error('No item exists with that name'));
        callback(null, items[0]);
      });
    },

    // Find Properties
    function(item, callback) {
      ItemProp.find({ item_id: item._id }, function(err, results) {
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
 * GET - Get a single item property
 */

ItemProperties.show = function show(req, res) {
  var params = req.params;

  // If incomplete parameters return a 500 error
  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!params.id || params.id === 'undefined') return res.json(404, { error: 'No item property given' });

  async.waterfall([
    // Find Bucket
    function(callback) {
      findBucket(params.bucket_name, function(err, bucket) {
        if(err) return callback(err);
        callback(null, bucket);
      });
    },

    // Find Item
    function(bucket, callback) {
      findItem(params.item_name, function(err, item) {
        if(err) return callback(err);
        callback(null, item);
      });
    },

    // Find Property
    function(item, callback) {
      ItemProp.get(params.id, function(err, property) {
        if(err) return callback(err);
        if(!property) return callback(new Error('No item property exist with that ID'));
        callback(null, property);
      });
    }
  ],
  // Async Callback, return error or status
  function(err, property) {
    if(err) return res.json(404, { error: err.message });
    res.json(property.attributes());
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

ItemProperties.create = function create(req, res) {
  var data,
      params = req.params;

  // If incomplete parameters return a 500 error
  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Accept an array of properties or a single property and normalize to an array
  data = req.body instanceof Array ? req.body : [req.body];

  async.waterfall([
    // Find Bucket
    function(callback) {
      findBucket(params.bucket_name, function(err, bucket) {
        if(err) return callback(err);
        callback(null, bucket);
      });
    },

    // Find Item
    function(bucket, callback) {
      findItem(params.item_name, function(err, item) {
        if(err) return callback(err);
        callback(null, item);
      });
    },

    // Create Properties
    function(item, callback) {
      var properties = [],
          createFn = createProperty.call(null, properties, item);

      // Run the createProperty functions in parallel
      async.forEach(data, createFn, function(err) {
        if(err) return callback(err);
        callback(null, properties);
      });
    }
  ],
  // Async Callback, return error or properties
  function(err, properties) {
    if(err) return res.json(500, { error: err.message });
    res.json(201, properties);
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

ItemProperties.update = function update(req, res) {
  var data,
      params = req.params;

  // If incomplete parameters return a 500 error
  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Accept an array of properties or a single property and normalize to an array
  data = req.body instanceof Array ? req.body : [req.body];

  async.waterfall([
    // Find Bucket
    function(callback) {
      findBucket(params.bucket_name, function(err, bucket) {
        if(err) return callback(err);
        callback(null, bucket);
      });
    },

    // Find Item
    function(bucket, callback) {
      findItem(params.item_name, function(err, item) {
        if(err) return callback(err);
        callback(null, item);
      });
    },

    // Validate Properties
    function(item, callback) {
      var errors = {},
          properties = [],
          validationFn = validateProperty.call(null, item.get('id'), errors, properties);

      async.forEach(data, validationFn, function(err) {
        if(err) return callback(err);
        if(Object.keys(errors).length) return callback({ message: errors });
        return callback(null, properties);
      });
    },

    // Update Properties
    function(properties, callback) {
      var results = [],
          updateFn = updateProperty.call(null, results);

      async.forEach(properties, updateFn, function(err) {
        if(err) return callback(err);
        return callback(null, results);
      });
    }
  ],
  // Async Callback, return error or results
  function(err, results) {
    if(err) return res.json(500, { error: err.message });
    return res.json(results);
  });
};

/**
 * DELETE - Destroys a single Item Property
 */

ItemProperties.destroy = function destroy(req, res) {
  var params = req.params;

  // If incomplete parameters return a 500 error
  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!params.id || params.id === 'undefined') return res.json(404, { error: 'No item property given' });

  async.waterfall([
    // Find Bucket
    function(callback) {
      findBucket(params.bucket_name, function(err, bucket) {
        if(err) return callback(err);
        callback(null, bucket);
      });
    },

    // Find Item
    function(bucket, callback) {
      findItem(params.item_name, function(err, item) {
        if(err) return callback(err);
        callback(null, item);
      });
    },

    // Find Property
    function(item, callback) {
      ItemProp.get(params.id, function(err, property) {
        if(err) return callback(err);
        if(!property) return callback(new Error('No item property exist with that ID'));
        callback(null, property);
      });
    },

    // Destroy Property
    function(property, callback) {
      property.destroy(function(err, status) {
        if(err) return callback(err);
        callback(null, status);
      });
    }
  ],
  // Async Callback, return error or status
  function(err, status) {
    if(err) return res.json(404, { error: err.message });
    res.json({ status: status });
  });
};

/**
 * Private Functions for this controller
 */

function findBucket(name, callback) {
  Bucket.find({ name: name }, function(err, buckets) {
    if(err) return callback(err);
    if(buckets.length === 0) return callback(new Error('No bucket found with that name'));
    callback(null, buckets[0]);
  });
}

function findItem(name, callback) {
  Item.find({ name: name }, function(err, items) {
    if(err) return callback(err);
    if(items.length === 0) return callback(new Error('No item found with that name'));
    callback(null, items[0]);
  });
}

/**
 * Functions to use in an Async Waterfall array.
 *
 * Call them passing in null and other options needed
 * then you can pass the return function to an async
 * forEach and it will run the callback when completed.
 *
 * ex:
 *     var fn = destroyItem.call(this);
 *     async.forEach(array, destroyItem, callback);
 */

// Creates a new property
var createProperty = function(properties, item) {
  return function(prop, callback) {
    prop.item_id = item._id;

    ItemProp.create(prop, function(err, item_prop) {
      if(err) return callback(err);
      properties.push(item_prop.attributes());
      callback(null);
    });
  };
};

/**
  * Validates the property and if there's an error add
  * the error to the validation_errors object
  *
  * @param {I}
  */
var validateProperty = function(item_id, errors, properties) {
  return function(prop, callback) {
    // Find the property
    ItemProp.getByKey(item_id, prop.key, function(err, result) {
      if(err) return callback(err);

      if(!result) {
        errors[prop.key] = "Property doesn't exist";

        // Don't return an error so we can collect all the validation
        // errors and return them to the client
        return callback(null);
      }

      // Set the attributes
      result.set(prop);

      // Run the validation process and if an error happens add it
      // to the validation_errors object
      result.validate(function(err) {
        if(err) errors[prop.key] = err.message;
        properties.push(result);
        callback(null);
      });
    });
  };
};

// Updates the property with the new values
var updateProperty = function(results) {
  return function(property, callback) {
    // Note: don't need to check for empty props here,
    // would have been caught by the validation process

    property.save(function(err, prop) {
      results.push(prop.attributes());
      callback(null);
    });
  };
};