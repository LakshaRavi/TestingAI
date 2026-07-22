import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // Navigation state: 'signup' | 'login' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('signup');
  
  // Current logged in user object: { id, name, email }
  const [user, setUser] = useState(null);
  
  // Flash message passed between views (e.g. signup success message shown on login page)
  const [flashMessage, setFlashMessage] = useState('');

  // Handle switching pages
  const handleNavigate = (page, message = '') => {
    setFlashMessage(message);
    setCurrentPage(page);
  };

  // Handle successful login from Login component
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // Handle logout from Dashboard component
  const handleLogout = () => {
    setUser(null);
    setFlashMessage('Logged out successfully.');
    setCurrentPage('login');
  };

  return (
    <div className="app-container">


      <main className="app-main">
        {currentPage === 'signup' && (
          <Signup
            onNavigate={handleNavigate}
            initialSuccessMessage={flashMessage}
          />
        )}

        {currentPage === 'login' && (
          <Login
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            initialMessage={flashMessage}
          />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            user={user}
            onLogout={handleLogout}
          />
        )}
      </main>


    </div>
  );
}

export default App;
