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

module.exports = function(route, level) {
  return function(req, res) {

    if(typeof req.user.role === 'undefined') return unauthorized(res);
    if(req.user.role < level) return unauthorized(res);

    route.call(null, req, res);
  };
};

function unauthorized(res) {
  res.send(401, 'Unauthorized');
}