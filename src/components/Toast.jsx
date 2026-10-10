// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useItems } from '../context/ItemsContext';

export default function Toast() {
  const { toast, hideToast } = useItems();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      <div className={`toast-pill ${toast.type}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : toast.type === 'info' ? (
            <Info size={18} color="#0ea5e9" />
          ) : (
            <AlertTriangle size={18} color="#f59e0b" />
          )}
          <span>{toast.message}</span>
        </div>
        <button
          type="button"
          className="toast-close"
          onClick={hideToast}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
