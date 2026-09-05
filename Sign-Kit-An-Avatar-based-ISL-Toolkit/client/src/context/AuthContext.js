import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
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

    // Minimum password length (Firebase requires at least 6, but we keep a generic check)
    if (password.length < 4) {
      throw new Error('Invalid username or password.');
    }

    const trimmedInput = usernameOrEmail.trim();
    const auth = getAuth(firebaseApp);
    try {
      // Firebase signInWithEmailAndPassword expects an email
      const userCredential = await signInWithEmailAndPassword(auth, trimmedInput, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const authUserData = {
        id: user.uid,
        username: user.displayName?.split(' ')[0] ?? trimmedInput.split('@')[0],
        email: user.email,
        name: user.displayName ?? trimmedInput,
        provider: 'email',
        token,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUserData));
      setUser(authUserData);
      return authUserData;
    } catch (err) {
      console.error('[AuthContext] Email login failed:', err);
      throw err;
    }
  };

  /**
   * Log out and clear session
   */
    const logout = async () => {
    // Sign out from Firebase Auth if authenticated
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
    } catch (err) {
      console.error('[AuthContext] Firebase signOut error:', err);
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  // New signup function using Firebase Email/Password
  const signup = async (email, password) => {
    // Basic validation (assumed already done in UI)
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter a password.');
    }
    // Firebase sign-up
    const auth = getAuth(firebaseApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      const authUserData = {
        id: user.uid,
        username: user.displayName?.split(' ')[0] ?? email.split('@')[0],
        email: user.email,
        name: user.displayName ?? email,
        provider: 'email',
        token,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUserData));
      setUser(authUserData);
      return authUserData;
    } catch (err) {
      console.error('[AuthContext] Email signup failed:', err);
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    signup,
    logout,
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
