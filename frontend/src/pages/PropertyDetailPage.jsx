import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building,
  Heart,
  Scale,
  Calendar,
  ShieldCheck,
  Check,
  PhoneCall,
  Download,
  Share2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Layers,
  ArrowRight,
  Info,
  Waves,
  Dumbbell,
  Home,
  Car,
  Compass,
  Trees,
  Smile,
  Trophy,
  ArrowUpCircle,
  Zap,
  UserCheck,
  BatteryCharging,
} from 'lucide-react';
import EnquiryModal from '../components/common/EnquiryModal';
import PropertyCard from '../components/common/PropertyCard';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useComparison } from '../context/ComparisonContext';
import { useNotification } from '../context/NotificationContext';
import {
  formatIndianPrice,
  formatArea,
  formatPricePerSqft,
  formatDate,
  getWhatsAppLink,
} from '../utils/formatters';

// Map icon string name to Lucide Icon
const getAmenityIcon = (iconName) => {
  switch (iconName) {
    case 'Waves': return Waves;
    case 'Dumbbell': return Dumbbell;
    case 'Home': return Home;
    case 'Car': return Car;
    case 'Compass': return Compass;
    case 'ShieldCheck': return ShieldCheck;
    case 'Trees': return Trees;
    case 'Smile': return Smile;
    case 'Trophy': return Trophy;
    case 'ArrowUpCircle': return ArrowUpCircle;
    case 'Zap': return Zap;
    case 'Sparkles': return Sparkles;
    case 'UserCheck': return UserCheck;
    case 'BatteryCharging': return BatteryCharging;
    default: return Check;
  }
};

