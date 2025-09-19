import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="container">
        <nav className="dashboard-nav">
          <div className="dashboard-logo">
            🔐 Auth Portal
          </div>
          <div className="dashboard-user">
            <span className="text-sm">Welcome, {user?.email}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
