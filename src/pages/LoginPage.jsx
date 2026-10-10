// src/pages/LoginPage.jsx
// Real Supabase Email/Password Authentication & Session Creation
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { signIn, isConfigured } = useAuth();
  const { showToast } = useItems();
  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = location.state?.from?.pathname || '/explore';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'College or personal email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      showToast('Signed in successfully! Welcome back.', 'success');
      navigate(fromLocation, { replace: true });
    } catch (err) {
      console.error('Sign in error:', err);
      setAuthError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge-preview" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
            <KeyRound size={13} color="#0d9488" /> Supabase Authentication
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-desc">
            Sign in to manage your campus donations, request supplies, and coordinate safe handovers.
          </p>
        </div>

        {/* Notice if Supabase keys not set yet in .env */}
        {!isConfigured && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#92400e',
              lineHeight: 1.5
            }}
          >
            <strong>Setup Notice:</strong> To connect your real database, copy your project URL &amp; anon key into the <code>.env</code> file.
          </div>
        )}

        {/* Server Auth Error */}
        {authError && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Campus or Personal Email <span className="required-star">*</span>
            </label>
            <input
              type="email"
              id="login-email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              required
            />
            {errors.email && (
              <span className="form-error-msg">
                <AlertCircle size={14} /> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password <span className="required-star">*</span>
            </label>
            <div className="password-toggle-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                className={`form-input ${errors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error-msg">
                <AlertCircle size={14} /> {errors.password}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? <Loader2 size={18} className="spin-animation" /> : null}
            {submitting ? 'Signing In...' : 'Log In to Campus Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
