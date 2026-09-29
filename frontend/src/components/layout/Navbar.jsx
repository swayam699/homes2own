import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/client';
import {
  Search,
  MapPin,
  ShoppingBag,
  User,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  LogOut,
  UtensilsCrossed,
  Tag,
  Menu as MenuIcon,
  X,
  Store,
} from 'lucide-react';

export const Navbar = ({
  currentLocation,
  onLocationChange,
  onNavigate,
  currentPage,
}) => {
  const { user, isAuthenticated, isAdmin, isRestaurantAdmin, logout, quickDemoLogin } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ restaurants: [], dishes: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);

  const locations = [
    'Bandra West, Mumbai',
    'Powai, Mumbai',
    'BKC, Mumbai',
    'Lower Parel, Mumbai',
    'Khar West, Mumbai',
  ];

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ restaurants: [], dishes: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          api.get(`/api/restaurants?search=${encodeURIComponent(searchQuery)}`),
          api.get(`/api/menu?search=${encodeURIComponent(searchQuery)}`),
        ]);

        setSearchResults({
          restaurants: restRes.data?.slice(0, 3) || [],
          dishes: menuRes.data?.slice(0, 4) || [],
        });
      } catch (e) {
        console.warn('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Brand & Location */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  CRAVE<span className="text-brand-600">CART</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Artisanal Food
                </span>
              </div>
            </button>

            {/* Location Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-transparent hover:border-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{currentLocation}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLocationMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Select Delivery Locality
                  </div>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        onLocationChange(loc);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-orange-50 hover:text-brand-600 transition-colors ${
                        currentLocation === loc ? 'text-brand-600 font-bold bg-orange-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{loc}</span>
                      {currentLocation === loc && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Live Interactive Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for biryani, pizzas, burgers, or restaurants..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {showSearchDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Searching dishes & restaurants...
                  </div>
                ) : searchResults.restaurants.length === 0 && searchResults.dishes.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500">
                    No culinary results found for "<span className="font-semibold text-slate-800">{searchQuery}</span>"
                  </div>
                ) : (
                  <>
                    {/* Restaurants */}
                    {searchResults.restaurants.length > 0 && (
                      <div className="p-2">
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Restaurants
                        </div>
                        {searchResults.restaurants.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                              onNavigate('restaurant', r.id);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={r.image_url}
                                alt={r.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                              <div>
                                <h6 className="text-xs font-bold text-slate-900 group-hover:text-brand-600">
                                  {r.name}
                                </h6>
                                <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.cuisine_types}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              ★ {r.rating}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Dishes */}
                    {searchResults.dishes.length > 0 && (
                      <div className="p-2">
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Dishes
                        </div>
                        {searchResults.dishes.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                              onNavigate('restaurant', d.restaurant_id);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={d.is_veg ? 'badge-veg flex-shrink-0' : 'badge-nonveg flex-shrink-0'} />
                              <div>
                                <h6 className="text-xs font-bold text-slate-900 group-hover:text-brand-600">
                                  {d.name}
                                </h6>
                                <p className="text-[11px] text-slate-400">by {d.restaurant_name}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              ₹{d.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Links, Cart, Auth */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Quick Demo Switcher (Presenter / Evaluator Tool) */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-[11px] font-bold text-brand-700 hover:bg-orange-100 transition-colors shadow-2xs"
                title="Quick 1-Click Role Switcher for College Presentation"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-brand-600" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in text-xs">
                  <div className="px-3 py-1 font-bold text-slate-900 border-b border-slate-100 flex items-center justify-between">
                    <span>Quick Login (Demo)</span>
                    <span className="text-[10px] text-brand-600 font-mono">Password123!</span>
                  </div>
                  <button
                    onClick={() => {
                      quickDemoLogin('customer');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Aarav Sharma</div>
                      <div className="text-[10px] text-slate-500">customer@example.com (Customer)</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">User</span>
                  </button>
                  <button
                    onClick={() => {
                      quickDemoLogin('restaurant_admin');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Chef Vikram Mehra</div>
                      <div className="text-[10px] text-slate-500">restaurant@example.com (Partner)</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">Manager</span>
                  </button>
                  <button
                    onClick={() => {
                      quickDemoLogin('admin');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">System Admin</div>
                      <div className="text-[10px] text-slate-500">admin@example.com (SuperAdmin)</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Admin Dashboard Link (if admin or manager) */}
            {isRestaurantAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage.startsWith('admin')
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden md:inline">Admin Portal</span>
              </button>
            )}

            {/* Orders History Link */}
            {isAuthenticated && (
              <button
                onClick={() => onNavigate('orders')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentPage === 'orders'
                    ? 'bg-orange-50 text-brand-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>My Orders</span>
              </button>
            )}

            {/* Cart Button with Glowing Live Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm group"
            >
              <ShoppingBag className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Basket</span>
              {totalCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-brand-500 text-white text-[11px] font-extrabold animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-fade-in text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-brand-700">
                        {user?.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Manage Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Order History</span>
                    </button>

                    {isRestaurantAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('admin-dashboard');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-brand-600 font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5 text-brand-500" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3 animate-fade-in">
            <div className="px-2">
              <input
                type="text"
                placeholder="Search food or restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 rounded-lg text-xs"
              />
            </div>
            <div className="flex flex-col gap-1 text-sm font-semibold">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Restaurants
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('orders');
                  }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  My Orders
                </button>
              )}
              {isRestaurantAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin-dashboard');
                  }}
                  className="text-left px-3 py-2 rounded-lg text-brand-600"
                >
                  Admin Portal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
