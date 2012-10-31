/**
 * Bootstrap API categories so they will always spin
 * up without having to manually create the categories
 * in the datastore.
 */

module.exports = function(connection, callback) {
  var resource = connection.resource('categories'),
      api_category;

  // Check if the category already exists
  resource.find({ name: 'api' }, function(err, results) {
    if(err) return callback(err);
    if(results.length !== 0) return callback(null);

    api_category = {
      name: 'api',
      slug: 'api',
      published: true,
      plugins: [{ 'API V1' : { published: true }} ]
    };

    resource.create(api_category, function() {
      callback(null);
    });
  });
};