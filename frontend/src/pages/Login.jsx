import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, User, Lock, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/courses';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from);
    } catch (err) {
      setError(err.message || 'Unable to authenticate. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoIdentifier, demoPassword) => {
    setEmail(demoIdentifier);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-screen-container">
      {/* ponytail: single enlarged matte card without lateral split columns as requested. Upgrade path: OAuth provider buttons if SSO required. */}
      <div className="auth-matte-card">
        {/* Header */}
        <div className="auth-matte-header">
          <div className="auth-matte-badge">
            <span className="auth-matte-dot"></span>
            <span>Secure Student & Staff Portal</span>
          </div>
          <h1 className="auth-matte-title">Sign In to LearnSphere</h1>
          <p className="auth-matte-subtitle">
            Access your courses, track your lessons, and continue your learning journey.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email or Username */}
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="login-identifier">
              <span>Email or Username</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                Email, handle or full name
              </span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <User size={19} />
              </span>
              <input
                id="login-identifier"
                type="text"
                className="auth-matte-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com or username"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password with Toggle */}
          <div className="auth-field-group" style={{ marginBottom: '2rem' }}>
            <label className="auth-field-label" htmlFor="login-password">
              <span>Password</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Lock size={19} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-matte-input"
                style={{ paddingRight: '3.25rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-matte-primary"
            disabled={submitting}
          >
            <LogIn size={20} />
            <span>{submitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        {/* Demo Fast-Login Helpers */}
        <div className="auth-demo-section">
          <span className="auth-demo-label">Quick Demo Credentials</span>
          <div className="auth-demo-chips">
            {/* ponytail: single student demo button. Instructor and admin credentials removed from login UI as requested. Upgrade path: role switcher modal in dev mode. */}
            <button
              type="button"
              className="auth-demo-chip"
              onClick={() => handleDemoFill('alex.mercer@learnsphere.io', 'StudentPass123!')}
              title="Fill Alex Mercer (Student)"
            >
              <Zap size={14} color="#6366f1" />
              <span>Fill Student Demo</span>
            </button>
          </div>
        </div>

        {/* Switch Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            Register as Student
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="auth-trust-footer">
          <div className="auth-trust-item">
            <ShieldCheck size={14} color="#10b981" />
            <span>256-Bit Encrypted</span>
          </div>
          <div className="auth-trust-item">
            <span>•</span>
            <span>Session Preserved</span>
          </div>
          <div className="auth-trust-item">
            <span>•</span>
            <span>Instant Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
