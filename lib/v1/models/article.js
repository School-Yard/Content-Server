/**
 * Article Model
 */

var Validator = require('../../utils/validator'),
    Utils = require('../../utils'),
    Slug = require('slug');

module.exports = function(options) {
  var _resource = options.adapters.mongo.resource('articles');

  var Article = function Article(attrs) {
    this._resource = _resource;

    this._id = null;

    // Set some default values
    this._attributes = {
      page_id: '',
      title: '',
      slug: '',
      published: 0,
      ctime: '',
      mtime: ''
    };

    // Save previous attributes
    this._previousAttributes = Utils.extend({}, this._attributes);

    // Save an array of changed properties since last commit to database
    this._changed = [];

    // Set attributes if an object is passed in
    if(typeof attrs === 'object') this.set(attrs);

    // Reset this._changed after the set.call
    this._changed = [];

    return this;
  };

  /**
   * Validator
   *
   * Validate the attributes to ensure its all good
   *
   * @param {Function} - callback - a callback function to run
   */

  Article.prototype.validate = function(callback) {
    var validator = new Validator(),
        prev = this._previousAttributes,
        errors;

    // Custom Validation properties
    validator.check(this.get('title')).notEmpty();
    validator.check(this.get('slug')).notEmpty();
    validator.check(this.get('page_id')).notEmpty();

    errors = validator.getErrors();

    if(errors.length === 0) {
      // Check if the slug has changed values
      if(this._changed.indexOf('slug') !== -1) {
        // Check uniqueness of `slug` property
        Article.find({ slug: this.get('slug') }, function(err, result) {
          if(err) return callback(err);
          if(result.length > 0) return callback(new Error('Slug must be unique'));
          return callback(null);
        });

      }
      else {
        return callback(null);
      }

    }
    else {
      return callback(new Error('Invalid Article data'));
    }
  };


  /**
   * Setter
   *
   * Use the following method to set instance
   * attributes.
   *
   * @param {Object} - attrs - new instance attributes to set
   */

  Article.prototype.set = function(attrs) {
    var self = this;

    Object.keys(attrs).forEach(function(key) {
      if(key === 'id') self._id = attrs.id;

      if(key in self._attributes) {

        // Store the current value into previousAttributes
        // before changing
        self._previousAttributes[key] = self._attributes[key];

        // Mark the field as changed
        self._changed.push(key);

        // If the key is a slug ensure it's slugified
        self._attributes[key] = key === 'slug' ? Slug(attrs[key]) : attrs[key];
      }
    });
  };

  /**
   * Getter
   *
   * Use the following method to retrieve instance
   * attributes.
   *
   * @param {array|string} - attrs - attributes to return
   * @return {string|object}
   */

  Article.prototype.get = function(attrs) {
    if(typeof attrs === 'string') {
      if(attrs === 'id') return this._id;
      return this._attributes[attrs];
    }
    else {
      var self = this,
          attributes = {};

      attrs.forEach(function(key) {
        if(key === 'id') {
          attributes.id = self._id;
        }
        else {
          attributes[key] = self._attributes[key];
        }
      });

      return attributes;
    }
  };

  /**
   * Save Method
   *
   * Commit the current state of the model
   *
   * @param {Function} callback(err, article)
   */

  Article.prototype.save = function(callback) {
    var self = this;

    if(!this._id) {
      // Set the ctime
      this.set({ ctime: Date.now() });

      // Validate and create the record
      this.validate(function(err) {
        if(err) return callback(err);

        self._resource.create(self._attributes, function(err, result) {
          if(err) return callback(err);
          if(result.id) { self._id = result.id; }
          self._changed = [];
          callback(null, self);
        });
      });
    }
    else {
      // Set the mtime
      this.set({ mtime: Date.now() });

      // Validate and save the record
      this.validate(function(err) {
        if(err) return callback(err);

        self._resource.save(self._id, self._attributes, function(err, result) {
          if(err) return callback(err);
          self.changed = [];
          callback(null, self);
        });
      });
    }
  };

  /**
   * Update Method
   *
   * Update attributes and commits changes
   *
   * @param {Object} attrs
   * @param {Function} callback
   */

  Article.prototype.update = function(attrs, callback) {
    var self = this;

    this.set(attrs);
    this.save(function(err, results) {
      if(err) return callback(err);
      callback(null, self);
    });
  };

  /**
   * Destroy Method
   *
   * Delete a record from the database.
   * Wrapper function for the resource destroy method.
   *
   * @param {Function} callback
   */

  Article.prototype.destroy = function(callback) {
    this._resource.destroy(this._id, callback);
  };

  /* ===========================================
   * Static Methods
   * =========================================== */

  /**
   * All Articles
   *
   * Gets all articles in the database.
   *
   * @param {Function} callback(err, results)
   */

  Article.all = function(callback) {
    _resource.all(function(err, results) {
      if(err) return callback(err);

      var articles = results.map(function(article) {
        return new Article(article);
      });

      return callback(null, articles);
    });
  };

  /**
   * Find Article
   *
   * Wrapper for the storage find method
   *
   * @param {Object} conditions
   * @params {Function} callback(err, results)
   */

  Article.find = function(conditions, callback) {
    _resource.find(conditions, function(err, results) {
      if(err) return callback(err);
      if(results.length === 0) return callback(null, []);

      var articles = results.map(function(article) {
        return new Article(article);
      });

      return callback(null, articles);
    });
  };

  /**
   * Get Single Article
   *
   * Returns a single `Article` object
   *
   * @param {String} id
   * @param {Function} callback(err, results)
   */

  Article.get = function(id, callback) {
    _resource.get(id, function(err, article) {
      if(err) return callback(err);
      if(!article || Object.keys(article).length === 0) return callback(null, null);
      return callback(null, new Article(article));
    });
  };

  /**
   * Create an Article
   *
   * Inserts aa article record into the Database
   *
   * @param {Object} - attrs - An object of data to store
   * @param {Function} - callback(err, data)
   */

  Article.create = function(attrs, callback) {
    var record = new Article(attrs);

    // Set the ctime
    record.set({ ctime: Date.now() });

    // Validate and create the record
    record.validate(function(err) {
      if(err) return callback(err);

      record._resource.create(record._attributes, function(err, result) {
        if(err) return callback(err);
        callback(null, new Article(result));
      });
    });
  };

  // Expose `Article`
  return Article;
};