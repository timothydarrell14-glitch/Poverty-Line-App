import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import { clearAuthSession, getCurrentUser, isAuthenticated } from '../utils/auth';

export const Navbar = ({ activeTab, setActiveTab, onOpenDonate, onOpenLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handle = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  useEffect(() => {
    const syncAuthState = () => setCurrentUser(getCurrentUser());
    window.addEventListener('povertyline-auth-change', syncAuthState);
    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener('povertyline-auth-change', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const openLogin = () => {
    setOpen(false);
    setIsLoginOpen(true);
  };

  const signOut = () => {
    clearAuthSession();
    navigate('/');
  };

  const items = [
    ['/', 'home', 'Home'],
    ['/get-help', 'get-help', 'Get Help'],
    ['/donors', 'donors', 'Donors'],
    ['/organisations', 'organisations', 'Organisations'],
    ['/contact', 'contact', 'Contact Us'],
  ];

  const handleSelect = (path, id) => {
    setOpen(false);
    if (setActiveTab) {
      setActiveTab(id);
    }
    if (navigate) {
      navigate(path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTabActive = (path, id) => {
    if (location && location.pathname === path) return true;
    if (activeTab === id) return true;
    return false;
  };

  return (
    <>
      <nav className={`site-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <button className="brand font-heading" onClick={() => handleSelect('/', 'home')}>
            <span className="material-symbols-outlined material-symbols-fill">volunteer_activism</span>
            Poverty Line
          </button>
          <div className="nav-links">
            {items.map(([path, id, label]) => (
              <button
                key={id}
                className={`nav-link ${isTabActive(path, id) ? 'active' : ''}`}
                onClick={() => handleSelect(path, id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            {isAuthenticated() ? (
              <>
                {currentUser?.is_admin && <span className="admin-badge">Admin</span>}
                <button className="login-button" onClick={signOut}>Log out</button>
              </>
            ) : <button className="login-button" onClick={openLogin}>Login</button>}
            <button className="pill-button nav-donate" onClick={onOpenDonate}>
              <span className="material-symbols-outlined">favorite</span>Donate Now
            </button>
          </div>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {items.map(([path, id, label]) => (
          <button
            key={id}
            className={`nav-link ${isTabActive(path, id) ? 'active' : ''}`}
            onClick={() => handleSelect(path, id)}
          >
            {label}
          </button>
        ))}
        <div className="nav-actions">
          <button className="pill-button" onClick={() => { setOpen(false); onOpenDonate?.(); }}>Donate Now</button>
          {isAuthenticated() ? <button className="login-button" onClick={signOut}>Log out</button> : <button className="login-button" onClick={openLogin}>Login</button>}
        </div>
      </div>
      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onShowSignup={() => { setIsLoginOpen(false); setIsSignupOpen(true); }}
        onAuthenticated={(user) => setCurrentUser(user)}
      />
      <Signup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onShowLogin={() => { setIsSignupOpen(false); setIsLoginOpen(true); }}
      />
    </>
  );
};

export default Navbar;
