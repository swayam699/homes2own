import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  MapPin,
  Clock,
  RotateCw,
  X,
  Check,
} from 'lucide-react';

export const AdminRestaurantsView = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    cuisine_types: '',
    address: '',
    city: 'Mumbai',
    phone: '',
    delivery_time_min: 25,
    delivery_time_max: 35,
    price_for_two: 500,
    rating: 4.5,
    image_url: '',
    banner_url: '',
    description: '',
  });

  // Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);

  const { showToast } = useNotification();

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/restaurants');
      if (res.success && res.data) {
        setRestaurants(res.data);
      }
    } catch (err) {
      showToast('Failed to load restaurants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      cuisine_types: '',
      address: '',
      city: 'Mumbai',
      phone: '+91 22 ',
      delivery_time_min: 25,
      delivery_time_max: 35,
      price_for_two: 500,
      rating: 4.5,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      banner_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      description: '',
    });
    setFormModalOpen(true);
  };

  const openEditModal = (r) => {
    setIsEditing(true);
    setCurrentId(r.id);
    setFormData({
      name: r.name,
      cuisine_types: r.cuisine_types,
      address: r.address,
      city: r.city,
      phone: r.phone || '',
      delivery_time_min: r.delivery_time_min,
      delivery_time_max: r.delivery_time_max,
      price_for_two: r.price_for_two,
      rating: r.rating,
      image_url: r.image_url || '',
      banner_url: r.banner_url || '',
      description: r.description || '',
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await api.put(`/api/restaurants/${currentId}`, formData);
        if (res.success) {
          showToast(`Restaurant "${formData.name}" updated!`, 'success');
        }
      } else {
        const res = await api.post('/api/restaurants', formData);
        if (res.success) {
          showToast(`New restaurant "${formData.name}" added!`, 'success');
        }
      }
      setFormModalOpen(false);
      fetchRestaurants();
    } catch (err) {
      showToast(err.data?.message || 'Operation failed.', 'error');
    }
  };

  const confirmDelete = (r) => {
    setRestaurantToDelete(r);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    try {
      const res = await api.delete(`/api/restaurants/${restaurantToDelete.id}`);
      if (res.success) {
        showToast(`Restaurant "${restaurantToDelete.name}" deleted.`, 'info');
        fetchRestaurants();
      }
    } catch (err) {
      showToast(err.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setRestaurantToDelete(null);
    }
  };

  const filtered = restaurants.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      r.cuisine_types.toLowerCase().includes(term) ||
      r.city.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Restaurant Partners</h1>
          <p className="text-xs text-slate-500 mt-0.5">Add, configure kitchens, update delivery timings and menus</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Restaurant</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by restaurant name, cuisine, locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs font-semibold text-slate-500">{filtered.length} kitchens found</span>
      </div>

      {/* Restaurants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Kitchen</th>
                <th className="px-5 py-3.5">Cuisines</th>
                <th className="px-5 py-3.5">Delivery Time</th>
                <th className="px-5 py-3.5">Cost for Two</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                    Loading restaurants...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                    No restaurants found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.image_url}
                          alt={r.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{r.name}</span>
                          <span className="text-[11px] text-slate-400">{r.address}, {r.city}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{r.cuisine_types}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-semibold">
                      {r.delivery_time_min}-{r.delivery_time_max} mins
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">₹{r.price_for_two}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {r.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Restaurant"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(r)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Restaurant"
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

      {/* Add / Edit Restaurant Form Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Restaurant Partner' : 'Add New Restaurant Partner'}
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
                <label className="block font-semibold text-slate-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Spice Biryani House"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cuisines (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formData.cuisine_types}
                  onChange={(e) => setFormData({ ...formData, cuisine_types: e.target.value })}
                  placeholder="e.g. Indian, Biryani, Mughlai"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot 10, Linking Road"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Deliv. (min)</label>
                  <input
                    type="number"
                    value={formData.delivery_time_min}
                    onChange={(e) => setFormData({ ...formData, delivery_time_min: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Deliv. (min)</label>
                  <input
                    type="number"
                    value={formData.delivery_time_max}
                    onChange={(e) => setFormData({ ...formData, delivery_time_max: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost for Two (₹)</label>
                  <input
                    type="number"
                    value={formData.price_for_two}
                    onChange={(e) => setFormData({ ...formData, price_for_two: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
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
                  {isEditing ? 'Save Changes' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Restaurant?"
        message={`Are you sure you want to permanently delete "${restaurantToDelete?.name}"? All associated menu items and active orders will be impacted.`}
        confirmText="Yes, Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setRestaurantToDelete(null);
        }}
      />
    </div>
  );
};
