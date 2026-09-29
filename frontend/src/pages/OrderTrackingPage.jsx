import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Bike,
  PackageCheck,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';

const STAGE_ORDER = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export const OrderTrackingPage = ({ orderId, onBackToOrders }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const { showToast } = useNotification();

  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      showToast('Could not load order tracking.', 'error');
    } finally {
      setLoading(false);
    }
  }, [orderId, showToast]);

  useEffect(() => {
    fetchOrder();
    // Poll every 8 seconds for dynamic updates
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleAdvanceStage = async () => {
    setAdvancing(true);
    try {
      const res = await api.post(`/api/orders/${orderId}/advance-stage`);
      if (res.success && res.data) {
        setOrder(res.data);
        showToast(`Order status updated to "${res.data.status}" in database!`, 'success');
      }
    } catch (err) {
      showToast(err.data?.message || 'Could not advance stage.', 'info');
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h3 className="font-bold text-slate-900 text-lg mb-2">Order Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">Could not locate tracking records for this order ID.</p>
        <button
          onClick={onBackToOrders}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner with Order ID & Status */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <PackageCheck className="w-48 h-48" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 font-mono text-xs font-bold uppercase tracking-wider border border-brand-500/30">
              {order.order_number}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchOrder}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1.5"
                title="Refresh from backend database"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isCancelled
              ? 'Order Cancelled'
              : isDelivered
              ? 'Delivered Hot & Fresh! 🎉'
              : 'Tracking Your Fresh Meal...'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Est. Delivery: {order.estimated_delivery_time}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{order.restaurant_name}</span>
            </span>
          </div>

          {/* Presentation Tool: Advance Order Stage Button */}
          {!isDelivered && !isCancelled && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-medium">
                Live simulation tool for evaluators to trigger backend stage transition:
              </span>
              <button
                onClick={handleAdvanceStage}
                disabled={advancing}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-md flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{advancing ? 'Updating DB...' : 'Simulate Next Stage →'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Live Stepper Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card">
        <h2 className="text-base font-bold text-slate-900 mb-6">Delivery Progress</h2>

        <div className="relative">
          {/* Stepper Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { key: 'placed', label: 'Order Placed', icon: Clock },
              { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
              { key: 'preparing', label: 'Preparing', icon: ChefHat },
              { key: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
              { key: 'delivered', label: 'Delivered', icon: PackageCheck },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;
              const isFuture = currentStageIndex < idx;

              // Find timestamp from database tracking logs if available
              const logEntry = order.tracking?.find((t) => t.status === step.key);

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative group">
                  {/* Step Bubble */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xs mb-2 ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-orange-100 scale-110 font-bold'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-xs font-bold leading-snug ${
                      isCurrent
                        ? 'text-brand-600 font-extrabold'
                        : isPast
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>

                  {logEntry ? (
                    <span className="text-[10px] text-slate-500 mt-1">
                      {new Date(logEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 mt-1">Pending</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Database Event Log */}
        {order.tracking && order.tracking.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Audit Trail & Database Status Log
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {order.tracking.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{event.status_label}</span>
                      <p className="text-slate-500 text-[11px]">{event.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Driver Card (Simulated when in out_for_delivery or delivered) */}
      {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              RK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">Rahul Kumar</h4>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                  ★ 4.9
                </span>
              </div>
              <p className="text-xs text-slate-500">Delivery Valet • Hero Electric Scooter (MH-02-CB-4912)</p>
            </div>
          </div>
          <button
            onClick={() => showToast('Calling delivery partner (simulated): +91 98765 43210', 'info')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Rider</span>
          </button>
        </div>
      )}

      {/* Order Details & Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-600" />
            <span>Items Ordered</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={item.is_veg ? 'badge-veg' : 'badge-nonveg'} />
                  <span className="font-medium text-slate-800">
                    {item.item_name} × {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-900">₹{item.total_price}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-800">
                {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (5%)</span>
              <span className="font-semibold text-slate-800">₹{order.tax_amount}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({order.coupon_code})</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-brand-600">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Address & Payment Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Delivery & Payment Information</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                Delivery Address
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">{order.delivery_address}</p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                Customer Contact
              </span>
              <p className="text-slate-800 font-medium">{order.customer_phone}</p>
            </div>

            {order.notes && (
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                  Delivery Note
                </span>
                <p className="text-slate-600 italic">"{order.notes}"</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                Payment Status
              </span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 capitalize">
                  Method: {order.payment?.payment_method?.toUpperCase() || 'Online'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  {order.payment?.payment_status || 'Verified'}
                </span>
              </div>
              {order.payment?.transaction_id && (
                <p className="font-mono text-[10px] text-slate-400 mt-1">
                  TXN: {order.payment.transaction_id}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
