/**
 * RESTFul Methods for Items
 */

var Bucket,
    Item,
    Property,
    Items = {},
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

  return Items;
};

/**
 * GET - All Items in a given bucket.
 *
 * Returns all the items in the database that belong to
 * the bucket.
 */

Items.index = function index(req, res) {
  var params = req.params,
      items;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });

  findBucket.call(this, params.bucket_name, function(err, bucket) {
    Item.find({ bucket_id: bucket._id }, function(err, results) {
      if(err) return res.json(500, { error: err.message });

      // Collect just the attributes
      items = results.map(function(item) {
        return item.attributes();
      });

      res.json(items);
    });
  });
};

/**
 * POST - Create an Item
 *
 * Creates a new item and returns the new record.
 */

Items.create = function create(req, res) {
  var params = req.params,
      data = req.body;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Find the bucket so we ensure the bucket_name belongs to a valid
  // record and not a ghost item.
  findBucket(params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    // Set the bucket_id
    data.bucket_id = bucket._id;

    Item.create(data, function(err, item) {
      if(err) return res.json(500, { error: err.message });
      res.json(201, item.attributes());
    });
  });
};

/**
 * GET - Return an Item and it's properties
 *
 * Return an item and it's property attributes
 */

Items.show = function show(req, res) {
  var params = req.params,
      data;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(404, { error: 'No item name given' });

  // Find the bucket so we ensure the bucket_name belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    // Find the item by bucket_id and name param
    Item.find({ bucket_id: bucket._id, name: params.item_name }, function(err, items) {
      if(err) return res.json(500, { error: err.message });
      if(items.length === 0) return res.json(404, { error: 'No item exists with that name'});

      // Create an object of item properties to use as a return value
      data = items[0].attributes();

      // Look up all the properties associated with the item
      Property.find({ item_id: data.id }, function(err, properties) {
        if(err) return res.json(500, { error: err.message });

        // Create an object to hold the property values by key
        data.properties = {};

        properties.forEach(function(prop) {
          // Here we create a new clean object that doesn't contain the
          // item_id or key since the parent object will be namespaced
          // by key. This makes it easier to work with when retrieving items
          var propAttrs = prop.attributes();
          delete propAttrs.item_id;
          delete propAttrs.key;
          data.properties[prop._attributes.key] = propAttrs;
        });

        res.json(200, data);
      });
    });
  });
};

/**
 * PUT - Update an Item's core data
 *
 * Updates an Item's core data but not it's properties
 */

Items.update = function update(req, res) {
  var params = req.params;

  if(!params.bucket_name) return res.json(500, { error: "Can't find that bucket" });
  if(!params.item_name) return res.json(404, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Find the bucket so we ensure the bucket_name belongs to a valid
  // record and not a ghost item.
  findBucket(params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    // Find the item by bucket_id and name param
    Item.find({ bucket_id: bucket._id, name: params.item_name }, function(err, items) {
      if(err) return res.json(500, { error: err.message });
      if(items.length === 0) return res.json(404, { error: 'No item exists with that name'});

      items[0].update(req.body, function(err, item) {
        if(err) return res.json(500, { error: err.message });
        res.json(item.attributes());
      });
    });
  });
};

/**
 * DELETE - Remove an Item and all it's properties
 */

Items.destroy = function destroy(req, res) {
  var params = req.params;

  if(!params.bucket_name) return res.json(500, { error: "Can't find that bucket" });
  if(!params.item_name) return res.json(404, { error: 'No item name given' });

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
      Item.find({ bucket_id: bucket._id, name: params.item_name }, function(err, items) {
        if(err) return callback(err);
        if(items.length === 0) return callback(new Error('No item exist with that name'));
        callback(null, items[0]);
      });
    },

    // Find Properties
    function(item, callback) {
      Property.find({ item_id: item._id }, function(err, results) {
        if(err) return callback(err);
        callback(null, { item: item, properties: results });
      });
    },

    // Delete Item
    function(assets, callback) {
      assets.item.destroy(function(err, status) {
        if(err) return callback(err);
        if(status === 0) return callback(new Error('Error destroying item'));
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
 * Private Functions for this controller
 */

function findBucket(name, callback) {
  Bucket.find({ name: name }, function(err, buckets) {
    if(err) return callback(err);
    if(buckets.length === 0) return callback(new Error('No bucket found with that ID'));
    callback(null, buckets[0]);
  });
}

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

// Destroy A property

function destroyProperty(property, callback) {
  property.destroy(function(err, status) {
    if(err) return callback(err);
    if(status === 0) return callback(new Error('Error destroying ' + property._attributes.key + ' property'));
    callback(null);
  });
}