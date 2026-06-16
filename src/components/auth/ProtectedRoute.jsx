import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

// Requires any authenticated session
export default function ProtectedRoute() {
  const { session, loading } = useAuthStore()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
