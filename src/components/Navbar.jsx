import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          🏨 <span>SmartStay</span>
        </Link>

        <div className="nav-links" style={{ display: mobileOpen ? 'flex' : undefined }}>
          <Link to="/" className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/hotels" className={`nav-link ${isActive('/hotels') ? 'active' : ''}`}>
            Hotels
          </Link>

          {isAuthenticated ? (
            <>
              {isGuest(user) && (
                <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}>
                  My Bookings
                </Link>
              )}
              {isManager && (
                <Link to="/manager" className={`nav-link ${isActive('/manager') ? 'active' : ''}`}>
                  Manager
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                  Admin
                </Link>
              )}
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <FiUser size={16} /> {user?.firstName || 'Profile'}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                <FiLogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function isGuest(user) {
  return user?.role === 'GUEST';
}
