/**
 * RESTFul Methods for Buckets
 */

var Bucket,
    Item,
    Property,
    Buckets = {},
    async = require('async');

/**
 * 'Boot' models
 *  - used to pass the adapters to the models
 */

module.exports = function(app) {
  var adapters = app.get('adapters');

  Bucket = require('../models/bucket')(adapters.mongo);
  Item = require('../models/item')(adapters.mongo);
  Property = require('../models/property')(adapters.mongo);

  return Buckets;
};

/**
 * GET - A List of buckets
 *
 * Returns a listing of all the buckets
 */

Buckets.index = function index(req, res) {
  var buckets;

  Bucket.all(function(err, results) {
    if(err) return res.json(500, { error: err.message });

    // Collect just the attributes
    buckets = results.map(function(bucket) {
      return bucket.attributes();
    });

    res.json(buckets);
  });
};

/**
 * POST - Create a Bucket
 *
 * Creates a new bucket to hold items
 */

Buckets.create = function create(req, res) {
  if(!req.body) return res.json(400, { error: 'invalid json' });

  var data = req.body;

  Bucket.create(data, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });
    res.json(201, bucket.attributes());
  });
};

/**
 * GET - Return a Bucket's contents
 *
 * Return a list of items contained in a bucket
 */

Buckets.show = function show(req, res) {
  var params = req.params;

  if(!params.bucket_name) return res.json(404, { error: "Can't find that bucket" });

  Bucket.find({ name: params.bucket_name }, function(err, buckets) {
    if(err) return res.json(500, { error: err.message });
    if(buckets.length === 0) return res.json(404, { error: "Can't find that bucket" });

    Item.find({ bucket_id: buckets[0]._id }, function(err, items) {
      if(err) return res.json(500, { error: err.message });

      var data = buckets[0].attributes();
      data.items = items.map(function(item) {
        return item.attributes();
      });

      res.json(data);
    });
  });
};

/**
 * PUT - Update a Bucket
 *
 * Updates a Bucket's properties
 */

Buckets.update = function update(req, res) {
  var params = req.params;

  if(!params.bucket_name) return res.json(404, { error: "Can't find that bucket" });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  Bucket.find({ name: params.bucket_name }, function(err, buckets) {
    if(err) return res.json(500, { error: err.message });
    if(buckets.length === 0) return res.json(404, { error: "Can't find that bucket"});

    buckets[0].update(req.body, function(err, bucket) {
      if(err) return res.json(500, { error: err.message });

      res.json(bucket.attributes());
    });
  });
};

/**
 * DELETE - Destroy a Bucket
 *
 * Deletes a bucket and all it's data, including items
 * and item properties by doing a cascading delete.
 */

Buckets.destroy = function destroy(req, res) {
  var params = req.params;

  if(!params.bucket_name) return res.json(404, { error: "Can't find that bucket" });

  async.waterfall([
    // Find Bucket
    function(callback) {
      Bucket.find({ name: params.bucket_name }, function(err, buckets) {
        if(err) return res.json(500, { error: err.message });
        if(buckets.length === 0) return res.json(404, { error: "Can't find that bucket"});
        callback(null, buckets[0]);
      });
    },

    // Find Items
    function(bucket, callback) {
      Item.find({ bucket_id: bucket._id }, function(err, items) {
        if(err) return callback(err);
        callback(null, { bucket: bucket, items: items });
      });
    },

    // Find properties for each item and add to a single array
    function(assets, callback) {
      var properties = [],
          collectFn = collectProperties.call(null, properties);

      async.forEach(assets.items, collectFn, function(err) {
        if(err) return callback(err);
        callback(null, { bucket: assets.bucket, items: assets.items, properties: properties });
      });
    },

    // Destroy Bucket
    function(assets, callback) {
      assets.bucket.destroy(function(err, status) {
        if(err) return callback(err);
        if(status !== 1) return callback(new Error('Error destroying bucket'));
        delete assets.bucket;
        callback(null, assets);
      });
    },

    // Destroy Item
    function(assets, callback) {
      async.forEach(assets.items, destroyItem, function(err) {
        if(err) return callback(err);
        callback(null, assets.properties);
      });
    },

    // Loop through properties and destroy them
    function(properties, callback) {
      async.forEach(properties, destroyProperty, function(err) {
        if(err) return callback(err);
        callback(null);
      });
    }
  ],
  function(err) {
    if(err) return res.json(404, { error: err.message });
    res.json({ status: 1 });
  });
};

/**
 * Functions to use in an Async Waterfall array.
 *
 * Call them passing in self and other options needed
 * then you can pass the return function to an async
 * forEach and it will run the callback when completed.
 *
 * ex:
 *     var fn = destroyItem.call(this);
 *     async.forEach(array, destroyItem, callback);
 */

// Find All Item Properties

function collectProperties(properties) {
  return function(item, callback) {
    Property.find({ item_id: item._id }, function(props) {
      properties.concat(props);
      callback(null);
    });
  };
}

// Destroy an Item

function destroyItem(item, callback) {
  item.destroy(function(err, status) {
    if(err) return callback(err);
    if(status === 0) return callback(new Error('Error destroying item ' + item._attributes.name));
    callback(null);
  });
}

// Destroy A Property

function destroyProperty(property, callback) {
  property.destroy(function(err, status) {
    if(err) return callback(err);
    if(status === 0) return callback(new Error('Error destroying ' + property._attributes.key + ' property'));
    callback(null);
  });
}