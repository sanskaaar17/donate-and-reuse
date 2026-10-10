// src/components/EmptyState.jsx
import React from 'react';
import { PackageSearch, PlusCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = "No listings found matching your search",
  description = "Try adjusting your search terms or clearing some of the filters to view available community donations.",
  onReset,
  showDonateButton = true
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        <PackageSearch size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {onReset && (
          <button type="button" className="btn btn-outline" onClick={onReset}>
            <RotateCcw size={16} /> Reset All Filters
          </button>
        )}
        {showDonateButton && (
          <Link to="/donate" className="btn btn-primary">
            <PlusCircle size={16} /> Be the First to Donate This Item
          </Link>
        )}
      </div>
    </div>
  );
}
