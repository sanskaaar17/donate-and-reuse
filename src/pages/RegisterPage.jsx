// src/pages/RegisterPage.jsx
// Real Supabase User Registration & Profile Creation
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    campusRole: 'Engineering Student',
    department: 'Computer Science & Engineering',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const { signUp, isConfigured } = useAuth();
  const { showToast } = useItems();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.name.trim(),
        campusRole: formData.campusRole,
        department: formData.department.trim(),
        phone: formData.phone.trim()
      });

      setRegisteredSuccess(true);
      showToast('Registration successful! Welcome to Donate & Reuse.', 'success');
    } catch (err) {
      console.error('Registration error:', err);
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge-preview" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
            <UserPlus size={13} color="#0d9488" /> Student Registration
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-desc">
            Join classmates in sharing engineering resources, lab gear, and textbooks for free.
          </p>
        </div>

        {/* Setup Notice if .env unconfigured */}
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
            <strong>Setup Notice:</strong> To connect your real database, configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.
          </div>
        )}

        {/* Server Error Message */}
        {serverError && (
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
            <span>{serverError}</span>
          </div>
        )}

        {/* Success Screen */}
        {registeredSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--color-heading)' }}>
              Registration Successful!
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Your account has been created for <strong>{formData.email}</strong>. You can now log in or start exploring campus donations.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary">
                Proceed to Log In
              </Link>
              <Link to="/explore" className="btn btn-outline">
                Explore Items
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="reg-name"
                name="name"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <span className="form-error-msg">
                  <AlertCircle size={14} /> {errors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                College or Personal Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span className="form-error-msg">
                  <AlertCircle size={14} /> {errors.email}
                </span>
              )}
            </div>

            {/* Campus Role & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">
                  Campus Role
                </label>
                <select
                  id="reg-role"
                  name="campusRole"
                  className="form-select"
                  value={formData.campusRole}
                  onChange={handleChange}
                >
                  <option value="Engineering Student">Engineering Student</option>
                  <option value="Postgraduate / Researcher">Postgraduate / Researcher</option>
                  <option value="Faculty / Campus Staff">Faculty / Campus Staff</option>
                  <option value="Campus Neighbor">Campus Neighbor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">
                  Department / Branch
                </label>
                <input
                  type="text"
                  id="reg-dept"
                  name="department"
                  className="form-input"
                  placeholder="e.g. Mechanical, CSE, ECE"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Phone (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                <span>Phone / WhatsApp (Optional)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>For handover coordination</span>
              </label>
              <input
                type="tel"
                id="reg-phone"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password <span className="required-star">*</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Min 6 chars</span>
              </label>
              <div className="password-toggle-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  className={`form-input ${errors.password ? 'has-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirm Password <span className="required-star">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="reg-confirm"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <span className="form-error-msg">
                  <AlertCircle size={14} /> {errors.confirmPassword}
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
              {submitting ? 'Creating Account...' : 'Register Campus Account'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
