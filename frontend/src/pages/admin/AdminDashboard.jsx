import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0 });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async (filterDate = '') => {
    setLoading(true);
    setError('');
    try {
      const params = filterDate ? { date: filterDate } : {};
      const { data } = await api.get('/reservations', { params });

      setReservations(data.reservations);
      const confirmed = data.reservations.filter(r => r.status === 'Confirmed').length;
      const cancelled = data.reservations.filter(r => r.status === 'Cancelled').length;
      setStats({ total: data.reservations.length, confirmed, cancelled });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAll(dateFilter);
  };

  const clearFilter = () => {
    setDateFilter('');
    fetchAll('');
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;

    setCancellingId(id);
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'Cancelled' } : r));
      setStats(s => ({ ...s, confirmed: s.confirmed - 1, cancelled: s.cancelled + 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Hey {user?.name}, here's the reservation overview.</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 uppercase font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-medium">Confirmed</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 uppercase font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{stats.cancelled}</p>
        </div>
      </div>

      {/* filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input id="dateFilter" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-md">
            Filter
          </button>
          {dateFilter && (
            <button type="button" onClick={clearFilter}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2.5 rounded-md">
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* table */}
      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading...</p>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">
            {dateFilter ? `Nothing found for ${dateFilter}` : 'No reservations yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservations.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{r.user?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{r.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.timeSlot}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Table {r.table?.tableNumber} (seats {r.table?.capacity})
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.guests}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'Confirmed' ? (
                      <button onClick={() => handleCancel(r._id)} disabled={cancellingId === r._id}
                        className="text-red-600 hover:text-red-800 font-medium text-sm disabled:text-red-300">
                        {cancellingId === r._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
