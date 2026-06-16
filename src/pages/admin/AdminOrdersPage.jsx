import { useState, useEffect } from 'react'
import { getAllOrders } from '../../services/admin'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, timeAgo } from '../../utils'
import { ORDER_STATUS } from '../../constants'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/orders', label: 'Orders' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllOrders().then(data => { setOrders(data); setFiltered(data) }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setFiltered(statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter))
  }, [statusFilter, orders])

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
        <h2 style={{ marginBottom: '24px' }}>All Orders ({orders.length})</h2>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['all', ...Object.keys(ORDER_STATUS)].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: '50px', border: '1.5px solid var(--border)',
                background: statusFilter === s ? 'var(--orange)' : 'white',
                color: statusFilter === s ? 'white' : 'var(--muted)',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'All' : ORDER_STATUS[s]?.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="emoji">📦</div>
              <h3>No orders found</h3>
            </div>
          )}
          {filtered.map(order => {
            const status = ORDER_STATUS[order.status]
            return (
              <div key={order.id} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
                    #{order.id.slice(0, 8).toUpperCase()} · {order.vendor?.name}
                  </p>
                  <p className="text-muted text-sm">
                    {order.student?.first_name} {order.student?.last_name} → {order.hostel?.name}
                  </p>
                  <p className="text-muted text-sm">{timeAgo(order.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {order.runner && (
                    <span className="text-muted text-sm">
                      🛵 {order.runner.first_name}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, color: 'var(--orange)' }}>
                    {formatNaira(order.total_amount)}
                  </span>
                  <span style={{
                    color: status?.color, fontWeight: 600, fontSize: '0.78rem',
                    background: status?.color + '18', padding: '3px 10px', borderRadius: '50px',
                  }}>
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
