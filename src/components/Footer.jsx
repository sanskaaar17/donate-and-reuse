// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-top">
        {/* Brand & Mission */}
        <div>
          <Link to="/" className="brand-logo-link" style={{ color: '#ffffff' }}>
            <div className="brand-icon-wrapper" aria-hidden="true">
              <HeartHandshake size={22} strokeWidth={2.3} />
            </div>
            <div className="brand-text">
              <span className="brand-title" style={{ color: '#ffffff' }}>Donate &amp; Reuse</span>
              <span className="brand-tag" style={{ color: '#5eead4' }}>Common Engagement Project</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            Give What You Can. Get What You Need. An engineering student initiative
            to help students and community members exchange usable items for free and eliminate campus waste.
          </p>
          <div className="footer-badge-demo">
            <Sparkles size={13} /> Supabase-powered campus exchange
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-link-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore All Items</Link></li>
            <li><Link to="/college-essentials">College Essentials</Link></li>
            <li><Link to="/donate">Donate an Item</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
          </ul>
        </div>

        {/* College Categories */}
        <div>
          <h4 className="footer-col-title">Top Categories</h4>
          <ul className="footer-link-list">
            <li><Link to="/college-essentials">Textbooks &amp; Notes</Link></li>
            <li><Link to="/college-essentials">Scientific Calculators</Link></li>
            <li><Link to="/college-essentials">Lab Coats &amp; Supplies</Link></li>
            <li><Link to="/college-essentials">Project Materials</Link></li>
            <li><Link to="/explore">Clothes &amp; Household</Link></li>
          </ul>
        </div>

        {/* Project & Community Note */}
        <div>
          <h4 className="footer-col-title">Project Mission</h4>
          <p style={{ fontSize: '0.88rem', color: '#9ab3af', lineHeight: 1.6, margin: '0 0 12px' }}>
            Built as part of the engineering Common Engagement Project (CEP). Free peer-to-peer sharing promotes circular economy principles and community solidarity.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5eead4', fontSize: '0.8rem' }}>
            <ShieldCheck size={16} /> Zero Commercial Fees • 100% Free
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} Donate &amp; Reuse Platform. Engineering Common Engagement Project.
        </div>
        <div className="footer-bottom-links">
          <Link to="/how-it-works">Safety Guidelines</Link>
          <Link to="/how-it-works">Handover Ethics</Link>
          <Link to="/login">Account Login</Link>
        </div>
      </div>
    </footer>
  );
}
