import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Building,
  Check,
} from 'lucide-react';
import PropertyCard from '../components/common/PropertyCard';
import client from '../api/client';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters State derived from URL
  const currentSearch = searchParams.get('search') || searchParams.get('q') || '';
  const currentTransaction = searchParams.get('transaction_type') || '';
  const currentPropertyType = searchParams.get('property_type') || '';
  const currentConfig = searchParams.get('configuration') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentLocationId = searchParams.get('location_id') || '';
  const currentLocality = searchParams.get('locality') || '';
  const currentMinArea = searchParams.get('min_area') || '';
  const currentMaxArea = searchParams.get('max_area') || '';
  const currentPossession = searchParams.get('possession_status') || '';
  const currentAvailability = searchParams.get('availability_status') || '';
  const currentAmenities = searchParams.get('amenities') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Data States
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Local Search Input
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch Auxiliary Metadata (Locations & Amenities)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [locRes, amRes] = await Promise.all([
          client.get('/api/locations'),
          client.get('/api/amenities'),
        ]);
        if (locRes.success) setLocations(locRes.locations);
        if (amRes.success) setAmenitiesList(amRes.amenities);
      } catch (err) {
        console.warn('Metadata fetch error:', err.message);
      }
    };
    fetchMeta();
  }, []);

  // Fetch Properties on SearchParam Changes
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        if (!queryParams.has('limit')) queryParams.set('limit', '12');

        const res = await client.get(`/api/properties?${queryParams.toString()}`);
        if (res.success) {
          setProperties(res.properties);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load properties:', err.message);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Update a single filter in the URL
  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  // Toggle an amenity in the comma-separated amenities list
  const toggleAmenity = (slug) => {
    const current = currentAmenities ? currentAmenities.split(',').map((s) => s.trim()) : [];
    let updated;
    if (current.includes(slug)) {
      updated = current.filter((s) => s !== slug);
    } else {
      updated = [...current, slug];
    }
    setFilter('amenities', updated.join(','));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  // Filter Drawer & Sidebar Component
  const FilterContent = () => (
    <div className="space-y-6 text-xs text-[#242521]">
      
      {/* Transaction Type */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Buy', 'Rent'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter('transaction_type', currentTransaction === type ? '' : type)}
              className={`py-2 px-3 text-center rounded-xs border font-medium transition-all ${
                currentTransaction === type
                  ? 'bg-[#242521] text-white border-[#242521]'
                  : 'bg-white border-[#D9D4C9] text-[#242521] hover:border-[#777B5A]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Property Type
        </label>
        <select
          value={currentPropertyType}
          onChange={(e) => setFilter('property_type', e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
        >
          <option value="">All Property Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Penthouse">Penthouse</option>
          <option value="Villa">Villa</option>
          <option value="Office">Commercial Office</option>
          <option value="Shop">Retail Shop</option>
          <option value="Commercial">Commercial (General)</option>
          <option value="Plot">Plot / Land</option>
        </select>
      </div>

      {/* Configuration */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Configuration (BHK)
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['Studio', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'].map((cfg) => (
            <button
              key={cfg}
              type="button"
              onClick={() => setFilter('configuration', currentConfig === cfg ? '' : cfg)}
              className={`py-1.5 text-center rounded-xs border text-[11px] font-medium transition-all ${
                currentConfig === cfg
                  ? 'bg-[#777B5A] text-white border-[#777B5A]'
                  : 'bg-white border-[#D9D4C9] text-[#242521] hover:border-[#777B5A]'
              }`}
            >
              {cfg}
            </button>
          ))}
        </div>
      </div>

      {/* Mumbai Locality */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Mumbai Locality
        </label>
        <select
          value={currentLocationId}
          onChange={(e) => setFilter('location_id', e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
        >
          <option value="">All Localities</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.region})
            </option>
          ))}
        </select>
      </div>

      {/* Budget Min / Max */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Budget Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={currentMinPrice}
            onChange={(e) => setFilter('min_price', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={currentMaxPrice}
            onChange={(e) => setFilter('max_price', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
          />
        </div>
      </div>

      {/* Carpet Area (sqft) */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Carpet Area (sq.ft.)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min sqft"
            value={currentMinArea}
            onChange={(e) => setFilter('min_area', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
          />
          <input
            type="number"
            placeholder="Max sqft"
            value={currentMaxArea}
            onChange={(e) => setFilter('max_area', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
          />
        </div>
      </div>

      {/* Possession Status */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Possession Status
        </label>
        <select
          value={currentPossession}
          onChange={(e) => setFilter('possession_status', e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
        >
          <option value="">Any Possession</option>
          <option value="Ready to Move">Ready to Move</option>
          <option value="Under Construction">Under Construction</option>
          <option value="Upcoming">Upcoming</option>
        </select>
      </div>

      {/* Availability Status */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Availability Status
        </label>
        <select
          value={currentAvailability}
          onChange={(e) => setFilter('availability_status', e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
        >
          <option value="">All Availability</option>
          <option value="Available">Available</option>
          <option value="Limited Availability">Limited Availability</option>
          <option value="Sold">Sold</option>
          <option value="Rented">Rented</option>
          <option value="Coming Soon">Coming Soon</option>
        </select>
      </div>

      {/* Key Amenities */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#71716D] mb-2">
          Amenities
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {amenitiesList.map((am) => {
            const isSelected = currentAmenities.split(',').map((s) => s.trim()).includes(am.slug);
            return (
              <label
                key={am.id}
                className="flex items-center gap-2 cursor-pointer hover:text-[#777B5A]"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAmenity(am.slug)}
                  className="rounded-xs accent-[#777B5A]"
                />
                <span className="text-[11px] truncate">{am.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#71716D] border border-[#D9D4C9] hover:text-[#242521] hover:border-[#242521] rounded-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Search Bar Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#D9D4C9]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
            Mumbai Portfolio
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#242521] mt-1">
            Properties in Mumbai
          </h1>
          <p className="text-xs text-[#71716D] mt-1">
            Displaying {pagination.total} demonstration properties across Mumbai
          </p>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71716D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by locality, project, or developer..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filter Sidebar (1 column) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 bg-[#F7F5F0] border border-[#D9D4C9] p-5 rounded-xs shadow-subtle">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D9D4C9]">
              <div className="flex items-center gap-1.5 font-serif font-bold text-base text-[#242521]">
                <Filter className="w-4 h-4 text-[#777B5A]" />
                Refine Search
              </div>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#71716D] hover:text-[#242521] underline"
              >
                Reset
              </button>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Listings Section (3 columns) */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Sorting and Mobile Filter Bar */}
          <div className="flex items-center justify-between bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#242521] border border-[#D9D4C9] rounded-xs hover:border-[#777B5A]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#777B5A]" />
              Filters ({[currentTransaction, currentPropertyType, currentConfig, currentLocationId].filter(Boolean).length})
            </button>

            <div className="text-xs text-[#71716D] hidden sm:block">
              Showing {properties.length} of {pagination.total} results
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <span className="text-[#71716D] hidden md:inline">Sort By:</span>
              <select
                value={currentSort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="px-2.5 py-1.5 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] font-medium focus:border-[#777B5A]"
              >
                <option value="newest">Newest Listings</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Carpet Area: High to Low</option>
                <option value="area_asc">Carpet Area: Low to High</option>
              </select>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-[#EFECE3] rounded-xs animate-pulse"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white border border-[#D9D4C9] p-12 text-center rounded-xs space-y-4">
              <Building className="w-12 h-12 text-[#71716D] mx-auto stroke-1" />
              <h3 className="font-serif text-2xl font-light text-[#242521]">No Properties Match Criteria</h3>
              <p className="text-xs text-[#71716D] max-w-md mx-auto">
                No active property records were found matching your current filter combination. Try clearing some filters or searching a broader locality.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={currentPage <= 1}
                onClick={() => setFilter('page', (currentPage - 1).toString())}
                className="px-3.5 py-1.5 text-xs font-medium border border-[#D9D4C9] rounded-xs disabled:opacity-30 hover:border-[#777B5A]"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter('page', p.toString())}
                  className={`w-8 h-8 text-xs font-medium rounded-xs border transition-colors ${
                    p === currentPage
                      ? 'bg-[#242521] text-white border-[#242521]'
                      : 'border-[#D9D4C9] hover:border-[#777B5A]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setFilter('page', (currentPage + 1).toString())}
                className="px-3.5 py-1.5 text-xs font-medium border border-[#D9D4C9] rounded-xs disabled:opacity-30 hover:border-[#777B5A]"
              >
                Next
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#242521]/50 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-[#F7F5F0] h-full overflow-y-auto p-5 shadow-drawer flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D9D4C9]">
                <span className="font-serif text-lg font-bold text-[#242521]">Filters</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#71716D] hover:text-[#242521]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
            </div>

            <div className="pt-6 border-t border-[#D9D4C9] mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] rounded-xs"
              >
                Apply Filters & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
