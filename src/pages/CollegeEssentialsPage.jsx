// src/pages/CollegeEssentialsPage.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  PlusCircle,
  Search,
  BookOpen,
  FileText,
  FlaskConical,
  Calculator,
  Cpu,
  Bookmark,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import DonationCard from '../components/DonationCard';
import EmptyState from '../components/EmptyState';
import { useItems } from '../context/ItemsContext';
import { Loader2 } from 'lucide-react';
import { COLLEGE_SUBCATEGORIES, CONDITIONS } from '../data/demoData';

export default function CollegeEssentialsPage() {
  const { items, loadingItems, itemsError, fetchItems } = useItems();
  const [selectedSubcat, setSelectedSubcat] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Subcategory Icon Mapping
  const getSubcategoryIcon = (subcat) => {
    switch (subcat) {
      case 'Textbooks & Reference Books':
        return <BookOpen size={16} />;
      case 'Notes & Previous-Year Papers':
        return <FileText size={16} />;
      case 'Lab Coats & Lab Supplies':
        return <FlaskConical size={16} />;
      case 'Scientific Calculators & Drawing Instruments':
        return <Calculator size={16} />;
      case 'Engineering Project Materials':
        return <Cpu size={16} />;
      case 'Stationery & Record Books':
        return <Bookmark size={16} />;
      case 'Bags & College Accessories':
        return <Briefcase size={16} />;
      default:
        return <Layers size={16} />;
    }
  };

  // Only take College Essentials items
  const collegeItems = useMemo(() => {
    return items.filter((item) => item.category === 'College Essentials');
  }, [items]);

  // Filter by Subcategory, Search, and Condition
  const filteredItems = useMemo(() => {
    return collegeItems.filter((item) => {
      // Subcategory
      if (selectedSubcat !== 'All' && item.subcategory !== selectedSubcat) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'All' && item.condition !== selectedCondition) {
        return false;
      }

      // Search
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesSubcat = item.subcategory?.toLowerCase().includes(query);
        const matchesLoc = item.location.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesDesc && !matchesSubcat && !matchesLoc && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [collegeItems, selectedSubcat, selectedCondition, searchTerm]);

  const handleReset = () => {
    setSelectedSubcat('All');
    setSearchTerm('');
    setSelectedCondition('All');
  };

  return (
    <div className="section-container">
      {/* College Banner Showcase */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e6f7f2 0%, #f4f6fc 50%, #f1ecf9 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '44px 40px',
          border: '1px solid #cce8e2',
          marginBottom: '36px'
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '14px'
            }}
          >
            <GraduationCap size={18} /> Signature CEP Feature
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.8rem',
              fontWeight: 800,
              color: 'var(--color-heading)',
              lineHeight: 1.15,
              margin: '0 0 12px'
            }}
          >
            College Essentials, <span className="hero-gradient-text">Shared.</span>
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-text-body)',
              lineHeight: 1.6,
              margin: '0 0 24px'
            }}
          >
            Books, notes, calculators and project supplies — give learning resources a second life.
            Ensure incoming juniors and engineering peers have equal access to essential course materials at zero cost.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/donate?category=College%20Essentials" className="btn btn-primary">
              <PlusCircle size={17} /> Donate a College Item
            </Link>
            <Link to="/explore" className="btn btn-outline-dark">
              View All Campus Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Subcategory Quick Tabs */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-heading)' }}>
            Select Resource Subcategory:
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredItems.length} of {collegeItems.length} college items
          </span>
        </div>

        <div className="subcategory-strip" role="tablist">
          <button
            type="button"
            className={`subcat-pill ${selectedSubcat === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedSubcat('All')}
          >
            <Layers size={14} style={{ display: 'inline', marginRight: '6px' }} />
            All College Items ({collegeItems.length})
          </button>

          {COLLEGE_SUBCATEGORIES.map((subcat) => {
            const countInSubcat = collegeItems.filter((i) => i.subcategory === subcat).length;
            return (
              <button
                key={subcat}
                type="button"
                className={`subcat-pill ${selectedSubcat === subcat ? 'active' : ''}`}
                onClick={() => setSelectedSubcat(subcat)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {getSubcategoryIcon(subcat)}
                  {subcat}
                  {countInSubcat > 0 && <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({countInSubcat})</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '42px', borderRadius: '999px', fontSize: '0.9rem' }}
            placeholder="Search college books, authors, drafters, breadboards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="filter-select"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="All">All Conditions</option>
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>

          {(selectedSubcat !== 'All' || searchTerm || selectedCondition !== 'All') && (
            <button type="button" className="btn btn-sm btn-outline" onClick={handleReset}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {itemsError && (
        <div className="demo-banner-box" role="alert" style={{ marginBottom: '24px' }}>
          <span>{itemsError}</span>
          {itemsError.includes('Configure Supabase') ? null : (
            <button type="button" className="btn btn-sm btn-outline" onClick={() => fetchItems().catch((error) => console.error('Retrying donations failed:', error))}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Results Grid */}
      {loadingItems ? (
        <div role="status" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
          <Loader2 size={30} className="spin-animation" style={{ margin: '0 auto 10px' }} />
          <div>Loading College Essentials...</div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="donation-grid">
          {filteredItems.map((item) => (
            <DonationCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No listings in "${selectedSubcat}"`}
          description="Be the first student to donate learning materials in this category and support someone in need."
          onReset={handleReset}
          showDonateButton={true}
        />
      )}
    </div>
  );
}
