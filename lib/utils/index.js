/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Extend an object with the properties from the
 * passed in object
 */

exports.extend = function(obj) {
  var source = Array.prototype.slice.call(arguments, 1)[0];

  for (var prop in source) {
    obj[prop] = source[prop];
  }

  return obj;
};