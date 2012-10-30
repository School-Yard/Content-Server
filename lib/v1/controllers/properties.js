/**
 * RESTFul Methods for Item Properties
 */

var ItemProperties = module.exports,
    async = require('async');

/**
 * POST - Create an Item Property
 *
 * Creates a new item property and returns the new record.
 *
 * Accepts as body data either an array or properties or a single
 * property object.
 *
 * Will always return an array.
 */

ItemProperties.create = function create(req, res, params) {
  var self = this,
      data,
      properties = [];

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

      var saveItem = function(prop, callback) {
	prop.item_id = item._id;

	self.ItemProp.create(prop, function(err, item_prop) {
	  if(err) return callback(err);
	  properties.push(item_prop.attributes());
	  callback(null);
	});
      };

      async.forEach(data, saveItem, function(err) {
	if(err) return res.json(500, { error: err.message });
	res.json(201, properties);
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
    if(buckets.length === 0) return callback(new Error('No bucket found with that ID'));
    callback(null, buckets[0]);
  });
}

function findItem(name, callback) {
  this.Item.find({ name: name }, function(err, items) {
    if(err) return callback(err);
    if(items.length === 0) return callback(new Error('No item found with that ID'));
    callback(null, items[0]);
  });
}