/**
 * Verify HMAC Authentication Key
 */

var crypto = require('crypto'),
    pause = require('pause');

module.exports = function(connection) {
  var users;

  // Setup the data connection to lookup users
  users = connection.resource('users');

  return function(req, res, next) {
    var authorization,
        parts,
        paused,
        user,
        secret,
        data,
        timeBlock,
        computed;

    authorization = req.headers.authorization;

    // Check if the request contains an Authorization Header
    if(!authorization) return unauthorized(res);

    parts = authorization.split(':');

    /**
     * Compute and verify the signed request using
     * a user's AUTH_SECRET.
     *
     * To prevent reply attacks but still allow a client's
     * time to be a bit off use a 60 second time block in the
     * TOTP password algorithm. http://tools.ietf.org/html/rfc6238
     */

    // Pause the stream since this is async and in middleware
    paused = pause(req);

    // Lookup User from the Access Key
    users.find({ auth_key: parts[0]}, function(err, users) {
      var user = users[0]; // users will be an array

      if(err) return unauthorized(res);
      if(!user) return unauthorized(res);

      secret = user.auth_secret;
      data = user.email;

      // Compute the signed request to compare to the req signature
      timeBlock = Math.floor(new Date().getTime() / 1000 / 60); // 60 seconds
      computed = crypto.createHmac('sha512', secret).update(data + timeBlock).digest('base64');

      if(computed !== parts[1]) return unauthorized(res);

      // User is authenticated, set normalized role and id
      req.user = { role: parseInt(user.role.toString(), 10), id: user.id };
      next();
      paused.resume();
    });

  };
};

function unauthorized(res) {
  res.statusCode = 401;
  res.send('Unauthorized');
  res.end();
}