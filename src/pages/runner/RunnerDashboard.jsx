// RunnerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAvailableDeliveries, getRunnerDeliveries, getRunnerEarnings } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira } from '../../utils'

const NAV_LINKS = [
  { to: '/runner', label: 'Dashboard' },
  { to: '/runner/deliveries', label: 'Deliveries' },
  { to: '/runner/earnings', label: 'Earnings' },
]

export default function RunnerDashboard() {
  const [available, setAvailable] = useState([])
  const [active, setActive] = useState([])
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAvailableDeliveries(), getRunnerDeliveries(), getRunnerEarnings()])
      .then(([avail, act, earn]) => { setAvailable(avail); setActive(act); setEarnings(earn) })
      .finally(() => setLoading(false))
  }, [])

  const totalEarnings = earnings.reduce((s, e) => s + Number(e.amount), 0)
  const todayEarnings = earnings
    .filter(e => new Date(e.created_at).toDateString() === new Date().toDateString())
    .reduce((s, e) => s + Number(e.amount), 0)

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
        <h2 style={{ marginBottom: '24px' }}>Runner Dashboard</h2>

        <div className="grid-3" style={{ marginBottom: '32px' }}>
          <StatCard label="Available Jobs" value={available.length} color="var(--orange)" />
          <StatCard label="Today's Earnings" value={formatNaira(todayEarnings)} color="var(--green)" />
          <StatCard label="Total Earned" value={formatNaira(totalEarnings)} color="var(--muted)" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Available Deliveries ({available.length})</h3>
          <Link to="/runner/deliveries" style={{ color: 'var(--orange)', fontSize: '0.875rem', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        {available.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🛵</div>
            <h3>No deliveries available</h3>
            <p>Check back soon — new orders will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {available.slice(0, 3).map(order => (
              <div key={order.id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>From: {order.vendor?.name}</p>
                  <p className="text-muted text-sm">To: {order.hostel?.name} · {order.order_items?.reduce((s, i) => s + i.quantity, 0)} items</p>
                </div>
                <Link to="/runner/deliveries" className="btn btn-primary btn-sm">Accept</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card card-body" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}
