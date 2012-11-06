var ACL = require('./ACL/access_control'),
    Buckets = require('./controllers/buckets'),
    Items = require('./controllers/items'),
    ItemProperties = require('./controllers/properties');


/**
 * Version 1 JSON API
 * uses app.map to map routes in express
 */

module.exports = function(app) {
  var Buckets = require('./controllers/buckets')(app),
      Items = require('./controllers/items')(app),
      ItemProperties = require('./controllers/properties')(app);

  /**
   * Access Levels:
   *
   * 0 - Read Only
   * 1 - Editor (can write values to properties)
   * 2 - Creator (can create buckets, items and properties)
   */

  return {
    // /v1/buckets
    '/buckets': {
      get: ACL(Buckets.index, 0),
      post: ACL(Buckets.create, 2),

      // /v1/buckets/:bucket_name
      '/:bucket_name': {
        get: ACL(Buckets.show, 0),
        put: ACL(Buckets.update, 2),
        del: ACL(Buckets.destroy, 2),

        // /v1/buckets/:bucket_name/items
        '/items': {
          get: ACL(Items.index, 0),
          post: ACL(Items.create, 2),

          // /v1/buckets/:bucket_name/items/:item_name
          '/:item_name': {
            get: ACL(Items.show, 0),
            put: ACL(Items.update, 2),
            del: ACL(Items.destroy, 2),

            // /v1/buckets/:bucket_name/items/:item_name/properties
            '/properties': {
              get: ACL(ItemProperties.index, 0),
              put: ACL(ItemProperties.update, 2),
              post: ACL(ItemProperties.create, 2),

              // /v1/buckets/:bucket_name/items/:item_name/properties/:id
              '/:id': {
                get: ACL(ItemProperties.show, 0),
                del: ACL(ItemProperties.destroy, 2)
              }
            }
          }
        }
      }
    }
  };
};