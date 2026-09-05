import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateAccount.css';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signup } = useAuth(); // Firebase signup function

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    const { fullName, email, username, password, confirmPassword } = formData;
    if (!fullName.trim() || !email.trim() || !username.trim() || !password || !confirmPassword) {
      return 'All fields are required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters long.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Normal signup flow (Firebase + Supabase)
    try {
      setIsSubmitting(true);
      // Create Firebase auth user
      const authUser = await signup(formData.email, formData.password);
      const token = authUser.token;

      // Diagnostic logs
      console.log('[SIGNUP] Firebase user created:', authUser.id);
      console.log('[SIGNUP] Firebase email:', authUser.email);
      console.log('[SIGNUP] API URL:', process.env.REACT_APP_API_URL);
      console.log('[SIGNUP] About to call POST /api/users');
      console.log('[SIGNUP] ID token obtained');

      console.log('[CreateAccount] Sending profile to backend:', `${process.env.REACT_APP_API_URL}/api/users`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          username: formData.username,
        }),
      });

      // Log response status
      console.log('[SIGNUP] Backend response:', response.status);
      const responseBody = await response.text();
      console.log('[SIGNUP] Backend response body:', responseBody);
      // If not ok, throw error (re-parse if JSON)
      if (!response.ok) {
        let errData;
        try {
          errData = JSON.parse(responseBody);
        } catch {
          errData = { message: responseBody };
        }
        throw new Error(errData.message || 'Failed to create profile');
      }

      // All good – navigate to login with success message
      navigate('/login', {
        state: {
          successMessage: 'Account created successfully! Welcome to Sign-Kit.',
          prefillIdentifier: formData.username || formData.email,
        },
      });
    } catch (err) {
      console.error('Signup error:', err);
      // Distinguish network errors (e.g., backend unreachable) from Firebase errors
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Account was created in Firebase, but your profile could not be saved. Please try again.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setIsSubmitting(false);
    }
    return;
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="isl-badge">
          <span role="img" aria-label="Sign Language Badge">🤟 ISL AI Powered</span>
        </div>
        <div className="signup-header">
          <h1>Create Your Mitra AI Account</h1>
          <p className="subtitle">Join Mitra AI and make communication more accessible.</p>
        </div>
        {error && <div className="signup-error">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">💳</span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                disabled={isSubmitting}
              />
            </div>
          </div>
          {/* Password fields remain for normal signup */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
          <button type="submit" className="signup-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="signin-text">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;