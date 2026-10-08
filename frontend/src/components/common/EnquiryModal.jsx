import React, { useState } from 'react';
import { X, Calendar, Phone, Mail, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import client from '../../api/client';

export default function EnquiryModal({
  isOpen,
  onClose,
  property = null,
  initialTab = 'enquiry', // 'enquiry' | 'visit' | 'callback'
}) {
  const { user } = useAuth();
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);

  // Common Form States
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    preferred_contact_method: 'phone',
    message: property ? `I am interested in ${property.title}. Please provide more information.` : '',
    preferred_date: '',
    preferred_time: 'Morning 10:00 AM - 01:00 PM',
    visitor_count: 2,
    callback_time: 'Anytime during business hours',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await client.post('/api/enquiries', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferred_contact_method: formData.preferred_contact_method,
        property_id: property?.id || null,
        message: formData.message,
      });

      setSubmittedMessage(res.message || 'Thank you for your enquiry. A HOMES2OWN consultant will contact you shortly.');
      notify.success('Enquiry registered successfully.');
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSiteVisitSubmit = async (e) => {
    e.preventDefault();
    if (!formData.preferred_date) {
      notify.error('Please select a visit date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await client.post('/api/site-visits', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        property_id: property?.id || 1,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        visitor_count: formData.visitor_count,
        notes: formData.message,
      });

      setSubmittedMessage(res.message || 'Site visit request registered. Our consultant will confirm your slot.');
      notify.success('Site visit scheduled.');
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await client.post('/api/callbacks', {
        name: formData.name,
        phone: formData.phone,
        property_id: property?.id || null,
        preferred_time: formData.callback_time,
        message: formData.message,
      });

      setSubmittedMessage(res.message || 'Callback request submitted. A consultant will call you shortly.');
      notify.success('Callback requested.');
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242521]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs shadow-editorial overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D9D4C9] bg-white">
          <div>
            <span className="font-serif text-lg font-bold text-[#242521]">
              Consultation & Inquiries
            </span>
            {property && (
              <p className="text-xs text-[#71716D] line-clamp-1 mt-0.5">
                Regarding: <strong className="text-[#242521]">{property.title}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#71716D] hover:text-[#242521] transition-colors rounded-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {!submittedMessage && (
          <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider border-b border-[#D9D4C9] bg-[#EFECE3]">
            <button
              onClick={() => setActiveTab('enquiry')}
              className={`py-3 text-center transition-colors ${
                activeTab === 'enquiry'
                  ? 'bg-[#F7F5F0] text-[#242521] border-b-2 border-[#777B5A]'
                  : 'text-[#71716D] hover:text-[#242521]'
              }`}
            >
              Enquire
            </button>
            <button
              onClick={() => setActiveTab('visit')}
              className={`py-3 text-center transition-colors ${
                activeTab === 'visit'
                  ? 'bg-[#F7F5F0] text-[#242521] border-b-2 border-[#777B5A]'
                  : 'text-[#71716D] hover:text-[#242521]'
              }`}
            >
              Site Visit
            </button>
            <button
              onClick={() => setActiveTab('callback')}
              className={`py-3 text-center transition-colors ${
                activeTab === 'callback'
                  ? 'bg-[#F7F5F0] text-[#242521] border-b-2 border-[#777B5A]'
                  : 'text-[#71716D] hover:text-[#242521]'
              }`}
            >
              Callback
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {submittedMessage ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#777B5A] mx-auto" />
              <h4 className="font-serif text-xl font-bold text-[#242521]">Submission Confirmed</h4>
              <p className="text-xs text-[#71716D] leading-relaxed max-w-sm mx-auto">
                {submittedMessage}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form
              onSubmit={
                activeTab === 'enquiry'
                  ? handleEnquirySubmit
                  : activeTab === 'visit'
                  ? handleSiteVisitSubmit
                  : handleCallbackSubmit
              }
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium text-[#242521] mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Merchant"
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
                {activeTab !== 'callback' && (
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
                )}
              </div>

              {/* Tab specific fields */}
              {activeTab === 'enquiry' && (
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
              )}

              {activeTab === 'visit' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#242521] mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      name="preferred_date"
                      required
                      min={minDate}
                      value={formData.preferred_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#242521] mb-1">Preferred Time *</label>
                    <select
                      name="preferred_time"
                      value={formData.preferred_time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                    >
                      <option value="Morning 10:00 AM - 01:00 PM">Morning (10:00 AM - 1:00 PM)</option>
                      <option value="Afternoon 02:00 PM - 04:00 PM">Afternoon (2:00 PM - 4:00 PM)</option>
                      <option value="Evening 04:00 PM - 06:30 PM">Evening (4:00 PM - 6:30 PM)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'callback' && (
                <div>
                  <label className="block font-medium text-[#242521] mb-1">Preferred Callback Window</label>
                  <select
                    name="callback_time"
                    value={formData.callback_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  >
                    <option value="Immediately (Within 30 mins)">Immediately (Within 30 mins)</option>
                    <option value="Today Evening (5 PM - 8 PM)">Today Evening (5 PM - 8 PM)</option>
                    <option value="Tomorrow Morning (10 AM - 12 PM)">Tomorrow Morning (10 AM - 12 PM)</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#242521] mb-1">
                  {activeTab === 'visit' ? 'Visitor Notes / Requirements' : 'Message / Specific Enquiries'}
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details regarding your preferred floor, budget, or family requirements..."
                  className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] transition-colors rounded-xs disabled:opacity-50"
                >
                  {submitting
                    ? 'Transmitting Request...'
                    : activeTab === 'enquiry'
                    ? 'Submit Enquiry'
                    : activeTab === 'visit'
                    ? 'Confirm Site Visit Request'
                    : 'Request Immediate Callback'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
