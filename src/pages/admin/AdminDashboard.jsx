import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlatformStats, getAllOrders } from '../../services/admin'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, timeAgo } from '../../utils'
import { ORDER_STATUS } from '../../constants'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/orders', label: 'Orders' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPlatformStats(), getAllOrders()])
      .then(([s, o]) => { setStats(s); setRecentOrders(o.slice(0, 8)) })
      .finally(() => setLoading(false))
  }, [])

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
        <h2 style={{ marginBottom: '8px' }}>Admin Dashboard</h2>
        <p className="text-muted" style={{ marginBottom: '28px' }}>UNILAG Pilot — Platform Overview</p>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '36px' }}>
          <StatCard label="Students" value={stats?.totalStudents} color="var(--orange)" />
          <StatCard label="Vendors" value={stats?.activeVendors} color="var(--green)" />
          <StatCard label="Runners" value={stats?.activeRunners} color="var(--yellow)" />
          <StatCard label="Total Orders" value={stats?.totalOrders} color="var(--muted)" />
        </div>

        {/* Quick links */}
        <div className="grid-3" style={{ marginBottom: '36px' }}>
          {[
            { to: '/admin/users', label: 'Manage Users', emoji: '👥' },
            { to: '/admin/vendors', label: 'Manage Vendors', emoji: '🍽️' },
            { to: '/admin/orders', label: 'Monitor Orders', emoji: '📦' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
              <div className="card card-body card-hover" style={{ textAlign: 'center', padding: '28px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{link.emoji}</div>
                <p style={{ fontWeight: 600 }}>{link.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" style={{ color: 'var(--orange)', fontSize: '0.875rem', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentOrders.map(order => {
            const status = ORDER_STATUS[order.status]
            return (
              <div key={order.id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {order.student?.first_name} {order.student?.last_name} → {order.vendor?.name}
                  </p>
                  <p className="text-muted text-sm">{order.hostel?.name} · {timeAgo(order.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{formatNaira(order.total_amount)}</span>
                  <span style={{ color: status?.color, fontWeight: 600, fontSize: '0.78rem',
                    background: status?.color + '18', padding: '3px 10px', borderRadius: '50px' }}>
                    {status?.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card card-body" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value ?? '—'}</p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}
