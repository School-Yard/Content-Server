/**
 * API Card
 *
 * A Versioned JSON API
 */

var BucketModel = require('./models/bucket'),
    ArticleModel = require('./models/article'),
    Buckets = require('./controllers/buckets'),
    Articles = require('./controllers/articles');

module.exports = {
  'name': 'API V1',
  'slug': 'v1',

  'init': function() {
    this.Bucket = new BucketModel({ adapters: this.adapters });
    this.Article = new ArticleModel({ adapters: this.adapters });
  },

  'before': [],

  'router': {
    'get': {
      '/buckets': Buckets.index,
      '/buckets/:name': Buckets.show
    },
    'post': {
      '/buckets': Buckets.create
    },
    'put': {
      '/buckets/:name': Buckets.update
    },
    'delete': {
      '/buckets/:name': Buckets.destroy
    }
  }
};