export default function PropertyDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { comparedProperties, addToComparison, removeFromComparison } = useComparison();
  const notify = useNotification();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('enquiry');

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/api/properties/${idOrSlug}`);
        if (res.success && res.property) {
          setProperty(res.property);
          setActiveImageIndex(0);

          // Check if favourited
          if (isAuthenticated) {
            const favRes = await client.get(`/api/favourites/check/${res.property.id}`).catch(() => null);
            if (favRes && favRes.isFavourite) {
              setIsSaved(true);
            }
          }
        }
      } catch (err) {
        notify.error('Property details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-8 bg-[#EFECE3] w-1/3 rounded-xs animate-pulse"></div>
        <div className="h-[480px] bg-[#EFECE3] rounded-xs animate-pulse"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#242521]">Property Not Found</h2>
        <p className="text-xs text-[#71716D]">
          The requested listing may have been unlisted or removed.
        </p>
        <Link
          to="/properties"
          className="inline-block px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] rounded-xs"
        >
          Return to Property Search
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : [
        {
          id: 1,
          image_url:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          caption: property.title,
        },
      ];

  const isCompared = comparedProperties.some((p) => p.id === property.id);

  const toggleFavourite = async () => {
    if (!isAuthenticated) {
      notify.info('Please sign in to save this property.');
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await client.delete(`/api/favourites/${property.id}`);
        setIsSaved(false);
        notify.info('Removed from saved portfolio.');
      } else {
        await client.post(`/api/favourites/${property.id}`);
        setIsSaved(true);
        notify.success('Saved to your private portfolio.');
      }
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Explore ${property.title} in Mumbai with HOMES2OWN`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify.success('Listing URL copied to clipboard.');
    }
  };

  const handleBrochureDownload = () => {
    if (property.brochure_url) {
      notify.info('Opening official architectural brochure preview.');
      window.open(property.brochure_url, '_blank');
    } else {
      notify.info('Direct brochure download unavailable for this demonstration unit. Please request a customized digital dossier from our consultants.');
    }
  };

  const openModal = (tab) => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumbs & Header Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#71716D]">
          <Link to="/" className="hover:text-[#242521]">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-[#242521]">Properties</Link>
          <span>/</span>
          <Link to={`/properties?locality=${encodeURIComponent(property.location_name)}`} className="hover:text-[#242521]">
            {property.location_name}
          </Link>
          <span>/</span>
          <span className="text-[#242521] truncate max-w-xs">{property.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#242521] text-white rounded-xs">
                {property.transaction_type}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#777B5A] text-white rounded-xs">
                {property.configuration}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[#EFECE3] text-[#242521] border border-[#D9D4C9] rounded-xs">
                {property.property_type}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#242521]">
              {property.title}
            </h1>
            <p className="text-xs text-[#71716D] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#777B5A]" />
              {property.address}
            </p>
          </div>

          <div className="flex flex-col lg:items-end">
            <span className="text-[10px] uppercase tracking-wider text-[#71716D]">
              Indicative Valuation
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#242521]">
              {formatIndianPrice(property.price, property.transaction_type)}
            </div>
            {property.price_per_sqft > 0 && (
              <span className="text-xs text-[#71716D]">
                {formatPricePerSqft(property.price_per_sqft)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY & LIGHTBOX */}
      <div className="space-y-3">
        {/* Main Display Image */}
        <div className="relative aspect-[16/9] lg:aspect-[21/9] bg-[#EFECE3] border border-[#D9D4C9] rounded-xs overflow-hidden group">
          <img
            src={images[activeImageIndex]?.image_url}
            alt={images[activeImageIndex]?.caption || property.title}
            className="w-full h-full object-cover"
          />

          {/* Expand Fullscreen / Lightbox Button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-4 right-4 p-2 bg-[#242521]/80 hover:bg-[#242521] text-white rounded-xs backdrop-blur-sm transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Full Gallery ({images.length})</span>
          </button>

          {/* Left / Right Nav Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-[#242521]/60 hover:bg-[#242521] text-white rounded-xs transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#242521]/60 hover:bg-[#242521] text-white rounded-xs transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Caption */}
          {images[activeImageIndex]?.caption && (
            <div className="absolute bottom-3 left-3 bg-[#242521]/80 backdrop-blur-sm px-3 py-1.5 text-xs text-white rounded-xs">
              {images[activeImageIndex].caption}
            </div>
          )}
        </div>

        {/* Thumbnail Filmstrip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-24 h-16 rounded-xs overflow-hidden border shrink-0 transition-all ${
                  activeImageIndex === idx
                    ? 'border-[#777B5A] ring-2 ring-[#777B5A]'
                    : 'border-[#D9D4C9] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN CONTENT & CONVERSION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Specifications, Overview, Highlights, Amenities, etc. */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Key Facts Summary Matrix */}
          <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs">
            <h3 className="font-serif text-lg font-semibold text-[#242521] mb-4 pb-2 border-b border-[#F0ECE4]">
              Property Specifications & Facts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Carpet Area</span>
                <span className="font-medium text-[#242521]">{formatArea(property.carpet_area)}</span>
              </div>
              {property.built_up_area && (
                <div>
                  <span className="text-[10px] text-[#71716D] uppercase block">Built-Up Area</span>
                  <span className="font-medium text-[#242521]">{formatArea(property.built_up_area)}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Bedrooms / Baths</span>
                <span className="font-medium text-[#242521]">{property.bedrooms} Beds / {property.bathrooms} Baths</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Floor Vantage</span>
                <span className="font-medium text-[#242521]">{property.floor_number} of {property.total_floors} Floors</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Possession Timeline</span>
                <span className="font-medium text-[#242521]">{property.possession_status} ({property.possession_date || 'Immediate'})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Reserved Parking</span>
                <span className="font-medium text-[#242521]">{property.parking_spaces} Covered Bays</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Furnishing Level</span>
                <span className="font-medium text-[#242521]">{property.furnishing}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">MahaRERA Registration</span>
                <span className="font-medium text-[#242521]">{property.rera_number || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71716D] uppercase block">Inventory Status</span>
                <span className="font-medium text-[#242521]">{property.availability_status}</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          {property.overview && (
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-light text-[#242521] border-b border-[#D9D4C9] pb-2">
                Overview & Architectural Statement
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4C45] leading-relaxed whitespace-pre-line">
                {property.overview}
              </p>
            </div>
          )}

          {/* Highlights */}
          {property.highlights && (
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-light text-[#242521] border-b border-[#D9D4C9] pb-2">
                Residence Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {property.highlights.split('\n').filter(Boolean).map((hl, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-white border border-[#D9D4C9] rounded-xs">
                    <Check className="w-4 h-4 text-[#777B5A] shrink-0 mt-0.5" />
                    <span className="text-[#242521]">{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-light text-[#242521] border-b border-[#D9D4C9] pb-2">
                Curated Amenities & Lifestyle
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((am) => {
                  const IconComp = getAmenityIcon(am.icon);
                  return (
                    <div
                      key={am.id}
                      className="p-3.5 bg-white border border-[#D9D4C9] rounded-xs flex items-center gap-3 text-xs"
                    >
                      <IconComp className="w-4 h-4 text-[#777B5A] shrink-0" />
                      <span className="font-medium text-[#242521]">{am.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specifications */}
          {property.specifications && (
            <div className="space-y-3">
              <h3 className="font-serif text-2xl font-light text-[#242521] border-b border-[#D9D4C9] pb-2">
                Technical Specifications & Fit-Outs
              </h3>
              <p className="text-xs text-[#4A4C45] leading-relaxed whitespace-pre-line bg-white border border-[#D9D4C9] p-4 rounded-xs">
                {property.specifications}
              </p>
            </div>
          )}

          {/* Connectivity & Nearby Landmarks */}
          {(property.connectivity || property.nearby_landmarks) && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-light text-[#242521] border-b border-[#D9D4C9] pb-2">
                Connectivity & Neighbourhood Environs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {property.connectivity && (
                  <div className="p-4 bg-white border border-[#D9D4C9] rounded-xs space-y-2">
                    <span className="font-semibold text-[#242521] block">Transit & Road Access</span>
                    <p className="text-[#71716D] leading-relaxed">{property.connectivity}</p>
                  </div>
                )}
                {property.nearby_landmarks && (
                  <div className="p-4 bg-white border border-[#D9D4C9] rounded-xs space-y-2">
                    <span className="font-semibold text-[#242521] block">Key Clubs & Social Infrastructure</span>
                    <p className="text-[#71716D] leading-relaxed">{property.nearby_landmarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Status Progression Timeline */}
          {property.project_timeline && property.project_timeline.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-light text-[#242521] border-b border-[#D9D4C9] pb-2">
                Development Milestone Progression
              </h3>
              <div className="border-l-2 border-[#777B5A] pl-4 space-y-6">
                {property.project_timeline.map((item, idx) => (
                  <div key={item.id || idx} className="relative space-y-1 text-xs">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#777B5A]"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#242521]">{item.stage}</span>
                      {item.completion_percentage > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#777B5A] text-white rounded-xs">
                          {item.completion_percentage}% Complete
                        </span>
                      )}
                    </div>
                    {item.target_date && (
                      <p className="text-[11px] text-[#71716D]">Target Handover: {item.target_date}</p>
                    )}
                    {item.notes && <p className="text-[#4A4C45]">{item.notes}</p>}
                    <span className="text-[10px] text-[#71716D] block">Recorded: {formatDate(item.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Developer Information Card */}
          {property.developer_name && (
            <div className="bg-[#EFECE3] border border-[#D9D4C9] p-6 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#71716D]">
                    Master Builder & Developer
                  </span>
                  <h4 className="font-serif text-xl font-bold text-[#242521]">
                    {property.developer_name}
                  </h4>
                </div>
                {property.developer_logo && (
                  <img
                    src={property.developer_logo}
                    alt={property.developer_name}
                    className="w-12 h-12 object-cover rounded-xs border border-[#D9D4C9]"
                  />
                )}
              </div>
              <p className="text-xs text-[#4A4C45] leading-relaxed">
                {property.developer_description || 'Premier real estate group delivering landmark Mumbai projects.'}
              </p>
              {property.developer_website && (
                <a
                  href={property.developer_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#242521] hover:text-[#777B5A]"
                >
                  Visit Developer Profile →
                </a>
              )}
            </div>
          )}

        </div>

        {/* Right 1 Column: Sticky Conversion Panel */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 space-y-4">
            
            <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-editorial space-y-5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#71716D] block">
                  Demonstration Asking Price
                </span>
                <div className="font-serif text-3xl font-bold text-[#242521]">
                  {formatIndianPrice(property.price, property.transaction_type)}
                </div>
                <p className="text-[11px] text-[#71716D] mt-0.5">
                  Exclusive of stamp duty, registration & GST
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => openModal('enquiry')}
                  className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs shadow-subtle"
                >
                  Enquire Now
                </button>

                <button
                  onClick={() => openModal('visit')}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-[#242521] border border-[#242521] hover:bg-[#242521] hover:text-white transition-all rounded-xs"
                >
                  Schedule Site Visit
                </button>

                <button
                  onClick={() => openModal('callback')}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-[#242521] border border-[#D9D4C9] hover:border-[#777B5A] hover:text-[#777B5A] transition-colors rounded-xs"
                >
                  Request Callback
                </button>
              </div>

              <div className="border-t border-[#F0ECE4] pt-4 space-y-2.5 text-xs">
                {/* WhatsApp Action */}
                <a
                  href={getWhatsAppLink('+919664586316', property.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs transition-colors font-medium text-[11px]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  WhatsApp Consultant
                </a>

                {/* Brochure Download */}
                <button
                  onClick={handleBrochureDownload}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-[#D9D4C9] hover:border-[#777B5A] text-[#242521] rounded-xs transition-colors text-[11px]"
                >
                  <Download className="w-3.5 h-3.5 text-[#777B5A]" />
                  Download Brochure
                </button>
              </div>

              {/* Tray / Secondary Tool Row */}
              <div className="border-t border-[#F0ECE4] pt-3 flex items-center justify-between text-xs text-[#71716D]">
                <button
                  onClick={toggleFavourite}
                  className="flex items-center gap-1.5 hover:text-[#242521] transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-600 fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() =>
                    isCompared
                      ? removeFromComparison(property.id)
                      : addToComparison(property)
                  }
                  className={`flex items-center gap-1.5 transition-colors ${
                    isCompared ? 'text-[#777B5A] font-semibold' : 'hover:text-[#242521]'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{isCompared ? 'Compared' : 'Compare'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-[#242521] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

            </div>

            {/* Direct Consultant Advisory Card */}
            <div className="bg-[#F7F5F0] border border-[#D9D4C9] p-4 rounded-xs text-xs space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#71716D] block">
                Lead Mumbai Consultant
              </span>
              <p className="font-semibold text-[#242521]">Kabir Varma</p>
              <p className="text-[11px] text-[#71716D]">
                Senior Advisor — Western Suburbs & South Mumbai Luxury
              </p>
              <div className="pt-1 text-[11px] text-[#242521] font-medium">
                Direct Desk: +91 96645 86316
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* SIMILAR PROPERTIES SECTION */}
      {property.similar_properties && property.similar_properties.length > 0 && (
        <section className="pt-10 border-t border-[#D9D4C9] space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
                Related Portfolios
              </span>
              <h3 className="font-serif text-2xl font-light text-[#242521]">
                Similar Properties in {property.location_name}
              </h3>
            </div>
            <Link
              to={`/properties?location_id=${property.location_id}`}
              className="text-xs font-semibold uppercase tracking-wider text-[#242521] hover:text-[#777B5A]"
            >
              View More in Locality →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {property.similar_properties.map((sim) => (
              <PropertyCard key={sim.id} property={sim} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-fade-in">
          <div className="flex items-center justify-between text-white pb-4">
            <span className="text-sm font-medium">
              {property.title} — {activeImageIndex + 1} of {images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center">
            <img
              src={images[activeImageIndex]?.image_url}
              alt=""
              className="max-h-[80vh] max-w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }
                  className="absolute left-2 p-3 bg-black/60 text-white hover:bg-black"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 p-3 bg-black/60 text-white hover:bg-black"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-white/80 text-xs py-2">
            {images[activeImageIndex]?.caption}
          </div>
        </div>
      )}

      {/* Sticky Mobile Conversion Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#242521] text-white p-3 border-t border-[#3C3E2C] flex items-center justify-between shadow-editorial">
        <div>
          <span className="text-[10px] text-[#A8A296] uppercase block">Price</span>
          <span className="font-serif text-base font-bold text-white">
            {formatIndianPrice(property.price, property.transaction_type)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppLink('+919664586316', property.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-emerald-700 text-white rounded-xs"
          >
            <PhoneCall className="w-4 h-4" />
          </a>
          <button
            onClick={() => openModal('enquiry')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#777B5A] rounded-xs"
          >
            Enquire Now
          </button>
        </div>
      </div>

      {/* Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        property={property}
        initialTab={modalTab}
      />

    </div>
  );
}
