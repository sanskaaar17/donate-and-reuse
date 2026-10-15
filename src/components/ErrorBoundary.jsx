// src/components/ErrorBoundary.jsx
// Catches unhandled JS errors in the React tree so the full app doesn't blank out
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Unhandled error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

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
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}
        >
          <AlertTriangle size={30} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-heading)' }}>
          Something went wrong
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: '440px', lineHeight: 1.6 }}>
          An unexpected error occurred in this section. Your data is safe — try refreshing the page.
        </p>
        {this.state.error?.message && (
          <code
            style={{
              display: 'block',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '0.8rem',
              color: '#64748b',
              maxWidth: '600px',
              wordBreak: 'break-word'
            }}
          >
            {this.state.error.message}
          </code>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          }}
        >
          <RefreshCw size={16} /> Reload Page
        </button>
      </div>
    );
  }
}
