const { auth } = require('../firebaseAdmin');

async function authenticateFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token using the modular Auth instance
    const decodedToken = await auth.verifyIdToken(token);
    console.log('[authMiddleware] Token verified, uid:', decodedToken.uid, 'email:', decodedToken.email);

    // Attach the decoded token to the request for downstream handlers
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}

module.exports = authenticateFirebaseToken;