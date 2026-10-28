import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard, Layers, Shield, FileText, CheckCircle2 } from 'lucide-react';

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
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
            height: '70px',
          }}
        >
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              <BookOpen size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Learn<span style={{ color: 'var(--primary)' }}>Sphere</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/courses"
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive('/courses') ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Course Catalog
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
          </nav>

          {/* Right Header User State */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                  <span className="badge badge-student">
                    Learner
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
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
          padding: '2rem 0',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            © 2026 <strong>LearnSphere LMS</strong>. Production-grade educational architecture.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>SQLite WAL</span>
            <span>•</span>
            <span>Three-Tier Modular</span>
            <span>•</span>
            <span>GCP Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
