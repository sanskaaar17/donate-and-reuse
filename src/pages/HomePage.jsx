// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, HeartHandshake, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import Hero from '../components/Hero';
import CollegeEssentialsSection from '../components/CollegeEssentialsSection';
import DonationCard from '../components/DonationCard';
import { useItems } from '../context/ItemsContext';
import { HOW_IT_WORKS_STEPS, CEP_PRINCIPLES } from '../data/demoData';

export default function HomePage() {
  const { items, loadingItems, itemsError } = useItems();

  // Show top 6 items for featured donations
  const featuredDonations = items.slice(0, 6);

  const getPrincipleIcon = (index) => {
    switch (index) {
      case 0:
        return <HeartHandshake size={24} color="#0d9488" />;
      case 1:
        return <RefreshCw size={24} color="#2563eb" />;
      case 2:
        return <Leaf size={24} color="#10b981" />;
      default:
        return <ShieldCheck size={24} color="#059669" />;
    }
  };

  return (
    <div className="home-page-view">
      {/* 1. Hero Section (Screenshot-inspired editorial composition) */}
      <Hero />

      {/* 2. Signature Feature: College Essentials Section (Prominent) */}
      <div className="section-container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <CollegeEssentialsSection />
      </div>

      {/* 3. Featured Recent Community Donations */}
      <section className="section-container" aria-labelledby="featured-heading">
        <div className="section-header-row">
          <div>
            <span className="section-eyebrow">Community Catalog</span>
            <h2 id="featured-heading" className="section-main-heading">
              Available Community Donations
            </h2>
            <p className="section-subtext">
              Browse recently offered textbooks, calculators, project boards, and campus living essentials ready for pickup.
            </p>
          </div>
          <Link to="/explore" className="btn btn-outline" style={{ gap: '6px' }}>
            View Full Catalog ({items.length}) <ArrowRight size={16} />
          </Link>
        </div>

        {loadingItems ? (
          <p role="status" className="section-subtext">Loading recent donations...</p>
        ) : featuredDonations.length ? (
          <div className="donation-grid">
            {featuredDonations.map((item) => <DonationCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p role={itemsError ? 'alert' : 'status'} className="section-subtext">
            {itemsError || 'No donations have been listed yet. Be the first to share an item.'}
          </p>
        )}
      </section>

      {/* 4. Three-Step "How It Works" Walkthrough */}
      <section className="section-container" style={{ backgroundColor: '#f8faf9', borderRadius: 'var(--radius-xl)', margin: '40px auto', maxWidth: '1160px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <span className="section-eyebrow">Simple &amp; Safe</span>
          <h2 className="section-main-heading">How Donate &amp; Reuse Works</h2>
          <p className="section-subtext" style={{ margin: '8px auto 0' }}>
            A sustainable campus exchange created by engineering students. No commercial fees, no shipping hassles — just direct campus peer sharing.
          </p>
        </div>

        <div className="how-it-works-grid">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div key={idx} className="step-card">
              <span className="step-number">{step.number}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/how-it-works" className="btn btn-primary">
            Read Full Safety &amp; Handover Guidelines <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5. Sustainability & Community Principles (Genuine Project Values - No Fake Stats) */}
      <section className="section-container" style={{ paddingBottom: '32px' }}>
        <div className="impact-banner">
          <div className="impact-header">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#5eead4',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px'
              }}
            >
              <Leaf size={14} /> Campus Circular Economy
            </span>
            <h2>Our Core Sharing Principles</h2>
            <p>
              By recirculating course materials and equipment across graduating batches, our student community reduces landfill waste and eases academic expenses.
            </p>
          </div>

          <div className="principles-grid">
            {CEP_PRINCIPLES.map((principle, idx) => (
              <div key={idx} className="principle-card">
                <div className="principle-icon-wrap">
                  {getPrincipleIcon(idx)}
                </div>
                <span className="principle-tagline">{principle.tagline}</span>
                <h3 className="principle-title">{principle.title}</h3>
                <p className="principle-desc">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bottom Call-To-Action Banner */}
      <section className="section-container" style={{ paddingTop: '0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '44px 36px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <div style={{ maxWidth: '580px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px' }}>
              Have books or lab items you don’t need anymore?
            </h3>
            <p style={{ color: '#ccfbf1', fontSize: '0.98rem', margin: 0, lineHeight: 1.5 }}>
              Pass them forward to a junior or campus peer in just 60 seconds. Every item shared strengthens our community.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/donate"
              className="btn"
              style={{ background: '#ffffff', color: '#0f766e', fontWeight: 700 }}
            >
              <PlusCircle size={18} /> Donate an Item Now
            </Link>
            <Link
              to="/explore"
              className="btn btn-outline"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
