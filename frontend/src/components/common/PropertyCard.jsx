import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Scale, MapPin, Building, ArrowUpRight, Check } from 'lucide-react';
import { formatIndianPrice, formatArea, formatPricePerSqft } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useComparison } from '../../context/ComparisonContext';
import { useNotification } from '../../context/NotificationContext';
import client from '../../api/client';

export default function PropertyCard({ property, isInitiallyFavourited = false, onFavouriteChange }) {
  const { isAuthenticated } = useAuth();
  const { comparedProperties, addToComparison, removeFromComparison } = useComparison();
  const notify = useNotification();
  const navigate = useNavigate();

  const [isFav, setIsFav] = useState(isInitiallyFavourited);
  const [favLoading, setFavLoading] = useState(false);

  const isCompared = comparedProperties.some((p) => p.id === property.id);

  const toggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      notify.info('Please sign in to save properties to your private portfolio.');
      navigate('/login');
      return;
    }

    try {
      setFavLoading(true);
      if (isFav) {
        await client.delete(`/api/favourites/${property.id}`);
        setIsFav(false);
        notify.info(`Removed ${property.title} from saved properties.`);
        if (onFavouriteChange) onFavouriteChange(property.id, false);
      } else {
        await client.post(`/api/favourites/${property.id}`);
        setIsFav(true);
        notify.success(`Saved ${property.title} to your portfolio.`);
        if (onFavouriteChange) onFavouriteChange(property.id, true);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setFavLoading(false);
    }
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(property.id);
    } else {
      addToComparison(property);
    }
  };

  // Image fallback
  const fallbackImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  const displayImage = property.primary_image || property.image_url || fallbackImage;

  return (
    <article className="group bg-white border border-[#D9D4C9] rounded-xs overflow-hidden flex flex-col transition-all duration-300 hover:border-[#777B5A] hover:shadow-editorial">
      
      {/* Property Imagery Box */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EFECE3]">
        <img
          src={displayImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.is_featured ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#242521] text-white rounded-xs">
              Featured
            </span>
          ) : null}
          <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-white/95 text-[#242521] rounded-xs shadow-sm">
            {property.transaction_type || 'Buy'}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide bg-[#777B5A] text-white rounded-xs shadow-sm">
            {property.configuration}
          </span>
        </div>

        {/* Availability Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase rounded-xs shadow-sm ${
              property.availability_status === 'Available'
                ? 'bg-emerald-800 text-white'
                : property.availability_status === 'Sold'
                ? 'bg-rose-800 text-white'
                : 'bg-[#2A2B27] text-white'
            }`}
          >
            {property.availability_status}
          </span>
        </div>

        {/* Quick Action Floating Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {/* Compare toggle */}
          <button
            onClick={toggleCompare}
            title={isCompared ? 'Remove from comparison' : 'Compare property'}
            className={`p-2 rounded-xs backdrop-blur-md transition-all shadow-sm ${
              isCompared
                ? 'bg-[#777B5A] text-white'
                : 'bg-white/90 text-[#242521] hover:bg-white hover:text-[#777B5A]'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          {/* Favourite toggle */}
          <button
            onClick={toggleFavourite}
            disabled={favLoading}
            title={isFav ? 'Remove from saved' : 'Save to portfolio'}
            className={`p-2 rounded-xs backdrop-blur-md transition-all shadow-sm ${
              isFav
                ? 'bg-rose-700 text-white'
                : 'bg-white/90 text-[#242521] hover:bg-white hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Locality Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-[#242521]/80 backdrop-blur-sm px-2 py-1 rounded-xs text-[11px] text-[#EFECE3] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#777B5A]" />
          <span>{property.location_name || 'Mumbai'}</span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-1.5">
          {/* Developer Identity */}
          {property.developer_name && (
            <p className="text-[11px] font-medium tracking-wide uppercase text-[#71716D] flex items-center gap-1">
              <Building className="w-3 h-3 text-[#777B5A]" />
              {property.developer_name}
            </p>
          )}

          {/* Property Name */}
          <h3 className="font-serif text-lg text-[#242521] font-semibold leading-tight line-clamp-1 group-hover:text-[#777B5A] transition-colors">
            <Link to={`/properties/${property.slug || property.id}`}>
              {property.title}
            </Link>
          </h3>

          <p className="text-xs text-[#71716D] line-clamp-1">
            {property.address}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#F0ECE4] text-xs">
          <div>
            <span className="text-[10px] text-[#71716D] uppercase block">Carpet Area</span>
            <span className="font-medium text-[#242521]">{formatArea(property.carpet_area)}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#71716D] uppercase block">Possession</span>
            <span className="font-medium text-[#242521] truncate block">
              {property.possession_status}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#71716D] block">
              Indicative Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#242521]">
                {formatIndianPrice(property.price, property.transaction_type)}
              </span>
            </div>
            {property.price_per_sqft > 0 && (
              <span className="text-[10px] text-[#71716D]">
                {formatPricePerSqft(property.price_per_sqft)}
              </span>
            )}
          </div>

          <Link
            to={`/properties/${property.slug || property.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#242521] border border-[#D9D4C9] hover:bg-[#242521] hover:text-white hover:border-[#242521] transition-all rounded-xs"
          >
            <span>View Property</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </article>
  );
}
