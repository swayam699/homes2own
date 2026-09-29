import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Check } from 'lucide-react';

export const CartDrawer = ({ onNavigateCheckout, onExplore }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    discountAmount,
    grandTotal,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApply = async (codeToUse) => {
    const code = codeToUse || couponInput;
    if (!code) return;
    setApplyingCoupon(true);
    try {
      await applyCouponCode(code);
      setCouponInput('');
    } catch (e) {
      // Handled in context
    } finally {
      setApplyingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Your Basket</h2>
                <p className="text-xs text-slate-500">
                  {cart.restaurant ? cart.restaurant.name : '0 items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-500 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Your basket is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore top-rated restaurants nearby and add some delicious gourmet dishes to your cart.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (onExplore) onExplore();
                  }}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <>
                {/* Restaurant Info Pill */}
                <div className="flex items-center justify-between p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{cart.restaurant?.name}</h4>
                    <span className="text-[11px] text-slate-500">Estimated delivery: {cart.restaurant?.deliveryTime}</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-medium text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className={item.is_veg ? 'badge-veg mt-1 flex-shrink-0' : 'badge-nonveg mt-1 flex-shrink-0'} />
                        <div className="min-w-0">
                          <h5 className="font-medium text-sm text-slate-900 truncate">{item.name}</h5>
                          <span className="text-xs text-slate-500 font-semibold">₹{item.price}</span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-50 text-slate-600 rounded-l-md transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-50 text-brand-600 rounded-r-md transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupons Section */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    <span>Apply Coupon</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                          <p className="text-[11px] text-emerald-600">Saved ₹{appliedCoupon.discount}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCouponCode}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500 uppercase placeholder:normal-case"
                        />
                        <button
                          onClick={() => handleApply()}
                          disabled={applyingCoupon || !couponInput.trim()}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          {applyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>

                      {/* Coupon Quick Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          onClick={() => handleApply('WELCOME50')}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-orange-100 text-brand-700 hover:bg-orange-200 transition-colors"
                        >
                          WELCOME50 (50% OFF)
                        </button>
                        <button
                          onClick={() => handleApply('FEAST20')}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
                        >
                          FEAST20 (20% OFF)
                        </button>
                        <button
                          onClick={() => handleApply('FREESHIP')}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                        >
                          FREESHIP (Free Delivery)
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Bill Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-800">₹{cart.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className={cart.deliveryFee === 0 ? 'text-emerald-600 font-semibold' : 'text-slate-800 font-semibold'}>
                      {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST & Restaurant Charges (5%)</span>
                    <span className="font-semibold text-slate-800">₹{cart.taxAmount}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>To Pay</span>
                    <span className="text-brand-600 text-base">₹{grandTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (onNavigateCheckout) onNavigateCheckout();
                }}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-medium text-orange-100">{cart.totalCount} items</span>
                  <span>₹{grandTotal}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
