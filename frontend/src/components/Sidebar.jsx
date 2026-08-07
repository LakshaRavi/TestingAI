import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  ClipboardList, 
  FileText, 
  User, 
  BriefcaseIcon
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    {
      path: '/',
      label: user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: <Briefcase size={20} />
    },
    {
      path: '/status',
      label: 'Daily Status',
      icon: <ClipboardList size={20} />
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <FileText size={20} />
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <BriefcaseIcon size={22} />
        </div>
        <span className="sidebar-logo-text">Office Work System</span>

      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Office Work System v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
