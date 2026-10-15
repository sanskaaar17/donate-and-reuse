// src/pages/MyRequestsPage.jsx
// View all donation items requested by the user and their acceptance status
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  ArrowRight,
  TriangleAlert
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function MyRequestsPage() {
  const { fetchMyRequests, cancelMyRequest } = useItems();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null); // { id, title }
  const [actionError, setActionError] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setLoadError(err.message || 'Unable to load your requests.');
    } finally {
      setLoading(false);
    }
  }, [fetchMyRequests]);

  // Use stable user?.id so this doesn't re-fire on every token refresh
  useEffect(() => {
    loadRequests();
  }, [user?.id, loadRequests]);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    const { id, title } = confirmCancel;
    setConfirmCancel(null);
    setActionError(null);
    setActionInProgress(id);
    try {
      await cancelMyRequest(id);
      await loadRequests();
    } catch (err) {
      setActionError(err.message || 'Failed to cancel request. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Requester Dashboard</span>
          <h1 className="section-main-heading">My Requests</h1>
          <p className="section-subtext">
            Monitor the status of course supplies and essentials you requested from campus donors.
          </p>
        </div>
        <Link to="/explore" className="btn btn-primary">
          Explore Items Catalog
        </Link>
      </div>

      {/* Inline action error */}
      {actionError && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
            aria-label="Dismiss error"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Inline confirmation dialog */}
      {confirmCancel && (
        <div
          role="alertdialog"
          aria-labelledby="cancel-confirm-title"
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <TriangleAlert size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong id="cancel-confirm-title" style={{ display: 'block', color: '#92400e', marginBottom: '6px' }}>
              Cancel your request for "{confirmCancel.title}"?
            </strong>
            <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#78350f' }}>
              The item will become available again for other students to request.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={handleCancel}
              >
                <XCircle size={15} /> Yes, Cancel Request
              </button>
              <button
                type="button"
                className="btn btn-sm btn-subtle"
                onClick={() => setConfirmCancel(null)}
              >
                Keep Request
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-primary)' }}>
          <Loader2 size={36} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your requests...</p>
        </div>
      ) : loadError ? (
        <div className="demo-banner-box" role="alert">
          <span>{loadError}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={loadRequests}>Retry</button>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="You haven't requested any items yet"
          description="Browse available textbooks, calculators, and lab tools shared by classmates and request what you need."
          showDonateButton={false}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map((req) => {
            // fetchMyRequests returns req.donation (singular) — fixed from previous req.donations bug
            const item = req.donation || {};
            const donor = item.profiles || {};
            const isAccepted = req.status === 'Accepted';
            const isPending = req.status === 'Pending';
            const isDeclined = req.status === 'Declined';

            return (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  border: isAccepted ? '2px solid #10b981' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px 28px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  {/* Left: Item Info */}
                  <div style={{ display: 'flex', gap: '20px', flex: 1, minWidth: '280px' }}>
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title ? `Photo of ${item.title}` : 'Donation item'}
                      style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-category">{item.category}</span>
                        <span className={`badge ${isAccepted ? 'badge-available' : isPending ? 'badge-like-new' : 'badge-reserved'}`}>
                          Status: {req.status}
                        </span>
                        {item.condition && <span className="badge badge-like-new">{item.condition}</span>}
                      </div>

                      <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: 'var(--color-heading)' }}>
                        {item.title || 'Item details unavailable'}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                        {item.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color="#0d9488" /> {item.location}
                          </span>
                        )}
                        <span>Offered by {donor.full_name || 'Campus Peer'}</span>
                        <span>Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                      </div>

                      <p style={{ margin: '10px 0 0', fontSize: '0.9rem', color: 'var(--color-text-body)', fontStyle: 'italic' }}>
                        Your message: "{req.message}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Cancel button for pending */}
                  {isPending && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ color: '#ef4444', borderColor: '#fca5a5', flexShrink: 0 }}
                      disabled={actionInProgress === req.id}
                      onClick={() => setConfirmCancel({ id: req.id, title: item.title || 'this item' })}
                      aria-busy={actionInProgress === req.id}
                    >
                      {actionInProgress === req.id
                        ? <Loader2 size={15} className="spin-animation" />
                        : <XCircle size={15} />
                      }
                      Cancel Request
                    </button>
                  )}
                </div>

                {/* ACCEPTED BANNER: Handover Coordination Details */}
                {isAccepted && (
                  <div
                    style={{
                      marginTop: '20px',
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                      border: '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
                      <CheckCircle2 size={18} color="#10b981" /> Request Accepted by Donor!
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#166534', lineHeight: 1.5 }}>
                      Please reach out using the verified contact details below to arrange a safe daytime handover on campus:
                    </p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#0f5132' }}>
                      {item.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} color="#0d9488" />
                          <strong>Pickup Point:</strong> {item.location}
                        </div>
                      )}
                      {item.pickup_times && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={16} color="#0d9488" />
                          <strong>Timings:</strong> {item.pickup_times}
                        </div>
                      )}
                      {donor.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={16} color="#0d9488" />
                          <strong>Email:</strong> {donor.email}
                        </div>
                      )}
                      {donor.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={16} color="#0d9488" />
                          <strong>Phone:</strong> {donor.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* DECLINED NOTICE */}
                {isDeclined && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#991b1b'
                    }}
                  >
                    This request was declined. The item may have been reserved for another student. You can continue searching the catalog for other resources!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

