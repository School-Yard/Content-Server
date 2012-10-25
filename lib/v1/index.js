/**
 * API Card
 *
 * A Versioned JSON API
 */

var BucketModel = require('./models/bucket'),
    ItemModel = require('./models/item'),
    Buckets = require('./controllers/buckets'),
    Items = require('./controllers/items');

module.exports = {
  'name': 'API V1',
  'slug': 'v1',

  'init': function() {
    this.Bucket = new BucketModel({ adapters: this.adapters });
    this.Item = new ItemModel({ adapters: this.adapters });
  },

  'before': [],

  'router': {
    'get': {
      '/buckets': Buckets.index,
      '/buckets/:name': Buckets.show
    },
    'post': {
      '/buckets': Buckets.create,
      '/buckets/:bucket_name/items': Items.create
    },
    'put': {
      '/buckets/:name': Buckets.update
    },
    'delete': {
      '/buckets/:name': Buckets.destroy
    }
  }
};