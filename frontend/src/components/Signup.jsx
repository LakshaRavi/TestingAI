import React, { useState } from 'react';

/**
 * Signup Component
 * Renders a simple registration form with Name, Email, and Password fields.
 * Sends data to POST /signup on the FastAPI backend.
 */
function Signup({ onNavigate, initialSuccessMessage }) {
  // Local form state for input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Local state for feedback messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(initialSuccessMessage || '');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Send POST request to FastAPI signup endpoint
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display error message from backend (e.g., "User already exists")
        setError(data.detail || 'Signup failed. Please try again.');
      } else {
        // Display success message and redirect to Login page
        setSuccess('Signup successful! Redirecting to Login...');
        setTimeout(() => {
          onNavigate('login', 'User registered successfully! Please log in.');
        }, 1500);
      }
    } catch (err) {
      setError('Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="subtitle">Sign up to get started</p>

      {/* Success and Error Feedback Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <p className="switch-text">
        Already have an account?{' '}
        <button
          type="button"
          className="btn-link"
          onClick={() => onNavigate('login')}
        >
          Log In
        </button>
      </p>
    </div>
  );
}

export default Signup;
