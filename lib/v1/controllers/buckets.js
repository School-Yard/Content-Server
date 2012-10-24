/**
 * RESTFul Methods for Buckets
 */

var Buckets = module.exports;

/**
 * GET - A List of buckets
 *
 * Returns a listing of all the buckets
 */

Buckets.index = function index(req, res) {
  var buckets;
  var self = this;

  this.Bucket.all(function(err, results) {
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

  this.Bucket.create(data, function(err, bucket) {
    if(err) return res.json(500, { error: err.message });
    res.json(201, bucket.attributes());
  });
};

/**
 * GET - Return a Bucket's contents
 *
 * Return a list of items contained in a bucket
 */

Buckets.show = function show(req, res, params) {
  if(!params.name) return res.json(404, { error: "Can't find that bucket" });

  this.Bucket.find({ name: params.name }, function(err, buckets) {
    if(err) return res.json(500, { error: err.message });
    if(buckets.length === 0) return res.json(404, { error: "Can't find that bucket" });

    res.json(buckets[0].attributes());
  });
};

/**
 * PUT - Update a Bucket
 *
 * Updates a Bucket's properties
 */

Buckets.update = function update(req, res, params) {
  if(!params.name) return res.json(500, { error: "Can't find that bucket" });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  this.Bucket.find({ name: params.name }, function(err, buckets) {
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
 * Deletes a bucket and all it's data
 */

Buckets.destroy = function destroy(req, res, params) {
  if(!params.name) return res.json(500, { error: "Can't find that bucket" });

  this.Bucket.find({ name: params.name }, function(err, buckets) {
    if(err) return res.json(500, { error: err.message });
    if(buckets.length === 0) return res.json(404, { error: "Can't find that bucket"});

    buckets[0].destroy(function(err, status) {
      if(err) return res.json(500, { error: err.message });
      res.json({ status: status });
    });
  });
};