import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">🍽️ ReserveTable</h1>
        <p className="text-xl text-gray-600 mb-8">
          Book your perfect dining experience. Browse available tables, pick your time, and reserve in seconds.
        </p>

        {isAuthenticated ? (
          <Link to={isAdmin ? '/admin/dashboard' : '/customer/reserve'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-medium text-lg">
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-medium text-lg">
              Sign In
            </Link>
            <Link to="/register"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-md font-medium text-lg">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
