// src/components/ProtectedRoute.jsx
// Protects authenticated routes (Donate, My Donations, My Requests, Profile)
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '12px',
          color: 'var(--color-primary)'
        }}
        role="status"
      >
        <Loader2 size={36} className="spin-animation" />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Verifying campus session...
        </span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and remember where the user was heading
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
