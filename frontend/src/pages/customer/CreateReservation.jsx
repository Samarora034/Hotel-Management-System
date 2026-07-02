import { useState } from 'react';
import API from '../../services/api';

const CreateReservation = () => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00',
  ];

  // Get today's date in YYYY-MM-DD format for min date restriction
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSearched(false);
    setLoading(true);

    try {
      const res = await API.get('/reservations/availability', {
        params: { date, timeSlot, guests },
      });
      setAvailableTables(res.data.availableTables);
      setSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to check availability.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (tableId) => {
    setError('');
    setSuccess('');
    setBooking(true);

    try {
      await API.post('/reservations', {
        tableId,
        date,
        timeSlot,
        guests: parseInt(guests, 10),
      });
      setSuccess('Reservation booked successfully! 🎉');
      // Refresh availability to remove the now-booked table
      const res = await API.get('/reservations/availability', {
        params: { date, timeSlot, guests },
      });
      setAvailableTables(res.data.availableTables);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create reservation.'
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Book a Table</h1>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Find Available Tables
        </h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSearched(false); }}
              min={today}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot
            </label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => { setTimeSlot(e.target.value); setSearched(false); }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
              Guests
            </label>
            <input
              id="guests"
              type="number"
              value={guests}
              onChange={(e) => { setGuests(e.target.value); setSearched(false); }}
              min="1"
              max="20"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 4"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-md transition"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Available Tables for {date} at {timeSlot}
          </h2>

          {availableTables.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No tables available for the selected date, time, and guest count. Try a different slot.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTables.map((table) => (
                <div
                  key={table._id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col items-center"
                >
                  <div className="text-3xl mb-2">🪑</div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Table {table.tableNumber}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Capacity: {table.capacity} guests
                  </p>
                  <button
                    onClick={() => handleBook(table._id)}
                    disabled={booking}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 rounded-md transition"
                  >
                    {booking ? 'Booking...' : 'Reserve'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateReservation;
