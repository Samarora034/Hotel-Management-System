import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0 });

  const fetchReservations = async (filterDate = '') => {
    try {
      setError('');
      setLoading(true);
      const params = {};
      if (filterDate) {
        params.date = filterDate;
      }
      const res = await API.get('/reservations', { params });
      const data = res.data.reservations;
      setReservations(data);

      // Calculate stats
      const confirmed = data.filter((r) => r.status === 'Confirmed').length;
      const cancelled = data.filter((r) => r.status === 'Cancelled').length;
      setStats({ total: data.length, confirmed, cancelled });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load reservations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReservations(dateFilter);
  };

  const handleClearFilter = () => {
    setDateFilter('');
    fetchReservations('');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setCancellingId(id);
    try {
      await API.patch(`/reservations/${id}/cancel`);
      // Update local state
      setReservations((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: 'Cancelled' } : r
        )
      );
      // Update stats
      setStats((prev) => ({
        ...prev,
        confirmed: prev.confirmed - 1,
        cancelled: prev.cancelled + 1,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to cancel reservation.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Confirmed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Confirmed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Cancelled
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}. Manage all restaurant reservations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 uppercase font-medium">Total Reservations</p>
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

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <input
              id="dateFilter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-md transition"
          >
            Filter
          </button>
          {dateFilter && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2.5 rounded-md transition"
            >
              Clear Filter
            </button>
          )}
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Reservations Table */}
      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">
            {dateFilter
              ? `No reservations found for ${dateFilter}.`
              : 'No reservations in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.user?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.timeSlot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Table {reservation.table?.tableNumber} (Cap: {reservation.table?.capacity})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.guests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reservation.status === 'Confirmed' ? (
                        <button
                          onClick={() => handleCancel(reservation._id)}
                          disabled={cancellingId === reservation._id}
                          className="text-red-600 hover:text-red-800 font-medium text-sm disabled:text-red-300"
                        >
                          {cancellingId === reservation._id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
