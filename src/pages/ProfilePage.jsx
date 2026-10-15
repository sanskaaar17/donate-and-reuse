// src/pages/ProfilePage.jsx
// View and update student profile information and account settings
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  Phone,
  GraduationCap,
  Save,
  LogOut,
  Package,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export default function ProfilePage() {
  const { user, profile, profileError, updateProfile, signOut } = useAuth();
  const { showToast } = useItems();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    campusRole: 'Engineering Student',
    department: 'General Engineering',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        campusRole: profile.campus_role || 'Engineering Student',
        department: profile.department || 'General Engineering',
        phone: profile.phone || ''
      });
    } else if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        campusRole: user.user_metadata?.campus_role || 'Engineering Student',
        department: user.user_metadata?.department || 'General Engineering',
        phone: user.user_metadata?.phone || ''
      });
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setPageError('Full name is required.');
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setPageError('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    setSuccessMsg(false);
    setPageError(null);
    try {
      await updateProfile({
        full_name: formData.fullName.trim(),
        campus_role: formData.campusRole,
        department: formData.department.trim(),
        phone: formData.phone.trim()
      });
      setSuccessMsg(true);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setPageError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };


  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await signOut();
        showToast('Logged out successfully.', 'info');
        navigate('/');
      } catch (error) {
        setPageError(error.message || 'Unable to sign out. Please try again.');
      }
    }
  };

  return (
    <div className="section-container" style={{ maxWidth: '780px' }}>
      {/* Header */}
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Campus Profile</span>
          <h1 className="section-main-heading">Account &amp; Settings</h1>
          <p className="section-subtext">
            Manage your verified student profile and contact details used for safe on-campus handovers.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          style={{ color: '#ef4444', borderColor: '#fee2e2' }}
          onClick={handleSignOut}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Link
          to="/my-donations"
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'transform 0.2s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e6f4f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
            <Package size={22} />
          </div>
          <div>
            <strong style={{ display: 'block', color: 'var(--color-heading)', fontSize: '1rem' }}>My Donations</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Manage your listed items</span>
          </div>
        </Link>

        <Link
          to="/my-requests"
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'transform 0.2s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Inbox size={22} />
          </div>
          <div>
            <strong style={{ display: 'block', color: 'var(--color-heading)', fontSize: '1rem' }}>My Requests</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Track requested supplies</span>
          </div>
        </Link>
      </div>

      {/* Edit Form */}
      <div className="form-card">
        {profileError && (
          <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            Profile could not be loaded from Supabase: {profileError}
          </div>
        )}
        {pageError && (
          <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
            {pageError}
          </div>
        )}
        {successMsg && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: '#065f46',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={18} />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email (Readonly) */}
          <div className="form-group">
            <label className="form-label">
              <span>Account Email</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Verified Login</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f1f5f4', color: '#64748b' }}
            />
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              <span>Full Name <span className="required-star">*</span></span>
            </label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          {/* Role & Department */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="campusRole">
                <span>Campus Affiliation</span>
              </label>
              <select
                id="campusRole"
                className="form-select"
                value={formData.campusRole}
                onChange={(e) => setFormData({ ...formData, campusRole: e.target.value })}
              >
                <option value="Engineering Student">Engineering Student</option>
                <option value="Postgraduate / Researcher">Postgraduate / Researcher</option>
                <option value="Faculty / Campus Staff">Faculty / Campus Staff</option>
                <option value="Campus Neighbor">Campus Neighbor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="department">
                <span>Department / Branch</span>
              </label>
              <input
                type="text"
                id="department"
                className="form-input"
                placeholder="e.g. Mechanical, Computer Science, Civil"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              <span>Contact Phone / WhatsApp (For Safe Handover)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Shown only when request accepted</span>
            </label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="spin-animation" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
