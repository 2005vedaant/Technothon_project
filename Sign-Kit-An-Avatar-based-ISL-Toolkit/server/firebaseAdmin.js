const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require('./firebase-service-account.json');

// Initialize the default app with the service account credentials using the modular API
const app = initializeApp({
  credential: cert(serviceAccount),
});

// Export the Auth instance (compatible with firebase-admin v14)
const auth = getAuth(app);

module.exports = { auth };