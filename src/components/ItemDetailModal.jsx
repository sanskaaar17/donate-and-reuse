// src/components/ItemDetailModal.jsx
// Detailed Item View with Real Request Creation, Self-Request Prevention, and Validation
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Send,
  Loader2,
  LogIn
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';

export default function ItemDetailModal() {
  const { selectedItem, closeItemModal, requestItem } = useItems();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeItemModal();
      }
    };
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setRequestMessage('');
      setRequestSuccess(false);
      setErrorMsg(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem, closeItemModal]);

  if (!selectedItem) return null;

  const isReserved = selectedItem.status === 'Reserved';
  const isCompleted = selectedItem.status === 'Completed';
  const isAvailable = selectedItem.status === 'Available';
  const isOwnItem = user && selectedItem.donorId && user.id === selectedItem.donorId;

  const handleSendRequest = async () => {
    if (!user) {
      navigate('/login');
      closeItemModal();
      return;
    }

    if (isOwnItem) {
      setErrorMsg('You cannot request an item that you donated yourself.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await requestItem(selectedItem.id, requestMessage);
      setRequestSuccess(true);
    } catch (err) {
      console.error('Request failed:', err);
      setErrorMsg(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeItemModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-item-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeItemModal}
          aria-label="Close details dialog"
        >
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Image Column */}
          <div className="modal-image-col">
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.title}
              className="modal-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          {/* Details Column */}
          <div className="modal-details-col">
            <div className="modal-badge-row">
              <span className="badge badge-category">{selectedItem.category}</span>
              {selectedItem.subcategory && (
                <span className="badge badge-college">
                  <GraduationCap size={12} /> {selectedItem.subcategory}
                </span>
              )}
              <span className={`badge ${isAvailable ? 'badge-available' : isReserved ? 'badge-reserved' : 'badge-functional'}`}>
                {selectedItem.status}
              </span>
              <span className="badge badge-like-new">Condition: {selectedItem.condition}</span>
            </div>

            <h2 id="modal-item-title" className="modal-title">
              {selectedItem.title}
            </h2>

            <p style={{ color: 'var(--color-text-body)', lineHeight: 1.6, fontSize: '0.95rem', margin: '0 0 16px' }}>
              {selectedItem.description}
            </p>

            {/* Structured Info Box */}
            <div className="modal-info-box">
              <div className="modal-info-row">
                <MapPin size={16} color="#0d9488" />
                <span><strong>Pickup Point:</strong> {selectedItem.location}</span>
              </div>
              <div className="modal-info-row">
                <Clock size={16} color="#0d9488" />
                <span><strong>Timings:</strong> {selectedItem.pickupTimes || 'Flexible coordination'}</span>
              </div>
              <div className="modal-info-row">
                <User size={16} color="#0d9488" />
                <span><strong>Offered By:</strong> {selectedItem.donorName} ({selectedItem.donorRole || 'Student'})</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Request Action Area */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              {requestSuccess ? (
                /* Success View */
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    textAlign: 'center'
                  }}
                >
                  <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                  <strong style={{ display: 'block', color: '#065f46', fontSize: '0.95rem' }}>
                    Request Sent to Donor!
                  </strong>
                  <p style={{ margin: '4px 0 12px', fontSize: '0.85rem', color: '#166534' }}>
                    The donor will review your request. When accepted, their contact details will appear in your requests dashboard.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Link
                      to="/my-requests"
                      className="btn btn-sm btn-primary"
                      onClick={closeItemModal}
                    >
                      View My Requests
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline" onClick={closeItemModal}>
                      Close
                    </button>
                  </div>
                </div>
              ) : isOwnItem ? (
                /* Donor viewing their own item */
                <div>
                  <div
                    style={{
                      background: '#f1f5f9',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#475569',
                      marginBottom: '12px'
                    }}
                  >
                    You listed this item. You cannot submit a request for your own donation.
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                      to="/my-donations"
                      className="btn btn-sm btn-primary"
                      onClick={closeItemModal}
                    >
                      Manage This Listing
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline" onClick={closeItemModal}>
                      Close
                    </button>
                  </div>
                </div>
              ) : !isAvailable ? (
                /* Item is reserved or completed */
                <div>
                  <div
                    style={{
                      background: '#fff7ed',
                      border: '1px solid #ffedd5',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#9a3412',
                      marginBottom: '12px'
                    }}
                  >
                    This item is currently {selectedItem.status.toLowerCase()} and cannot accept new requests.
                  </div>
                  <button type="button" className="btn btn-outline" onClick={closeItemModal}>
                    Close
                  </button>
                </div>
              ) : !user ? (
                /* Logged out prompt */
                <div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
                    Log in with your college account to request this item for free.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                      to="/login"
                      className="btn btn-primary"
                      onClick={closeItemModal}
                    >
                      <LogIn size={16} /> Log In to Request
                    </Link>
                    <button type="button" className="btn btn-outline" onClick={closeItemModal}>
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated user request form */
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-heading)',
                      marginBottom: '6px'
                    }}
                  >
                    Message to donor (Optional):
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: '0.88rem', padding: '10px 14px', marginBottom: '12px' }}
                    placeholder="e.g. Need this for 3rd semester mechanics practicals..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-accent"
                      style={{ flex: 1 }}
                      disabled={submitting}
                      onClick={handleSendRequest}
                    >
                      {submitting ? <Loader2 size={16} className="spin-animation" /> : <Send size={16} />}
                      {submitting ? 'Sending Request...' : 'Send Request to Donor'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={closeItemModal}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
