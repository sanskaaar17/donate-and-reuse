// src/pages/MyRequestsPage.jsx
// View all donation items requested by the user and their acceptance status
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function MyRequestsPage() {
  const { fetchMyRequests, cancelMyRequest } = useItems();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleCancel = async (requestId, itemTitle) => {
    if (!window.confirm(`Cancel your request for "${itemTitle}"?`)) return;
    setActionInProgress(requestId);
    try {
      await cancelMyRequest(requestId);
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-primary)' }}>
          <Loader2 size={36} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your requests...</p>
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
            const item = req.donations || {};
            const donor = item.profiles || {};
            const isAccepted = req.status === 'Accepted';
            const isPending = req.status === 'Pending';
            const isDeclined = req.status === 'Declined';
            const isCancelled = req.status === 'Cancelled';

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
                      alt={item.title || 'Donation item'}
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
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="#0d9488" /> {item.location}
                        </span>
                        <span>Offered by {donor.full_name || 'Campus Peer'}</span>
                        <span>Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                      </div>

                      <p style={{ margin: '10px 0 0', fontSize: '0.9rem', color: 'var(--color-text-body)', fontStyle: 'italic' }}>
                        Your message: "{req.message}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {isPending && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      disabled={actionInProgress === req.id}
                      onClick={() => handleCancel(req.id, item.title)}
                    >
                      <XCircle size={15} /> Cancel Request
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
                      The donor has accepted your request. Please reach out using the verified contact details below to arrange a safe daytime handover on campus:
                    </p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#0f5132' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="#0d9488" />
                        <strong>Pickup Point:</strong> {item.location}
                      </div>
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
                    This request was declined (the item may have been accepted for another student). You can continue searching the catalog for other resources!
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
