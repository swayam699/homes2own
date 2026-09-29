import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import {
  Clock,
  MapPin,
  ChevronRight,
  ShoppingBag,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
} from 'lucide-react';

export const OrderHistoryPage = ({ onTrackOrder, onNavigateRestaurant }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      showToast('Could not load order history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold animate-pulse">
            <Truck className="w-3.5 h-3.5 text-sky-600" /> Out for Delivery
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <ChefHat className="w-3.5 h-3.5 text-amber-600" /> In Kitchen
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-brand-700 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track active deliveries and review your past gourmet orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          title="Refresh orders"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-600 flex items-center justify-center mx-auto mb-4 font-bold">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">No past orders found</h3>
          <p className="text-xs text-slate-500 mb-6">
            You haven't placed any orders yet. Discover delicious dishes from top rated kitchens nearby!
          </p>
          <button
            onClick={() => onNavigateRestaurant(1)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Explore Restaurants
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-card transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {order.restaurant_image && (
                    <img
                      src={order.restaurant_image}
                      alt={order.restaurant_name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{order.restaurant_name}</h3>
                    <p className="text-xs text-slate-400">
                      {order.order_number} • {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-slate-600 space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.item_name} <span className="text-slate-400 font-semibold">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-800">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Amount</span>
                  <span className="text-sm font-extrabold text-slate-900">₹{order.total_amount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateRestaurant(order.restaurant_id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Menu
                  </button>
                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
