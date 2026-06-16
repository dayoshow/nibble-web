import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './services/supabase'
import useAuthStore from './store/authStore'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CompleteProfilePage from './pages/auth/CompleteProfilePage'

// Student pages
import StudentHome from './pages/student/StudentHome'
import VendorDetailPage from './pages/student/VendorDetailPage'
import CartPage from './pages/student/CartPage'
import CheckoutPage from './pages/student/CheckoutPage'
import OrderTrackingPage from './pages/student/OrderTrackingPage'
import OrderHistoryPage from './pages/student/OrderHistoryPage'

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorOrdersPage from './pages/vendor/VendorOrdersPage'
import VendorMenuPage from './pages/vendor/VendorMenuPage'

// Runner pages
import RunnerDashboard from './pages/runner/RunnerDashboard'
import RunnerDeliveriesPage from './pages/runner/RunnerDeliveriesPage'
import RunnerEarningsPage from './pages/runner/RunnerEarningsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminVendorsPage from './pages/admin/AdminVendorsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleRoute from './components/auth/RoleRoute'

export default function App() {
  const { setSession, loading } = useAuthStore()

  useEffect(() => {
    // Initialize session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p className="text-muted">Loading Nibble...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — complete profile */}
        <Route element={<ProtectedRoute />}>
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          {/* Student routes */}
          <Route element={<RoleRoute role="student" />}>
            <Route path="/student"                element={<StudentHome />} />
            <Route path="/student/vendor/:id"     element={<VendorDetailPage />} />
            <Route path="/student/cart"           element={<CartPage />} />
            <Route path="/student/checkout"       element={<CheckoutPage />} />
            <Route path="/student/orders"         element={<OrderHistoryPage />} />
            <Route path="/student/orders/:id"     element={<OrderTrackingPage />} />
          </Route>

          {/* Vendor routes */}
          <Route element={<RoleRoute role="vendor" />}>
            <Route path="/vendor"         element={<VendorDashboard />} />
            <Route path="/vendor/orders"  element={<VendorOrdersPage />} />
            <Route path="/vendor/menu"    element={<VendorMenuPage />} />
          </Route>

          {/* Runner routes */}
          <Route element={<RoleRoute role="runner" />}>
            <Route path="/runner"                element={<RunnerDashboard />} />
            <Route path="/runner/deliveries"     element={<RunnerDeliveriesPage />} />
            <Route path="/runner/earnings"       element={<RunnerEarningsPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin"          element={<AdminDashboard />} />
            <Route path="/admin/users"    element={<AdminUsersPage />} />
            <Route path="/admin/vendors"  element={<AdminVendorsPage />} />
            <Route path="/admin/orders"   element={<AdminOrdersPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

// Redirect root based on role
function RootRedirect() {
  const { profile, session, loading } = useAuthStore()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/login" replace />
  if (!profile.campus_id) return <Navigate to="/complete-profile" replace />
  const roleMap = { 
    student: '/student', 
    vendor: '/vendor', 
    runner: '/runner', 
    admin: '/admin' 
  }
  return <Navigate to={roleMap[profile.role] || '/login'} replace />
}
