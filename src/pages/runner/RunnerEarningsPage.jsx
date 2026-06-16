import { useState, useEffect } from 'react'
import { getRunnerEarnings } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, formatDate } from '../../utils'

const NAV_LINKS = [
  { to: '/runner', label: 'Dashboard' },
  { to: '/runner/deliveries', label: 'Deliveries' },
  { to: '/runner/earnings', label: 'Earnings' },
]

export default function RunnerEarningsPage() {
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRunnerEarnings().then(setEarnings).finally(() => setLoading(false))
  }, [])

  const totalEarnings = earnings.reduce((s, e) => s + Number(e.amount), 0)
  const todayEarnings = earnings
    .filter(e => new Date(e.created_at).toDateString() === new Date().toDateString())
    .reduce((s, e) => s + Number(e.amount), 0)
  const weekEarnings = earnings
    .filter(e => {
      const d = new Date(e.created_at)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    })
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
      <div className="container" style={{ padding: '32px 16px', maxWidth: '640px' }}>
        <h2 style={{ marginBottom: '24px' }}>My Earnings</h2>

        <div className="grid-3" style={{ marginBottom: '32px' }}>
          <StatCard label="Today" value={formatNaira(todayEarnings)} color="var(--orange)" />
          <StatCard label="This Week" value={formatNaira(weekEarnings)} color="var(--green)" />
          <StatCard label="All Time" value={formatNaira(totalEarnings)} color="var(--muted)" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Transaction History</h3>
          <span className="text-muted text-sm">{earnings.length} deliveries</span>
        </div>

        {earnings.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">💰</div>
            <h3>No earnings yet</h3>
            <p>Complete your first delivery to start earning.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {earnings.map(e => (
              <div key={e.id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '2px', fontSize: '0.9rem' }}>
                    Delivery #{e.order_id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-muted text-sm">{formatDate(e.created_at)}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>
                  +{formatNaira(e.amount)}
                </span>
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
      <p style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}
