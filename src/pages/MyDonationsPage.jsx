// src/pages/MyDonationsPage.jsx
// Manage user's donations, view incoming requests, and accept/decline requests
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function MyDonationsPage() {
  const { fetchMyDonations, acceptRequest, declineRequest, markDonationCompleted, deleteDonation } = useItems();
  const { user, profile } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [expandedDonationId, setExpandedDonationId] = useState(null);

  const loadDonations = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMyDonations();
      setDonations(data);
      // Auto-expand first donation that has pending requests
      const withPending = data.find((d) => d.item_requests?.some((r) => r.status === 'Pending'));
      if (withPending) {
        setExpandedDonationId(withPending.id);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
      setLoadError(err.message || 'Unable to load your donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [user]);

  const handleAccept = async (requestId, donationTitle) => {
    if (!window.confirm(`Accept this request for "${donationTitle}"? Other pending requests will be declined and the item marked as Reserved.`)) {
      return;
    }
    setActionInProgress(requestId);
    try {
      await acceptRequest(requestId);
      await loadDonations();
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDecline = async (requestId) => {
    if (!window.confirm('Decline this request?')) return;
    setActionInProgress(requestId);
    try {
      await declineRequest(requestId);
      await loadDonations();
    } catch (err) {
      alert(err.message || 'Failed to decline request');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkCompleted = async (donationId) => {
    if (!window.confirm('Confirm that the handover was completed successfully on campus?')) return;
    setActionInProgress(donationId);
    try {
      await markDonationCompleted(donationId);
      await loadDonations();
    } catch (err) {
      alert(err.message || 'Failed to mark as completed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (donationId, title) => {
    if (!window.confirm(`Delete listing "${title}"? This cannot be undone.`)) return;
    setActionInProgress(donationId);
    try {
      await deleteDonation(donationId);
      await loadDonations();
    } catch (err) {
      alert(err.message || 'Failed to delete donation');
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedDonationId(expandedDonationId === id ? null : id);
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Donor Dashboard</span>
          <h1 className="section-main-heading">My Donations</h1>
          <p className="section-subtext">
            Track your active listings, view requests from campus peers, and manage handovers.
          </p>
        </div>
        <Link to="/donate" className="btn btn-primary">
          <PlusCircle size={18} /> Donate Another Item
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-primary)' }}>
          <Loader2 size={36} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your donation listings...</p>
        </div>
      ) : loadError ? (
        <div className="demo-banner-box" role="alert">
          <span>{loadError}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={loadDonations}>Retry</button>
        </div>
      ) : donations.length === 0 ? (
        <EmptyState
          title="You haven't listed any items yet"
          description="Have textbooks, calculators, or lab coats you no longer need? List them for free to help fellow students."
          showDonateButton={true}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {donations.map((item) => {
            const requests = item.item_requests || [];
            const pendingCount = requests.filter((r) => r.status === 'Pending').length;
            const acceptedRequest = requests.find((r) => r.status === 'Accepted');
            const isExpanded = expandedDonationId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Main Item Row */}
                <div
                  style={{
                    padding: '24px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px',
                    background: item.status === 'Completed' ? '#fbfdfc' : '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '280px' }}>
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-category">{item.category}</span>
                        <span className={`badge ${item.status === 'Available' ? 'badge-available' : item.status === 'Reserved' ? 'badge-reserved' : 'badge-functional'}`}>
                          {item.status}
                        </span>
                        <span className="badge badge-like-new">{item.condition}</span>
                      </div>

                      <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: 'var(--color-heading)' }}>
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="#0d9488" /> {item.location}
                        </span>
                        <span>Listed on {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Request Count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {item.status === 'Reserved' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-accent"
                        disabled={actionInProgress === item.id}
                        onClick={() => handleMarkCompleted(item.id)}
                      >
                        <CheckCircle2 size={16} /> Mark Handover Completed
                      </button>
                    )}

                    <button
                      type="button"
                      className={`btn btn-sm ${pendingCount > 0 ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <span>Requests ({requests.length})</span>
                      {pendingCount > 0 && (
                        <span style={{ background: '#ef4444', color: '#fff', padding: '1px 7px', borderRadius: '999px', fontSize: '0.72rem' }}>
                          {pendingCount} new
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                      title="Delete listing"
                      disabled={actionInProgress === item.id}
                      onClick={() => handleDelete(item.id, item.title)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Requests Section */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      backgroundColor: '#f8faf9',
                      padding: '24px 28px'
                    }}
                  >
                    <h4 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--color-heading)' }}>
                      Incoming Requests for this Item ({requests.length})
                    </h4>

                    {requests.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        No campus requests received yet. Classmates browsing the catalog will be able to request this item.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {requests.map((req) => (
                          <div
                            key={req.id}
                            style={{
                              background: '#ffffff',
                              border: req.status === 'Accepted' ? '1.5px solid #10b981' : '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '16px 20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '14px'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: '240px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <strong style={{ color: 'var(--color-heading)', fontSize: '0.98rem' }}>
                                  {req.profiles?.full_name || 'Student Requester'}
                                </strong>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                  ({req.profiles?.campus_role || 'Engineering Student'})
                                </span>
                                <span className={`badge ${req.status === 'Accepted' ? 'badge-available' : req.status === 'Pending' ? 'badge-like-new' : 'badge-reserved'}`}>
                                  {req.status}
                                </span>
                              </div>

                              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--color-text-body)', fontStyle: 'italic' }}>
                                "{req.message}"
                              </p>

                              {/* If Accepted, show contact details for easy coordination */}
                              {req.status === 'Accepted' && (
                                <div
                                  style={{
                                    marginTop: '8px',
                                    padding: '10px 14px',
                                    background: '#ecfdf5',
                                    borderRadius: 'var(--radius-xs)',
                                    fontSize: '0.85rem',
                                    color: '#065f46',
                                    display: 'flex',
                                    gap: '16px',
                                    flexWrap: 'wrap'
                                  }}
                                >
                                  {req.profiles?.email && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Mail size={14} /> {req.profiles.email}
                                    </span>
                                  )}
                                  {req.profiles?.phone && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Phone size={14} /> {req.profiles.phone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions for Pending Requests */}
                            {req.status === 'Pending' && item.status === 'Available' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-accent"
                                  disabled={actionInProgress === req.id}
                                  onClick={() => handleAccept(req.id, item.title)}
                                >
                                  <Check size={15} /> Accept Request
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline"
                                  disabled={actionInProgress === req.id}
                                  onClick={() => handleDecline(req.id)}
                                >
                                  <XCircle size={15} /> Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
