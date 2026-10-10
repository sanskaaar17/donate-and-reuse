// src/App.jsx
// Main Application Routing, Auth & State Providers, and Layout Frame
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ItemDetailModal from './components/ItemDetailModal';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { ItemsProvider } from './context/ItemsContext';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CollegeEssentialsPage from './pages/CollegeEssentialsPage';
import DonatePage from './pages/DonatePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HowItWorksPage from './pages/HowItWorksPage';
import MyDonationsPage from './pages/MyDonationsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import ProfilePage from './pages/ProfilePage';

// Helper component that scrolls window to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <Router>
          <ScrollToTop />
          <div className="outer-viewport">
            <div className="app-canvas">
              <Navbar />
              <main className="main-content" id="main-content">
                <Routes>
                  {/* Public Browsing Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/college-essentials" element={<CollegeEssentialsPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Student Routes */}
                  <Route
                    path="/donate"
                    element={
                      <ProtectedRoute>
                        <DonatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-donations"
                    element={
                      <ProtectedRoute>
                        <MyDonationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-requests"
                    element={
                      <ProtectedRoute>
                        <MyRequestsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback route */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>

          {/* Global Details Modal & Toast Notification */}
          <ItemDetailModal />
          <Toast />
        </Router>
      </ItemsProvider>
    </AuthProvider>
  );
}
