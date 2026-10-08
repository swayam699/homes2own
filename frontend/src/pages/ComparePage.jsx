import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Trash2, ArrowRight, Building, Check, X, PhoneCall } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import EnquiryModal from '../components/common/EnquiryModal';
import {
  formatIndianPrice,
  formatArea,
  formatPricePerSqft,
} from '../utils/formatters';

export default function ComparePage() {
  const { comparedProperties, removeFromComparison, clearComparisons } = useComparison();
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openEnquiry = (property) => {
    setSelectedPropertyForModal(property);
    setModalOpen(true);
  };

  if (comparedProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Scale className="w-12 h-12 text-[#71716D] mx-auto stroke-1" />
        <h2 className="font-serif text-3xl font-light text-[#242521]">
          No Properties in Comparison Tray
        </h2>
        <p className="text-xs text-[#71716D] max-w-sm mx-auto">
          Add up to three properties from our Mumbai catalog to compare carpet areas, pricing, specifications, and possession timelines side-by-side.
        </p>
        <Link
          to="/properties"
          className="inline-block px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] rounded-xs hover:bg-[#777B5A] transition-colors"
        >
          Explore Properties
        </Link>
      </div>
    );
  }

  // Get distinct list of all amenities present across compared properties
  const allAmenities = Array.from(
    new Set(
      comparedProperties.flatMap((p) => (p.amenities ? p.amenities.map((a) => a.name) : []))
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Clear Action */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 pb-4 border-b border-[#D9D4C9]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
            Analytical Comparison
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#242521] mt-1">
            Property Comparison Matrix
          </h1>
          <p className="text-xs text-[#71716D] mt-1">
            Comparing {comparedProperties.length} of max 3 properties
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparedProperties.length < 3 && (
            <Link
              to="/properties"
              className="text-xs font-semibold uppercase tracking-wider text-[#777B5A] hover:underline"
            >
              + Add Another Property
            </Link>
          )}
          <button
            onClick={clearComparisons}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Tray
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white border border-[#D9D4C9] rounded-xs shadow-editorial">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D9D4C9] bg-[#F7F5F0]">
              <th className="p-4 w-1/4 font-semibold text-[#71716D] uppercase tracking-wider text-[11px]">
                Specification Metric
              </th>
              {comparedProperties.map((prop) => (
                <th key={prop.id} className="p-4 w-1/4 align-top">
                  <div className="space-y-3">
                    <div className="relative aspect-[16/10] bg-[#EFECE3] rounded-xs overflow-hidden">
                      <img
                        src={prop.primary_image || prop.image_url}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFromComparison(prop.id)}
                        className="absolute top-2 right-2 p-1 bg-[#242521]/70 hover:bg-rose-700 text-white rounded-xs transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-serif text-base font-bold text-[#242521] line-clamp-1">
                        <Link to={`/properties/${prop.slug || prop.id}`} className="hover:text-[#777B5A]">
                          {prop.title}
                        </Link>
                      </h4>
                      <p className="text-[11px] text-[#71716D]">{prop.location_name || 'Mumbai'}</p>
                    </div>

                    <button
                      onClick={() => openEnquiry(prop)}
                      className="w-full py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] rounded-xs transition-colors"
                    >
                      Enquire on Unit
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F0ECE4]">
            {/* Price */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Indicative Price</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 font-serif text-lg font-bold text-[#242521]">
                  {formatIndianPrice(p.price, p.transaction_type)}
                </td>
              ))}
            </tr>

            {/* Price Per Sq Ft */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Price Per Sq.Ft.</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 text-[#71716D]">
                  {formatPricePerSqft(p.price_per_sqft)}
                </td>
              ))}
            </tr>

            {/* Configuration */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Configuration</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 font-medium text-[#242521]">
                  {p.configuration} ({p.bedrooms} Beds, {p.bathrooms} Baths)
                </td>
              ))}
            </tr>

            {/* Carpet Area */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Carpet Area</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 font-medium text-[#242521]">
                  {formatArea(p.carpet_area)}
                </td>
              ))}
            </tr>

            {/* Developer */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Developer</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 text-[#242521]">
                  {p.developer_name || 'Independent Luxury'}
                </td>
              ))}
            </tr>

            {/* Locality */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Locality & Address</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 text-[#71716D]">
                  {p.location_name} — {p.address}
                </td>
              ))}
            </tr>

            {/* Possession Status */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Possession Timeline</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 text-[#242521]">
                  {p.possession_status} ({p.possession_date || 'Ready'})
                </td>
              ))}
            </tr>

            {/* Availability */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Availability Status</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-xs bg-[#242521] text-white">
                    {p.availability_status}
                  </span>
                </td>
              ))}
            </tr>

            {/* Parking */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Reserved Parking</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 text-[#242521]">
                  {p.parking_spaces || 1} Bays
                </td>
              ))}
            </tr>

            {/* Furnishing */}
            <tr>
              <td className="p-4 font-semibold text-[#242521] bg-[#FDFCFB]">Furnishing</td>
              {comparedProperties.map((p) => (
                <td key={p.id} className="p-4 text-[#242521]">
                  {p.furnishing || 'Semi-Furnished'}
                </td>
              ))}
            </tr>

            {/* Amenities Matrix */}
            {allAmenities.map((amenityName) => (
              <tr key={amenityName}>
                <td className="p-4 text-[#71716D] bg-[#FDFCFB]">{amenityName}</td>
                {comparedProperties.map((p) => {
                  const hasAmenity = p.amenities?.some((a) => a.name === amenityName);
                  return (
                    <td key={p.id} className="p-4">
                      {hasAmenity ? (
                        <Check className="w-4 h-4 text-[#777B5A]" />
                      ) : (
                        <span className="text-[#A8A296]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        property={selectedPropertyForModal}
      />

    </div>
  );
}
