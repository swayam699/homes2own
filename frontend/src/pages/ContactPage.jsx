import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import client from '../api/client';
import { useNotification } from '../context/NotificationContext';

export default function ContactPage() {
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_contact_method: 'phone',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await client.post('/api/enquiries', formData);
      setSubmitted(true);
      notify.success(res.message || 'Thank you for your enquiry. A HOMES2OWN consultant will contact you shortly.');
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      <div className="max-w-2xl space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#777B5A] font-semibold block">
          Client Engagement
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#242521]">
          Connect with HOMES2OWN
        </h1>
        <p className="text-xs sm:text-sm text-[#71716D] leading-relaxed">
          Reach out to our senior consultancy team for private viewings, institutional portfolio valuations, or bespoke residential mandates across Mumbai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Info */}
        <div className="space-y-8 bg-white border border-[#D9D4C9] p-8 rounded-xs shadow-subtle text-xs">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-light text-[#242521]">
              Advisory Headquarters
            </h3>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#777B5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#242521] block">Bandra Kurla Complex (BKC) Office</strong>
                <p className="text-[#71716D] mt-0.5">
                  Level 9, Platina Corporate Tower, G Block, BKC, Bandra East, Mumbai, Maharashtra 400051
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#777B5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#242521] block">Telephone Advisory Desk</strong>
                <p className="text-[#71716D] mt-0.5">+91 22 6120 8800 / +91 98201 55443</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#777B5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#242521] block">Confidential Inquiries</strong>
                <p className="text-[#71716D] mt-0.5">advisory@homes2own.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#777B5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#242521] block">Advisory Hours</strong>
                <p className="text-[#71716D] mt-0.5">Monday to Saturday: 09:30 AM – 07:00 PM IST</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0ECE4] text-[11px] text-[#71716D] leading-relaxed">
            All private viewings, developer board presentations, and structural layout inspections require advance coordination with our registered consulting team.
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="bg-[#F7F5F0] border border-[#D9D4C9] p-8 rounded-xs shadow-subtle">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#777B5A] mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-[#242521]">Enquiry Received</h3>
              <p className="text-xs text-[#71716D] max-w-sm mx-auto leading-relaxed">
                Thank you for your enquiry. A HOMES2OWN consultant will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] rounded-xs"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-serif text-xl font-bold text-[#242521] mb-2">
                Submit Confidential Inquiry
              </h3>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Anand Mahindra"
                  className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#242521] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#242521] mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Preferred Contact Mode</label>
                <div className="flex gap-4">
                  {['phone', 'whatsapp', 'email'].map((method) => (
                    <label key={method} className="flex items-center gap-1.5 cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="preferred_contact_method"
                        value={method}
                        checked={formData.preferred_contact_method === method}
                        onChange={handleChange}
                        className="accent-[#777B5A]"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#242521] mb-1">Advisory Mandate / Requirements *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details regarding your preferred Mumbai localities, target configuration, or investment horizon..."
                  className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs disabled:opacity-50"
              >
                {submitting ? 'Transmitting...' : 'Submit Advisory Request'}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
