import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  Compass,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import PropertyCard from '../components/common/PropertyCard';
import EnquiryModal from '../components/common/EnquiryModal';
import client from '../api/client';
import { formatIndianPrice } from '../utils/formatters';

export default function HomePage() {
  const navigate = useNavigate();

  // Search Filter State in Hero
  const [searchParams, setSearchParams] = useState({
    transaction_type: 'Buy',
    locality: '',
    property_type: '',
    configuration: '',
    max_price: '',
    q: '',
  });

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [newDevelopments, setNewDevelopments] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // 1. Featured properties
        const featRes = await client.get('/api/properties?is_featured=1&limit=4');
        if (featRes.success) setFeaturedProperties(featRes.properties);

        // 2. New developments
        const devRes = await client.get('/api/properties?possession_status=Under%20Construction&limit=3');
        if (devRes.success) setNewDevelopments(devRes.properties);

        // 3. Recent listings
        const recRes = await client.get('/api/properties?sort=newest&limit=3');
        if (recRes.success) setRecentListings(recRes.properties);

        // 4. Locations
        const locRes = await client.get('/api/locations');
        if (locRes.success) setLocations(locRes.locations.slice(0, 8));
      } catch (err) {
        console.warn('Home data fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const queryParts = [];
    if (searchParams.transaction_type) queryParts.push(`transaction_type=${encodeURIComponent(searchParams.transaction_type)}`);
    if (searchParams.locality) queryParts.push(`locality=${encodeURIComponent(searchParams.locality)}`);
    if (searchParams.property_type) queryParts.push(`property_type=${encodeURIComponent(searchParams.property_type)}`);
    if (searchParams.configuration) queryParts.push(`configuration=${encodeURIComponent(searchParams.configuration)}`);
    if (searchParams.max_price) queryParts.push(`max_price=${encodeURIComponent(searchParams.max_price)}`);
    if (searchParams.q) queryParts.push(`search=${encodeURIComponent(searchParams.q)}`);

    navigate(`/properties?${queryParts.join('&')}`);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center bg-[#242521] text-white overflow-hidden">
        {/* Subtle Architectural Background Photo */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Mumbai Architecture"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#242521] via-[#242521]/90 to-transparent z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#777B5A] font-semibold">
                Mumbai Advisory & Property Consultancy
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 border border-white/20 rounded-xs text-[10px] text-[#D9D4C9] font-mono tracking-wider">
                MahaRERA: A011182502918
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] text-[#F7F5F0]">
              Find a Place That Feels Like Yours.
            </h1>
            <p className="text-sm sm:text-base text-[#D9D4C9] font-light leading-relaxed">
              Explore homes, new developments and investment opportunities across Mumbai with guidance from HOMES2OWN.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setIsConsultModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#777B5A] hover:bg-[#64684A] transition-colors rounded-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Talk to a Consultant
              </button>
              <Link
                to="/explore-mumbai"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#D9D4C9] border border-[#71716D] hover:border-white hover:text-white transition-colors rounded-xs"
              >
                Explore Mumbai Localities
              </Link>
            </div>
          </div>

          {/* Real Property Search Interface */}
          <div className="mt-12 bg-white text-[#242521] rounded-xs shadow-editorial border border-[#D9D4C9] p-5 sm:p-6 max-w-4xl">
            <form onSubmit={handleHeroSearch} className="space-y-4">
              
              {/* Buy / Rent Toggle */}
              <div className="flex border-b border-[#F0ECE4] pb-3 gap-6">
                <button
                  type="button"
                  onClick={() => setSearchParams({ ...searchParams, transaction_type: 'Buy' })}
                  className={`text-xs uppercase tracking-wider font-semibold pb-1.5 transition-all ${
                    searchParams.transaction_type === 'Buy'
                      ? 'text-[#242521] border-b-2 border-[#777B5A]'
                      : 'text-[#71716D] hover:text-[#242521]'
                  }`}
                >
                  Buy Property
                </button>
                <button
                  type="button"
                  onClick={() => setSearchParams({ ...searchParams, transaction_type: 'Rent' })}
                  className={`text-xs uppercase tracking-wider font-semibold pb-1.5 transition-all ${
                    searchParams.transaction_type === 'Rent'
                      ? 'text-[#242521] border-b-2 border-[#777B5A]'
                      : 'text-[#71716D] hover:text-[#242521]'
                  }`}
                >
                  Rent Property
                </button>
              </div>

              {/* Input Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                
                {/* Locality */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-[#71716D]">
                    Locality / Area
                  </label>
                  <select
                    value={searchParams.locality}
                    onChange={(e) => setSearchParams({ ...searchParams, locality: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  >
                    <option value="">All Mumbai Localities</option>
                    <option value="Bandra West">Bandra West</option>
                    <option value="Worli">Worli</option>
                    <option value="Lower Parel">Lower Parel</option>
                    <option value="BKC">BKC</option>
                    <option value="Juhu">Juhu</option>
                    <option value="Powai">Powai</option>
                    <option value="Marine Drive">Marine Drive</option>
                    <option value="Malabar Hill">Malabar Hill</option>
                    <option value="Khar West">Khar West</option>
                  </select>
                </div>

                {/* Property Type */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-[#71716D]">
                    Property Type
                  </label>
                  <select
                    value={searchParams.property_type}
                    onChange={(e) => setSearchParams({ ...searchParams, property_type: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  >
                    <option value="">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                    <option value="Office">Office</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                {/* Configuration */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-[#71716D]">
                    Configuration
                  </label>
                  <select
                    value={searchParams.configuration}
                    onChange={(e) => setSearchParams({ ...searchParams, configuration: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  >
                    <option value="">Any BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="5 BHK+">5 BHK+</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-[#71716D]">
                    Max Budget
                  </label>
                  <select
                    value={searchParams.max_price}
                    onChange={(e) => setSearchParams({ ...searchParams, max_price: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  >
                    <option value="">Any Budget</option>
                    {searchParams.transaction_type === 'Buy' ? (
                      <>
                        <option value="30000000">Up to ₹3.0 Cr</option>
                        <option value="60000000">Up to ₹6.0 Cr</option>
                        <option value="100000000">Up to ₹10.0 Cr</option>
                        <option value="250000000">Up to ₹25.0 Cr</option>
                        <option value="500000000">Up to ₹50.0 Cr+</option>
                      </>
                    ) : (
                      <>
                        <option value="100000">Up to ₹1.0 L/mo</option>
                        <option value="200000">Up to ₹2.0 L/mo</option>
                        <option value="400000">Up to ₹4.0 L/mo</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Project or Keyword */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-[#71716D]">
                    Project / Developer
                  </label>
                  <input
                    type="text"
                    value={searchParams.q}
                    onChange={(e) => setSearchParams({ ...searchParams, q: e.target.value })}
                    placeholder="e.g. Godrej, Sea Front"
                    className="w-full px-2.5 py-2 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  />
                </div>

              </div>

              {/* Search Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs"
                >
                  <Search className="w-4 h-4" />
                  Search Properties
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-3 border-b border-[#D9D4C9]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
              Curated Advisory Collection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#242521] mt-1">
              Featured Properties
            </h2>
          </div>
          <Link
            to="/properties"
            className="text-xs font-semibold uppercase tracking-wider text-[#242521] hover:text-[#777B5A] transition-colors mt-2 sm:mt-0 flex items-center gap-1"
          >
            Explore Complete Portfolio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-[#EFECE3] animate-pulse rounded-xs"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 3. NEW DEVELOPMENTS & TIMELINE */}
      <section className="bg-[#EFECE3] py-16 border-y border-[#D9D4C9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
              Under-Construction & Upcoming Projects
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#242521] mt-1">
              New Developments in Mumbai
            </h2>
            <p className="text-xs text-[#71716D] mt-2 leading-relaxed">
              Track live milestone progression and investment pricing across iconic developments rising along Mumbai’s skyline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newDevelopments.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXPLORE MUMBAI BY NEIGHBOURHOOD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-3 border-b border-[#D9D4C9]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
              Mumbai Regional Guide
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#242521] mt-1">
              Explore Mumbai Localities
            </h2>
          </div>
          <Link
            to="/explore-mumbai"
            className="text-xs font-semibold uppercase tracking-wider text-[#242521] hover:text-[#777B5A] transition-colors mt-2 sm:mt-0 flex items-center gap-1"
          >
            All 20 Localities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              to={`/properties?location_id=${loc.id}`}
              className="group relative h-48 rounded-xs overflow-hidden border border-[#D9D4C9] bg-[#242521] shadow-subtle"
            >
              <img
                src={loc.image_url}
                alt={loc.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#242521] via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] tracking-wider uppercase text-[#D9D4C9] block">
                  {loc.region}
                </span>
                <h4 className="font-serif text-lg font-bold text-white group-hover:text-[#777B5A] transition-colors">
                  {loc.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#A8A296] mt-0.5">
                  <span>{loc.property_count || loc.live_property_count || 5}+ listings</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. RESIDENTIAL & COMMERCIAL CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#D9D4C9] p-8 sm:p-12 rounded-xs">
          <div className="max-w-xl mb-8">
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
              Asset Typology
            </span>
            <h2 className="font-serif text-3xl font-light text-[#242521] mt-1">
              Residential & Commercial Portfolio
            </h2>
            <p className="text-xs text-[#71716D] mt-2">
              Browse tailored Mumbai properties by purpose and zoning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/properties?property_type=Apartment"
              className="p-5 border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs bg-[#F7F5F0] transition-all group"
            >
              <Building2 className="w-6 h-6 text-[#777B5A] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg font-semibold text-[#242521]">Luxury Apartments</h3>
              <p className="text-xs text-[#71716D] mt-1">2, 3 & 4 BHK contemporary highrises in Lower Parel, Bandra & Worli.</p>
            </Link>

            <Link
              to="/properties?property_type=Penthouse"
              className="p-5 border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs bg-[#F7F5F0] transition-all group"
            >
              <Sparkles className="w-6 h-6 text-[#777B5A] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg font-semibold text-[#242521]">Sky Penthouses</h3>
              <p className="text-xs text-[#71716D] mt-1">Duplex terrace residences overlooking the Arabian Sea and Back Bay.</p>
            </Link>

            <Link
              to="/properties?property_type=Villa"
              className="p-5 border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs bg-[#F7F5F0] transition-all group"
            >
              <Compass className="w-6 h-6 text-[#777B5A] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg font-semibold text-[#242521]">Beachfront Villas</h3>
              <p className="text-xs text-[#71716D] mt-1">Independent landed bungalow estates in Juhu Beach and Malabar Hill.</p>
            </Link>

            <Link
              to="/properties?property_type=Office"
              className="p-5 border border-[#D9D4C9] hover:border-[#777B5A] rounded-xs bg-[#F7F5F0] transition-all group"
            >
              <TrendingUp className="w-6 h-6 text-[#777B5A] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-serif text-lg font-semibold text-[#242521]">Grade-A Commercial</h3>
              <p className="text-xs text-[#71716D] mt-1">LEED-certified headquarters plates in BKC and Lower Parel.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW HOMES2OWN HELPS BUYERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-[#242521] text-white p-8 sm:p-12 rounded-xs">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold">
              The HOMES2OWN Difference
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#F7F5F0] leading-snug">
              Bespoke Guidance Through Every Stage of Your Mumbai Acquisition.
            </h2>
            <p className="text-xs text-[#D9D4C9] leading-relaxed">
              Navigating Mumbai’s nuanced real estate landscape demands clear-eyed architectural critique, legal title vetting, and discreet negotiation.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 bg-[#2A2B27] border border-[#3C3E2C] rounded-xs space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#777B5A]" />
              <h4 className="font-serif text-base font-semibold text-white">Title & RERA Verification</h4>
              <p className="text-xs text-[#A8A296] leading-relaxed">
                Thorough audit of sanctioned plans, commencement certificates, encumbrance history, and MahaRERA milestones.
              </p>
            </div>

            <div className="p-5 bg-[#2A2B27] border border-[#3C3E2C] rounded-xs space-y-2">
              <Building2 className="w-6 h-6 text-[#777B5A]" />
              <h4 className="font-serif text-base font-semibold text-white">Carpet Area & Layout Audit</h4>
              <p className="text-xs text-[#A8A296] leading-relaxed">
                Precise structural evaluation of usable carpet area vs loading factors, floorplate orientation, and ventilation.
              </p>
            </div>

            <div className="p-5 bg-[#2A2B27] border border-[#3C3E2C] rounded-xs space-y-2">
              <TrendingUp className="w-6 h-6 text-[#777B5A]" />
              <h4 className="font-serif text-base font-semibold text-white">Institutional Price Intelligence</h4>
              <p className="text-xs text-[#A8A296] leading-relaxed">
                Micro-market transaction data and historical registration values ensuring optimal capital entry points.
              </p>
            </div>

            <div className="p-5 bg-[#2A2B27] border border-[#3C3E2C] rounded-xs space-y-2">
              <Compass className="w-6 h-6 text-[#777B5A]" />
              <h4 className="font-serif text-base font-semibold text-white">Private Escorted Viewings</h4>
              <p className="text-xs text-[#A8A296] leading-relaxed">
                Coordinated private access with senior developer management, sample residence walkthroughs, and site inspections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONSULTANT ENQUIRY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#D9D4C9] bg-white rounded-xs p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold">
              Private Consultation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#242521]">
              Consult with a Mumbai Property Advisor
            </h2>
            <p className="text-xs text-[#71716D] leading-relaxed">
              Whether you are seeking a generational sea-facing residence, evaluating pre-launch terms, or divesting prime commercial assets, our senior consultants provide confidential, impartial advice.
            </p>
            <div className="pt-2 space-y-2 text-xs text-[#242521]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#777B5A]" />
                <span>Zero spam, strict NDA confidentiality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#777B5A]" />
                <span>Direct access to verified developer inventories</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#777B5A]" />
                <span>Complimentary legal document review</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F5F0] border border-[#D9D4C9] p-6 rounded-xs">
            <h3 className="font-serif text-lg font-bold text-[#242521] mb-4">
              Request an Advisory Session
            </h3>
            <button
              onClick={() => setIsConsultModalOpen(true)}
              className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs shadow-subtle mb-3"
            >
              Open Consultation Form
            </button>
            <p className="text-[11px] text-[#71716D] text-center">
              Or call our Mumbai headquarters directly at <strong className="text-[#242521]">+91 96645 86316</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 8. RECENT PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-[#D9D4C9]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
              Fresh to Market
            </span>
            <h2 className="font-serif text-3xl font-light text-[#242521] mt-1">
              Recently Listed Properties
            </h2>
          </div>
          <Link
            to="/properties?sort=newest"
            className="text-xs font-semibold uppercase tracking-wider text-[#242521] hover:text-[#777B5A] transition-colors"
          >
            View All New Listings →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentListings.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* Interactive Modal */}
      <EnquiryModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        initialTab="enquiry"
      />

    </div>
  );
}
