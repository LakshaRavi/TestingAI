import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-title">Office Work Management</span>
      </div>

      <div className="navbar-user">
        <Link 
          to="/profile" 
          className="user-badge"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
          title="View Profile Details"
        >
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`role-pill ${user.role === 'admin' ? 'role-admin' : 'role-employee'}`}>
              {user.role}
            </span>
          </div>
        </Link>

        <button 
          onClick={logout} 
          className="btn btn-secondary btn-sm"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
