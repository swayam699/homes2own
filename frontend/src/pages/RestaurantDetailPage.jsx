import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  Search,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Flame,
  Check,
  Info,
} from 'lucide-react';

export const RestaurantDetailPage = ({ restaurantId, onBack, onOpenCart }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { showToast } = useNotification();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchMenu, setSearchMenu] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/restaurants/${restaurantId}`);
        if (res.success && res.data) {
          setRestaurant(res.data);
          if (res.data.categories?.length > 0) {
            setActiveCategory(res.data.categories[0].id);
          }
        }
      } catch (err) {
        showToast('Restaurant details could not be loaded.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId, showToast]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Restaurant not found</h3>
        <p className="text-xs text-slate-500 mb-6">The requested restaurant may be temporarily closed or unavailable.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
        >
          Return to Restaurants
        </button>
      </div>
    );
  }

  // Filter categories and menu items
  const filteredCategories = restaurant.categories
    .map((cat) => {
      const items = (cat.items || []).filter((item) => {
        if (vegOnly && !item.is_veg) return false;
        if (searchMenu.trim()) {
          const query = searchMenu.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          return matchName || matchDesc;
        }
        return true;
      });

      return {
        ...cat,
        items,
      };
    })
    .filter((cat) => cat.items.length > 0);

  const cartFromThisRest = cart.restaurant?.id === restaurant.id && cart.totalCount > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-24">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all restaurants</span>
      </button>

      {/* Restaurant Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        {/* Banner Image */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={restaurant.banner_url || restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Quick Badges inside banner */}
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-bold mb-2">
                <span>{restaurant.cuisine_types}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 line-clamp-2">
                {restaurant.description}
              </p>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/95 text-slate-900 px-3 py-1.5 rounded-xl shadow-md backdrop-blur-xs flex-shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold">{restaurant.rating}</span>
                <span className="text-[9px] text-slate-500">{restaurant.total_ratings}+ ratings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Strip */}
        <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} mins delivery</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{restaurant.address}, {restaurant.city}</span>
            </span>
            {restaurant.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{restaurant.phone}</span>
              </span>
            )}
          </div>
          <span className="text-slate-800 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
            ₹{restaurant.price_for_two} for two
          </span>
        </div>
      </div>

      {/* Menu Filter Controls & Category Jump */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Menu Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={`Search dishes in ${restaurant.name}...`}
              value={searchMenu}
              onChange={(e) => setSearchMenu(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:border-brand-500 rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Pure Veg Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-slate-100 border-transparent text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="badge-veg flex-shrink-0" />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          {restaurant.categories.map((cat) => (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition-colors"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      {/* Categorized Menu Items List */}
      <div className="space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm mb-1">No matching dishes</h4>
            <p className="text-xs text-slate-500">
              Try searching for something else or turn off the pure veg filter.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {cat.name} <span className="text-xs font-semibold text-slate-400">({cat.items.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.items.map((item) => {
                  const inCartItem = cart.items.find((ci) => ci.menu_item_id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-card transition-shadow flex gap-4 justify-between"
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={item.is_veg ? 'badge-veg flex-shrink-0' : 'badge-nonveg flex-shrink-0'} />
                            {item.is_popular ? (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5" /> Bestseller
                              </span>
                            ) : null}
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h4>
                          <span className="font-extrabold text-sm text-slate-900 block my-1">
                            ₹{item.price}
                          </span>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Availability Note */}
                        {!item.is_available && (
                          <span className="text-[11px] font-bold text-rose-600 mt-2 block">
                            Currently Sold Out
                          </span>
                        )}
                      </div>

                      {/* Right: Dish Photo & Add Stepper */}
                      <div className="relative w-28 sm:w-32 flex flex-col items-center flex-shrink-0">
                        <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              Delicious Dish
                            </div>
                          )}
                        </div>

                        {/* Add / Stepper Button */}
                        <div className="absolute -bottom-3">
                          {!item.is_available ? (
                            <button
                              disabled
                              className="px-3 py-1 rounded-lg bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
                            >
                              Sold Out
                            </button>
                          ) : inCartItem ? (
                            <div className="flex items-center bg-white border border-brand-500 rounded-xl shadow-md overflow-hidden text-xs font-bold text-brand-700">
                              <button
                                onClick={() => updateQuantity(inCartItem.id, inCartItem.quantity - 1)}
                                className="px-2 py-1 hover:bg-orange-50 text-brand-600 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 py-1 text-slate-900">{inCartItem.quantity}</span>
                              <button
                                onClick={() => updateQuantity(inCartItem.id, inCartItem.quantity + 1)}
                                className="px-2 py-1 hover:bg-orange-50 text-brand-600 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item.id, 1)}
                              className="px-4 py-1.5 rounded-xl bg-white border border-brand-500 text-brand-600 hover:bg-brand-600 hover:text-white text-xs font-extrabold shadow-sm transition-all uppercase tracking-wide flex items-center gap-1"
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
            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Cart Bar if items exist from this restaurant */}
      {cartFromThisRest && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full px-4 animate-slide-up">
          <div
            onClick={onOpenCart}
            className="cursor-pointer bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 hover:bg-slate-850 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">{cart.totalCount} item(s) in basket</span>
                <span className="text-[11px] text-slate-300">from {cart.restaurant?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm text-brand-400">₹{cart.estimatedTotal}</span>
              <span className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm">
                View Basket →
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
