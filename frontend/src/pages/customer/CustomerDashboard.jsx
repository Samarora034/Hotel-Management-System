import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user?.name}! 👋
      </h1>
      <p className="text-gray-600 mb-8">
        What would you like to do today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/customer/reserve"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-100"
        >
          <div className="text-4xl mb-3">📅</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Book a Table
          </h2>
          <p className="text-gray-600">
            Search for available tables and make a reservation for your next meal.
          </p>
        </Link>

        <Link
          to="/customer/my-reservations"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-100"
        >
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            My Reservations
          </h2>
          <p className="text-gray-600">
            View your upcoming and past reservations, or cancel if plans change.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;
