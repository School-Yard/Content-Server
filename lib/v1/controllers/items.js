/**
 * RESTFul Methods for Items
 */

var Items = module.exports,
    async = require('async');

/**
 * GET - All Items in a given bucket.
 *
 * Returns all the items in the database that belong to
 * the bucket.
 */

Items.index = function index(req, res, params) {
  var self = this,
      items;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });

  findBucket.call(this, params.bucket_name, function(err, bucket) {
    self.Item.find({ bucket_id: bucket._id }, function(err, results) {
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

Items.create = function create(req, res, params) {
  var self = this;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  var data = req.body;

  // Find the bucket so we ensure the bucket_name belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    // Set the bucket_id
    data.bucket_id = bucket._id;

    self.Item.create(data, function(err, item) {
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

Items.show = function show(req, res, params) {
  var self = this,
      data;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });

  // Find the bucket so we ensure the bucket_name belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    // Find the item by bucket_id and name param
    self.Item.find({ bucket_id: bucket._id, name: params.item_name }, function(err, items) {
      if(err) return res.json(500, { error: err.message });
      if(items.length === 0) return res.json(404, { error: 'No item exists with that name'});

      // Create an object of item properties to use as a return value
      data = items[0].attributes();

      // Look up all the properties associated with the item
      self.ItemProp.find({ item_id: data.id }, function(err, properties) {
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

Items.update = function update(req, res, params) {
  var self = this,
      data;

  if(!params.bucket_name) return res.json(500, { error: "Can't find that bucket" });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  // Find the bucket so we ensure the bucket_name belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    // Find the item by bucket_id and name param
    self.Item.find({ bucket_id: bucket._id, name: params.item_name }, function(err, items) {
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

Items.destroy = function destroy(req, res, params) {
  var self = this;

  if(!params.bucket_name) return res.json(500, { error: "Can't find that bucket" });
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
      self.Item.find({ bucket_id: bucket._id, name: params.item_name }, function(err, items) {
        if(err) return callback(err);
        if(items.length === 0) return callback(new Error('No item exist with that name'));
        callback(null, items[0]);
      });
    },

    // Find Properties
    function(item, callback) {
      self.ItemProp.find({ item_id: item._id }, function(err, results) {
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
      var destroyFn = destroyProperty.call(self);

      async.forEach(properties, destroyFn, function(err) {
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
  this.Bucket.find({ name: name }, function(err, buckets) {
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

function destroyProperty() {
  var self = this;

  return function(property, callback) {
    property.destroy(function(err, status) {
      if(err) return callback(err);
      if(status === 0) return callback(new Error('Error destroying ' + property._attributes.key + ' property'));
      callback(null);
    });
  };
}