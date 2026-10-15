// src/components/Navbar.jsx
// Responsive Navbar with real Supabase Auth State, Profile indicator, and Mobile Drawer
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Menu,
  X,
  PlusCircle,
  GraduationCap,
  User,
  Package,
  Inbox,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { showToast } = useItems();
  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleSignOut = async () => {
    closeMobileMenu();
    try {
      await signOut();
      showToast('You have been logged out.', 'info');
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      showToast(error.message || 'Unable to sign out. Please try again.', 'error');
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'My Account';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo-link" onClick={closeMobileMenu}>
          <div className="brand-icon-wrapper" aria-hidden="true">
            <HeartHandshake size={22} strokeWidth={2.3} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Donate &amp; Reuse</span>
            <span className="brand-tag">Campus Circle</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-menu">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/explore"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Explore Items
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/college-essentials"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GraduationCap size={16} /> College Essentials
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/how-it-works"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                How It Works
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="nav-actions">
          <Link to="/donate" className="btn btn-sm btn-subtle" style={{ gap: '6px' }}>
            <PlusCircle size={15} /> Donate an Item
          </Link>

          {user ? (
            /* Logged In User Navigation */
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/my-donations" className="btn btn-sm btn-outline" title="My Donations">
                <Package size={15} /> My Items
              </Link>
              <Link to="/my-requests" className="btn btn-sm btn-outline" title="My Requests">
                <Inbox size={15} /> Requests
              </Link>

              {/* User Profile Pill */}
              <Link
                to="/profile"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#f1f5f9',
                  color: 'var(--color-heading)',
                  gap: '6px',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1'
                }}
                title="Profile and Account Settings"
              >
                <User size={15} color="#0d9488" />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
              </Link>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleSignOut}
                title="Log Out"
                style={{ color: '#ef4444', borderColor: '#fee2e2', padding: '8px 12px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            /* Logged Out Actions (Matching screenshot design) */
            <>
              <Link to="/register" className="btn-nav-signup">
                Sign up
              </Link>
              <Link to="/login" className="btn-nav-login">
                Log in
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-drawer"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" id="mobile-drawer">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMobileMenu}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMobileMenu}
          >
            Explore Items
          </NavLink>
          <NavLink
            to="/college-essentials"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMobileMenu}
          >
            College Essentials
          </NavLink>
          <NavLink
            to="/how-it-works"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMobileMenu}
          >
            How It Works
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/my-donations"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={closeMobileMenu}
              >
                <Package size={16} style={{ display: 'inline', marginRight: '6px' }} /> My Donations
              </NavLink>
              <NavLink
                to="/my-requests"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={closeMobileMenu}
              >
                <Inbox size={16} style={{ display: 'inline', marginRight: '6px' }} /> My Requests
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={closeMobileMenu}
              >
                <User size={16} style={{ display: 'inline', marginRight: '6px' }} /> Profile ({displayName})
              </NavLink>
            </>
          )}

          <div className="mobile-drawer-actions">
            <Link
              to="/donate"
              className="btn btn-primary"
              style={{ justifyContent: 'center' }}
              onClick={closeMobileMenu}
            >
              <PlusCircle size={16} /> Donate an Item
            </Link>

            {user ? (
              <button
                type="button"
                className="btn btn-outline"
                style={{ justifyContent: 'center', color: '#ef4444', borderColor: '#fee2e2' }}
                onClick={handleSignOut}
              >
                <LogOut size={16} /> Log Out ({user.email})
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-nav-signup"
                  style={{ textAlign: 'center' }}
                  onClick={closeMobileMenu}
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="btn-nav-login"
                  style={{ textAlign: 'center' }}
                  onClick={closeMobileMenu}
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
