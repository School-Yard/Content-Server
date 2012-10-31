/**
 * Access Control Check
 *
 * Assumes the request has already been run through an Authorization
 * check and that there is a req.user object.
 *
 * Checks the user's role level is greater than or equal to the
 * minimum required role to access the route handler.
 *
 * Returns a 401 status if the role is not high enough.
 */

module.exports = function index(cb, level) {
  return function(req, res, params) {

    if(typeof req.user.role === 'undefined') return unauthorized(res);
    if(req.user.role < level) return unauthorized(res);

    cb.call(this, req, res, params);
  };
};

function unauthorized(res) {
  res.statusCode = 401;
  res.send('Unauthorized');
  res.end();
}