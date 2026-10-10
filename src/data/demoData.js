// src/data/demoData.js
// Demo listings for "Donate & Reuse" platform (Phase 1 Frontend Prototype)
// NOTE: All records are simulated demo data for frontend visualization.
// No fake user testimonials or unsupported statistical counts are used.

export const COLLEGE_SUBCATEGORIES = [
  "Textbooks & Reference Books",
  "Notes & Previous-Year Papers",
  "Lab Coats & Lab Supplies",
  "Scientific Calculators & Drawing Instruments",
  "Engineering Project Materials",
  "Stationery & Record Books",
  "Bags & College Accessories",
  "Other College Items"
];

export const CATEGORIES = [
  "College Essentials",
  "Books",
  "Clothes",
  "Stationery",
  "Electronics",
  "Household",
  "Other"
];

export const CONDITIONS = [
  "Brand New",
  "Like New",
  "Gently Used",
  "Functional / Fair"
];

export const INITIAL_DEMO_ITEMS = [
  {
    id: "item-1",
    title: "Casio fx-991EX ClassWiz Scientific Calculator",
    category: "College Essentials",
    subcategory: "Scientific Calculators & Drawing Instruments",
    condition: "Like New",
    location: "Campus Central Library, 2nd Floor",
    status: "Available",
    donorName: "Aarav Sharma",
    donorRole: "4th Year Mechanical",
    postedDate: "2 hours ago",
    description: "Mint condition scientific calculator with dual power (solar + battery) and protective slip-on hard case. Finished my engineering math course and want to hand it to a junior who needs it for semester exams.",
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    tags: ["Calculator", "Engineering Math", "Exam Ready"],
    pickupTimes: "Mon - Fri, 2:00 PM to 6:00 PM"
  },
  {
    id: "item-2",
    title: "Higher Engineering Mathematics (B.S. Grewal, 44th Edition)",
    category: "College Essentials",
    subcategory: "Textbooks & Reference Books",
    condition: "Gently Used",
    location: "Engineering Block A, Near Dean Office",
    status: "Available",
    donorName: "Priya Nair",
    donorRole: "Graduate Scholar",
    postedDate: "Yesterday",
    description: "Standard engineering mathematics reference book. Clean pages with minimal pencil highlights in differential equations and Fourier series chapters. Binding is firm and intact.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    tags: ["Math", "Textbook", "Semester 1-3"],
    pickupTimes: "Weekdays after 4:00 PM"
  },
  {
    id: "item-3",
    title: "100% Cotton White Chemistry / Biology Lab Coat (Size M)",
    category: "College Essentials",
    subcategory: "Lab Coats & Lab Supplies",
    condition: "Like New",
    location: "Science Complex, Chemistry Lab foyer",
    status: "Available",
    donorName: "Rohan Patel",
    donorRole: "3rd Year Biotechnology",
    postedDate: "3 days ago",
    description: "Full-sleeve sterile white apron/lab coat with chest pocket and deep side pockets. Cleaned, washed, and pressed. Perfect for first-year engineering chemistry or biology practicals.",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    tags: ["Lab Coat", "Chemistry", "Safety Gear"],
    pickupTimes: "Flexible, can meet near Main Canteen"
  },
  {
    id: "item-4",
    title: "Arduino Uno R3 Starter Kit + Breadboard & Jumper Wires",
    category: "College Essentials",
    subcategory: "Engineering Project Materials",
    condition: "Like New",
    location: "Robotics & IoT Innovation Hub",
    status: "Available",
    donorName: "Divya Sengupta",
    donorRole: "ECE Senior",
    postedDate: "Just now",
    description: "Original Arduino Uno microcontroller, 830-tie point solderless breadboard, 65 male-to-male jumpers, 10 LEDs, and assorted resistors. Ideal for mini-projects, microcontrollers lab, or IoT hobbies.",
    imageUrl: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    tags: ["IoT", "Arduino", "Hardware Project"],
    pickupTimes: "Mon & Wed, 3:00 PM - 5:00 PM"
  },
  {
    id: "item-5",
    title: "Mini Drafter with Clamps & Sheet Container (ED / Civil)",
    category: "College Essentials",
    subcategory: "Scientific Calculators & Drawing Instruments",
    condition: "Gently Used",
    location: "Civil Drafting Hall, Ground Floor",
    status: "Available",
    donorName: "Karthik Verma",
    donorRole: "2nd Year Civil",
    postedDate: "4 days ago",
    description: "Rotatable mini-drafter for engineering graphics / drawing with sturdy steel clamp and dual scale ruler. Comes with a water-resistant black cylindrical sheet holder container.",
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
    tags: ["Engineering Drawing", "Drafter", "Civil"],
    pickupTimes: "Daily 1:00 PM to 2:30 PM"
  },
  {
    id: "item-6",
    title: "Handwritten Comprehensive Data Structures & Algorithms Notes",
    category: "College Essentials",
    subcategory: "Notes & Previous-Year Papers",
    condition: "Like New",
    location: "Computer Center, 3rd Floor",
    status: "Available",
    donorName: "Meera Krishnan",
    donorRole: "CS Graduate",
    postedDate: "5 days ago",
    description: "Spiral-bound, neat handwritten lecture notes covering trees, graphs, dynamic programming, sorting, and 5 years of solved university exam papers with code snippets.",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    tags: ["DSA", "Computer Science", "Exam Notes"],
    pickupTimes: "Tuesday & Thursday 11:00 AM"
  },
  {
    id: "item-7",
    title: "Unopened A4 Graph Sheets & Ruled Practical Records (Pack of 3)",
    category: "College Essentials",
    subcategory: "Stationery & Record Books",
    condition: "Brand New",
    location: "Hostel 4 Common Lounge",
    status: "Available",
    donorName: "Ananya Joshi",
    donorRole: "1st Year General Engg",
    postedDate: "1 day ago",
    description: "Brand new unused university-approved hardcover practical record books (80 pages each) plus a full pad of mm-division grid graph papers. Bought extra at semester start.",
    imageUrl: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80",
    tags: ["Practical Records", "Stationery", "Graph Paper"],
    pickupTimes: "Any evening after 6:00 PM"
  },
  {
    id: "item-8",
    title: "Water-Resistant College Laptop Backpack (15.6 inch)",
    category: "College Essentials",
    subcategory: "Bags & College Accessories",
    condition: "Gently Used",
    location: "Student Activity Center (SAC)",
    status: "Available",
    donorName: "Tanmay Deshmukh",
    donorRole: "Alumni / CEP Contributor",
    postedDate: "2 days ago",
    description: "Sturdy black dual-compartment backpack with padded sleeve for up to 15.6” laptop, water bottle mesh, and reinforced shoulder straps. All zips functioning smoothly.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    tags: ["Backpack", "Laptop Bag", "Campus Gear"],
    pickupTimes: "Saturday morning or by appointment"
  },
  {
    id: "item-9",
    title: "Warm Unisex Fleece Zip Jacket (Size L - Navy Blue)",
    category: "Clothes",
    subcategory: "Other",
    condition: "Like New",
    location: "North Block Reception",
    status: "Available",
    donorName: "Sanya Roy",
    donorRole: "Resident Scholar",
    postedDate: "4 days ago",
    description: "Thick winter fleece jacket in dark navy. Kept very well, freshly laundered, zero tears or loose threads. Great for chilly morning lectures and hostel study halls.",
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
    tags: ["Winter Wear", "Fleece", "Sustainable Fashion"],
    pickupTimes: "Every afternoon 3:00 PM - 5:00 PM"
  },
  {
    id: "item-10",
    title: "Dimmable LED Study Desk Lamp (USB Powered)",
    category: "Household",
    subcategory: "Other",
    condition: "Like New",
    location: "Hostel 9, Block B",
    status: "Available",
    donorName: "Vikram Malhotra",
    donorRole: "Final Year Electrical",
    postedDate: "3 days ago",
    description: "Flexible gooseneck desk lamp with touch control, 3 color temperatures (warm, natural, cool white), and 5 brightness levels. Powers via standard phone USB-A charger.",
    imageUrl: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80",
    tags: ["Desk Lamp", "Hostel Essential", "LED"],
    pickupTimes: "Hostel lobby, 7:00 PM - 9:00 PM"
  },
  {
    id: "item-11",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship (Robert C. Martin)",
    category: "Books",
    subcategory: "Textbooks & Reference Books",
    condition: "Gently Used",
    location: "Innovation Wing, Room 204",
    status: "Reserved",
    donorName: "Siddharth Rao",
    donorRole: "Staff Engineer / Mentor",
    postedDate: "6 days ago",
    description: "Classic software engineering book on writing clean, readable, maintainable code. Perfect for any student preparing for software developer internships and coding interviews.",
    imageUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80",
    tags: ["Programming", "Software Design", "Best Practices"],
    pickupTimes: "Weekdays 10:00 AM - 12:00 PM"
  },
  {
    id: "item-12",
    title: "Electric Water Kettle 1.5L Stainless Steel (Automatic Shutoff)",
    category: "Household",
    subcategory: "Other",
    condition: "Functional / Fair",
    location: "Postgraduate Hostels Quad",
    status: "Available",
    donorName: "Nisha Gupta",
    donorRole: "Research Fellow",
    postedDate: "1 week ago",
    description: "Working electric kettle, great for preparing hot water, green tea, or instant oatmeal during late-night exam prep. Minor exterior scuffs but heating coil operates quickly and safely.",
    imageUrl: "https://images.unsplash.com/photo-1594213114663-d94db9b17125?auto=format&fit=crop&w=800&q=80",
    tags: ["Kettle", "Hostel Living", "Home Appliance"],
    pickupTimes: "Weekend afternoons"
  }
];

