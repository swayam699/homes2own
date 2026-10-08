import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ShieldAlert, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#242521] text-[#EFECE3] border-t border-[#32342E] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#32342E]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="HOMES2OWN Logo"
                className="w-12 h-12 object-contain rounded-xs bg-white/5 p-1"
              />
              <div>
                <span className="font-serif text-2xl tracking-widest text-white font-semibold">
                  HOMES<span className="text-[#777B5A]">2</span>OWN
                </span>
                <p className="text-[10px] tracking-[0.25em] text-[#A8A296] uppercase mt-0.5">
                  Mumbai Property Advisory & Consultancy
                </p>
              </div>
            </Link>
            <p className="text-xs text-[#C2BCB0] leading-relaxed max-w-sm">
              HOMES2OWN is a premier real estate advisory firm dedicated to navigating Mumbai’s most sought-after residential and commercial property markets with bespoke architectural insight and end-to-end transaction expertise.
            </p>
            <div className="pt-2 text-xs text-[#A8A296] space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#777B5A] shrink-0" />
                <span>Chembur, Mumbai - 400071, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#777B5A] shrink-0" />
                <span>+91 96645 86316</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#777B5A] shrink-0" />
                <span>advisory@homes2own.com</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#777B5A] shrink-0" />
                <span>MahaRERA Reg. No: <strong className="text-white font-mono">A011182502918</strong></span>
              </div>
            </div>
          </div>

          {/* Key Mumbai Localities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Mumbai Localities
            </h4>
            <ul className="text-xs space-y-2 text-[#C2BCB0]">
              <li><Link to="/properties?locality=Bandra%20West" className="hover:text-white transition-colors">Bandra West & Carter Road</Link></li>
              <li><Link to="/properties?locality=Worli" className="hover:text-white transition-colors">Worli Sea Face</Link></li>
              <li><Link to="/properties?locality=Lower%20Parel" className="hover:text-white transition-colors">Lower Parel & Phoenix District</Link></li>
              <li><Link to="/properties?locality=Juhu" className="hover:text-white transition-colors">Juhu Beachfront</Link></li>
              <li><Link to="/properties?locality=BKC" className="hover:text-white transition-colors">Bandra Kurla Complex (BKC)</Link></li>
              <li><Link to="/properties?locality=Marine%20Drive" className="hover:text-white transition-colors">Marine Drive & Queen’s Necklace</Link></li>
              <li><Link to="/properties?locality=Powai" className="hover:text-white transition-colors">Powai Lake Boulevard</Link></li>
              <li><Link to="/explore-mumbai" className="text-[#777B5A] hover:underline font-medium">Explore All 20 Localities →</Link></li>
            </ul>
          </div>

          {/* Property Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Portfolios
            </h4>
            <ul className="text-xs space-y-2 text-[#C2BCB0]">
              <li><Link to="/properties?configuration=4%20BHK" className="hover:text-white transition-colors">Luxury 4 & 5 BHK Penthouses</Link></li>
              <li><Link to="/properties?property_type=Apartment" className="hover:text-white transition-colors">Prime City Residences</Link></li>
              <li><Link to="/properties?property_type=Villa" className="hover:text-white transition-colors">Beachfront Independent Villas</Link></li>
              <li><Link to="/properties?property_type=Office" className="hover:text-white transition-colors">Grade-A Corporate Plates</Link></li>
              <li><Link to="/properties?transaction_type=Rent" className="hover:text-white transition-colors">High-End Residential Leasing</Link></li>
              <li><Link to="/properties?possession_status=Ready%20to%20Move" className="hover:text-white transition-colors">Ready to Move Resale</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Compare Properties</Link></li>
            </ul>
          </div>

          {/* Quick Consultation & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Advisory Portals
            </h4>
            <ul className="text-xs space-y-2 text-[#C2BCB0]">
              <li><Link to="/contact" className="hover:text-white transition-colors">Schedule Private Viewing</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Advisory Standards</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Client Portfolio Portal</Link></li>
              <li><Link to="/consultant" className="hover:text-white transition-colors">Consultant CRM Access</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Administration Console</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

        </div>

        {/* Legal & Regulatory Demonstration Disclaimer */}
        <div className="pt-8 space-y-4">
          <div className="p-3.5 bg-[#2A2B27] rounded-xs border border-[#3C3E2C] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#777B5A] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#A8A296] leading-relaxed">
              <strong className="text-white">MahaRERA Registered Real Estate Agent: A011182502918.</strong> Properties, prices, architectural metrics, and development timelines showcased on this platform are curated demonstration representations for illustrative consultancy display. All registered trademarks, builder identities, and project titles belong to their respective proprietors. Unverified RERA numbers are marked as &ldquo;Not provided&rdquo;. Always verify statutory title documentation and sanctioned RERA certificates before executing real property contracts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A8A296] pt-2">
            <p>© {new Date().getFullYear()} HOMES2OWN Real Estate Advisory. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-3 sm:mt-0">
              <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/about" className="hover:text-white transition-colors">Terms of Advisory</Link>
              <Link to="/contact" className="hover:text-white transition-colors">MahaRERA Advisory Code</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
