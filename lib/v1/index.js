/**
 * API Card
 *
 * A Versioned JSON API
 */

var PageModel = require('./models/page'),
    ArticleModel = require('./models/article'),
    Pages = require('./controllers/pages'),
    Articles = require('./controllers/articles');

module.exports = {
  'name': 'API V1',
  'slug': 'v1',

  'init': function() {
    this.Page = new PageModel({ adapters: this.adapters });
    this.Article = new ArticleModel({ adapters: this.adapters });
  },

  'before': [],

  'router': {
    'get': {
      '/pages': Pages.index,
      '/pages/:id': Pages.show,
      '/pages/:page_id/articles': Articles.index,
      '/pages/:page_id/articles/:id': Articles.show
    },
    'post': {
      '/pages': Pages.create,
      '/pages/:page_id/articles': Articles.create
    },
    'put': {
      '/pages/:id': Pages.update,
      '/pages/:page_id/articles/:id': Articles.update
    },
    'delete': {
      '/pages/:id': Pages.destroy,
      '/pages/:page_id/articles/:id': Articles.destroy
    }
  }
};