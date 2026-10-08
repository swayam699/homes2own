import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ComparisonProvider } from './context/ComparisonContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ExploreMumbaiPage from './pages/ExploreMumbaiPage';
import ComparePage from './pages/ComparePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Compass, ArrowLeft } from 'lucide-react';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#777B5A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-[#D9D4C9] rounded text-center">
        <h2 className="font-serif text-2xl font-bold text-[#242521] mb-2">Access Restricted</h2>
        <p className="text-sm text-[#71716D] mb-6">
          Your current account role (<span className="capitalize font-semibold text-[#242521]">{user?.role}</span>) does not have authorization to view this advisory portal.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-[#242521] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#777B5A] transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return children;
}

function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#EFECE3] flex items-center justify-center text-[#777B5A] mb-4">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#242521] mb-2">404</h1>
      <h2 className="font-serif text-xl sm:text-2xl text-[#242521] mb-3">Property or Page Not Found</h2>
      <p className="text-sm text-[#71716D] max-w-md mb-8">
        The Mumbai property or editorial section you are looking for may have been repositioned or is currently unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/properties"
          className="px-5 py-2.5 bg-[#242521] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#777B5A] transition-colors shadow-subtle"
        >
          Browse All Properties
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#D9D4C9] bg-white text-[#242521] text-xs font-semibold uppercase tracking-wider rounded-xs hover:border-[#242521] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ComparisonProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#242521] font-sans antialiased selection:bg-[#777B5A] selection:text-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/properties/:idOrSlug" element={<PropertyDetailPage />} />
                  <Route path="/explore-mumbai" element={<ExploreMumbaiPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Customer Portal */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'consultant', 'admin']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Consultant CRM Portal */}
                  <Route
                    path="/consultant"
                    element={
                      <ProtectedRoute allowedRoles={['consultant', 'admin']}>
                        <ConsultantDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* System Administration Console */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ComparisonProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
