/**
 * Property Model
 *
 * A container for linking together key/value properties,
 * belongs to a single bucket.
 */

var Validator = require('../../utils/validator'),
    Utils = require('../../utils');

module.exports = function(adapter) {
  var _resource = adapter.resource('item_properties');

  var Property = function Property(attrs) {
    this._resource = _resource;

    this._id = null;

    // Set some default values
    this._attributes = {
      item_id: '',
      key: '',
      value: '',
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

  Property.prototype.validate = function(callback) {
    var self = this,
        validator = new Validator(),
        errors;

    // Custom Validation properties
    validator.check(this.get('key')).notEmpty();
    validator.check(this.get('item_id')).notEmpty();

    errors = validator.getErrors();

    if(errors.length === 0) {
      // Check if the key has changed values
      if(this._changed.indexOf('key') !== -1) {
        // Check uniqueness of `key` property
        Property.getByKey(this.get('item_id'), this.get('key'), function(err, result) {
          if(err) return callback(err);
          if(result && result.get('id') !== self.get('id')) {
            return callback(new Error('Key must be unique'));
          }

          return callback(null);
        });

      }
      else {
        return callback(null);
      }

    }
    else {
      return callback(new Error('Invalid item property data'));
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

  Property.prototype.set = function(attrs) {
    var self = this;

    Object.keys(attrs).forEach(function(key) {
      if(key === 'id') self._id = attrs.id;

      if(key in self._attributes) {

        // Store the current value into previousAttributes
        // before changing
        self._previousAttributes[key] = self._attributes[key];

        // Mark the field as changed
        self._changed.push(key);

        // Set the attribute
        self._attributes[key] = attrs[key];
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

  Property.prototype.get = function(attrs) {
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

  Property.prototype.attributes = function() {
    var attrs = Utils.merge({}, this._attributes);
    return Utils.merge(attrs, { id: this._id });
  };

  /**
   * Save Method
   *
   * Commit the current state of the model
   *
   * @param {Function} callback(err, item)
   */

  Property.prototype.save = function(callback) {
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

  Property.prototype.update = function(attrs, callback) {
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

  Property.prototype.destroy = function(callback) {
    this._resource.destroy(this._id, callback);
  };

  /* ===========================================
   * Static Methods
   * =========================================== */

  /**
   * All Properties
   *
   * Gets all items in the database.
   *
   * @param {Function} callback(err, results)
   */

  Property.all = function(callback) {
    _resource.all(function(err, results) {
      if(err) return callback(err);

      var items = results.map(function(item) {
        return new Property(item);
      });

      return callback(null, items);
    });
  };

  /**
   * Find Property
   *
   * Wrapper for the storage find method
   *
   * @param {Object} conditions
   * @params {Function} callback(err, results)
   */

  Property.find = function(conditions, callback) {
    _resource.find(conditions, function(err, results) {
      if(err) return callback(err);
      if(results.length === 0) return callback(null, []);

      var items = results.map(function(item) {
        return new Property(item);
      });

      return callback(null, items);
    });
  };

  /**
   * Get Single Property by ID
   *
   * Returns a single `Property` object
   *
   * @param {String} id
   * @param {Function} callback(err, results)
   */

  Property.get = function(id, callback) {
    _resource.get(id, function(err, item) {
      if(err) return callback(err);
      if(!item || Object.keys(item).length === 0) return callback(null, null);
      return callback(null, new Property(item));
    });
  };

  /**
   * Get Single Property by item_id and key
   *
   * Returns a single `Property` object
   *
   * @param {String} id
   * @param {String} key
   * @param {Function} callback(err, result)
   */

  Property.getByKey = function(item_id, key, callback) {
    _resource.find({ item_id: item_id, key: key }, function(err, items) {
      if(err) return callback(err);
      if(!items.length) return callback(null, null);
      return callback(null, new Property(items[0]));
    });
  };

  /**
   * Create an Property
   *
   * Inserts an item record into the Database
   *
   * @param {Object} - attrs - An object of data to store
   * @param {Function} - callback(err, data)
   */

  Property.create = function(attrs, callback) {
    var record = new Property(attrs);

    // Set the name and ctime
    record.set({ key: attrs.key });
    record.set({ ctime: Date.now() });

    // Validate and create the record
    record.validate(function(err) {
      if(err) return callback(err);

      record._resource.create(record._attributes, function(err, result) {
        if(err) return callback(err);
        callback(null, new Property(result));
      });
    });
  };

  // Expose `Property`
  return Property;
};