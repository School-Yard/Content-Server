var AddOns = module.exports;

/**
 * Take an object as routes and apply those routes
 *  to the `this` instance
 *
 * Taken from TJ Holowaychuk
 *  - github.com/visionmedia/express/blob/master/test/acceptance/route-map.js
 */

AddOns.map = function() {
  this.map = function(a, route) {
    route = route || '';

    for(var key in a) {
      switch(typeof a[key]) {
        case 'object':
          this.map(a[key], route + key);
          break;
        case 'function':
          this[key](route, a[key]);
          break;
      }
    }
  };
};