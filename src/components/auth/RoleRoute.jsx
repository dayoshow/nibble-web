import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function RoleRoute({ role }) {
  const { profile, loading } = useAuthStore()
  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (!profile.campus_id) return <Navigate to="/complete-profile" replace />
  if (profile.role !== role) {
    const roleMap = { 
      student: '/student', 
      vendor: '/vendor', 
      runner: '/runner', 
      admin: '/admin' 
    }
    return <Navigate to={roleMap[profile.role] || '/login'} replace />
  }
  return <Outlet />
}