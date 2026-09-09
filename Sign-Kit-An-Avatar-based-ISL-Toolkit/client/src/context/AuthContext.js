import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../firebase';

export const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'signkit_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('[AuthContext] Error reading stored auth:', err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
    });
    setLoading(false);
    return unsubscribe;
  }, []);

  const login = async (usernameOrEmail, password) => {
    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      throw new Error('Please enter your username/email.');
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter your password.');
    }
    if (password.length < 4) {
      throw new Error('Invalid username or password.');
    }
    const trimmedInput = usernameOrEmail.trim();
    const auth = getAuth(firebaseApp);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedInput, password);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      const authUserData = {
        id: fbUser.uid,
        username: fbUser.displayName?.split(' ')[0] ?? trimmedInput.split('@')[0],
        email: fbUser.email,
        name: fbUser.displayName ?? trimmedInput,
        provider: 'email',
        token,
        loggedAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUserData));
      setUser(authUserData);
      setFirebaseUser(fbUser);
      return authUserData;
    } catch (err) {
      console.error('[AuthContext] Email login failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
    } catch (err) {
      console.error('[AuthContext] Firebase signOut error:', err);
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setFirebaseUser(null);
  };

  const signup = async (email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || !password.trim()) {
      throw new Error('Please enter a password.');
    }
    const auth = getAuth(firebaseApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      const authUserData = {
        id: fbUser.uid,
        username: fbUser.displayName?.split(' ')[0] ?? email.split('@')[0],
        email: fbUser.email,
        name: fbUser.displayName ?? email,
        provider: 'email',
        token,
        loggedAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUserData));
      setUser(authUserData);
      setFirebaseUser(fbUser);
      return authUserData;
    } catch (err) {
      console.error('[AuthContext] Email signup failed:', err);
      throw err;
    }
  };

  const value = {
    user,
    firebaseUser,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
