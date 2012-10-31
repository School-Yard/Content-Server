/**
 * API Card
 *
 * A Versioned JSON API
 */

var ACL = require('./ACL/access_control'),
    BucketModel = require('./models/bucket'),
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

  /**
   * Access Levels:
   *
   * 0 - Read Only
   * 1 - Editor (can write values to properties)
   * 2 - Creator (can create buckets, items and properties)
   */

  'router': {
    'get': {
      '/buckets': ACL(Buckets.index, 0),
      '/buckets/:name': ACL(Buckets.show, 0),
      '/buckets/:bucket_name/items': ACL(Items.index, 0)
    },
    'post': {
      '/buckets': ACL(Buckets.create, 2),
      '/buckets/:bucket_name/items': ACL(Items.create, 2)
    },
    'put': {
      '/buckets/:name': ACL(Buckets.update, 2)
    },
    'delete': {
      '/buckets/:name': ACL(Buckets.destroy, 2)
    }
  }
};