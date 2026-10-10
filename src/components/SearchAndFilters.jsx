// src/components/SearchAndFilters.jsx
import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { CATEGORIES, CONDITIONS } from '../data/demoData';

export default function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  availabilityFilter,
  setAvailabilityFilter,
  onResetFilters,
  totalResults
}) {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedCondition !== 'All' ||
    availabilityFilter !== 'All';

  return (
    <div className="filter-panel">
      {/* Search Bar */}
      <div className="search-input-wrapper">
        <Search className="search-icon-inside" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, keywords, or campus drop location (e.g. calculator, library, lab)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search donations"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)'
            }}
            aria-label="Clear search input"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="filter-row">
        {/* Category Pills */}
        <div className="filter-group-left">
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-heading)', marginRight: '4px' }}>
            Category:
          </span>
          <button
            type="button"
            className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Items
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdowns: Condition & Status & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Condition Select */}
          <select
            className="filter-select"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            aria-label="Filter by condition"
          >
            <option value="All">All Conditions</option>
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>

          {/* Availability Status Select */}
          <select
            className="filter-select"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            aria-label="Filter by availability"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available Only</option>
            <option value="Reserved">Reserved</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={onResetFilters}
              style={{ gap: '4px' }}
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)'
        }}
      >
        <span>
          Showing <strong>{totalResults}</strong> donation listing{totalResults === 1 ? '' : 's'}
        </span>
        {hasActiveFilters && (
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Filtered Results
          </span>
        )}
      </div>
    </div>
  );
}
