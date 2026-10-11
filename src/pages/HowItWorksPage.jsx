// src/pages/HowItWorksPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Search,
  Users2,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  GraduationCap,
  Sparkles,
  MapPin
} from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/demoData';

export default function HowItWorksPage() {
  const stepsDetail = [
    {
      num: "01",
      title: "List Useful Items You No Longer Need",
      desc: "Completed your semester examinations or finished your lab coursework? Don't let your scientific calculators, drafters, reference textbooks, or lab aprons gather dust. Fill in our simple form with condition details and your preferred on-campus meeting location.",
      icon: <UploadCloud size={24} color="#0d9488" />
    },
    {
      num: "02",
      title: "Browse, Discover & Request Free Resources",
      desc: "Incoming students and peers explore listings by subject, department, or item category. When you find what you need for your courses, reserve the item with a single click. There is no money exchanged — zero fees, zero bartering pressure.",
      icon: <Search size={24} color="#2563eb" />
    },
    {
      num: "03",
      title: "Meet Safely on Campus for Handover",
      desc: "Coordinate an exchange at a convenient public campus hub: the Central Library, department foyer, student activity center, or campus cafe. Hand over the item, say hello to a fellow peer, and celebrate extending the lifecycle of useful materials.",
      icon: <Users2 size={24} color="#059669" />
    }
  ];

  const conditionGuide = [
    {
      title: "Brand New",
      color: "#15803d",
      bg: "#dcfce7",
      desc: "Never used, in original packaging or shrink-wrap. Zero flaws or pencil markings."
    },
    {
      title: "Like New",
      color: "#0369a1",
      bg: "#e0f2fe",
      desc: "Used lightly. Clean pages, no torn binding, calculators fully functional with all original covers."
    },
    {
      title: "Gently Used",
      color: "#b45309",
      bg: "#fef3c7",
      desc: "Shows minor wear, occasional highlights or notes. Fully readable and structurally sound."
    },
    {
      title: "Functional / Fair",
      color: "#4b5563",
      bg: "#f3f4f6",
      desc: "Shows cosmetic blemishes, worn edges, or older casing, but still performs its main function reliably."
    }
  ];

  return (
    <div className="section-container">
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
        <span className="section-eyebrow">Zero Friction Campus Exchange</span>
        <h1 className="section-main-heading">How Donate &amp; Reuse Works</h1>
        <p className="section-subtext" style={{ margin: '12px auto 0' }}>
          Our engineering Common Engagement Project aims to eliminate academic waste, support student finances, and build a stronger campus culture.
        </p>
      </div>

      {/* 3 Steps Detailed Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '56px' }}>
        {stepsDetail.map((step, idx) => (
          <div key={idx} className="step-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="step-number" style={{ margin: 0 }}>{step.num}</span>
              <div style={{ padding: '10px', background: '#f0fdfa', borderRadius: '50%' }}>
                {step.icon}
              </div>
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc" style={{ lineHeight: 1.65 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Safe Handover Guidelines Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #103838 0%, #0d2a2a 100%)',
          borderRadius: 'var(--radius-xl)',
          color: '#ffffff',
          padding: '44px 40px',
          marginBottom: '56px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5eead4', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
          <ShieldCheck size={20} /> Campus Safety &amp; Handover Best Practices
        </div>
        <h2 style={{ color: '#ffffff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 16px' }}>
          Smooth and Safe Student Exchanges
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#5eead4', display: 'block', marginBottom: '6px' }}>
              1. Choose Public Campus Hubs
            </strong>
            <p style={{ color: '#d1e7e3', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              Meet at familiar places like the Central Library, Department Foyer, Student Activity Center, or Canteen during regular daytime hours.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#5eead4', display: 'block', marginBottom: '6px' }}>
              2. Inspect Items Together
            </strong>
            <p style={{ color: '#d1e7e3', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              Check calculator batteries, verify book editions, or inspect breadboard components together to confirm everything matches the listing.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: '#5eead4', display: 'block', marginBottom: '6px' }}>
              3. Pass Forward Next Term
            </strong>
            <p style={{ color: '#d1e7e3', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              When you pass the course or graduate, re-list the item so another student can benefit. That is the circular spirit of Donate &amp; Reuse!
            </p>
          </div>
        </div>
      </div>

      {/* Item Condition Standards Guide */}
      <div style={{ marginBottom: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">Clear Standards</span>
          <h2 className="section-main-heading">Condition Rating Criteria</h2>
          <p className="section-subtext" style={{ margin: '8px auto 0' }}>
            We ask donors to honestly classify items so requesters know exactly what to expect.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {conditionGuide.map((cond, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: cond.bg,
                  color: cond.color,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '12px'
                }}
              >
                {cond.title}
              </span>
              <p style={{ color: 'var(--color-text-body)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
                {cond.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div style={{ maxWidth: '800px', margin: '0 auto 56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">Frequently Asked Questions</span>
          <h2 className="section-main-heading">Common Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: 'var(--color-heading)' }}>
              Are all items truly 100% free?
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: 1.6 }}>
              Yes! Donate &amp; Reuse is strictly a non-commercial community initiative. Items listed here cannot be sold, auctioned, or bartered for money.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: 'var(--color-heading)' }}>
              Can anyone in the local community donate, or only students?
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: 1.6 }}>
              While the platform is tailored with College Essentials for students, campus residents, alumni, faculty, and local neighbors are welcome to contribute books, appliances, clothing, and supplies.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: 'var(--color-heading)' }}>
              How are my listings and requests stored?
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: 1.6 }}>
              Listings and requests are stored in the project database and protected by account-based access policies. You can manage your own listings, and only the owner of an item can accept or decline its requests.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div
        style={{
          textAlign: 'center',
          background: '#f0fdf9',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 24px'
        }}
      >
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px' }}>
          Ready to share or find course resources?
        </h3>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '460px', margin: '0 auto 24px' }}>
          Start browsing the campus listings or post your first donation in seconds.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/explore" className="btn btn-primary">
            Explore All Items <ArrowRight size={16} />
          </Link>
          <Link to="/donate" className="btn btn-outline-dark">
            <PlusCircle size={16} /> Donate an Item
          </Link>
        </div>
      </div>
    </div>
  );
}
