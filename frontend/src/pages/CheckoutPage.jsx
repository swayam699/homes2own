import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../api/client';
import {
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  Globe,
  Tag,
  Check,
  AlertTriangle,
  Lock,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

export const CheckoutPage = ({ onOrderPlaced, onBackToMenu }) => {
  const { user } = useAuth();
  const { cart, appliedCoupon, discountAmount, grandTotal, applyCouponCode, removeCouponCode, fetchCart } = useCart();
  const { showToast } = useNotification();

  // Address & contact
  const [address, setAddress] = useState(user?.address || 'Flat 402, Sea Breeze Heights, Hill Road, Bandra West, Mumbai');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [notes, setNotes] = useState('');

  // Payment method: 'upi', 'card', 'online', 'cod'
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Simulated fields
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Aarav Sharma');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Demo presentation failure toggle
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Coupon box
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCouponCode(couponCode.trim());
      setCouponCode('');
    } catch (e) {
      // Handled in context
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const fillDemoCard = () => {
    setCardNumber('4242 8888 9999 1234');
    setCardExpiry('08/29');
    setCardCvv('789');
    setCardHolder('Aarav Sharma');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.trim()) {
      setErrorMessage('Please provide a complete delivery address.');
      showToast('Delivery address is required.', 'error');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please provide a valid phone number.');
      showToast('Phone number is required.', 'error');
      return;
    }

    if (cart.items.length === 0) {
      setErrorMessage('Your basket is empty.');
      showToast('Basket is empty.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        deliveryAddress: address.trim(),
        customerPhone: phone.trim(),
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        notes: notes.trim(),
        simulateFailure,
        paymentDetails: {
          method: paymentMethod,
          upiId: paymentMethod === 'upi' ? upiId : null,
          bank: paymentMethod === 'online' ? selectedBank : null,
          cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) : null,
        },
      };

      const res = await api.post('/api/orders', orderPayload);

      if (res.success && res.data) {
        showToast('Order placed successfully! Redirecting to tracking...', 'success');
        await fetchCart();
        if (onOrderPlaced) {
          onOrderPlaced(res.data.orderId, res.data.orderNumber);
        }
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to place order.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h3 className="text-xl font-bold text-slate-900 mb-2">No items to checkout</h3>
        <p className="text-xs text-slate-500 mb-6">Your basket is currently empty.</p>
        <button
          onClick={onBackToMenu}
          className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBackToMenu}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout Details Form (7 cols) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Checkout & Payment</h1>
            <p className="text-xs text-slate-500 mt-1">
              Ordering from <span className="font-semibold text-slate-800">{cart.restaurant?.name}</span>
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Payment / Order Notice:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* 1. Delivery Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-brand-600 flex items-center justify-center text-xs">
                1
              </div>
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Delivery Address & Contact</span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address / Flat / Building
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Hill Road, Bandra West, Mumbai"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (for rider contact)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave with guard / ring bell"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Method Simulation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-brand-600 flex items-center justify-center text-xs">
                  2
                </div>
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span>Payment Method (Simulated)</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" /> 256-bit Secure
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-brand-500 bg-orange-50/50 text-brand-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <Smartphone className="w-5 h-5 text-brand-600" />
                <span className="text-xs">UPI / QR</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-brand-500 bg-orange-50/50 text-brand-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-600" />
                <span className="text-xs">Credit/Debit</span>
              </button>

              {/* Netbanking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'online'
                    ? 'border-brand-500 bg-orange-50/50 text-brand-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <Globe className="w-5 h-5 text-brand-600" />
                <span className="text-xs">Netbanking</span>
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-brand-500 bg-orange-50/50 text-brand-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <Banknote className="w-5 h-5 text-brand-600" />
                <span className="text-xs">Cash on Del.</span>
              </button>
            </div>

            {/* Payment Details Container */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Scan QR Code or enter UPI ID</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Zero transaction fee</span>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-700 flex-shrink-0">
                      <QrCode className="w-12 h-12 text-slate-800" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">BHIM UPI</span>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-600">Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setUpiId('aarav@okhdfcbank')}
                          className="text-[10px] text-brand-600 hover:underline font-medium"
                        >
                          Use Demo VPA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Enter Card Information</span>
                    <button
                      type="button"
                      onClick={fillDemoCard}
                      className="text-xs text-brand-600 font-semibold hover:underline"
                    >
                      Fill Demo Card
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on Card"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'online' && (
                <div className="space-y-3">
                  <span className="font-bold text-xs text-slate-800 block">Select Netbanking Gateway</span>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    You will be simulated into the bank gateway for rapid 1-click confirmation.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Cash on Delivery</p>
                  <p>Pay ₹{grandTotal} in cash or via UPI QR to the delivery valet at your doorstep.</p>
                </div>
              )}

              {/* College Presentation Tool: Payment Simulation Toggle */}
              <div className="pt-3 border-t border-slate-200 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span>
                    Simulate Payment Decline / Failure{' '}
                    <span className="text-[10px] text-brand-600 font-mono font-bold">(Evaluator Viva Demo)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
          >
            <span>{isSubmitting ? 'Simulating Order & Payment...' : `Pay ₹${grandTotal} & Place Order`}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        {/* Right Column: Order Summary & Coupon (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary ({cart.totalCount} items)
            </h3>

            {/* Restaurant Badge */}
            <div className="text-xs">
              <span className="text-slate-400 block">From Restaurant</span>
              <span className="font-bold text-slate-900 text-sm">{cart.restaurant?.name}</span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={item.is_veg ? 'badge-veg flex-shrink-0' : 'badge-nonveg flex-shrink-0'} />
                    <span className="font-medium text-slate-800 truncate">
                      {item.name} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                <span>Offers & Coupons</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-600">₹{appliedCoupon.discount} discount applied</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCouponCode}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className={cart.deliveryFee === 0 ? 'text-emerald-600 font-semibold' : 'text-slate-900 font-semibold'}>
                  {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Govt GST (5%)</span>
                <span className="font-semibold text-slate-900">₹{cart.taxAmount}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="text-brand-600 text-lg">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
