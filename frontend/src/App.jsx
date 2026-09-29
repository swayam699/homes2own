import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { RestaurantSwitchModal } from './components/cart/RestaurantSwitchModal';

import { HomePage } from './pages/HomePage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { AdminOrdersView } from './pages/admin/AdminOrdersView';
import { AdminRestaurantsView } from './pages/admin/AdminRestaurantsView';
import { AdminMenuView } from './pages/admin/AdminMenuView';
import { AdminCustomersView } from './pages/admin/AdminCustomersView';
import { AdminCouponsView } from './pages/admin/AdminCouponsView';

function MainApp() {
  const { isAuthenticated, isRestaurantAdmin } = useAuth();
  const { setIsCartOpen } = useCart();

  const [currentPage, setCurrentPage] = useState('home');
  const [currentRestaurantId, setCurrentRestaurantId] = useState(1);
  const [trackingOrderId, setTrackingOrderId] = useState(1);
  const [currentLocation, setCurrentLocation] = useState('Bandra West, Mumbai');
  const [adminTab, setAdminTab] = useState('overview');

  const handleNavigate = (page, param) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'restaurant' && param) {
      setCurrentRestaurantId(param);
    }
    if (page === 'order-tracking' && param) {
      setTrackingOrderId(param);
    }
    setCurrentPage(page);
  };

  const handleOrderPlaced = (orderId) => {
    setTrackingOrderId(orderId);
    setCurrentPage('order-tracking');
  };

  // Render Admin console when navigating to admin pages
  if (currentPage.startsWith('admin')) {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onReturnToStore={() => setCurrentPage('home')}
      >
        {adminTab === 'overview' && (
          <AdminDashboardOverview onNavigateOrders={() => setAdminTab('orders')} />
        )}
        {adminTab === 'orders' && <AdminOrdersView />}
        {adminTab === 'restaurants' && <AdminRestaurantsView />}
        {adminTab === 'menu' && <AdminMenuView />}
        {adminTab === 'customers' && <AdminCustomersView />}
        {adminTab === 'coupons' && <AdminCouponsView />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-slate-900 font-sans">
      {/* Sticky Navbar */}
      <Navbar
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main Page Content */}
      <div className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            currentLocation={currentLocation}
            onNavigateRestaurant={(id) => handleNavigate('restaurant', id)}
          />
        )}

        {currentPage === 'restaurant' && (
          <RestaurantDetailPage
            restaurantId={currentRestaurantId}
            onBack={() => handleNavigate('home')}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onBackToMenu={() => handleNavigate('restaurant', currentRestaurantId)}
          />
        )}

        {currentPage === 'order-tracking' && (
          <OrderTrackingPage
            orderId={trackingOrderId}
            onBackToOrders={() => handleNavigate('orders')}
          />
        )}

        {currentPage === 'orders' && (
          <OrderHistoryPage
            onTrackOrder={(id) => handleNavigate('order-tracking', id)}
            onNavigateRestaurant={(id) => handleNavigate('restaurant', id)}
          />
        )}

        {currentPage === 'profile' && <ProfilePage />}

        {currentPage === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onNavigate={handleNavigate}
            onRegisterSuccess={() => handleNavigate('home')}
          />
        )}
      </div>

      {/* Persistent Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onNavigateCheckout={() => {
          if (!isAuthenticated) {
            handleNavigate('login');
          } else {
            handleNavigate('checkout');
          }
        }}
        onExplore={() => handleNavigate('home')}
      />

      {/* Restaurant Switch Conflict Modal */}
      <RestaurantSwitchModal />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
