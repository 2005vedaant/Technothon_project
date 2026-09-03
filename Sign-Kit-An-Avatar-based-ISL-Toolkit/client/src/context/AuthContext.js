import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Simulate network latency for OAuth popup / response
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

      // When Google Client ID is configured, backend OAuth validation will go here
      if (googleClientId) {
        console.log('[AuthContext] Google OAuth Client ID detected:', googleClientId);
      }

      const googleUserData = {
        id: 'goog_' + Math.random().toString(36).substring(2, 9),
        username: 'GoogleUser',
        email: 'user@gmail.com',
        name: 'Sign-Kit Explorer',
        avatar: null,
        provider: 'google',
        token: 'jwt_google_oauth_' + Date.now(),
        loggedInAt: new Date().toISOString()
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
