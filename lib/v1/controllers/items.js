/**
 * RESTFul Methods for Items
 */

var Items = module.exports;

/**
 * GET - All Articles for a given page.
 *
 * Returns all the articles in the database that belong to
 * the parent page.
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
 * POST - Create an Article
 *
 * Creates a new article and returns the new record.
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
 * Private Functions for this controller
 */

function findBucket(name, callback) {
  this.Bucket.find({ name: name }, function(err, buckets) {
    if(err) return callback(err);
    if(buckets.length === 0) return callback(new Error('No bucket found with that ID'));
    callback(null, buckets[0]);
  });
}