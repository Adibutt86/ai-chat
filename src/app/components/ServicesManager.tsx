'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Clock, 
  DollarSign, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [isActive, setIsActive] = useState(true);

  // Save loading state
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch services');
      }
    } catch {
      setError('Connection failed. Please verify API configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setDurationMinutes(30);
    setPrice(0);
    setCurrency('USD');
    setIsActive(true);
    setShowAddModal(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDurationMinutes(service.durationMinutes);
    setPrice(service.price);
    setCurrency(service.currency);
    setIsActive(service.isActive);
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || durationMinutes <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, durationMinutes, price, currency, isActive }),
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchServices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create service');
      }
    } catch {
      alert('Network error creating service');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !name || durationMinutes <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingService.id, name, description, durationMinutes, price, currency, isActive }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchServices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update service');
      }
    } catch {
      alert('Network error updating service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? Bookings attached to this service will also be deleted.')) return;
    try {
      const res = await fetch(`/api/services?serviceId=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchServices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete service');
      }
    } catch {
      alert('Network error deleting service');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
      });
      if (res.ok) {
        fetchServices();
      }
    } catch {
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Services</h2>
          <p className="text-zinc-550 text-sm">Create and manage bookable services for your AI chatbot.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-600 text-sm items-center">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 text-center text-zinc-400">
          <Briefcase className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
          <p className="font-semibold text-zinc-700">No services configured</p>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-6">Create services like "Consultation" or "Website Design" to allow visitors to book directly through your AI widget.</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-250 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`bg-white border ${service.isActive ? 'border-zinc-200' : 'border-zinc-150 opacity-60'} rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition relative shadow-sm`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-zinc-900 truncate pr-16">{service.name}</h3>
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      service.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    } cursor-pointer`}
                  >
                    {service.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <p className="text-zinc-600 text-sm line-clamp-3 mb-6 min-h-[60px]">
                  {service.description || 'No description provided.'}
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-4 flex justify-between items-center text-sm">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-zinc-550">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span>{service.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-900 font-semibold">
                    <span>{service.currency === 'USD' ? '$' : service.currency}</span>
                    <span>{service.price}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-zinc-450 hover:text-red-600 transition cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900 text-lg">Add New Service</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Consultation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe what is included in this service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>
                <div className="flex items-center pt-6 pl-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-zinc-300 bg-zinc-50 text-blue-600 focus:ring-blue-600 h-4 w-4 cursor-pointer"
                    />
                    <span>Active and bookable</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-50/50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Create Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-zinc-900 text-lg">Edit Service</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Consultation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="Describe what is included in this service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>
                <div className="flex items-center pt-6 pl-2">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-zinc-300 bg-zinc-50 text-blue-600 focus:ring-blue-600 h-4 w-4 cursor-pointer"
                    />
                    <span>Active and bookable</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-50/50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
