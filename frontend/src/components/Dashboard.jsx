import React from 'react';

/**
 * Dashboard Component (Home Page)
 * Displays user information after successful login and provides a Log Out button.
 */
function Dashboard({ user, onLogout }) {
  return (
    <div className="auth-card dashboard-card">
      <div className="dashboard-header">
        <h2>Home / Dashboard</h2>
        <span className="badge">Logged In</span>
      </div>

      <div className="welcome-section">
        <h3>Hello, {user?.name || 'User'}! 👋</h3>
        <p>You have successfully logged into your account.</p>
      </div>

      <div className="user-details">
        <h4>Your Account Details:</h4>
        <div className="detail-row">
          <strong>User ID:</strong> <span>#{user?.id}</span>
        </div>
        <div className="detail-row">
          <strong>Name:</strong> <span>{user?.name}</span>
        </div>
        <div className="detail-row">
          <strong>Email:</strong> <span>{user?.email}</span>
        </div>
      </div>

      <button onClick={onLogout} className="btn btn-secondary">
        Log Out
      </button>
    </div>
  );
}

export default Dashboard;
