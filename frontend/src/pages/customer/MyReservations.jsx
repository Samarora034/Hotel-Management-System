import { useState, useEffect } from 'react';
import API from '../../services/api';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = async () => {
    try {
      setError('');
      const res = await API.get('/reservations/my');
      setReservations(res.data.reservations);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500 text-center">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reservations</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">You have no reservations yet.</p>
          <a
            href="/customer/reserve"
            className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-medium"
          >
            Book a Table
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <tr key={reservation._id}>
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
      )}
    </div>
  );
};

export default MyReservations;
