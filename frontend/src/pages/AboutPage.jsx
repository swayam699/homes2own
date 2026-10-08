import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building, Award, CheckCircle, MapPin, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
          Corporate Ethos
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#242521] leading-tight">
          Advising Mumbai’s Most Discerning Property Buyers Since 2012.
        </h1>
        <p className="text-sm text-[#71716D] leading-relaxed">
          HOMES2OWN operates as a private client real estate advisory and consultancy practice based in Mumbai. We provide architectural evaluation, financial modeling, and discrete transaction guidance for high-net-worth families, institutional investors, and corporate occupiers.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-[#D9D4C9] p-8 rounded-xs space-y-3 shadow-subtle">
          <Shield className="w-8 h-8 text-[#777B5A]" />
          <h3 className="font-serif text-xl font-bold text-[#242521]">Architectural Rigor</h3>
          <p className="text-xs text-[#71716D] leading-relaxed">
            Every listing accepted onto our platform undergoes structural layout audits, carpet area verification, and inspection of loading efficiencies before client presentation.
          </p>
        </div>

        <div className="bg-white border border-[#D9D4C9] p-8 rounded-xs space-y-3 shadow-subtle">
          <Building className="w-8 h-8 text-[#777B5A]" />
          <h3 className="font-serif text-xl font-bold text-[#242521]">MahaRERA & Title Integrity</h3>
          <p className="text-xs text-[#71716D] leading-relaxed">
            We operate in strict alignment with Maharashtra Real Estate Regulatory Authority standards. We never fabricate registrations and mandate clear disclosure of project status.
          </p>
        </div>

        <div className="bg-white border border-[#D9D4C9] p-8 rounded-xs space-y-3 shadow-subtle">
          <Award className="w-8 h-8 text-[#777B5A]" />
          <h3 className="font-serif text-xl font-bold text-[#242521]">Zero-Conflict Advisory</h3>
          <p className="text-xs text-[#71716D] leading-relaxed">
            Our consultants prioritize long-term asset value and client capital preservation above transaction volume, providing objective guidance across developers and micro-markets.
          </p>
        </div>
      </div>

      {/* Office Locations */}
      <div className="bg-[#242521] text-white p-8 sm:p-12 rounded-xs space-y-6">
        <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
          Mumbai Presence
        </span>
        <h2 className="font-serif text-3xl font-light text-[#F7F5F0]">
          Advisory Desks in Prime Mumbai Business Districts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#3C3E2C] text-xs">
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-white">BKC Headquarters</h4>
            <p className="text-[#A8A296] leading-relaxed">
              Level 9, Platina Corporate Tower, G Block, Bandra Kurla Complex, Mumbai 400051
            </p>
            <p className="text-[#D9D4C9]">Direct Line: +91 22 6120 8800</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-white">Worli Coastal Desk</h4>
            <p className="text-[#A8A296] leading-relaxed">
              Dr. Annie Besant Road, Worli Sea Face, Mumbai 400018
            </p>
            <p className="text-[#D9D4C9]">Direct Line: +91 22 6133 9900</p>
          </div>
        </div>
      </div>

    </div>
  );
}
