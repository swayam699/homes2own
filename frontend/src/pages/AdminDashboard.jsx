import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Building,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  Users,
  MapPin,
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  X,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatIndianPrice, formatDate } from '../utils/formatters';

const CHART_COLORS = ['#777B5A', '#242521', '#A8A296', '#64684A', '#3C3E2C', '#D9D4C9'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const notify = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Property Filters & Search
  const [propSearch, setPropSearch] = useState('');

  // Modals
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Property Form State
  const [propForm, setPropForm] = useState({
    title: '',
    developer_id: '',
    location_id: '',
    transaction_type: 'Buy',
    property_type: 'Apartment',
    configuration: '2 BHK',
    bedrooms: 2,
    bathrooms: 2,
    carpet_area: '',
    built_up_area: '',
    price: '',
    floor_number: 1,
    total_floors: 20,
    possession_status: 'Ready to Move',
    possession_date: '',
    rera_number: 'Not provided',
    parking_spaces: 1,
    furnishing: 'Semi-Furnished',
    availability_status: 'Available',
    is_featured: false,
    is_published: true,
    address: '',
    overview: '',
    highlights: '',
    specifications: '',
    connectivity: '',
    nearby_landmarks: '',
    investment_considerations: '',
    image_url: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, propRes, locRes, devRes, amRes] = await Promise.all([
        client.get('/api/admin/stats'),
        client.get('/api/reports/analytics'),
        client.get('/api/properties?limit=50&is_published=all'),
        client.get('/api/locations'),
        client.get('/api/developers'),
        client.get('/api/amenities'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (propRes.success) setProperties(propRes.properties);
      if (locRes.success) setLocations(locRes.locations);
      if (devRes.success) setDevelopers(devRes.developers);
      if (amRes.success) setAmenities(amRes.amenities);
    } catch (err) {
      notify.error('Admin data load notice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProperty(null);
    setPropForm({
      title: '',
      developer_id: developers[0]?.id || '',
      location_id: locations[0]?.id || '',
      transaction_type: 'Buy',
      property_type: 'Apartment',
      configuration: '2 BHK',
      bedrooms: 2,
      bathrooms: 2,
      carpet_area: '',
      built_up_area: '',
      price: '',
      floor_number: 1,
      total_floors: 20,
      possession_status: 'Ready to Move',
      possession_date: '',
      rera_number: 'Not provided',
      parking_spaces: 1,
      furnishing: 'Semi-Furnished',
      availability_status: 'Available',
      is_featured: false,
      is_published: true,
      address: '',
      overview: '',
      highlights: '',
      specifications: '',
      connectivity: '',
      nearby_landmarks: '',
      investment_considerations: '',
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    });
    setPropertyModalOpen(true);
  };

  const openEditModal = (prop) => {
    setEditingProperty(prop);
    setPropForm({
      title: prop.title || '',
      developer_id: prop.developer_id || '',
      location_id: prop.location_id || '',
      transaction_type: prop.transaction_type || 'Buy',
      property_type: prop.property_type || 'Apartment',
      configuration: prop.configuration || '2 BHK',
      bedrooms: prop.bedrooms || 2,
      bathrooms: prop.bathrooms || 2,
      carpet_area: prop.carpet_area || '',
      built_up_area: prop.built_up_area || '',
      price: prop.price || '',
      floor_number: prop.floor_number || 1,
      total_floors: prop.total_floors || 20,
      possession_status: prop.possession_status || 'Ready to Move',
      possession_date: prop.possession_date || '',
      rera_number: prop.rera_number || 'Not provided',
      parking_spaces: prop.parking_spaces || 1,
      furnishing: prop.furnishing || 'Semi-Furnished',
      availability_status: prop.availability_status || 'Available',
      is_featured: !!prop.is_featured,
      is_published: !!prop.is_published,
      address: prop.address || '',
      overview: prop.overview || '',
      highlights: prop.highlights || '',
      specifications: prop.specifications || '',
      connectivity: prop.connectivity || '',
      nearby_landmarks: prop.nearby_landmarks || '',
      investment_considerations: prop.investment_considerations || '',
      image_url: prop.primary_image || '',
    });
    setPropertyModalOpen(true);
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...propForm,
        images: propForm.image_url ? [{ image_url: propForm.image_url, is_primary: 1 }] : [],
      };

      if (editingProperty) {
        await client.put(`/api/properties/${editingProperty.id}`, payload);
        notify.success('Property updated successfully.');
      } else {
        await client.post('/api/properties', payload);
        notify.success('New property listing published.');
      }

      setPropertyModalOpen(false);
      fetchData();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleDeleteProperty = async (propId) => {
    try {
      await client.delete(`/api/properties/${propId}`);
      notify.success('Property deleted successfully.');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleTogglePublish = async (prop) => {
    try {
      await client.put(`/api/properties/${prop.id}`, {
        is_published: prop.is_published ? 0 : 1,
      });
      notify.success(`Property ${prop.is_published ? 'unpublished' : 'published'}.`);
      fetchData();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const filteredProperties = properties.filter((p) =>
    propSearch
      ? p.title?.toLowerCase().includes(propSearch.toLowerCase()) ||
        p.location_name?.toLowerCase().includes(propSearch.toLowerCase())
      : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Console Top Header */}
      <div className="bg-[#242521] text-white p-6 sm:p-8 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#777B5A] font-semibold block">
            HOMES2OWN Enterprise Control
          </span>
          <h1 className="font-serif text-3xl font-light text-[#F7F5F0]">
            System Administration Console
          </h1>
          <p className="text-xs text-[#D9D4C9]">
            Full-Spectrum Property Inventory, Closed Deal Values, Developers, and Analytics
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#777B5A] hover:bg-[#64684A] rounded-xs transition-colors shrink-0 shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          Add New Property
        </button>
      </div>

      {/* Top Aggregated Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white border border-[#D9D4C9] p-4 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Total Listings</span>
            <span className="font-serif text-2xl font-bold text-[#242521]">{stats.total_properties}</span>
          </div>

          <div className="bg-white border border-[#D9D4C9] p-4 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Active Catalog</span>
            <span className="font-serif text-2xl font-bold text-emerald-800">{stats.active_listings}</span>
          </div>

          <div className="bg-white border border-[#D9D4C9] p-4 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Registered Users</span>
            <span className="font-serif text-2xl font-bold text-[#242521]">{stats.total_customers}</span>
          </div>

          <div className="bg-white border border-[#D9D4C9] p-4 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Pipeline Leads</span>
            <span className="font-serif text-2xl font-bold text-[#777B5A]">{stats.total_leads}</span>
          </div>

          <div className="bg-white border border-[#D9D4C9] p-4 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Converted Deals</span>
            <span className="font-serif text-2xl font-bold text-emerald-800">{stats.converted_leads}</span>
          </div>

          <div className="bg-white border border-[#D9D4C9] p-4 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Closed Deal Value</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#242521]">
              {formatIndianPrice(stats.closed_deal_value)}
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#D9D4C9] pb-2 text-xs font-medium">
        {[
          { id: 'overview', label: 'Executive Analytics & Reports', icon: BarChart3 },
          { id: 'properties', label: 'Property Inventory CRUD', count: properties.length, icon: Building },
          { id: 'developers', label: 'Developers & Builders', count: developers.length, icon: Users },
          { id: 'locations', label: 'Localities & Benchmark Rates', count: locations.length, icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xs transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#242521] text-white'
                  : 'bg-white border border-[#D9D4C9] text-[#71716D] hover:text-[#242521]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 text-[10px] font-bold rounded-full bg-[#777B5A] text-white">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. ANALYTICS & REPORTS VIEW */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Monthly Trend Chart */}
            <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-subtle space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#242521]">
                  Monthly Engagement Trends (Mumbai Market)
                </h3>
                <p className="text-xs text-[#71716D]">
                  Comparing Leads, General Enquiries, and Coordinated Site Viewings
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthly_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
                    <XAxis dataKey="month" stroke="#71716D" fontSize={11} />
                    <YAxis stroke="#71716D" fontSize={11} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="leads" stroke="#777B5A" strokeWidth={2} name="New Leads" />
                    <Line type="monotone" dataKey="enquiries" stroke="#242521" strokeWidth={2} name="Enquiries" />
                    <Line type="monotone" dataKey="visits" stroke="#A8A296" strokeWidth={2} name="Site Visits" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Properties by Mumbai Locality */}
            <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-subtle space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#242521]">
                  Inventory Distribution Across Mumbai
                </h3>
                <p className="text-xs text-[#71716D]">
                  Active advisory listings concentration by key localities
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.top_locations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
                    <XAxis dataKey="location_name" stroke="#71716D" fontSize={10} interval={0} angle={-25} textAnchor="end" />
                    <YAxis stroke="#71716D" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="property_count" fill="#777B5A" name="Properties" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Lead Stages Breakdown */}
          <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-subtle space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#242521]">
              CRM Pipeline Funnel Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {analytics.lead_stages.map((stage) => (
                <div key={stage.status} className="p-3 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-xs">
                  <span className="text-[10px] text-[#71716D] uppercase block truncate">{stage.status}</span>
                  <span className="font-serif text-xl font-bold text-[#242521]">{stage.count}</span>
                  {stage.total_value > 0 && (
                    <span className="text-[10px] text-[#777B5A] block mt-0.5 truncate">
                      {formatIndianPrice(stage.total_value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROPERTY INVENTORY CRUD */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-light text-[#242521]">
              Manage Property Catalog ({properties.length})
            </h2>

            {/* Quick Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={propSearch}
                onChange={(e) => setPropSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
              />
            </div>
          </div>

          <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Property Title</th>
                  <th className="p-3.5">Locality</th>
                  <th className="p-3.5">Configuration</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Carpet Area</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Live</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#242521]">
                      <Link to={`/properties/${prop.slug || prop.id}`} className="hover:text-[#777B5A]">
                        {prop.title}
                      </Link>
                    </td>
                    <td className="p-3.5 text-[#71716D]">{prop.location_name}</td>
                    <td className="p-3.5 text-[#242521] font-medium">{prop.configuration}</td>
                    <td className="p-3.5 font-serif font-bold text-[#242521]">
                      {formatIndianPrice(prop.price, prop.transaction_type)}
                    </td>
                    <td className="p-3.5 text-[#71716D]">{prop.carpet_area} sq.ft.</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs bg-[#242521] text-white">
                        {prop.availability_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleTogglePublish(prop)}
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs ${
                          prop.is_published ? 'bg-emerald-800 text-white' : 'bg-gray-400 text-white'
                        }`}
                      >
                        {prop.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(prop)}
                          className="p-1 text-[#242521] hover:text-[#777B5A]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prop.id)}
                          className="p-1 text-rose-700 hover:text-rose-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DEVELOPERS VIEW */}
      {activeTab === 'developers' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Developer Profiles & Partner Groups ({developers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {developers.map((dev) => (
              <div key={dev.id} className="bg-white border border-[#D9D4C9] p-5 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg font-bold text-[#242521]">{dev.name}</h4>
                  {dev.logo_url && (
                    <img src={dev.logo_url} alt="" className="w-8 h-8 rounded-xs object-cover" />
                  )}
                </div>
                <p className="text-xs text-[#71716D] line-clamp-3">{dev.description}</p>
                <div className="pt-2 border-t border-[#F0ECE4] text-[11px] text-[#242521] flex justify-between">
                  <span>Est. {dev.established_year || '1990'}</span>
                  <span>{dev.property_count || 0} Listings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. LOCATIONS VIEW */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Mumbai Localities & Benchmark Price Rates ({locations.length})
          </h2>

          <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Locality Name</th>
                  <th className="p-3.5">Region</th>
                  <th className="p-3.5">Avg Benchmark Rate</th>
                  <th className="p-3.5">Live Properties</th>
                  <th className="p-3.5">Landmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#242521]">{loc.name}</td>
                    <td className="p-3.5 text-[#71716D]">{loc.region}</td>
                    <td className="p-3.5 font-semibold text-[#777B5A]">
                      ₹{Math.round(loc.avg_price_sqft).toLocaleString('en-IN')} / sq.ft.
                    </td>
                    <td className="p-3.5 text-[#242521]">{loc.live_property_count || loc.property_count || 0}</td>
                    <td className="p-3.5 text-[#71716D]">{loc.landmark || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROPERTY MODAL */}
      {propertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242521]/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs shadow-editorial overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 bg-white border-b border-[#D9D4C9] flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#242521]">
                {editingProperty ? 'Edit Property Record' : 'Create New Property Listing'}
              </h3>
              <button
                onClick={() => setPropertyModalOpen(false)}
                className="p-1 text-[#71716D] hover:text-[#242521]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePropertySubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#242521] mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={propForm.title}
                    onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                    placeholder="e.g. Bandra Sea Front Residences"
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#242521] mb-1">Locality *</label>
                  <select
                    required
                    value={propForm.location_id}
                    onChange={(e) => setPropForm({ ...propForm, location_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  >
                    <option value="">Select Locality</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.region})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#242521] mb-1">Transaction *</label>
                  <select
                    value={propForm.transaction_type}
                    onChange={(e) => setPropForm({ ...propForm, transaction_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#242521] mb-1">Property Type *</label>
                  <select
                    value={propForm.property_type}
                    onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                    <option value="Office">Office</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#242521] mb-1">Configuration *</label>
                  <select
                    value={propForm.configuration}
                    onChange={(e) => setPropForm({ ...propForm, configuration: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  >
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="5 BHK+">5 BHK+</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#242521] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={propForm.price}
                    onChange={(e) => setPropForm({ ...propForm, price: e.target.value })}
                    placeholder="e.g. 185000000"
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#242521] mb-1">Carpet Area (sq.ft.) *</label>
                  <input
                    type="number"
                    required
                    value={propForm.carpet_area}
                    onChange={(e) => setPropForm({ ...propForm, carpet_area: e.target.value })}
                    placeholder="e.g. 2850"
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#242521] mb-1">Developer</label>
                  <select
                    value={propForm.developer_id}
                    onChange={(e) => setPropForm({ ...propForm, developer_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                  >
                    <option value="">Independent / None</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>{dev.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={propForm.address}
                  onChange={(e) => setPropForm({ ...propForm, address: e.target.value })}
                  placeholder="Street address in Mumbai"
                  className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Primary Image URL</label>
                <input
                  type="url"
                  value={propForm.image_url}
                  onChange={(e) => setPropForm({ ...propForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Overview Description</label>
                <textarea
                  rows={3}
                  value={propForm.overview}
                  onChange={(e) => setPropForm({ ...propForm, overview: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propForm.is_featured}
                    onChange={(e) => setPropForm({ ...propForm, is_featured: e.target.checked })}
                    className="accent-[#777B5A]"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propForm.is_published}
                    onChange={(e) => setPropForm({ ...propForm, is_published: e.target.checked })}
                    className="accent-[#777B5A]"
                  />
                  <span>Publish to Live Catalog</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#D9D4C9] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold uppercase text-[#71716D] border border-[#D9D4C9] rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] rounded-xs transition-colors"
                >
                  {editingProperty ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242521]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-editorial max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-serif text-lg font-bold">Confirm Deletion</h4>
            </div>
            <p className="text-xs text-[#71716D] leading-relaxed">
              Are you sure you want to permanently delete this property listing? Related images and customer saves will also be purged.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-[#71716D] border border-[#D9D4C9] rounded-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProperty(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-bold uppercase bg-rose-700 hover:bg-rose-800 text-white rounded-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
