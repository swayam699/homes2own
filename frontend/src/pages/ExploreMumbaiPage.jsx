import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Building2, TrendingUp } from 'lucide-react';
import client from '../api/client';
import { formatPricePerSqft } from '../utils/formatters';

export default function ExploreMumbaiPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const res = await client.get('/api/locations');
        if (res.success) {
          setLocations(res.locations);
        }
      } catch (err) {
        console.warn('Failed to load locations:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const regions = ['All', 'South Mumbai', 'South Central Mumbai', 'Western Suburbs', 'Central Mumbai', 'Central Suburbs', 'Eastern Suburbs'];

  const filteredLocations = selectedRegion === 'All'
    ? locations
    : locations.filter((loc) => loc.region === selectedRegion);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
          Mumbai Neighborhood Advisory
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#242521]">
          Explore Mumbai by Locality
        </h1>
        <p className="text-xs sm:text-sm text-[#71716D] leading-relaxed">
          From the storied heritage promenades of South Mumbai to the high-finance towers of BKC and the serene green boulevards of Powai, explore micro-markets with genuine local advisory perspective.
        </p>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#D9D4C9]">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-3.5 py-1.5 text-xs rounded-xs font-medium whitespace-nowrap transition-colors ${
              selectedRegion === region
                ? 'bg-[#242521] text-white'
                : 'bg-white border border-[#D9D4C9] text-[#71716D] hover:text-[#242521]'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-[#EFECE3] rounded-xs animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden flex flex-col justify-between group hover:border-[#777B5A] hover:shadow-editorial transition-all"
            >
              <div className="relative aspect-[16/10] bg-[#EFECE3] overflow-hidden">
                <img
                  src={loc.image_url}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#242521]/80 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-xs">
                  {loc.region}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 text-[#242521] px-2 py-0.5 text-[11px] font-semibold rounded-xs shadow-sm">
                  {loc.live_property_count || loc.property_count || 4} Properties
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#242521] group-hover:text-[#777B5A] transition-colors">
                    {loc.name}
                  </h3>
                  {loc.landmark && (
                    <p className="text-[11px] text-[#71716D] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#777B5A] shrink-0" />
                      Key Landmark: <strong className="text-[#242521]">{loc.landmark}</strong>
                    </p>
                  )}
                  <p className="text-xs text-[#4A4C45] leading-relaxed line-clamp-3">
                    {loc.overview}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0ECE4] flex items-center justify-between text-xs">
                  {loc.avg_price_sqft > 0 ? (
                    <div>
                      <span className="text-[10px] text-[#71716D] uppercase block">Benchmark Rate</span>
                      <span className="font-semibold text-[#242521]">{formatPricePerSqft(loc.avg_price_sqft)}</span>
                    </div>
                  ) : <div></div>}

                  <Link
                    to={`/properties?location_id=${loc.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#242521] hover:text-[#777B5A] transition-colors"
                  >
                    <span>View Properties</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
