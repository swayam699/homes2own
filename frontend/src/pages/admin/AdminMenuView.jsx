import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  Flame,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const AdminMenuView = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRestId, setSelectedRestId] = useState('');
  const [vegFilter, setVegFilter] = useState('all');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_veg: 1,
    is_available: 1,
    is_popular: 0,
  });

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { showToast } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, restRes] = await Promise.all([
        api.get('/api/menu'),
        api.get('/api/restaurants'),
      ]);

      if (menuRes.success && menuRes.data) setMenuItems(menuRes.data);
      if (restRes.success && restRes.data) {
        setRestaurants(restRes.data);
        if (restRes.data.length > 0 && !formData.restaurant_id) {
          setFormData((prev) => ({ ...prev, restaurant_id: restRes.data[0].id }));
        }
      }
    } catch (err) {
      showToast('Could not load menu items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (item) => {
    try {
      const res = await api.patch(`/api/menu/${item.id}/availability`);
      if (res.success) {
        showToast(res.message, 'info');
        setMenuItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, is_available: res.is_available } : m))
        );
      }
    } catch (err) {
      showToast('Could not toggle item availability.', 'error');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      restaurant_id: restaurants[0]?.id || '',
      name: '',
      description: '',
      price: '',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80',
      is_veg: 1,
      is_available: 1,
      is_popular: 0,
    });
    setFormModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      restaurant_id: item.restaurant_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      is_veg: item.is_veg,
      is_available: item.is_available,
      is_popular: item.is_popular,
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await api.put(`/api/menu/${currentId}`, formData);
        if (res.success) {
          showToast(`Dish "${formData.name}" updated!`, 'success');
        }
      } else {
        const res = await api.post('/api/menu', formData);
        if (res.success) {
          showToast(`New dish "${formData.name}" added to menu!`, 'success');
        }
      }
      setFormModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.data?.message || 'Failed to save menu item.', 'error');
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await api.delete(`/api/menu/${itemToDelete.id}`);
      if (res.success) {
        showToast(`Menu item "${itemToDelete.name}" deleted.`, 'info');
        fetchData();
      }
    } catch (err) {
      showToast('Could not delete dish.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filtered = menuItems.filter((item) => {
    if (selectedRestId && item.restaurant_id !== parseInt(selectedRestId, 10)) return false;
    if (vegFilter === 'veg' && !item.is_veg) return false;
    if (vegFilter === 'nonveg' && item.is_veg) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.restaurant_name?.toLowerCase().includes(term) ||
        item.category_name?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage dishes, pricing, veg classifications and live availability</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search dish by name, category, or kitchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Restaurant Filter */}
          <select
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Veg/Non-Veg Filter */}
          <select
            value={vegFilter}
            onChange={(e) => setVegFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="all">All Diets</option>
            <option value="veg">Vegetarian Only</option>
            <option value="nonveg">Non-Vegetarian Only</option>
          </select>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Dish</th>
                <th className="px-5 py-3.5">Kitchen</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Diet</th>
                <th className="px-5 py-3.5">Stock Availability</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400">
                    Loading menu catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400">
                    No dishes found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{item.restaurant_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{item.category_name}</td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">₹{item.price}</td>
                    <td className="px-5 py-3.5">
                      <span className={item.is_veg ? 'badge-veg' : 'badge-nonveg'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        <span>{item.is_available ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Dish"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Form Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Menu Dish' : 'Add New Menu Dish'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Restaurant</label>
                <select
                  required
                  value={formData.restaurant_id}
                  onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Awadhi Dum Chicken Biryani"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="350.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diet Classification</label>
                  <select
                    value={formData.is_veg}
                    onChange={(e) => setFormData({ ...formData, is_veg: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value={1}>Pure Vegetarian</option>
                    <option value={0}>Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Appetizing description of ingredients and spices..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_available === 1}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked ? 1 : 0 })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Available in Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_popular === 1}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked ? 1 : 0 })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Featured / Bestseller</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {isEditing ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Menu Dish?"
        message={`Are you sure you want to remove "${itemToDelete?.name}" from the menu? Customers will no longer be able to add this item.`}
        confirmText="Delete Dish"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};
