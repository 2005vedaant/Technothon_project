const { auth } = require('../firebaseAdmin');

/**
 * Express middleware that validates a Firebase ID token passed in the
 * Authorization header as `Bearer <token>`.
 *
 * On success, `req.firebaseUser` is populated with the decoded token
 * (containing `uid`, `email`, etc.) and `req.firebaseUserRecord` contains
 * the full Firebase user record obtained via `auth.getUser(uid)`.
 *
 * If the token is missing, malformed or invalid, a 401 response is sent
 * and the request handling stops.
 */
function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.*)$/i);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const idToken = match[1];
  auth
    .verifyIdToken(idToken)
    .then((decoded) => {
      // Attach decoded token
      req.firebaseUser = decoded;
      // Also fetch full user record for name/email
      return auth.getUser(decoded.uid);
    })
    .then((userRecord) => {
      req.firebaseUserRecord = userRecord;
      next();
    })
    .catch((err) => {
      console.error('[Auth Middleware] Firebase token verification error:', err);
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    });
}

module.exports = verifyFirebaseToken;
