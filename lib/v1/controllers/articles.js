/**
 * RESTFul Methods for Articles
 */

var Articles = module.exports;

/**
 * GET - All Articles for a given page.
 *
 * Returns all the articles in the database that belong to
 * the parent page.
 */

Articles.index = function index(req, res, params) {
  var self = this,
      articles;

  if(!params.page_id) return res.json(500, { error: 'No page ID param given' });

  findPage.call(this, params.page_id, function(err, page) {
    if(err) return res.json(500, { error: err.message });

    self.Article.find({ page_id: page._id }, function(err, results) {
      if(err) return res.json(500, { error: err.message });

      // Collect just the attributes
      articles = results.map(function(article) {
        var attrs = article._attributes;
        attrs.id = attrs.id || article.get('id');
        return attrs;
      });

      res.json(articles);
    });
  });
};

/**
 * POST - Create an Article
 *
 * Creates a new article and returns the new record.
 */

Articles.create = function create(req, res, params) {
  var self = this,
      data,
      attrs;

  if(!params.page_id) return res.json(500, { error: 'No page ID param given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  data = req.body;

  // Find the page so we ensure the page_id belongs to a valid
  // record and not a ghost item.
  findPage.call(this, params.page_id, function(err, page) {
    if(err) return res.json(500, { error: err.message });

    // Set the page ID
    data.page_id = page._id;

    self.Article.create(data, function(err, article) {
      if(err) return res.json(500, { error: err.message });

      attrs = article._attributes;
      attrs.id = attrs.id || article.get('id');

      res.json(201, attrs);
    });
  });
};

/**
 * GET - Single Record
 *
 * Return a single record from an id
 */

Articles.show = function show(req, res, params) {
  var self = this,
      attrs;

  if(!params.page_id) return res.json(500, { error: 'No page ID param given' });
  if(!params.id) return res.json(500, { error: 'No article ID param given' });

  // Find the page so we ensure the page_id belongs to a valid
  // record and not a ghost item.
  findPage.call(this, params.page_id, function(err, page) {
    if(err) return res.json(500, { error: err.message });

    // Find the article
    self.Article.get(params.id, function(err, article) {
      if(err) return res.json(500, { error: err.message });
      if(!article) return res.json(500, { error: 'No article found with that ID' });

      attrs = article._attributes;
      attrs.id = attrs.id || article.get('id');

      res.json(attrs);
    });
  });
};

/**
 * PUT - Update a Record
 *
 * Updates a single article model with new attributes
 */

Articles.update = function update(req, res, params) {
  var self = this,
      data,
      attrs;

  if(!params.page_id) return res.json(500, { error: 'No page ID param given' });
  if(!params.id) return res.json(500, { error: 'No article ID param given' });

  data = req.body;

  // Find the page so we ensure the page_id belongs to a valid
  // record and not a ghost item.
  findPage.call(this, params.page_id, function(err, page) {
    if(err) return res.json(500, { error: err.message });

    // Set the page ID
    data.page_id = page._id;

    // Find the article
    self.Article.get(params.id, function(err, article) {
      if(err) return res.json(500, { error: err.message });
      if(!article) return res.json(500, { error: 'No article found with that ID' });

      // Update the article
      article.update(data, function(err, updated_article) {
        if(err) return res.json(500, { error: err.message });

        attrs = article._attributes;
        attrs.id = attrs.id || article.get('id');

        res.json(attrs);
      });
    });
  });
};

/**
 * DELETE - Destroy a Record
 *
 * Deletes a record from the data store
 */

Articles.destroy = function destroy(req, res, params) {
  var self = this;

  if(!params.page_id) return res.json(500, { error: 'No page ID param given' });
  if(!params.id) return res.json(500, { error: 'No article ID param given' });

  // Find the page so we ensure the page_id belongs to a valid
  // record and not a ghost item.
  findPage.call(this, params.page_id, function(err, page) {
    if(err) return res.json(500, { error: err.message });

    // Find the article
    self.Article.get(params.id, function(err, article) {
      if(err) return res.json(500, { error: err.message });
      if(!article) return res.json(500, { error: 'No article found with that ID' });

      // Destroy the article
      article.destroy(function(err, status) {
        if(err) return res.json(500, { error: err.message });
        res.json({ status: status });
      });
    });
  });
};

/**
 * Private Functions for this controller
 */

function findPage(id, callback) {
  this.Page.get(id, function(err, page) {
    if(err) return callback(err);
    if(!page) return callback(new Error('No record found with that ID'));
    callback(null, page);
  });
}