import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building,
  Calendar,
  MessageSquare,
  PhoneCall,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatIndianPrice, formatDate } from '../utils/formatters';

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const notify = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSection = searchParams.get('sec') || 'overview';

  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lead Filter & Search
  const [leadStatusFilter, setLeadStatusFilter] = useState('');
  const [leadSearch, setLeadSearch] = useState('');

  // Selected Lead Modal / Note
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Site Visit Status Update Modal
  const [editingVisit, setEditingVisit] = useState(null);
  const [visitNotes, setVisitNotes] = useState('');

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes, enqRes, svRes, cbRes, fuRes] = await Promise.all([
        client.get('/api/admin/stats'),
        client.get(`/api/leads${leadStatusFilter ? `?status=${leadStatusFilter}` : ''}`),
        client.get('/api/enquiries'),
        client.get('/api/site-visits'),
        client.get('/api/callbacks'),
        client.get('/api/follow-ups'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (leadsRes.success) setLeads(leadsRes.leads);
      if (enqRes.success) setEnquiries(enqRes.enquiries);
      if (svRes.success) setSiteVisits(svRes.site_visits);
      if (cbRes.success) setCallbacks(cbRes.callbacks);
      if (fuRes.success) setFollowUps(fuRes.follow_ups);
    } catch (err) {
      notify.error('Could not load CRM data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, [leadStatusFilter]);

  // Handle Lead Status Change
  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await client.put(`/api/leads/${leadId}`, { status: newStatus });
      notify.success(`Lead status updated to ${newStatus}`);
      fetchCRMData();
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      notify.error(err.message);
    }
  };

  // Add Internal Note to Lead
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;

    try {
      await client.post(`/api/leads/${selectedLead.id}/notes`, { note: newNote });
      notify.success('Consultant note recorded.');
      setNewNote('');
      // Refresh lead details
      const detailRes = await client.get(`/api/leads/${selectedLead.id}`);
      if (detailRes.success) setSelectedLead(detailRes.lead);
      fetchCRMData();
    } catch (err) {
      notify.error(err.message);
    }
  };

  // Open Lead Details Modal
  const openLeadModal = async (leadId) => {
    try {
      const res = await client.get(`/api/leads/${leadId}`);
      if (res.success) {
        setSelectedLead(res.lead);
      }
    } catch (err) {
      notify.error(err.message);
    }
  };

  // Handle Site Visit Status Change
  const handleUpdateSiteVisitStatus = async (visitId, newStatus) => {
    try {
      await client.put(`/api/site-visits/${visitId}`, {
        status: newStatus,
        consultant_notes: visitNotes || 'Confirmed with sales gallery.',
      });
      notify.success(`Site visit updated to ${newStatus}`);
      setEditingVisit(null);
      setVisitNotes('');
      fetchCRMData();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const navItems = [
    { id: 'overview', label: 'CRM Overview', icon: Briefcase },
    { id: 'leads', label: 'Leads Pipeline', count: leads.length, icon: TrendingUp },
    { id: 'enquiries', label: 'Enquiries', count: enquiries.length, icon: MessageSquare },
    { id: 'visits', label: 'Site Visits', count: siteVisits.length, icon: Calendar },
    { id: 'callbacks', label: 'Callbacks', count: callbacks.length, icon: PhoneCall },
    { id: 'followups', label: 'Follow-ups', count: followUps.length, icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Console Bar */}
      <div className="bg-[#242521] text-white p-6 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#777B5A] font-semibold block">
            HOMES2OWN Consultant CRM
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#F7F5F0]">
            Advisory Operations — {user?.name}
          </h1>
          <p className="text-xs text-[#D9D4C9]">
            Active Lead Pipeline, Site Inspection Coordination, and Customer Intake
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/properties"
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#F7F5F0] text-[#242521] hover:bg-white rounded-xs transition-colors"
          >
            Browse Listings
          </Link>
          <Link
            to="/admin"
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[#71716D] text-white hover:border-white rounded-xs transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>

      {/* Live Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Total Properties</span>
            <span className="font-serif text-lg font-bold text-[#242521]">{stats.total_properties}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Active Listings</span>
            <span className="font-serif text-lg font-bold text-[#242521]">{stats.active_listings}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Sold Units</span>
            <span className="font-serif text-lg font-bold text-[#242521]">{stats.sold_properties}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Upcoming Devs</span>
            <span className="font-serif text-lg font-bold text-[#242521]">{stats.upcoming_projects}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Total Leads</span>
            <span className="font-serif text-lg font-bold text-[#777B5A]">{stats.total_leads}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">New Enquiries</span>
            <span className="font-serif text-lg font-bold text-[#242521]">{stats.new_enquiries}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Site Visits</span>
            <span className="font-serif text-lg font-bold text-[#242521]">{stats.total_site_visits}</span>
          </div>
          <div className="bg-white border border-[#D9D4C9] p-3 rounded-xs">
            <span className="text-[10px] text-[#71716D] uppercase block">Converted Leads</span>
            <span className="font-serif text-lg font-bold text-emerald-800">{stats.converted_leads}</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-bar */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#D9D4C9] pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSearchParams({ sec: item.id })}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#242521] text-white'
                  : 'bg-white border border-[#D9D4C9] text-[#71716D] hover:text-[#242521]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#777B5A] text-white' : 'bg-[#EFECE3] text-[#242521]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CRM SECTION VIEWS */}

      {/* 1. OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Leads */}
            <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE4]">
                <h3 className="font-serif text-lg font-bold text-[#242521]">
                  Active High-Value Leads
                </h3>
                <button
                  onClick={() => setSearchParams({ sec: 'leads' })}
                  className="text-xs font-semibold text-[#777B5A] hover:underline"
                >
                  View All Leads →
                </button>
              </div>

              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => openLeadModal(lead.id)}
                    className="p-3 bg-[#F7F5F0] hover:bg-[#EFECE3] border border-[#D9D4C9] rounded-xs cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[#242521] block">{lead.name}</strong>
                      <span className="text-[11px] text-[#71716D]">
                        {lead.phone} • {lead.property_title || 'General'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#242521] text-white">
                        {lead.status}
                      </span>
                      {lead.deal_value > 0 && (
                        <p className="text-[11px] font-semibold text-[#777B5A] mt-0.5">
                          {formatIndianPrice(lead.deal_value)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Site Visits */}
            <div className="bg-white border border-[#D9D4C9] p-6 rounded-xs shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE4]">
                <h3 className="font-serif text-lg font-bold text-[#242521]">
                  Upcoming Site Viewings
                </h3>
                <button
                  onClick={() => setSearchParams({ sec: 'visits' })}
                  className="text-xs font-semibold text-[#777B5A] hover:underline"
                >
                  View All Visits →
                </button>
              </div>

              <div className="space-y-3">
                {siteVisits.slice(0, 5).map((sv) => (
                  <div
                    key={sv.id}
                    className="p-3 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[#242521] block">{sv.name}</strong>
                      <span className="text-[11px] text-[#71716D]">
                        {sv.property_title} • {sv.preferred_date} ({sv.preferred_time})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                        sv.status === 'Approved' ? 'bg-emerald-800 text-white' : 'bg-[#777B5A] text-white'
                      }`}
                    >
                      {sv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. LEADS PIPELINE */}
      {activeSection === 'leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-light text-[#242521]">
              Consultant Leads Pipeline ({leads.length})
            </h2>

            {/* Filter by status */}
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-[#71716D]" />
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#D9D4C9] rounded-xs text-[#242521]"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                <option value="Site Visit Completed">Site Visit Completed</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Lead / Client</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Property Interest</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Pipeline Status</th>
                  <th className="p-3.5">Deal Potential</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#242521]">{lead.name}</td>
                    <td className="p-3.5 text-[#71716D]">
                      <div>{lead.phone}</div>
                      <div className="text-[10px]">{lead.email}</div>
                    </td>
                    <td className="p-3.5 text-[#242521] max-w-xs truncate">
                      {lead.property_title || 'General Mumbai Mandate'}
                    </td>
                    <td className="p-3.5 uppercase text-[10px] font-semibold text-[#71716D]">
                      {lead.source}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className="px-2 py-1 bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs text-[11px] font-medium text-[#242521]"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                        <option value="Site Visit Completed">Site Visit Completed</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-semibold text-[#242521]">
                      {lead.deal_value > 0 ? formatIndianPrice(lead.deal_value) : '—'}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => openLeadModal(lead.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#242521] border border-[#D9D4C9] hover:bg-[#242521] hover:text-white rounded-xs transition-colors"
                      >
                        Notes & History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SITE VISITS MANAGEMENT */}
      {activeSection === 'visits' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Site Visits & Walkthrough Requests ({siteVisits.length})
          </h2>

          <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Date & Slot</th>
                  <th className="p-3.5">Visitors</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {siteVisits.map((sv) => (
                  <tr key={sv.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#242521]">
                      {sv.name}
                      <span className="block text-[11px] font-normal text-[#71716D]">{sv.phone}</span>
                    </td>
                    <td className="p-3.5 text-[#242521]">{sv.property_title}</td>
                    <td className="p-3.5 font-medium text-[#242521]">
                      {sv.preferred_date} <br />
                      <span className="text-[10px] text-[#71716D]">{sv.preferred_time}</span>
                    </td>
                    <td className="p-3.5 text-[#242521]">{sv.visitor_count || 1} Person</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                          sv.status === 'Approved'
                            ? 'bg-emerald-800 text-white'
                            : sv.status === 'Completed'
                            ? 'bg-blue-800 text-white'
                            : 'bg-[#777B5A] text-white'
                        }`}
                      >
                        {sv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#71716D] max-w-xs truncate">
                      {sv.consultant_notes || sv.notes || '—'}
                    </td>
                    <td className="p-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleUpdateSiteVisitStatus(sv.id, 'Approved')}
                          className="px-2 py-1 text-[10px] font-bold uppercase bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateSiteVisitStatus(sv.id, 'Completed')}
                          className="px-2 py-1 text-[10px] font-bold uppercase bg-[#242521] hover:bg-[#777B5A] text-white rounded-xs"
                          title="Complete"
                        >
                          Complete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ENQUIRIES */}
      {activeSection === 'enquiries' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            All Property Enquiries ({enquiries.length})
          </h2>

          <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Sender</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Message</th>
                  <th className="p-3.5">Received</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#242521]">
                      {enq.name}
                      <span className="block text-[11px] font-normal text-[#71716D]">{enq.phone}</span>
                    </td>
                    <td className="p-3.5 text-[#242521]">{enq.property_title || 'General'}</td>
                    <td className="p-3.5 capitalize text-[#242521]">{enq.preferred_contact_method}</td>
                    <td className="p-3.5 text-[#4A4C45] max-w-sm">{enq.message}</td>
                    <td className="p-3.5 text-[#71716D]">{formatDate(enq.created_at)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#242521] text-white">
                        {enq.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={async () => {
                          await client.put(`/api/enquiries/${enq.id}`, { status: 'contacted' });
                          notify.success('Marked as contacted.');
                          fetchCRMData();
                        }}
                        className="px-2 py-1 text-[10px] font-semibold border border-[#D9D4C9] hover:bg-[#242521] hover:text-white rounded-xs"
                      >
                        Contacted
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CALLBACKS */}
      {activeSection === 'callbacks' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-[#242521]">
            Pending Advisory Callbacks ({callbacks.length})
          </h2>

          <div className="bg-white border border-[#D9D4C9] rounded-xs overflow-hidden shadow-subtle">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F5F0] border-b border-[#D9D4C9] text-[#71716D] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Preferred Slot</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {callbacks.map((cb) => (
                  <tr key={cb.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#242521]">{cb.name}</td>
                    <td className="p-3.5 font-semibold text-[#777B5A]">{cb.phone}</td>
                    <td className="p-3.5 text-[#242521]">{cb.property_title || 'General Advisory'}</td>
                    <td className="p-3.5 text-[#242521]">{cb.preferred_time}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#242521] text-white">
                        {cb.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={async () => {
                          await client.put(`/api/callbacks/${cb.id}`, { status: 'Completed' });
                          notify.success('Callback marked completed.');
                          fetchCRMData();
                        }}
                        className="px-2 py-1 text-[10px] font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded-xs"
                      >
                        Mark Done
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAD DETAIL & NOTES MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242521]/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#F7F5F0] border border-[#D9D4C9] rounded-xs shadow-editorial overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 bg-white border-b border-[#D9D4C9] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#71716D] block">Lead Record</span>
                <h3 className="font-serif text-xl font-bold text-[#242521]">{selectedLead.name}</h3>
                <p className="text-xs text-[#71716D]">
                  {selectedLead.phone} • {selectedLead.email || 'No email provided'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-[#71716D] hover:text-[#242521]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              <div className="grid grid-cols-2 gap-4 bg-white p-4 border border-[#D9D4C9] rounded-xs">
                <div>
                  <span className="text-[10px] text-[#71716D] uppercase block">Associated Listing</span>
                  <span className="font-semibold text-[#242521]">
                    {selectedLead.property_title || 'General Advisory Mandate'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71716D] uppercase block">Current Status</span>
                  <span className="font-semibold text-[#777B5A]">{selectedLead.status}</span>
                </div>
              </div>

              {/* Internal Consultant Notes History */}
              <div className="space-y-3">
                <h4 className="font-serif text-base font-semibold text-[#242521]">
                  Internal Consultation Notes ({selectedLead.notes?.length || 0})
                </h4>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-white border border-[#D9D4C9] rounded-xs space-y-1">
                        <p className="text-[#242521] leading-relaxed">{note.note}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#71716D] pt-1 border-t border-[#F0ECE4]">
                          <span>Logged by: {note.author_name}</span>
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#71716D] italic">No internal notes recorded yet.</p>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log note from client phone conversation, terms discussion, or requirement updates..."
                    className="w-full px-3 py-2 bg-white border border-[#D9D4C9] rounded-xs text-[#242521] focus:border-[#777B5A]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#242521] hover:bg-[#777B5A] rounded-xs transition-colors"
                    >
                      Record Note
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
