import React, { useState } from 'react';

/**
 * Login Component
 * Renders a simple login form with Email and Password fields.
 * Sends credentials to POST /login on the FastAPI backend.
 */
function Login({ onNavigate, onLoginSuccess, initialMessage }) {
  // Local form state for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Local state for feedback messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(initialMessage || '');
  const [loading, setLoading] = useState(false);

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send POST request to FastAPI login endpoint
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display error message from backend (e.g., "Invalid email or password")
        setError(data.detail || 'Login failed. Please try again.');
      } else {
        // Login successful! Save user state and redirect to Home/Dashboard page
        setSuccess('Login successful! Redirecting to Dashboard...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1000);
      }
    } catch (err) {
      setError('Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="subtitle">Log in to your account</p>

      {/* Success and Error Feedback Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <p className="switch-text">
        Don't have an account?{' '}
        <button
          type="button"
          className="btn-link"
          onClick={() => onNavigate('signup')}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default Login;
