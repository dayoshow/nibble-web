import { useState, useEffect } from 'react'
import { getAllUsers, updateUserStatus } from '../../services/admin'
import Navbar from '../../components/layout/Navbar'
import { getInitials } from '../../utils'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/orders', label: 'Orders' },
]

const ROLE_COLORS = { student: 'var(--orange)', vendor: 'var(--green)', runner: '#8B5CF6', admin: 'var(--muted)' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    getAllUsers().then(data => { setUsers(data); setFiltered(data) }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = users
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter)
    if (search.trim()) result = result.filter(u =>
      `${u.first_name} ${u.last_name} ${u.phone_number}`.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, roleFilter, users])

  const handleToggleStatus = async (user) => {
    const next = user.status === 'active' ? 'suspended' : 'active'
    setUpdating(user.id)
    try {
      const updated = await updateUserStatus(user.id, next)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: updated.status } : u))
      toast.success(`User ${next === 'active' ? 'activated' : 'suspended'}`)
    } catch {
      toast.error('Could not update user')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="loading-screen"><div className="spinner spinner-lg" /></div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="container" style={{ padding: '32px 16px' }}>
        <h2 style={{ marginBottom: '24px' }}>Users ({users.length})</h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            className="form-input" style={{ maxWidth: '280px' }}
            placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="form-input" style={{ maxWidth: '160px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="vendor">Vendors</option>
            <option value="runner">Runners</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(user => (
            <div key={user.id} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Avatar */}
              <div style={{ ...styles.avatar, background: ROLE_COLORS[user.role] + '22', color: ROLE_COLORS[user.role] }}>
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '2px' }}>{user.first_name} {user.last_name}</p>
                <p className="text-muted text-sm">{user.phone_number || 'No phone'} · {user.campus?.name || '—'}</p>
              </div>
              <span style={{ color: ROLE_COLORS[user.role], fontWeight: 700, fontSize: '0.78rem',
                background: ROLE_COLORS[user.role] + '18', padding: '3px 10px', borderRadius: '50px' }}>
                {user.role}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600,
                color: user.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>
                {user.status}
              </span>
              <button
                className={`btn btn-sm ${user.status === 'active' ? 'btn-ghost' : 'btn-secondary'}`}
                disabled={updating === user.id}
                onClick={() => handleToggleStatus(user)}
              >
                {updating === user.id ? <span className="spinner" /> : user.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="emoji">👥</div>
              <h3>No users found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
  },
}
