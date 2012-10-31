/**
 * Bucket Model
 *
 * A top level container for holding items.
 */

var Validator = require('../../utils/validator'),
    Utils = require('../../utils'),
    Slug = require('slug');

module.exports = function(options) {
  var _resource = options.adapters.mongo.resource('buckets');

  var Bucket = function Bucket(attrs) {
    this._resource = _resource;

    this._id = null;

    // Set some default values
    this._attributes = {
      name: '',
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

  Bucket.prototype.validate = function(callback) {
    var validator = new Validator(),
        prev = this._previousAttributes,
        errors;

    // Custom Validation properties
    validator.check(this.get('name')).notEmpty();

    errors = validator.getErrors();

    if(errors.length === 0) {
      // Check if the slug has changed values
      if(this._changed.indexOf('name') !== -1) {
        // Check uniqueness of `slug` property
        Bucket.find({ name: this.get('name') }, function(err, result) {
          if(err) return callback(err);
          if(result.length > 0) return callback(new Error('Name must be unique'));
          return callback(null);
        });

      }
      else {
        return callback(null);
      }

    }
    else {
      return callback(new Error('Invalid Bucket data'));
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

  Bucket.prototype.set = function(attrs) {
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
        self._attributes[key] = key === 'name' ? Slug(attrs[key]) : attrs[key];
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

  Bucket.prototype.get = function(attrs) {
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
   * Return Attribute values
   *
   * Combines the _id and _attributes values
   */

  Bucket.prototype.attributes = function() {
    var attrs = Utils.merge({}, this._attributes);
    return Utils.merge(attrs, { id: this._id });
  };

  /**
   * Save Method
   *
   * Commit the current state of the model
   *
   * @param {Function} callback(err, bucket)
   */

  Bucket.prototype.save = function(callback) {
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

  Bucket.prototype.update = function(attrs, callback) {
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

  Bucket.prototype.destroy = function(callback) {
    this._resource.destroy(this._id, callback);
  };

  /* ===========================================
   * Static Methods
   * =========================================== */

  /**
   * All Buckets
   *
   * Gets all buckets in the database.
   *
   * @param {Function} callback(err, results)
   */

  Bucket.all = function(callback) {
    _resource.all(function(err, results) {
      if(err) return callback(err);

      var buckets = results.map(function(bucket) {
        return new Bucket(bucket);
      });

      return callback(null, buckets);
    });
  };

  /**
   * Find Bucket
   *
   * Wrapper for the storage find method
   *
   * @param {Object} conditions
   * @params {Function} callback(err, results)
   */

  Bucket.find = function(conditions, callback) {
    _resource.find(conditions, function(err, results) {
      if(err) return callback(err);
      if(results.length === 0) return callback(null, []);

      var buckets = results.map(function(bucket) {
        return new Bucket(bucket);
      });

      return callback(null, buckets);
    });
  };

  /**
   * Get Single Bucket
   *
   * Returns a single `Bucket` object
   *
   * @param {String} id
   * @param {Function} callback(err, results)
   */

  Bucket.get = function(id, callback) {
    _resource.get(id, function(err, bucket) {
      if(err) return callback(err);
      if(!bucket || Object.keys(bucket).length === 0) return callback(null, null);
      return callback(null, new Bucket(bucket));
    });
  };

  /**
   * Create a Bucket
   *
   * Inserts a bucket record into the Database
   *
   * @param {Object} - attrs - An object of data to store
   * @param {Function} - callback(err, data)
   */

  Bucket.create = function(attrs, callback) {
    var record = new Bucket(attrs);

    // Set the ctime
    record.set({ ctime: Date.now() });

    // Validate and create the record
    record.validate(function(err) {
      if(err) return callback(err);

      record._resource.create(record._attributes, function(err, result) {
        if(err) return callback(err);
        callback(null, new Bucket(result));
      });
    });
  };

  // Expose `Bucket`
  return Bucket;
};