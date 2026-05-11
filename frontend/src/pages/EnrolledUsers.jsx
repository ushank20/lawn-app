import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../lib/api';

const SERVICE_LABELS = {
  lawnMowing: 'Lawn Mowing',
  dethatching: 'Dethatching',
  sprinklerBlowout: 'Sprinkler Blowout',
};

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EnrolledUsers() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');

  function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  }

  useEffect(() => {
    bookingApi.list({ sortBy: 'createdAt', sortOrder: 'desc' })
      .then(res => {
        setUsers(res.data.bookings);
        setFiltered(res.data.bookings);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to load users.');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.city?.toLowerCase().includes(q)
      );
    }
    if (serviceFilter !== 'all') {
      result = result.filter(u => u[serviceFilter]);
    }
    setFiltered(result);
  }, [search, serviceFilter, users]);

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

      {/* Nav tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          <Link
            to="/admin"
            className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 transition-colors"
          >
            Bookings
          </Link>
          <span className="px-4 py-3 text-sm font-medium text-[#2d6a4f] border-b-2 border-[#2d6a4f]">
            Enrolled Users
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header + filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, email, phone, city..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Service</label>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            >
              <option value="all">All services</option>
              <option value="lawnMowing">Lawn Mowing</option>
              <option value="dethatching">Dethatching</option>
              <option value="sprinklerBlowout">Sprinkler Blowout</option>
            </select>
          </div>
          <p className="text-sm text-gray-500 self-end pb-2">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 bg-white rounded-xl border border-red-200">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            No enrolled users found.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Contact</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">City</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Services</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <a href={`tel:${u.phone}`} className="text-[#2d6a4f] hover:underline block">{u.phone}</a>
                        {u.email && <span className="text-gray-500 text-xs">{u.email}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.city}, {u.state}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(SERVICE_LABELS).filter(([k]) => u[k]).map(([k, label]) => (
                            <span key={k} className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                              {label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}>
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(u => (
                <div key={u.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[u.status] || 'bg-gray-100'}`}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </div>
                  <a href={`tel:${u.phone}`} className="text-sm text-[#2d6a4f] hover:underline block">{u.phone}</a>
                  {u.email && <p className="text-xs text-gray-500">{u.email}</p>}
                  <p className="text-sm text-gray-600">{u.city}, {u.state}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(SERVICE_LABELS).filter(([k]) => u[k]).map(([k, label]) => (
                      <span key={k} className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Enrolled {formatDate(u.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
