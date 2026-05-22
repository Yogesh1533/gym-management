import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import HomeLoggedIn from './pages/HomeLoggedIn';
import Pricing from './pages/Pricing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import Sessions from './pages/member/Sessions';
import BookingHistory from './pages/member/BookingHistory';
import Profile from './pages/member/Profile';
import Progress from './pages/member/Progress';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminSessions from './pages/admin/AdminSessions';
import AdminWorkoutPlans from './pages/admin/AdminWorkoutPlans';
import AdminDietPlans from './pages/admin/AdminDietPlans';
import AdminBookings from './pages/admin/AdminBookings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminMemberships from './pages/admin/AdminMemberships';

// Redirect logged-in users away from home
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" /></div>;
  if (user) return <><Navbar /><HomeLoggedIn /></>;
  return <><Navbar /><Home /></>;
};

// Member layout wrapper (with Navbar)
const MemberLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<><Navbar /><Pricing /></>} />

          {/* Member Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MemberLayout><MemberDashboard /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/sessions" element={
            <ProtectedRoute>
              <MemberLayout><Sessions /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <MemberLayout><BookingHistory /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MemberLayout><Profile /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <MemberLayout><Progress /></MemberLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes — use sidebar layout */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="sessions" element={<AdminSessions />} />
            <Route path="workout-plans" element={<AdminWorkoutPlans />} />
            <Route path="diet-plans" element={<AdminDietPlans />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="memberships" element={<AdminMemberships />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
