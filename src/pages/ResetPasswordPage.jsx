import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { updatePassword, user, loading, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [updated, setUpdated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      setUpdated(true);
    } catch (error) {
      console.error('Updating password failed:', error);
      setErrorMessage(error.message || 'Unable to update your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge-preview" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
            <KeyRound size={13} color="#0d9488" /> Account Recovery
          </div>
          <h1 className="auth-title">Set a New Password</h1>
          <p className="auth-desc">Choose a new password for your Donate &amp; Reuse account.</p>
        </div>

        {!isConfigured ? (
          <div role="alert" className="demo-banner-box">Configure Supabase before resetting your password.</div>
        ) : loading ? (
          <div role="status" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
            <Loader2 size={24} className="spin-animation" style={{ margin: '0 auto 8px' }} />
            Verifying your recovery link...
          </div>
        ) : updated ? (
          <div role="status" style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#065f46', fontWeight: 700 }}>Password updated successfully.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/explore')}>
              Continue to Donate &amp; Reuse
            </button>
          </div>
        ) : !user ? (
          <div>
            <div role="alert" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', color: '#92400e', fontSize: '0.88rem', lineHeight: 1.5 }}>
              This recovery link is invalid or expired. Request another password-reset link from the login page.
            </div>
            <Link className="btn btn-primary" to="/login">Back to Log In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">New password</label>
              <input id="new-password" className="form-input" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">Confirm new password</label>
              <input id="confirm-new-password" className="form-input" type="password" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting && <Loader2 size={18} className="spin-animation" />}
              {submitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
