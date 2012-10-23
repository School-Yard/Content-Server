/**
 * RESTFul Methods for Pages
 */

var Pages = module.exports;

/**
 * GET - All Pages
 *
 * Returns all the pages in the database
 */

Pages.index = function index(req, res) {
  var pages;

  this.Page.all(function(err, results) {
    if(err) return res.json(500, { error: err.message });

    // Collect just the attributes
    pages = results.map(function(page) {
      var attrs = page._attributes;
      attrs.id = attrs.id || page.get('id');
      return attrs;
    });

    res.json(pages);
  });
};

/**
 * POST - Create a Page
 *
 * Creates a new page and returns the new record.
 */

Pages.create = function create(req, res) {
  var data;

  if(!req.body) return res.json(400, { error: 'invalid json' });

  data = req.body;

  this.Page.create(data, function(err, page) {
    if(err) return res.json(500, { error: err.message });

    var attrs = page._attributes;
    attrs.id = attrs.id || page.get('id');
    res.json(201, attrs);
  });
};

/**
 * GET - Single Record
 *
 * Return a single record from an id
 */

Pages.show = function show(req, res, params) {
  var id, attrs;

  if(!params.id) return res.json(500, { error: 'No ID param given' });

  id = params.id;

  this.Page.get(id, function(err, page) {
    if(err) return res.json(500, { error: err.message });
    if(!page) return res.json(404, { error: 'No record found with that ID'});

    attrs = page._attributes;
    attrs.id = attrs.id || page.get('id');

    res.json(attrs);
  });
};

/**
 * PUT - Update a Page
 *
 * Updates a single page model with new attributes
 */

Pages.update = function update(req, res, params) {
  var id, data, attrs;

  if(!params.id) return res.json(500, { error: 'No ID param given' });
  if(!req.body) return res.json(400, { error: 'invalid json' });

  id = params.id;
  data = req.body;

  this.Page.get(id, function(err, page) {
    if(err) return res.json(500, { error: err.message });
    if(!page) return res.json(404, { error: 'No record found with that ID'});

    page.update(data, function(err, updated_page) {
      if(err) return res.json(500, { error: err.message });

      attrs = page._attributes;
      attrs.id = attrs.id || page.get('id');

      res.json(attrs);
    });
  });
};

/**
 * DELETE - Destroy a Page
 *
 * Deletes a page from the data store
 */

Pages.destroy = function destroy(req, res, params) {
  var id;

  if(!params.id) return res.json(500, { error: 'No ID param given' });

  id = params.id;

  this.Page.get(id, function(err, page) {
    if(err) return res.json(500, { error: err.message });
    if(!page) return res.json(404, { error: 'No record found with that ID'});

    page.destroy(function(err, status) {
      if(err) return res.json(500, { error: err.message });
      res.json({ status: status });
    });
  });
};