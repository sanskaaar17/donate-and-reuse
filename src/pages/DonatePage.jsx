// src/pages/DonatePage.jsx
// Database-backed donation creation with optional Supabase Storage file uploads
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  GraduationCap,
  UploadCloud,
  ArrowRight,
  Loader2,
  Package
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CONDITIONS, COLLEGE_SUBCATEGORIES, PRESET_IMAGES } from '../data/demoData';

export default function DonatePage() {
  const { createDonation } = useItems();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'College Essentials';

  const [formData, setFormData] = useState({
    title: '',
    category: initialCat,
    subcategory: COLLEGE_SUBCATEGORIES[0],
    condition: 'Gently Used',
    location: '',
    description: '',
    pickupTimes: 'Weekdays after 4:00 PM',
    imageUrl: PRESET_IMAGES[0].url,
    tags: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [submittedItem, setSubmittedItem] = useState(null);

  const isCollegeEssentials = formData.category === 'College Essentials';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectPresetImage = (url) => {
    setImageFile(null);
    setFilePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setServerError('File size exceeds 5MB. Please choose a smaller photo.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setServerError('Choose a JPG, PNG, or WebP image.');
        return;
      }
      setServerError(null);
      setImageFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Item title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please choose a category';
    }

    if (isCollegeEssentials && !formData.subcategory) {
      newErrors.subcategory = 'Please select a College Essentials subcategory';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please specify approximate campus pickup location';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a short description';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await createDonation(formData, imageFile);
      setSubmittedItem(created);
    } catch (err) {
      console.error('Failed to create donation:', err);
      setServerError(err.message || 'Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      title: '',
      category: 'College Essentials',
      subcategory: COLLEGE_SUBCATEGORIES[0],
      condition: 'Gently Used',
      location: '',
      description: '',
      pickupTimes: 'Weekdays after 4:00 PM',
      imageUrl: PRESET_IMAGES[0].url,
      tags: ''
    });
    setImageFile(null);
    setFilePreview(null);
    setErrors({});
    setSubmittedItem(null);
  };

  return (
    <div className="section-container" style={{ maxWidth: '840px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="section-eyebrow">Community Sharing</span>
        <h1 className="section-main-heading">Donate an Item</h1>
        <p className="section-subtext" style={{ margin: '8px auto 0' }}>
          Pass forward your books, calculators, and lab tools. List items for free and connect directly with campus peers.
        </p>
      </div>

      {serverError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '24px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{serverError}</span>
        </div>
      )}

      {/* Success View */}
      {submittedItem ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 10px' }}>
            Listing Published to Database!
          </h2>

          <p style={{ color: 'var(--color-text-body)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            "<strong>{submittedItem.title}</strong>" is now live in the campus catalog. Students can discover it and request it.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary">
              View in Explore Catalog <ArrowRight size={16} />
            </Link>
            <Link to="/my-donations" className="btn btn-subtle">
              Manage in My Donations
            </Link>
            <button type="button" className="btn btn-outline" onClick={handleResetForm}>
              <PlusCircle size={16} /> Donate Another Item
            </button>
          </div>
        </div>
      ) : (
        /* The Donation Form */
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          {/* Item Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              <span>Item Title <span className="required-star">*</span></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>e.g. Casio fx-991EX Scientific Calculator</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${errors.title ? 'has-error' : ''}`}
              placeholder="Enter exact item title..."
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && (
              <span className="form-error-msg">
                <AlertCircle size={14} /> {errors.title}
              </span>
            )}
          </div>

          {/* Category & Conditional Subcategory */}
          <div style={{ display: 'grid', gridTemplateColumns: isCollegeEssentials ? '1fr 1fr' : '1fr', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                <span>Category <span className="required-star">*</span></span>
              </label>
              <select
                id="category"
                name="category"
                className={`form-select ${errors.category ? 'has-error' : ''}`}
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="form-error-msg">
                  <AlertCircle size={14} /> {errors.category}
                </span>
              )}
            </div>

            {/* CONDITIONAL SUB-CATEGORY (Only when College Essentials is selected) */}
            {isCollegeEssentials && (
              <div className="form-group">
                <label className="form-label" htmlFor="subcategory">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <GraduationCap size={15} color="#0d9488" /> College Subcategory <span className="required-star">*</span>
                  </span>
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  className={`form-select ${errors.subcategory ? 'has-error' : ''}`}
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  {COLLEGE_SUBCATEGORIES.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <span className="form-error-msg">
                    <AlertCircle size={14} /> {errors.subcategory}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Condition & Pickup Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="condition">
                <span>Condition <span className="required-star">*</span></span>
              </label>
              <select
                id="condition"
                name="condition"
                className={`form-select ${errors.condition ? 'has-error' : ''}`}
                value={formData.condition}
                onChange={handleChange}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                <span>Campus Pickup Location <span className="required-star">*</span></span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className={`form-input ${errors.location ? 'has-error' : ''}`}
                placeholder="e.g. Central Library foyer, SAC lounge"
                value={formData.location}
                onChange={handleChange}
                required
              />
              {errors.location && (
                <span className="form-error-msg">
                  <AlertCircle size={14} /> {errors.location}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              <span>Item Description &amp; Details <span className="required-star">*</span></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Min 10 characters</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={`form-textarea ${errors.description ? 'has-error' : ''}`}
              placeholder="Describe condition, course relevance, and what is included..."
              value={formData.description}
              onChange={handleChange}
              required
            />
            {errors.description && (
              <span className="form-error-msg">
                <AlertCircle size={14} /> {errors.description}
              </span>
            )}
          </div>

          {/* Image Upload / Preset Selector (Supabase Storage Enabled) */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} /> Item Photo (Upload File or Choose Preset)
              </span>
            </label>

            {/* File Upload Option */}
            <div
              style={{
                border: '1.5px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: '#fafcfb',
                marginBottom: '12px'
              }}
            >
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="imageFile"
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <UploadCloud size={20} />
                <span>{imageFile ? `Selected: ${imageFile.name}` : 'Click to Upload Photo from Device (Supabase Storage)'}</span>
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Supports JPG, PNG up to 5MB
              </div>
            </div>

            {/* Quick Demo Photo Presets */}
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                Or select a curated photo preset:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn btn-sm ${!filePreview && formData.imageUrl === preset.url ? 'btn-accent' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => handleSelectPresetImage(preset.url)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Thumbnail */}
            {(filePreview || formData.imageUrl) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: '#f8faf9',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <img
                  src={filePreview || formData.imageUrl}
                  alt="Item Preview"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {filePreview ? 'Device photo ready for upload' : 'Preset image selected'}
                </span>
              </div>
            )}
          </div>

          {/* Pickup Timing & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="pickupTimes">
                <span>Preferred Handover Timing</span>
              </label>
              <input
                type="text"
                id="pickupTimes"
                name="pickupTimes"
                className="form-input"
                placeholder="e.g. Weekdays 4:00 PM - 6:00 PM"
                value={formData.pickupTimes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags">
                <span>Tags (Comma-separated)</span>
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="form-input"
                placeholder="e.g. Math, Semester 2, Drafter"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? <Loader2 size={20} className="spin-animation" /> : <PlusCircle size={20} />}
              {submitting ? 'Publishing Donation...' : 'Publish Donation Listing'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/explore')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
