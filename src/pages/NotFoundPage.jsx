// src/pages/NotFoundPage.jsx
// 404 page shown for any unmatched route
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, Home, BookOpen } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '16px'
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e0f2fe, #dcfce7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0d9488'
        }}
      >
        <SearchX size={36} />
      </div>

      <span style={{ fontSize: '4rem', fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>404</span>

      <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--color-heading)' }}>
        Page Not Found
      </h1>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: '440px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or may have been moved.
        Head back to explore free campus donations.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Go to Home
        </Link>
        <Link to="/explore" className="btn btn-outline">
          <BookOpen size={16} /> Browse Donations
        </Link>
      </div>
    </div>
  );
}
