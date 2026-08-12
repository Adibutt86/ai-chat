'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Mail, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  AlertCircle,
  Download,
  Send,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import EmailTemplates from '@/app/components/EmailTemplates';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerNotes: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
  googleEventId: string | null;
  createdAt: string;
  service: {
    name: string;
    price: number;
    currency: string;
    durationMinutes: number;
  };
  agent: {
    name: string;
  };
}

interface BookingsManagerProps {
  agentId: string;
}

export default function BookingsManager({ agentId }: BookingsManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Details Modal & Email Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);

  const [emailModalBooking, setEmailModalBooking] = useState<Booking | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showEmailTemplatesModal, setShowEmailTemplatesModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [agentId, page, statusFilter, serviceFilter]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = `/api/bookings?agentId=${agentId}&page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (serviceFilter) url += `&serviceId=${serviceFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotalPages(data.pages || 1);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel this booking? An automated cancellation email will be sent to the customer.')) return;

    setStatusChanging(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchBookings();
        if (selectedBooking && selectedBooking.id === id) {
          const updated = { ...selectedBooking, status: newStatus };
          setSelectedBooking(updated);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch {
      alert('Network error updating status');
    } finally {
      setStatusChanging(false);
    }
  };

  const openEmailModal = (b: Booking) => {
    setEmailModalBooking(b);
    const startDate = new Date(b.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setEmailSubject(`Regarding your appointment for ${b.service?.name || 'our service'}`);
    setEmailMessage(`Hello ${b.customerName},\n\nWe are contacting you regarding your appointment for ${b.service?.name || 'our service'} scheduled on ${startDate}.\n\nHow can we assist you prior to your appointment?\n\nBest regards,\nGeekvista Support`);
  };

  const handleSendResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalBooking) return;

    setSendingEmail(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/leads/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadEmail: emailModalBooking.customerEmail,
          leadName: emailModalBooking.customerName,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMessage({
          type: 'success',
          text: `Email successfully delivered to ${emailModalBooking.customerEmail} via Resend Server!`
        });
        setTimeout(() => {
          setEmailModalBooking(null);
          setToastMessage(null);
        }, 2200);
      } else {
        setToastMessage({
          type: 'error',
          text: data.error || 'Failed to send email via Resend API.'
        });
      }
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Network error sending email via Resend server.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Email Address', 'Phone Number', 'Service Name', 'Scheduled Date', 'Time Slot', 'Status', 'Timezone'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(b => {
        const d = new Date(b.startTime);
        return [
          `"${(b.customerName || '').replace(/"/g, '""')}"`,
          `"${(b.customerEmail || '').replace(/"/g, '""')}"`,
          `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
          `"${(b.service?.name || '').replace(/"/g, '""')}"`,
          `"${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}"`,
          `"${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}"`,
          `"${b.status.toUpperCase()}"`,
          `"${b.timezone || 'UTC'}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'scheduled_bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-650 border border-zinc-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <UserX className="h-3 w-3" /> No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bookings</h2>
          <p className="text-slate-500 text-xs mt-0.5">Review, verify, and manage customer appointments scheduled through your AI agent.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmailTemplatesModal(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            title="Configure email subjects and body text for booking approvals & cancellations"
          >
            <Sliders className="h-3.5 w-3.5 text-[#F97316]" />
            Email Templates
          </button>
          {bookings.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-xs font-medium"
            />
          </div>
          <button
            type="submit"
            className="bg-[#F97316] hover:bg-[#ea580c] border border-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="h-3.5 w-3.5 text-[#F97316]" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="no_show">No Show</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 text-xs max-w-[150px] truncate font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
          >
            <option value="">All Services</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings List Table */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-rose-700 text-xs font-semibold items-center">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Service</th>
                <th className="p-3.5">Scheduled Date</th>
                <th className="p-3.5">Time Slot</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#F97316] mx-auto" />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No bookings found matching selected filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const startDate = new Date(booking.startTime);
                  return (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="p-3.5 text-slate-900 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] text-xs font-bold border border-[#1E3A8A]/20">
                            {booking.customerName.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">{booking.customerName}</span>
                            <span className="block text-[11px] text-slate-500 font-medium mt-0.5">{booking.customerEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">{booking.service?.name}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">{booking.service?.durationMinutes} min</span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-end items-center">
                          <button
                            onClick={() => openEmailModal(booking)}
                            className="bg-[#F97316] hover:bg-[#ea580c] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                            title="Send Email via Resend"
                          >
                            <Mail className="h-3.5 w-3.5" /> Email
                          </button>
                          {booking.status !== 'confirmed' && booking.status !== 'completed' && (
                            <button
                              disabled={statusChanging}
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 disabled:opacity-50"
                              title="Approve Booking"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              disabled={statusChanging}
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1 disabled:opacity-50"
                              title="Mark Completed"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Complete
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              disabled={statusChanging}
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Cancel Booking"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-slate-700 transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-slate-700 transition cursor-pointer shadow-xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl overflow-hidden shadow-xl text-xs text-slate-700">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#F97316]" /> Booking Details
              </h3>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 bg-white">
              {/* Customer Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="h-3.5 w-3.5 text-[#1E3A8A]" />
                  <span className="font-bold text-slate-900">Customer Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Full Name</label>
                    <span className="text-slate-800 font-semibold block mt-0.5">{selectedBooking.customerName}</span>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Email Address</label>
                    <a href={`mailto:${selectedBooking.customerEmail}`} className="text-[#1E3A8A] font-semibold hover:underline block mt-0.5">{selectedBooking.customerEmail}</a>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Phone Number</label>
                    <span className="text-slate-800 font-medium block mt-0.5">{selectedBooking.customerPhone || 'Not provided'}</span>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Created At</label>
                    <span className="text-slate-600 block mt-0.5 font-medium">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Service & Time Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Calendar className="h-3.5 w-3.5 text-[#F97316]" />
                  <span className="font-bold text-slate-900">Appointment Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Booked Service</label>
                    <span className="text-slate-800 font-semibold block mt-0.5">{selectedBooking.service?.name}</span>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Service Price</label>
                    <span className="text-slate-900 font-bold block mt-0.5">
                      {selectedBooking.service?.price > 0 ? `${selectedBooking.service?.currency === 'USD' ? '$' : selectedBooking.service?.currency} ${selectedBooking.service?.price}` : 'Free'}
                    </span>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Time Slot (Local Time)</label>
                    <span className="text-slate-800 font-semibold block mt-0.5">
                      {new Date(selectedBooking.startTime).toLocaleString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })} 
                      <span className="text-slate-400 font-normal ml-1">({selectedBooking.timezone})</span>
                    </span>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block uppercase">Slot Management</label>
                    <span className="block mt-0.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Dashboard Business Hours Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedBooking.customerNotes && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <label className="text-slate-400 text-[10px] font-bold block uppercase mb-1">Customer Notes / Messages</label>
                  <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">{selectedBooking.customerNotes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 items-center">
              <button
                onClick={() => openEmailModal(selectedBooking)}
                className="bg-[#1E3A8A] hover:bg-[#152a65] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" /> Email Customer
              </button>
              {selectedBooking.status !== 'confirmed' && (
                <button
                  disabled={statusChanging}
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve Booking
                </button>
              )}
              {selectedBooking.status !== 'cancelled' && (
                <button
                  disabled={statusChanging}
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                  className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 disabled:opacity-40 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Direct Resend Email Modal for Customer */}
      {emailModalBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-xl text-xs text-slate-700 animate-fadeIn">
            
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send Direct Email</h3>
                  <p className="text-[10px] text-slate-400">Delivered directly from your server to customer inbox</p>
                </div>
              </div>
              <button 
                onClick={() => setEmailModalBooking(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendResendEmail} className="p-5 space-y-4">
              {toastMessage && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
                  toastMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {toastMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                  <span>{toastMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Customer Email
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${emailModalBooking.customerName} (${emailModalBooking.customerEmail})`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={5}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEmailModalBooking(null)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex items-center gap-1.5 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold border border-slate-900 shadow-xs rounded-lg px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Email Templates Editor Modal */}
      {showEmailTemplatesModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-fadeIn">
            <button 
              onClick={() => setShowEmailTemplatesModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer bg-slate-100 hover:bg-slate-200 transition"
              title="Close"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <EmailTemplates />
          </div>
        </div>
      )}
    </div>
  );
}
