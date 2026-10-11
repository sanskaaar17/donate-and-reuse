// Shared form choices and static presentation content; listings always come from Supabase.
export const COLLEGE_SUBCATEGORIES = [
  'Textbooks & Reference Books',
  'Notes & Previous-Year Papers',
  'Lab Coats & Lab Supplies',
  'Scientific Calculators & Drawing Instruments',
  'Engineering Project Materials',
  'Stationery & Record Books',
  'Bags & College Accessories',
  'Other College Items'
];

export const CATEGORIES = [
  'College Essentials',
  'Books',
  'Clothes',
  'Stationery',
  'Electronics',
  'Household',
  'Other'
];

export const CONDITIONS = [
  'Brand New',
  'Like New',
  'Gently Used',
  'Functional / Fair'
];

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80';

export const PRESET_IMAGES = [
  { label: 'Scientific Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Engineering Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Lab Coat', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Arduino / IoT Kit', url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80' },
  { label: 'Study Notes & Pen', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80' },
  { label: 'College Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' }
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: "List What You Don't Need",
    description: 'Finished a semester or clearing your shelf? Snap a photo, choose condition, pick your campus drop point, and post in under 60 seconds.'
  },
  {
    number: '02',
    title: 'Connect & Request for Free',
    description: 'Search books, calculators, and supplies shared by peers. No bidding, no payment, no commercial fees — 100% free community sharing.'
  },
  {
    number: '03',
    title: 'Safe On-Campus Handover',
    description: 'Coordinate an exchange at a familiar campus hub like the library, student center, or department foyer. Reduce waste and make a friend.'
  }
];

export const CEP_PRINCIPLES = [
  {
    title: '100% Free Peer Exchange',
    tagline: 'Zero Financial Barrier',
    description: 'No subscription, no bidding wars, and no hidden charges. All items are shared freely among students in the spirit of academic mutual aid.'
  },
  {
    title: 'Academic Resource Continuity',
    tagline: 'Semester-to-Semester Reuse',
    description: 'Costly reference books, mini drafters, and scientific calculators stay in circulation, giving each incoming batch direct access without re-purchasing.'
  },
  {
    title: 'Zero Campus Waste Goal',
    tagline: 'Circular Economy in Action',
    description: 'Practical records, breadboard components, and hostel appliances find new homes rather than being dumped into campus waste bins.'
  },
  {
    title: 'Verified On-Campus Handover',
    tagline: 'Safe & Frictionless',
    description: 'Meetings take place at familiar public campus locations like the Central Library, SAC, and department halls during normal daylight hours.'
  }
];

export const CAMPUS_PARTNERS = [
  { name: 'ENGINEERING SOCIETY', category: 'Technical Guild' },
  { name: 'GREEN CAMPUS CLUB', category: 'Sustainability' },
  { name: 'CENTRAL LIBRARY EXCHANGE', category: 'Academic Resources' },
  { name: 'ROBOTICS & IOT LAB', category: 'Hardware Circle' },
  { name: 'STUDENT WELFARE COUNCIL', category: 'Campus Support' },
  { name: 'ZERO WASTE FORUM', category: 'Circular Campus' }
];
