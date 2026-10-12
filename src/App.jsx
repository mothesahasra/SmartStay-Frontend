import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HotelListPage from './pages/HotelListPage.jsx';
import HotelDetailPage from './pages/HotelDetailPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px',
            background: '#1a1a2e',
            color: '#fff',
            padding: '12px 16px',
          },
        }}
      />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/hotels" element={<HotelListPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />

        {/* Authenticated Routes */}
        <Route path="/book/:roomId" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Manager Routes */}
        <Route path="/manager" element={
          <ProtectedRoute roles={['MANAGER', 'ADMIN']}><ManagerDashboard /></ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="container page-wrapper text-center">
            <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>
            <h1>Page Not Found</h1>
            <p className="text-muted mt-sm">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn btn-primary mt-lg">Go Home</a>
          </div>
        } />
      </Routes>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--gray-200)',
        padding: 'var(--space-xl) 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        background: 'var(--bg-primary)',
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} <strong>SmartStay</strong>. Premium Hotel & Accommodation Management.</p>
        </div>
      </footer>
    </>
  );
}
