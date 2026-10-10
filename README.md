# Donate & Reuse — Engineering Common Engagement Project (CEP)
**Frontend Prototype (Phase 1)**

> **Tagline:** Give What You Can. Get What You Need.  
> **Mission:** A sustainable, 100% free peer-to-peer campus resource exchange helping engineering students and community members give textbooks, calculators, lab gear, and supplies a second life.

---

## 🎨 Visual Design Inspiration
Inspired by the modern, premium aesthetic of top-tier consumer apps, adapted specifically for community reuse:
- **Outer Canvas:** Soft ambient pastel backdrop with a floating, rounded main application container (`border-radius: 28px`).
- **Hero Canvas:** Gentle mint-to-lavender gradient with large bold editorial typography and green-teal gradient accents.
- **Asymmetric Visual Showcase:** Large dark teal promotional card featuring campus sustainability goals, paired with rounded photographic tiles of real academic supplies (scientific calculators, engineering drawing kits, textbooks, and campus gear).
- **Signature Feature — College Essentials:** Dedicated highlight for course materials, previous year notes, lab coats, and breadboard electronics.

---

## 🛠 Tech Stack
- **Framework:** React 18 with Vite 6
- **Language:** JavaScript (ES Modules, strictly no TypeScript)
- **Routing:** React Router v6 (`react-router-dom`)
- **Icons:** Lucide React (`lucide-react`)
- **Styling:** Pure Plain CSS (CSS Variables, modular files, responsive without external UI frameworks)
- **State Management:** In-memory React Context (`ItemsContext`) allowing real-time simulated donations and item reservation toggles without a backend.

---

## 📂 Project Directory Structure

```text
donate-and-reuse/
├── index.html                  # HTML entry with Plus Jakarta Sans & Inter fonts
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite configuration (port 3000)
├── README.md                   # Project documentation & verification checklist
└── src/
    ├── main.jsx                # Application root entry point
    ├── App.jsx                 # Top-level routing, layout wrapper & providers
    ├── index.css               # Central stylesheet loading tokens and resets
    ├── styles/
    │   ├── variables.css       # Design tokens (colors, gradients, shadows, radii)
    │   ├── layout.css          # Canvas container, navbar, footer, responsive grids
    │   ├── components.css      # Buttons, badges, cards, modals, toast, search filters
    │   └── pages.css           # Hero section, college banner, auth styling, impact metrics
    ├── data/
    │   └── demoData.js         # Realistic listings, categories, subcategories, metrics
    ├── context/
    │   └── ItemsContext.jsx    # In-memory reactive state (items, addItem, modal, toast)
    ├── components/
    │   ├── Navbar.jsx          # Header with active indicators & responsive mobile drawer
    │   ├── Footer.jsx          # Multi-column footer with project mission & links
    │   ├── Hero.jsx            # Asymmetric hero showcase matching screenshot layout
    │   ├── DonationCard.jsx    # Card with image fallback, condition badge & location
    │   ├── ItemDetailModal.jsx # Accessible popup with full donor details & reserve action
    │   ├── SearchAndFilters.jsx# Real-time search, category pills & condition dropdowns
    │   ├── CollegeEssentialsSection.jsx # Reusable signature spotlight component
    │   ├── EmptyState.jsx      # Friendly zero-results UI with filter reset trigger
    │   └── Toast.jsx           # Animated floating feedback notifications
    └── pages/
        ├── HomePage.jsx        # Landing page with hero, spotlight, recent items & impact
        ├── ExplorePage.jsx     # Full catalog with dynamic search, multi-filters & cards
        ├── CollegeEssentialsPage.jsx # Signature hub with 8 specialized subcategories
        ├── DonatePage.jsx      # Form with conditional subcategory selector & live preview
        ├── LoginPage.jsx       # Email & password with show/hide toggle (UI preview)
        ├── RegisterPage.jsx    # Account registration with password matching (UI preview)
        └── HowItWorksPage.jsx  # Safe handover guide, condition rubric & FAQs
```

---

## 🚀 Running the Project Locally

The development server is already compiled and running. If you ever need to restart or run it manually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Dev Server
```bash
npm run dev
```
Open your browser to: **`http://localhost:3000/`**

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🧪 Browser Verification Checklist

Verify the following key interactions in your browser:

1. **Home Page (`/`)**:
   - Check the soft outer background and large rounded canvas container.
   - Verify the editorial headline with the teal-to-green gradient highlight.
   - Verify the dark teal promotional card and asymmetric photo tiles.
   - Click "Explore Items →" or "Donate an Item" and ensure navigation works smoothly.
2. **Explore Items (`/explore`)**:
   - Type in the search box (e.g., "calculator", "library", or "lab") to see instant filtering.
   - Click category filter pills (e.g. "College Essentials", "Books", "Clothes").
   - Change the Condition filter (e.g. "Like New").
   - Click "Clear Filters" to reset.
   - Click any card's **"Details"** button to open the Item Detail modal.
   - In the modal, click **"Request This Item (Demo Reserve)"** to watch its status change to "Reserved" and trigger a toast notice!
3. **College Essentials (`/college-essentials`)**:
   - Verify the graduation-cap header banner and description.
   - Click across the 8 subcategory pills (e.g., *Scientific Calculators & Drawing Instruments*, *Lab Coats & Lab Supplies*, *Textbooks & Reference Books*).
4. **Donate an Item (`/donate`)**:
   - Notice the College Subcategory dropdown only appears when "College Essentials" is selected.
   - Try submitting with empty fields to observe client validation feedback.
   - Fill in a test listing, pick one of the quick photo presets (or leave the default), and submit.
   - Confirm that the new item is stored in React state and immediately appears in `/explore` and `/college-essentials`!
5. **How It Works (`/how-it-works`)**:
   - Review the 3-step exchange process, the condition rating guide, campus handover safety tips, and FAQs.
6. **Login (`/login`) & Register (`/register`)**:
   - Test password show/hide eye toggle button.
   - Verify client-side field validation and clear disclaimers that backend authentication will be connected in Phase 3.
7. **Mobile Responsiveness**:
   - Resize your browser window below 768px and verify the mobile hamburger menu opens and closes cleanly with all navigation links.
