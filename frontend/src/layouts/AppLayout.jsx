import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  Compass,
  Layers,
  Sparkles,
  Shield,
  FileText,
  HelpCircle,
  Menu,
  X,
  Award,
  ExternalLink,
} from 'lucide-react';
import Logo from '../components/Logo';
import InfoModal from '../components/InfoModal';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState(null); // 'privacy' | 'terms' | 'help'

  const homeTarget = '/';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ============================================================== */}
      {/* TOP NAVIGATION HEADER (Udemy-Style)                            */}
      {/* ============================================================== */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '76px',
            padding: '0.45rem 0',
            gap: '1.25rem',
          }}
        >
          {/* Brand Logo */}
          <Link
            to={homeTarget}
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Logo variant="full" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/') && !location.hash ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Home
            </Link>

            <Link
              to={user ? "/courses" : "/login"}
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/courses') ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Courses
            </Link>

            <Link
              to={user ? "/roadmaps" : "/login"}
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/roadmaps') || location.pathname.startsWith('/roadmaps') ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Roadmaps
            </Link>

            {user && (
              <Link
                to="/my-learning"
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: isActive('/my-learning') ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                My Learning
              </Link>
            )}

            {user && isAdmin && (
              <Link
                to="/admin"
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: isActive('/admin') ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Right Header User State */}
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.35rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <User size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.full_name}</span>
                  <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Learner'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign Out"
                  aria-label="Sign out of account"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/') && !location.hash ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to={user ? "/courses" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/courses') ? 'active' : ''}`}
            >
              Courses
            </Link>
            <Link
              to={user ? "/roadmaps" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className={`mobile-nav-link ${isActive('/roadmaps') || location.pathname.startsWith('/roadmaps') ? 'active' : ''}`}
            >
              Roadmaps
            </Link>
            {user && (
              <Link
                to="/my-learning"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-link ${isActive('/my-learning') ? 'active' : ''}`}
              >
                My Learning
              </Link>
            )}
            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin Dashboard
              </Link>
            )}

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              {user ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    Signed in as <strong>{user.full_name}</strong>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* ============================================================== */}
      {/* COMPREHENSIVE UDEMY-STYLE FOOTER                               */}
      {/* ============================================================== */}
      <footer className="edunova-footer">
        <div className="container">
          <div className="footer-top-grid">
            {/* Column 1: Brand & Identity */}
            <div className="footer-col brand-col">
              <Link to={homeTarget} style={{ display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
                <Logo variant="full" size="md" />
              </Link>
              <p className="footer-brand-desc">
                Edunova Technologies is a modernized learning platform delivering production-grade engineering
                tracks, embedded video classrooms, and verifiable skill credentials.
              </p>
              <div className="footer-badges">
                <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>React 19</span>
                <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>SQLite WAL</span>
                <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>3-Tier Arch</span>
              </div>
            </div>

            {/* Column 2: Navigation & Discovery */}
            <div className="footer-col">
              <h4 className="footer-col-title">Navigation</h4>
              <ul className="footer-links">
                <li><Link to={homeTarget}>Home</Link></li>
                <li><Link to={user ? "/courses" : "/login"}>Browse All Courses</Link></li>
                <li><Link to={user ? "/roadmaps" : "/login"}>Career Roadmaps</Link></li>
                {user && <li><Link to="/my-learning">My Learning</Link></li>}
                <li>
                  <Link to={user ? "/courses" : "/login"} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {user ? 'Student Dashboard' : 'Student Portal'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Trust */}
            <div className="footer-col">
              <h4 className="footer-col-title">Legal & Trust</h4>
              <ul className="footer-links">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('privacy')}
                    className="footer-link-btn"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('terms')}
                    className="footer-link-btn"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="footer-bottom-bar">
            <div className="footer-copyright">
              © 2026 <strong>Edunova Technologies, Inc.</strong> Production-grade educational architecture. All rights reserved.
            </div>

            {/* Social Media Links */}
            <div className="footer-social-links">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                title="Twitter / X"
                aria-label="Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Info & Legal Modal */}
      <InfoModal
        isOpen={Boolean(activeInfoModal)}
        onClose={() => setActiveInfoModal(null)}
        type={activeInfoModal}
      />
    </div>
  );
}