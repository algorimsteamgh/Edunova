import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return setError('Password must contain uppercase, lowercase, and numeric characters');
    }

    setSubmitting(true);
    try {
      await register(fullName, email, password);
      navigate('/courses');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen-container">
      {/* ponytail: single enlarged matte register card matching login aesthetics. Upgrade path: step wizard if onboarding questions added. */}
      <div className="auth-matte-card">
        {/* Header */}
        <div className="auth-matte-header">
          <div className="auth-matte-badge">
            <span className="auth-matte-dot"></span>
            <span>New Student Enrollment</span>
          </div>
          <h1 className="auth-matte-title">Create Student Account</h1>
          <p className="auth-matte-subtitle">
            Start discovering verified courses and building production-ready engineering skills today.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="register-fullname">
              <span>Full Name</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <User size={19} />
              </span>
              <input
                id="register-fullname"
                type="text"
                className="auth-matte-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="register-email">
              <span>Email Address</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Mail size={19} />
              </span>
              <input
                id="register-email"
                type="email"
                className="auth-matte-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.lee@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="register-password">
              <span>Password</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                Min 8 chars (A-Z, a-z, 0-9)
              </span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Lock size={19} />
              </span>
              <input
                id="register-password"
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

          {/* Confirm Password */}
          <div className="auth-field-group" style={{ marginBottom: '2rem' }}>
            <label className="auth-field-label" htmlFor="register-confirm">
              <span>Confirm Password</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Lock size={19} />
              </span>
              <input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                className="auth-matte-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-matte-primary"
            disabled={submitting}
          >
            <UserPlus size={20} />
            <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        {/* Switch Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            Sign In
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="auth-trust-footer">
          <div className="auth-trust-item">
            <ShieldCheck size={14} color="#10b981" />
            <span>Encrypted Credentials</span>
          </div>
          <div className="auth-trust-item">
            <span>•</span>
            <span>Self-Paced Enrollment</span>
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
