import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Heart,
  Scale,
  Calendar,
  MessageSquare,
  PhoneCall,
  Settings,
  Sparkles,
  Building,
  CheckCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import PropertyCard from '../components/common/PropertyCard';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const notify = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'saved';

  const [profile, setProfile] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Preferences State
  const [prefForm, setPrefForm] = useState({
    name: '',
    phone: '',
    preferred_locations: '',
    preferred_configurations: '',
    min_budget: '',
    max_budget: '',
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profRes, favRes, enqRes, svRes, cbRes] = await Promise.all([
          client.get('/api/users/profile'),
          client.get('/api/favourites'),
          client.get('/api/enquiries/my'),
          client.get('/api/site-visits/my'),
          client.get('/api/callbacks/my'),
        ]);

        if (profRes.success) {
          setProfile(profRes.profile);
          setPrefForm({
            name: profRes.profile.name || '',
            phone: profRes.profile.phone || '',
            preferred_locations: profRes.profile.preferred_locations || '',
            preferred_configurations: profRes.profile.preferred_configurations || '',
            min_budget: profRes.profile.min_budget || '',
            max_budget: profRes.profile.max_budget || '',
          });

          // Fetch recommended based on preferred location or configuration
          const loc = profRes.profile.preferred_locations?.split(',')[0]?.trim();
          const recRes = await client.get(`/api/properties?limit=3${loc ? `&locality=${encodeURIComponent(loc)}` : ''}`);
          if (recRes.success) setRecommended(recRes.properties);
        }

        if (favRes.success) setFavourites(favRes.favourites);
        if (enqRes.success) setEnquiries(enqRes.enquiries);
        if (svRes.success) setSiteVisits(svRes.site_visits);
        if (cbRes.success) setCallbacks(cbRes.callbacks);
      } catch (err) {
        console.warn('Dashboard data fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await client.put('/api/users/profile', prefForm);
      if (res.success) {
        setProfile((prev) => ({ ...prev, ...res.user }));
        updateUser(res.user);
        notify.success('Profile and property preferences saved.');
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleRemoveFavourite = async (propertyId) => {
    try {
      await client.delete(`/api/favourites/${propertyId}`);
      setFavourites((prev) => prev.filter((p) => p.id !== propertyId));
      notify.info('Property removed from saved portfolio.');
    } catch (err) {
      notify.error(err.message);
    }
  };

  const tabs = [
    { id: 'saved', label: 'Saved Properties', count: favourites.length, icon: Heart },
    { id: 'enquiries', label: 'Enquiries', count: enquiries.length, icon: MessageSquare },
    { id: 'visits', label: 'Site Visits', count: siteVisits.length, icon: Calendar },
    { id: 'callbacks', label: 'Callbacks', count: callbacks.length, icon: PhoneCall },
    { id: 'preferences', label: 'Profile & Preferences', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#242521] text-white p-6 sm:p-8 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#777B5A] font-semibold">
            Private Customer Portfolio
          </span>
          <h1 className="font-serif text-3xl font-light text-[#F7F5F0]">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-[#D9D4C9]">
            Manage your saved properties, scheduled viewings, and tailored Mumbai recommendations.
          </p>
        </div>
        <Link
          to="/compare"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#242521] bg-[#F7F5F0] hover:bg-white rounded-xs transition-colors shrink-0"
        >
          <Scale className="w-4 h-4 text-[#777B5A]" />
          View Comparison Tray
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#D9D4C9] pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs rounded-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#242521] text-white'
                  : 'bg-white border border-[#D9D4C9] text-[#71716D] hover:text-[#242521]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#777B5A] text-white' : 'bg-[#EFECE3] text-[#242521]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. SAVED PROPERTIES */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-light text-[#242521]">
              Saved Properties ({favourites.length})
            </h2>
            <Link to="/properties" className="text-xs font-semibold text-[#777B5A] hover:underline">
              + Discover More Properties
            </Link>
          </div>

          {favourites.length === 0 ? (
            <div className="bg-white border border-[#D9D4C9] p-12 text-center rounded-xs space-y-3">
              <Heart className="w-10 h-10 text-[#71716D] mx-auto stroke-1" />
              <h3 className="font-serif text-xl text-[#242521]">No Saved Properties Yet</h3>
              <p className="text-xs text-[#71716D] max-w-sm mx-auto">
                Click the heart icon on any property in our catalog to save it to your private portfolio.
              </p>
              <Link
                to="/properties"
                className="mt-2 inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] rounded-xs"
              >
                Browse Mumbai Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favourites.map((prop) => (
                <div key={prop.id} className="relative group">
                  <PropertyCard
                    property={prop}
                    isInitiallyFavourited={true}
                    onFavouriteChange={(propId, isFav) => {
                      if (!isFav) handleRemoveFavourite(propId);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Your Enquiry History ({enquiries.length})
          </h2>

          {enquiries.length === 0 ? (
            <div className="bg-white border border-[#D9D4C9] p-12 text-center rounded-xs space-y-2">
              <MessageSquare className="w-10 h-10 text-[#71716D] mx-auto stroke-1" />
              <h3 className="font-serif text-xl text-[#242521]">No Enquiries Submitted</h3>
              <p className="text-xs text-[#71716D]">
                Enquiries submitted on property pages or via our consultant desks will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Property</th>
                    <th className="p-3.5">Message Summary</th>
                    <th className="p-3.5">Contact Mode</th>
                    <th className="p-3.5">Date Submitted</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE4]">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3.5 font-medium text-[#242521]">
                        {enq.property_title ? (
                          <Link to={`/properties/${enq.property_slug || enq.property_id}`} className="hover:text-[#777B5A]">
                            {enq.property_title}
                          </Link>
                        ) : (
                          'General Mumbai Advisory'
                        )}
                      </td>
                      <td className="p-3.5 text-[#71716D] max-w-xs truncate">{enq.message}</td>
                      <td className="p-3.5 capitalize text-[#242521]">{enq.preferred_contact_method}</td>
                      <td className="p-3.5 text-[#71716D]">{formatDate(enq.created_at)}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs bg-[#242521] text-white">
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. SITE VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Scheduled Site Visits ({siteVisits.length})
          </h2>

          {siteVisits.length === 0 ? (
            <div className="bg-white border border-[#D9D4C9] p-12 text-center rounded-xs space-y-2">
              <Calendar className="w-10 h-10 text-[#71716D] mx-auto stroke-1" />
              <h3 className="font-serif text-xl text-[#242521]">No Site Visits Scheduled</h3>
              <p className="text-xs text-[#71716D]">
                Request private viewing walkthroughs directly from any property detail page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteVisits.map((sv) => (
                <div key={sv.id} className="bg-white border border-[#D9D4C9] p-5 rounded-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#242521]">
                        <Link to={`/properties/${sv.property_slug || sv.property_id}`} className="hover:text-[#777B5A]">
                          {sv.property_title}
                        </Link>
                      </h4>
                      <p className="text-xs text-[#71716D]">{sv.property_address}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                        sv.status === 'Approved'
                          ? 'bg-emerald-800 text-white'
                          : sv.status === 'Completed'
                          ? 'bg-blue-800 text-white'
                          : 'bg-[#777B5A] text-white'
                      }`}
                    >
                      {sv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#F0ECE4]">
                    <div>
                      <span className="text-[10px] text-[#71716D] uppercase block">Scheduled Date</span>
                      <span className="font-semibold text-[#242521]">{sv.preferred_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#71716D] uppercase block">Time Window</span>
                      <span className="font-semibold text-[#242521]">{sv.preferred_time}</span>
                    </div>
                  </div>

                  {sv.consultant_notes && (
                    <div className="p-2.5 bg-[#F7F5F0] rounded-xs text-[11px] text-[#4A4C45]">
                      <strong className="text-[#242521] block">Consultant Notes:</strong>
                      {sv.consultant_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. CALLBACKS */}
      {activeTab === 'callbacks' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Callback Requests ({callbacks.length})
          </h2>

          {callbacks.length === 0 ? (
            <div className="bg-white border border-[#D9D4C9] p-12 text-center rounded-xs space-y-2">
              <PhoneCall className="w-10 h-10 text-[#71716D] mx-auto stroke-1" />
              <h3 className="font-serif text-xl text-[#242521]">No Callbacks Requested</h3>
              <p className="text-xs text-[#71716D]">
                Request expedited telephone consultations from any listing.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Property Association</th>
                    <th className="p-3.5">Preferred Window</th>
                    <th className="p-3.5">Date Requested</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE4]">
                  {callbacks.map((cb) => (
                    <tr key={cb.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3.5 font-medium text-[#242521]">
                        {cb.property_title || 'General Property Inquiry'}
                      </td>
                      <td className="p-3.5 text-[#242521]">{cb.preferred_time}</td>
                      <td className="p-3.5 text-[#71716D]">{formatDate(cb.created_at)}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs bg-[#242521] text-white">
                          {cb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. PROFILE & PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="max-w-2xl bg-white border border-[#D9D4C9] p-8 rounded-xs shadow-editorial space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-light text-[#242521]">
              Profile & Acquisition Preferences
            </h2>
            <p className="text-xs text-[#71716D] mt-1">
              Customize your target localities and configurations so our consultants can recommend matching inventory.
            </p>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#242521] mb-1">Full Name</label>
                <input
                  type="text"
                  value={prefForm.name}
                  onChange={(e) => setPrefForm({ ...prefForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={prefForm.phone}
                  onChange={(e) => setPrefForm({ ...prefForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#242521] mb-1">
                Preferred Mumbai Localities (comma separated)
              </label>
              <input
                type="text"
                value={prefForm.preferred_locations}
                onChange={(e) => setPrefForm({ ...prefForm, preferred_locations: e.target.value })}
                placeholder="e.g. Bandra West, Worli, BKC, Juhu"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#242521] mb-1">
                Preferred Configurations
              </label>
              <input
                type="text"
                value={prefForm.preferred_configurations}
                onChange={(e) => setPrefForm({ ...prefForm, preferred_configurations: e.target.value })}
                placeholder="e.g. 3 BHK, 4 BHK, Penthouse"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#242521] mb-1">Min Budget (₹)</label>
                <input
                  type="number"
                  value={prefForm.min_budget}
                  onChange={(e) => setPrefForm({ ...prefForm, min_budget: e.target.value })}
                  placeholder="e.g. 30000000"
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  value={prefForm.max_budget}
                  onChange={(e) => setPrefForm({ ...prefForm, max_budget: e.target.value })}
                  placeholder="e.g. 150000000"
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPrefs}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs disabled:opacity-50"
            >
              {savingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* RECOMMENDED PROPERTIES SECTION */}
      {recommended.length > 0 && (
        <section className="pt-10 border-t border-[#D9D4C9] space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
                Tailored Advisory
              </span>
              <h3 className="font-serif text-2xl font-light text-[#242521]">
                Recommended for Your Portfolio
              </h3>
            </div>
            <Link to="/properties" className="text-xs font-semibold text-[#777B5A] hover:underline">
              Explore All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommended.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
