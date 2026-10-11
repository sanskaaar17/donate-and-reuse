// src/pages/ExplorePage.jsx
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PlusCircle, Loader2, RefreshCw } from 'lucide-react';
import DonationCard from '../components/DonationCard';
import SearchAndFilters from '../components/SearchAndFilters';
import EmptyState from '../components/EmptyState';
import { useItems } from '../context/ItemsContext';

export default function ExplorePage() {
  const { items, loadingItems, itemsError, fetchItems } = useItems();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states initialized from query parameters if present
  const initialCategory = searchParams.get('category') || 'All';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search term match (title, description, location, tags)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesLoc = item.location.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesSubcat = item.subcategory?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesTags && !matchesSubcat) {
          return false;
        }
      }

      // 2. Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Condition match
      if (selectedCondition !== 'All' && item.condition !== selectedCondition) {
        return false;
      }

      // 4. Availability match
      if (availabilityFilter !== 'All' && item.status !== availabilityFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchTerm, selectedCategory, selectedCondition, availabilityFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setAvailabilityFilter('All');
    setSearchParams({});
  };

  return (
    <div className="section-container">
      {/* Page Header */}
      <div className="section-header-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <span className="section-eyebrow">Community Catalog</span>
          <h1 className="section-main-heading">Explore Donations</h1>
          <p className="section-subtext">
            Search items donated by campus peers. Contact the donor and arrange a safe handover at a campus location.
          </p>
        </div>
        <Link to="/donate" className="btn btn-primary">
          <PlusCircle size={18} /> Donate an Item
        </Link>
      </div>

      {/* Search & Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        onResetFilters={handleResetFilters}
        totalResults={filteredItems.length}
      />

      {itemsError && (
        <div className="demo-banner-box" role="alert" style={{ marginBottom: '24px' }}>
          <span>{itemsError}</span>
          {itemsError.includes('Configure Supabase') ? null : (
            <button type="button" className="btn btn-sm btn-outline" onClick={() => fetchItems().catch((error) => console.error('Retrying donations failed:', error))}>
              <RefreshCw size={15} /> Retry
            </button>
          )}
        </div>
      )}

      {/* Item Grid or Empty State */}
      {loadingItems ? (
        <div role="status" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
          <Loader2 size={30} className="spin-animation" style={{ margin: '0 auto 10px' }} />
          <div>Loading campus donations...</div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="donation-grid">
          {filteredItems.map((item) => (
            <DonationCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No donation items matched your criteria"
          description="We couldn't find any listings matching your search or active filters. Try broadening your keywords or resetting filters."
          onReset={handleResetFilters}
          showDonateButton={true}
        />
      )}
    </div>
  );
}
