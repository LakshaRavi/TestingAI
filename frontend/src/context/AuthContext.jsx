import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage if present
    const storedUser = localStorage.getItem('office_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('office_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'employee', name = '') => {
    const userData = await authAPI.login(email, password, role, name);
    setUser(userData);
    localStorage.setItem('office_user', JSON.stringify(userData));
    return userData;
  };


  const updateUserSession = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('office_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('office_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserSession, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
