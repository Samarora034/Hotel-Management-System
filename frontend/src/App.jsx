import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './pages/Home';
import Unauthorized from './pages/Unauthorized';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateReservation from './pages/customer/CreateReservation';
import MyReservations from './pages/customer/MyReservations';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute roles={['Customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/reserve"
              element={
                <ProtectedRoute roles={['Customer']}>
                  <CreateReservation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/my-reservations"
              element={
                <ProtectedRoute roles={['Customer']}>
                  <MyReservations />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
