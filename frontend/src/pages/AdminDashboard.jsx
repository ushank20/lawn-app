import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../lib/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

const SERVICE_PILLS = [
  { key: 'lawnMowing',      dateKey: 'lawnMowingDate',      label: 'Lawn Mowing',      color: 'bg-green-100 text-green-800' },
  { key: 'dethatching',     dateKey: 'dethatchingDate',     label: 'Dethatching',      color: 'bg-blue-100 text-blue-800' },
  { key: 'sprinklerBlowout',dateKey: 'sprinklerBlowoutDate',label: 'Sprinkler Blowout',color: 'bg-orange-100 text-orange-800' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function BookingCard({ booking, onUpdate }) {
  const [status, setStatus] = useState(booking.status);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [saved, setSaved] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await bookingApi.update(booking.id, { status: newStatus });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate(booking.id, { status: newStatus });
    } catch {
      setStatus(booking.status);
    }
  }

  async function handleNotesSave() {
    try {
      await bookingApi.update(booking.id, { adminNotes });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
      onUpdate(booking.id, { adminNotes });
    } catch {
      // ignore
    }
  }

  const services = SERVICE_PILLS.filter(s => booking[s.key]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-base">
            {booking.firstName} {booking.lastName}
          </p>
          <a
            href={`tel:${booking.phone}`}
            className="text-sm text-[#2d6a4f] hover:underline"
          >
            {booking.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${booking.paymentMethod === 'zelle' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
            {booking.paymentMethod === 'zelle' ? 'Zelle' : 'Cash'}
          </span>
        </div>
      </div>

      {/* Address */}
      <p className="text-sm text-gray-600">
        {booking.streetAddress}, {booking.city}, {booking.state} {booking.zipCode}
      </p>

      {/* Service pills */}
      <div className="flex flex-wrap gap-2">
        {services.map(s => (
          <span key={s.key} className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
            {s.label} — {formatDate(booking[s.dateKey])}
          </span>
        ))}
      </div>

      {/* Customer notes */}
      {booking.notes && (
        <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">
          {booking.notes}
        </p>
      )}

      {/* Admin controls */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Update status:</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {saved && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Internal notes</label>
          <div className="flex gap-2">
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              rows={2}
              placeholder="Add notes visible only to you..."
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] resize-none"
            />
            <button
              onClick={handleNotesSave}
              className="px-3 py-1 bg-[#2d6a4f] text-white text-xs rounded-lg hover:bg-[#245a42] self-end transition-colors"
            >
              Save
            </button>
          </div>
          {noteSaved && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
        </div>
      </div>

      <p className="text-xs text-gray-400">Submitted {formatDate(booking.createdAt)}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';

  const [bookings, setBookings] = useState([]);
  const [byCityMap, setByCityMap] = useState({});
  const [cities, setCities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCity !== 'all') params.city = selectedCity;
      if (selectedService !== 'all') params.service = selectedService;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const [bookingsRes, citiesRes] = await Promise.all([
        bookingApi.list(params),
        bookingApi.cities(),
      ]);
      setBookings(bookingsRes.data.bookings);
      setByCityMap(bookingsRes.data.byCity);
      setTotal(bookingsRes.data.total);
      setCities(citiesRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedService, selectedStatus, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  }

  function handleBookingUpdate(id, patch) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }

  const stats = {
    total,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const cityKeys = Object.keys(byCityMap).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-[#2d6a4f] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-bold text-lg">Lawn Co Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-100">Hello, {adminName}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            >
              <option value="all">All cities</option>
              {cities.map(c => (
                <option key={c.city} value={c.city}>{c.city} ({c.count})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            >
              <option value="all">All services</option>
              <option value="lawnMowing">Lawn Mowing</option>
              <option value="dethatching">Dethatching</option>
              <option value="sprinklerBlowout">Sprinkler Blowout</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadData}
              className="text-sm bg-[#2d6a4f] text-white px-4 py-2 rounded-lg hover:bg-[#245a42] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: stats.total,     color: 'text-gray-900' },
            { label: 'Pending',        value: stats.pending,   color: 'text-yellow-700' },
            { label: 'Confirmed',      value: stats.confirmed, color: 'text-blue-700' },
            { label: 'Completed',      value: stats.completed, color: 'text-green-700' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            No bookings found.
          </div>
        ) : selectedCity !== 'all' ? (
          // Flat list for single city filter
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedCity} <span className="text-gray-400 font-normal text-base">({bookings.length} request{bookings.length !== 1 ? 's' : ''})</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {bookings.map(b => (
                <BookingCard key={b.id} booking={b} onUpdate={handleBookingUpdate} />
              ))}
            </div>
          </div>
        ) : (
          // Grouped by city
          <div className="space-y-10">
            {cityKeys.map(city => (
              <div key={city}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>{city}</span>
                  <span className="text-gray-400 font-normal text-base">({byCityMap[city].length} request{byCityMap[city].length !== 1 ? 's' : ''})</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {byCityMap[city].map(b => (
                    <BookingCard key={b.id} booking={b} onUpdate={handleBookingUpdate} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
