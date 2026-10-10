// src/components/CollegeEssentialsSection.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, PlusCircle, Sparkles } from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { COLLEGE_SUBCATEGORIES } from '../data/demoData';
import DonationCard from './DonationCard';

export default function CollegeEssentialsSection() {
  const { items } = useItems();
  const [activeSubcat, setActiveSubcat] = useState('All');

  // Filter items in College Essentials
  const collegeItems = items.filter((item) => item.category === 'College Essentials');

  const filteredItems = activeSubcat === 'All'
    ? collegeItems.slice(0, 4) // Show top 4 on homepage
    : collegeItems.filter((item) => item.subcategory === activeSubcat).slice(0, 4);

  return (
    <section className="college-essentials-spotlight" aria-labelledby="college-spotlight-title">
      <div className="college-spotlight-header">
        <div>
          <div className="spotlight-badge">
            <GraduationCap size={16} /> Signature Campus Initiative • College Essentials
          </div>
          <h2 id="college-spotlight-title" className="spotlight-title">
            College Essentials, <span className="hero-gradient-text">Shared.</span>
          </h2>
          <p className="spotlight-desc">
            Books, notes, calculators, and lab supplies — give learning resources a second life and save peers hundreds every semester.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/college-essentials" className="btn btn-primary">
            Explore All College Items ({collegeItems.length}) <ArrowRight size={16} />
          </Link>
          <Link to="/donate?category=College%20Essentials" className="btn btn-outline-dark">
            <PlusCircle size={16} /> Donate College Item
          </Link>
        </div>
      </div>

      {/* Interactive Subcategory Pills with Live Item Counts */}
      <div className="subcategory-strip" role="tablist" aria-label="College Subcategories">
        <button
          type="button"
          className={`subcat-pill ${activeSubcat === 'All' ? 'active' : ''}`}
          onClick={() => setActiveSubcat('All')}
        >
          All College Resources <span className="subcat-count">({collegeItems.length})</span>
        </button>

        {COLLEGE_SUBCATEGORIES.slice(0, 6).map((subcat) => {
          const count = collegeItems.filter((i) => i.subcategory === subcat).length;
          return (
            <button
              key={subcat}
              type="button"
              className={`subcat-pill ${activeSubcat === subcat ? 'active' : ''}`}
              onClick={() => setActiveSubcat(subcat)}
            >
              {subcat}
              {count > 0 && <span className="subcat-count">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Grid of 4 Featured College Items */}
      <div className="donation-grid">
        {filteredItems.map((item) => (
          <DonationCard key={item.id} item={item} />
        ))}
      </div>

      {/* Prominent Bottom Banner inside Section */}
      <div className="college-spotlight-footer-callout">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="callout-icon-box">
            <Sparkles size={20} color="#0d9488" />
          </div>
          <div>
            <strong style={{ display: 'block', color: 'var(--color-heading)', fontSize: '0.98rem' }}>
              Finished semester exams or practical labs?
            </strong>
            <span style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
              Pass your engineering calculators, lab coats, and drafters down to incoming juniors.
            </span>
          </div>
        </div>
        <Link to="/donate?category=College%20Essentials" className="btn btn-sm btn-accent">
          Donate a College Item <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
