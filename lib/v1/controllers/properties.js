/**
 * RESTFul Methods for Item Properties
 */

var ItemProperties = module.exports;

/**
 * POST - Create an Item Property
 *
 * Creates a new item property and returns the new record.
 */

ItemProperties.create = function create(req, res, params) {
  var self = this;

  if(!params.bucket_name) return res.json(500, { error: 'No bucket name given' });
  if(!params.item_name) return res.json(500, { error: 'No item name given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  var data = req.body;

  // Find the bucket and item so we ensure the property belongs to a valid
  // record and not a ghost item.
  findBucket.call(this, params.bucket_name, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });

    findItem.call(self, params.item_name, function(err, item) {
      if(err) return res.json(500, { error: err.message });

      // Set the item_id
      data.item_id = item._id;

      self.ItemProp.create(data, function(err, item_prop) {
	if(err) return res.json(500, { error: err.message });
	res.json(201, item_prop.attributes());
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