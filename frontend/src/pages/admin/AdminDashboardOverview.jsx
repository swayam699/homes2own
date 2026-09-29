import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  ChefHat,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboardOverview = ({ onNavigateOrders }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      showToast('Could not load administrative stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        showToast(`Order status updated to "${newStatus}"!`, 'success');
        fetchStats();
      }
    } catch (err) {
      showToast('Could not update order status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-72 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!stats) return null;

  // Chart data computation: max revenue for scaling SVG bars
  const trends = stats.dailyTrends || [];
  const maxRevenue = Math.max(...trends.map((t) => t.daily_revenue || 0), 1000);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Platform performance, financial metrics & active operations</p>
        </div>
        <button
          onClick={fetchStats}
          className="self-start sm:self-auto px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Verified DB Orders
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalOrders}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Across all restaurants</span>
          </div>
        </div>

        {/* Total Restaurants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Restaurants</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalRestaurants}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Curated culinary partners</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalCustomers}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Registered consumer accounts</span>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600">Pending Orders</span>
              <p className="text-xl font-extrabold text-slate-900">{stats.pendingOrders}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600">Completed Orders</span>
              <p className="text-xl font-extrabold text-slate-900">{stats.completedOrders}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Delivered
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600">Cancelled Orders</span>
              <p className="text-xl font-extrabold text-slate-900">{stats.cancelledOrders}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
            Void
          </span>
        </div>
      </div>

      {/* Visual Analytics: Revenue Trend & Bestsellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Trend</h3>
              <p className="text-xs text-slate-400">Order revenue over recent dates</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Live DB Aggregates
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {trends.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Awaiting order transaction entries...
              </div>
            ) : (
              trends.map((t, idx) => {
                const heightPercent = Math.max(15, Math.round(((t.daily_revenue || 0) / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{t.daily_revenue}
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-brand-500 hover:bg-brand-600 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[50px]">
                      {t.date ? t.date.slice(5) : `Day ${idx + 1}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Popular Dishes Leaderboard (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top-Selling Dishes</h3>
              <p className="text-xs text-slate-400">By quantity sold</p>
            </div>
            <ChefHat className="w-4 h-4 text-brand-600" />
          </div>

          <div className="divide-y divide-slate-100 space-y-1">
            {stats.popularItems?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sold dishes recorded yet.</p>
            ) : (
              stats.popularItems?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{item.item_name}</h5>
                    <p className="text-[11px] text-slate-400">{item.restaurant_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">{item.total_sold} sold</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">₹{item.revenue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live feed with instant status change controls</p>
          </div>
          <button
            onClick={onNavigateOrders}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            View All Orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Order Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Restaurant</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {order.order_number}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 block">{order.customer_name}</span>
                    <span className="text-[11px] text-slate-400">{order.customer_email}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{order.restaurant_name}</td>
                  <td className="px-5 py-3.5 font-extrabold text-slate-900">₹{order.total_amount}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
