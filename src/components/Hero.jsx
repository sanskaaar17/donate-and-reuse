// src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, Leaf, BookOpen, Cpu, Sparkles, ShieldCheck } from 'lucide-react';
import { CAMPUS_PARTNERS } from '../data/demoData';

export default function Hero() {
  return (
    <section className="hero-wrapper" aria-labelledby="hero-heading">
      <div className="hero-box">
        {/* Top Row: Editorial Headline on Left, Intro & CTA on Right (Matching Reference) */}
        <div className="hero-top-row">
          <div>
            <h1 id="hero-heading" className="hero-headline">
              Give What You Can.{' '}
              <span className="hero-gradient-text">Get What You Need.</span>
            </h1>
          </div>

          <div className="hero-intro-col">
            <div className="hero-arrow-indicator" aria-hidden="true">→</div>
            <p className="hero-intro-text">
              Welcome to our campus platform! Connect with fellow students to share textbooks,
              lab coats, calculators, and essentials — 100% free peer-to-peer exchange.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/explore" className="btn btn-primary hero-btn-main">
                Explore Items <ArrowRight size={17} />
              </Link>
              <Link to="/donate" className="btn btn-outline-dark">
                <PlusCircle size={17} /> Donate an Item
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Asymmetric Visual Showcase (Pixel-balanced matching reference composition) */}
        <div className="hero-visual-grid">
          {/* Tile 1: Large Dark Teal Promotional Card (Left) */}
          <div className="hero-teal-promo-card">
            <div>
              <span className="teal-card-badge">
                <Leaf size={14} /> Zero Waste Campus Movement
              </span>
              <h2 className="teal-card-title">
                Share more, waste less by joining our campus circle
              </h2>
              <p className="teal-card-desc">
                From engineering calculators to semester notes, keep valuable items circulating freely among students.
              </p>
            </div>

            <div className="teal-community-strip">
              <div className="avatar-stack" aria-label="Campus community members">
                <img
                  className="avatar-bubble"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Student community member"
                />
                <img
                  className="avatar-bubble"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Student community member"
                />
                <img
                  className="avatar-bubble"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Student community member"
                />
              </div>
              <div className="teal-community-info">
                <span className="teal-community-label">Join Our Circle</span>
                <span className="teal-community-count">100% Free Sharing (Demo)</span>
              </div>
            </div>
          </div>

          {/* Tile 2: Center Top Rounded Photo (Casio fx-991EX Scientific Calculator) */}
          <div className="hero-tile-center-top">
            <img
              src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80"
              alt="Scientific Calculator for engineering students"
              loading="eager"
            />
            <div className="tile-tag-overlay">
              <span>Calculators &amp; Instruments</span>
            </div>
          </div>

          {/* Tile 3: Center Bottom Rounded Photo (Engineering Drafting & Project Supplies) */}
          <div className="hero-tile-center-bottom">
            <img
              src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80"
              alt="Engineering graphics and drafting instruments"
              loading="lazy"
            />
            <div className="tile-tag-overlay">
              <span>Drawing Kits &amp; Supplies</span>
            </div>
          </div>

          {/* Tile 4: Right Side Tall Rounded Photo (Student with books & backpack on campus) */}
          <div className="hero-tile-right-tall">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
              alt="College students sharing textbooks and study materials"
              loading="eager"
            />
            <div className="tile-tag-overlay">
              <span>Campus Book &amp; Gear Exchange</span>
            </div>
          </div>
        </div>

        {/* Campus Partner Clubs / Initiatives Strip (Styled like premium brand logos in screenshot) */}
        <div className="campus-partners-bar">
          <span className="partners-title">Supported by campus student initiatives &amp; societies</span>
          <div className="partners-logo-row">
            {CAMPUS_PARTNERS.map((partner, index) => (
              <div key={index} className="partner-brand-mark">
                <span className="partner-brand-name">{partner.name}</span>
                <span className="partner-brand-category">{partner.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
