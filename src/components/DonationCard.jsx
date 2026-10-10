// src/components/DonationCard.jsx
import React, { useState } from 'react';
import { MapPin, Eye, GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { DEFAULT_FALLBACK_IMAGE } from '../data/demoData';

export default function DonationCard({ item }) {
  const { setSelectedItem } = useItems();
  const [imgSrc, setImgSrc] = useState(item.imageUrl);

  const handleImageError = () => {
    setImgSrc(DEFAULT_FALLBACK_IMAGE);
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'Brand New':
        return 'badge badge-brand-new';
      case 'Like New':
        return 'badge badge-like-new';
      case 'Gently Used':
        return 'badge badge-gently-used';
      default:
        return 'badge badge-functional';
    }
  };

  const isReserved = item.status === 'Reserved';

  return (
    <article className={`donation-card ${isReserved ? 'is-reserved' : ''}`} aria-label={item.title}>
      {/* Clickable Image Container */}
      <div
        className="card-image-wrap"
        onClick={() => setSelectedItem(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedItem(item);
          }
        }}
        aria-label={`View details for ${item.title}`}
      >
        <img
          src={imgSrc}
          alt={item.title}
          className="card-image"
          onError={handleImageError}
          loading="lazy"
        />

        {/* Badges on top */}
        <div className="card-badges-top">
          <span className={getConditionBadgeClass(item.condition)}>
            {item.condition}
          </span>
          <span className={`badge ${isReserved ? 'badge-reserved' : 'badge-available'}`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="card-meta-top">
          <span className="card-category-text">
            {item.category === 'College Essentials' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={13} /> {item.subcategory || item.category}
              </span>
            ) : (
              item.category
            )}
          </span>
          <span className="card-posted-time">
            {item.postedDate}
          </span>
        </div>

        <h3
          className="card-title"
          title={item.title}
          onClick={() => setSelectedItem(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedItem(item);
            }
          }}
        >
          {item.title}
        </h3>

        <div className="card-location">
          <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span title={item.location}>{item.location}</span>
        </div>

        <p className="card-desc">
          {item.description}
        </p>

        {/* Footer info & Actions */}
        <div className="card-footer">
          <div className="card-donor">
            Shared by <span className="card-donor-name">{item.donorName}</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-subtle"
            onClick={() => setSelectedItem(item)}
            aria-label={`View details for ${item.title}`}
          >
            <Eye size={14} /> Details
          </button>
        </div>
      </div>
    </article>
  );
}
