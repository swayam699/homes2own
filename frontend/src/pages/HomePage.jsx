import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Star,
  Plus,
  Minus,
  Check,
  Percent,
  SlidersHorizontal,
  X,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Cuisines', icon: '🍽️' },
  { id: 'Biryani', name: 'Biryani', icon: '🍚', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80' },
  { id: 'Pizza', name: 'Woodfired Pizza', icon: '🍕', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
  { id: 'Burgers', name: 'Burgers', icon: '🍔', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
  { id: 'Indian', name: 'North Indian', icon: '🍛', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80' },
  { id: 'Healthy', name: 'Healthy & Bowls', icon: '🥗', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80' },
  { id: 'Beverages', name: 'Shakes & Juices', icon: '🥤', img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&q=80' },
];

export const HomePage = ({ onNavigateRestaurant, currentLocation }) => {
  const { cart, addToCart, updateQuantity, applyCouponCode } = useCart();
  const { showToast } = useNotification();

  const [restaurants, setRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [minRating, setMinRating] = useState(0); // 0 or 4.5
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false); // <= 30 mins
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'delivery_time', 'price_asc', 'price_desc'
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under500', 'above500'

  // Fetch Restaurants & Dishes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [restRes, menuRes] = await Promise.all([
          api.get('/api/restaurants'),
          api.get('/api/menu?isPopular=true'),
        ]);

        if (restRes.success) setRestaurants(restRes.data || []);
        if (menuRes.success) setPopularDishes(menuRes.data || []);
      } catch (err) {
        showToast('Failed to load restaurants. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Client-side filtering & sorting on live restaurant dataset
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Search filter
      if (searchFilter) {
        const term = searchFilter.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(term);
        const matchesCuisine = r.cuisine_types.toLowerCase().includes(term);
        const matchesDesc = r.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesCuisine && !matchesDesc) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (!r.cuisine_types.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Rating filter
      if (minRating > 0 && r.rating < minRating) {
        return false;
      }

      // Fast delivery filter
      if (fastDeliveryOnly && r.delivery_time_max > 30) {
        return false;
      }

      // Price range
      if (priceRange === 'under500' && r.price_for_two > 500) return false;
      if (priceRange === 'above500' && r.price_for_two <= 500) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'delivery_time') return a.delivery_time_min - b.delivery_time_min;
      if (sortBy === 'price_asc') return a.price_for_two - b.price_for_two;
      if (sortBy === 'price_desc') return b.price_for_two - a.price_for_two;
      return b.rating - a.rating;
    });
  }, [restaurants, searchFilter, selectedCategory, minRating, fastDeliveryOnly, priceRange, sortBy]);

  // Filtered popular dishes
  const filteredDishes = useMemo(() => {
    return popularDishes.filter((d) => {
      if (vegOnly && !d.is_veg) return false;
      if (searchFilter) {
        const term = searchFilter.toLowerCase();
        const matchDish = d.name.toLowerCase().includes(term);
        const matchRest = d.restaurant_name?.toLowerCase().includes(term);
        if (!matchDish && !matchRest) return false;
      }
      return true;
    });
  }, [popularDishes, vegOnly, searchFilter]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchFilter !== '' ||
    minRating > 0 ||
    fastDeliveryOnly ||
    vegOnly ||
    priceRange !== 'all' ||
    sortBy !== 'rating';

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchFilter('');
    setMinRating(0);
    setFastDeliveryOnly(false);
    setVegOnly(false);
    setPriceRange('all');
    setSortBy('rating');
  };

  const copyCouponCode = (code) => {
    navigator.clipboard?.writeText(code);
    applyCouponCode(code);
    showToast(`Code "${code}" copied & applied!`, 'success');
  };

  return (
    <div className="min-h-screen pb-16 space-y-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle decorative culinary background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Headline and callouts */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Artisanal Food Ordering</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Authentic culinary flavors, delivered hot in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">
                  30 minutes.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                Handpicked top kitchens in <span className="font-semibold text-white underline decoration-brand-500 decoration-2">{currentLocation}</span>. From slow-dum biryanis to woodfired sourdough pizzas.
              </p>

              {/* In-hero Search Box */}
              <div className="max-w-xl flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-slate-700/50">
                <div className="pl-3.5 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Craving something specific? e.g. Paneer Tikka, Truffle Burger..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400 bg-transparent"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    const el = document.getElementById('explore-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex-shrink-0"
                >
                  Find Food
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 sm:gap-6 pt-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>Avg. 28 Mins Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.7+ Rated Heritage Kitchens</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Real-time Live Order Tracking</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card Carousel */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80"
                    alt="Royal Dum Biryani"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                    <span className="inline-block px-2.5 py-1 rounded bg-brand-600 text-white text-[10px] font-extrabold uppercase tracking-wider mb-2 self-start">
                      Featured Kitchen
                    </span>
                    <h3 className="text-xl font-bold text-white">Mumbai Spice</h3>
                    <p className="text-xs text-slate-300 mb-3">Awadhi Dum Biryani & Royal Charcoal Tikkas</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">★ 4.7 (420+ reviews)</span>
                      <button
                        onClick={() => onNavigateRestaurant(1)}
                        className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-colors"
                      >
                        View Menu →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Offers & Promo Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Offer 1 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">WELCOME50</h4>
                <p className="text-[11px] text-slate-600">Flat 50% OFF up to ₹150 on your first order</p>
              </div>
            </div>
            <button
              onClick={() => copyCouponCode('WELCOME50')}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors flex-shrink-0"
            >
              Apply
            </button>
          </div>

          {/* Offer 2 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-stone-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">FEAST20</h4>
                <p className="text-[11px] text-slate-600">Flat 20% OFF on party orders above ₹400</p>
              </div>
            </div>
            <button
              onClick={() => copyCouponCode('FEAST20')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex-shrink-0"
            >
              Apply
            </button>
          </div>

          {/* Offer 3 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">FREESHIP</h4>
                <p className="text-[11px] text-slate-600">Free delivery on all orders above ₹250</p>
              </div>
            </div>
            <button
              onClick={() => copyCouponCode('FREESHIP')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex-shrink-0"
            >
              Apply
            </button>
          </div>
        </div>
      </section>

      {/* 3. Interactive Food Categories Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Inspiration for your order</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">Click to filter kitchens</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-brand-600 border-brand-600 text-white scale-102 shadow-md shadow-brand-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Filter & Controls Bar */}
      <section id="explore-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters:</span>
            </span>

            {/* Pure Veg Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="badge-veg flex-shrink-0" />
              <span>Pure Veg Dishes</span>
            </button>

            {/* 4.0+ Rating Filter */}
            <button
              onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                minRating > 0
                  ? 'bg-amber-50 border-amber-500 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Rating 4.5+</span>
            </button>

            {/* Fast Delivery Filter */}
            <button
              onClick={() => setFastDeliveryOnly(!fastDeliveryOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                fastDeliveryOnly
                  ? 'bg-orange-50 border-brand-500 text-brand-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Fastest (&le; 30 min)</span>
            </button>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">Price: Any</option>
              <option value="under500">Under ₹500 for two</option>
              <option value="above500">Above ₹500 for two</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="rating">Rating: High to Low</option>
              <option value="delivery_time">Delivery Time: Fastest First</option>
              <option value="price_asc">Cost: Low to High</option>
              <option value="price_desc">Cost: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. Recommended / Popular Dishes Carousel */}
      {filteredDishes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand-600" />
                <span>Trending Signature Dishes</span>
              </h2>
              <p className="text-xs text-slate-500">Crowd favorites prepared to perfection right now</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDishes.slice(0, 4).map((dish) => {
              const inCartItem = cart.items.find((i) => i.menu_item_id === dish.id);

              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card transition-card flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
                      <span className={dish.is_veg ? 'badge-veg' : 'badge-nonveg'} />
                    </div>
                    {dish.is_popular ? (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Bestseller
                      </span>
                    ) : null}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">{dish.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {dish.description}
                      </p>
                      <button
                        onClick={() => onNavigateRestaurant(dish.restaurant_id)}
                        className="text-[11px] font-semibold text-brand-600 hover:underline block mb-3"
                      >
                        by {dish.restaurant_name} →
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-extrabold text-base text-slate-900">₹{dish.price}</span>

                      {inCartItem ? (
                        <div className="flex items-center border border-brand-500 rounded-xl bg-orange-50 shadow-xs">
                          <button
                            onClick={() => updateQuantity(inCartItem.id, inCartItem.quantity - 1)}
                            className="px-2 py-1 text-brand-700 hover:bg-orange-100 rounded-l-lg"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-brand-800">
                            {inCartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(inCartItem.id, inCartItem.quantity + 1)}
                            className="px-2 py-1 text-brand-700 hover:bg-orange-100 rounded-r-lg"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(dish.id, 1)}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Popular / Filtered Restaurants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {searchFilter
                ? `Results for "${searchFilter}"`
                : selectedCategory !== 'all'
                ? `${selectedCategory} Kitchens`
                : 'Top Restaurants for You'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredRestaurants.length} premium restaurant partners near {currentLocation}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4">
                <div className="h-44 bg-slate-200 rounded-xl mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-600 flex items-center justify-center mx-auto mb-4 font-bold">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">No restaurants match your filters</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn't find any dining options matching the selected cuisine, rating, or price criteria. Try adjusting your preferences.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => onNavigateRestaurant(restaurant.id)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card transition-card cursor-pointer group flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-900">{restaurant.rating}</span>
                    <span className="text-[10px] text-slate-400">({restaurant.total_ratings}+)</span>
                  </div>

                  {/* Delivery Time Badge */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-400" />
                    <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} mins</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      <span className="text-xs font-bold text-slate-700">₹{restaurant.price_for_two} for two</span>
                    </div>

                    <p className="text-xs font-medium text-slate-500 truncate mb-2">
                      {restaurant.cuisine_types}
                    </p>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {restaurant.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </span>
                    <span className="text-brand-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                      Menu <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
