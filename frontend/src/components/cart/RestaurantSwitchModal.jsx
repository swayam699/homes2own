import React from 'react';
import { useCart } from '../../context/CartContext';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const RestaurantSwitchModal = () => {
  const { conflictModal, resolveConflict } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Replace items in cart?
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Your basket already contains items from <span className="font-semibold text-slate-900">"{conflictModal.currentRestaurantName}"</span>. A new order can only contain items from one restaurant at a time.
        </p>

        <div className="p-3.5 bg-slate-50 rounded-xl mb-6 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium text-slate-800">{conflictModal.currentRestaurantName}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-brand-600">{conflictModal.newRestaurantName}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => resolveConflict(false)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Keep Existing
          </button>
          <button
            onClick={() => resolveConflict(true)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};