// Fallback image helper if remote image network fails
export const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80";

// Reusable Presets for Donation Form
export const PRESET_IMAGES = [
  { label: 'Scientific Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Engineering Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Lab Coat', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Arduino / IoT Kit', url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80' },
  { label: 'Study Notes & Pen', url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80' },
  { label: 'College Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' }
];

// Three-step walkthrough
export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "List What You Don't Need",
    description: "Finished a semester or clearing your shelf? Snap a photo, choose condition, pick your campus drop point, and post in under 60 seconds."
  },
  {
    number: "02",
    title: "Connect & Request for Free",
    description: "Search books, calculators, and supplies shared by peers. No bidding, no payment, no commercial fees — 100% free community sharing."
  },
  {
    number: "03",
    title: "Safe On-Campus Handover",
    description: "Coordinate an exchange at a familiar campus hub like the library, student center, or department foyer. Reduce waste and make a friend."
  }
];

// Campus Sustainability & Engineering CEP Core Pillars (replaces fake numbers)
export const CEP_PRINCIPLES = [
  {
    title: "100% Free Peer Exchange",
    tagline: "Zero Financial Barrier",
    description: "No subscription, no bidding wars, and no hidden charges. All items are shared freely among students in the spirit of academic mutual aid."
  },
  {
    title: "Academic Resource Continuity",
    tagline: "Semester-to-Semester Reuse",
    description: "Costly reference books, mini drafters, and scientific calculators stay in circulation, giving each incoming batch direct access without re-purchasing."
  },
  {
    title: "Zero Campus Waste Goal",
    tagline: "Circular Economy in Action",
    description: "Practical records, breadboard components, and hostel appliances find new homes rather than being dumped into campus waste bins."
  },
  {
    title: "Verified On-Campus Handover",
    tagline: "Safe & Frictionless",
    description: "Meetings take place at familiar public campus locations like the Central Library, SAC, and department halls during normal daylight hours."
  }
];

// Campus Initiatives / Student Societies
export const CAMPUS_PARTNERS = [
  { name: "ENGINEERING SOCIETY", category: "Technical Guild" },
  { name: "GREEN CAMPUS CLUB", category: "Sustainability" },
  { name: "CENTRAL LIBRARY EXCHANGE", category: "Academic Resources" },
  { name: "ROBOTICS & IOT LAB", category: "Hardware Circle" },
  { name: "STUDENT WELFARE COUNCIL", category: "Campus Support" },
  { name: "ZERO WASTE FORUM", category: "Circular Campus" }
];
