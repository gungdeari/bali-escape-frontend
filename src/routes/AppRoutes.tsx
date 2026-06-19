import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import Home from "../pages/Home";
import Packages from "../pages/Packages";     
import PackageDetail from "../pages/PackageDetail";
import BookingNew from "../pages/BookingNew"; 
import BookingSuccess from "../pages/BookingSuccess";
import BookingDetail from "../pages/BookingDetail";
import MyBookings from "../pages/MyBooking";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminBookingDetail from "../pages/admin/AdminBookingDetail";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return <>{children}</>;
}

// redirects to / if not an admin
// used to protect all /admin/* routes
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)         return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        // public route
        <Route path="/" element={<Home />} />
        <Route path="/packages"    element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />

        // auth pages - redirect home
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        // user protected pages
        <Route path="/bookings/new" element={
          <ProtectedRoute><BookingNew /></ProtectedRoute>
        } />
        <Route path="/bookings/success" element={
          <ProtectedRoute><BookingSuccess /></ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute><BookingDetail /></ProtectedRoute>
        } />

        // admin protected page
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/bookings/:id" element={
          <AdminRoute><AdminBookingDetail /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}