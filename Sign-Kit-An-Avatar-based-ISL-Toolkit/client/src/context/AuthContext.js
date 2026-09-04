import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { firebaseApp } from '../firebase';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'signkit_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('[AuthContext] Error reading stored auth:', err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log in with Username or Email & Password
   * Can be hooked to a backend endpoint (e.g. POST /api/auth/login)
   */
  const login = async (usernameOrEmail, password) => {
    // Basic validation
    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      throw new Error('Please enter your username/email.');
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter your password.');
    }

    // Minimum password check (e.g. at least 4 characters)
    if (password.length < 4) {
      throw new Error('Invalid username or password.');
    }

    // Simulate network authentication latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const trimmedInput = usernameOrEmail.trim();
    const isEmail = trimmedInput.includes('@');

    const authUserData = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      username: isEmail ? trimmedInput.split('@')[0] : trimmedInput,
      email: isEmail ? trimmedInput : `${trimmedInput.toLowerCase()}@signkit.local`,
      name: isEmail ? trimmedInput.split('@')[0] : trimmedInput,
      provider: 'local',
      token: 'jwt_signkit_token_' + Date.now(),
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUserData));
    setUser(authUserData);
    return authUserData;
  };

  /**
   * Log in with Google
   * To connect Google OAuth:
   * 1. Add REACT_APP_GOOGLE_CLIENT_ID to your .env file
   * 2. Replace the simulated flow below with Google Identity Services (GIS) / OAuth token exchange
   */
  const loginWithGoogle = async () => {
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const googleUserData = {
        id: user.uid,
        username: user.displayName?.split(' ')[0] ?? 'GoogleUser',
        email: user.email,
        name: user.displayName ?? '',
        avatar: user.photoURL ?? null,
        provider: 'google',
        token: await user.getIdToken(),
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUserData));
      setUser(googleUserData);
      return googleUserData;
    } catch (err) {
      console.error('[AuthContext] Google login failed:', err);
      throw new Error('Google login failed. Please try again.');
    }
  };

  /**
   * Log out and clear session
   */
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
