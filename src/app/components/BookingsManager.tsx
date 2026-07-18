'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react';

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

  // Details Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);

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
    if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel this booking? This will also remove the event from Google Calendar.')) return;
    
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full text-xs font-semibold">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-650 border border-zinc-200 px-2 py-0.5 rounded-full text-xs font-semibold">
            <UserX className="h-3 w-3" /> No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Bookings</h2>
        <p className="text-zinc-550 text-sm">Review, verify, and manage customer appointments scheduled through your AI agent.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by customer name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-zinc-900 placeholder-zinc-450 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-white hover:bg-zinc-50 border border-zinc-250 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="">All Statuses</option>
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
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 text-xs max-w-[150px] truncate focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-600 text-sm items-center">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-zinc-700">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-550 font-semibold uppercase text-xs tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Service</th>
                <th className="p-4">Scheduled Date</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 italic">
                    No bookings found matching selected filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const startDate = new Date(booking.startTime);
                  return (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-zinc-50/50 transition cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="p-4 text-zinc-900 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-blue-600 text-xs uppercase font-semibold border border-zinc-200">
                            {booking.customerName.substring(0, 1)}
                          </div>
                          <div>
                            <span className="block">{booking.customerName}</span>
                            <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">{booking.customerEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-zinc-800">{booking.service?.name}</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5">{booking.service?.durationMinutes} min</span>
                      </td>
                      <td className="p-4 text-zinc-600 font-mono text-xs">
                        {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-zinc-600 font-mono text-xs">
                        {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-end">
                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                className="bg-white hover:bg-zinc-50 text-emerald-600 border border-zinc-250 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="bg-white hover:bg-zinc-50 text-red-650 border border-zinc-250 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status !== 'confirmed' && (
                            <span className="text-zinc-400 text-xs italic pr-2">No actions available</span>
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
          <div className="bg-zinc-50 p-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 rounded-lg text-zinc-500 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 rounded-lg text-zinc-500 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-sm text-zinc-700">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Booking Details
              </h3>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="p-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 bg-white">
              {/* Customer Info Card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-zinc-900">Customer Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Full Name</label>
                    <span className="text-zinc-850 block mt-0.5">{selectedBooking.customerName}</span>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Email Address</label>
                    <a href={`mailto:${selectedBooking.customerEmail}`} className="text-blue-600 hover:underline block mt-0.5">{selectedBooking.customerEmail}</a>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Phone Number</label>
                    <span className="text-zinc-850 block mt-0.5">{selectedBooking.customerPhone || 'Not provided'}</span>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Created At</label>
                    <span className="text-zinc-550 block mt-0.5 font-mono text-xs">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Service & Time Info Card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-zinc-900">Appointment Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Booked Service</label>
                    <span className="text-zinc-850 block mt-0.5">{selectedBooking.service?.name}</span>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Service Price</label>
                    <span className="text-zinc-850 block mt-0.5 font-semibold text-zinc-900">
                      {selectedBooking.service?.price > 0 ? `${selectedBooking.service?.currency === 'USD' ? '$' : selectedBooking.service?.currency} ${selectedBooking.service?.price}` : 'Free'}
                    </span>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Time Slot (Local Time)</label>
                    <span className="text-zinc-850 block mt-0.5 font-mono text-xs">
                      {new Date(selectedBooking.startTime).toLocaleString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })} 
                      <span className="text-zinc-500 font-sans ml-1">({selectedBooking.timezone})</span>
                    </span>
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs font-semibold block uppercase">Sync Status</label>
                    <span className="block mt-0.5 text-xs">
                      {selectedBooking.googleEventId ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Event Synchronized (Google Calendar)
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">No sync calendar connected</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedBooking.customerNotes && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                  <label className="text-zinc-500 text-xs font-semibold block uppercase mb-1">Customer Notes / Messages</label>
                  <p className="text-zinc-750 text-sm leading-relaxed whitespace-pre-wrap">{selectedBooking.customerNotes}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Update Status</label>
                <div className="flex gap-2">
                  <button
                    disabled={statusChanging || selectedBooking.status === 'completed'}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 disabled:opacity-40 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Mark Completed
                  </button>
                  <button
                    disabled={statusChanging || selectedBooking.status === 'no_show'}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'no_show')}
                    className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 disabled:opacity-40 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Mark No Show
                  </button>
                  <button
                    disabled={statusChanging || selectedBooking.status === 'cancelled'}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 disabled:opacity-40 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
