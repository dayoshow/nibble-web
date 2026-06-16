import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudentOrders } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, timeAgo } from '../../utils'
import { ORDER_STATUS } from '../../constants'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/student', label: 'Home' },
  { to: '/student/orders', label: 'My Orders' },
]

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentOrders()
      .then(setOrders)
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />

      <div className="container" style={{ padding: '32px 16px', maxWidth: '720px' }}>
        <h2 style={{ marginBottom: '24px' }}>My Orders</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📦</div>
            <h3>No orders yet</h3>
            <p>Place your first order and it will appear here.</p>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/student')}>
              Start Ordering
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/student/orders/${order.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, onClick }) {
  const statusConfig = ORDER_STATUS[order.status]
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0

  return (
    <div className="card card-hover" onClick={onClick} style={styles.card}>
      <div style={styles.cardInner}>
        <div style={styles.vendorIcon}>🍛</div>
        <div style={styles.info}>
          <div style={styles.top}>
            <h4 style={{ fontSize: '0.95rem' }}>{order.vendor?.name}</h4>
            <span style={{ ...styles.badge, color: statusConfig?.color, background: statusConfig?.color + '18' }}>
              {statusConfig?.label}
            </span>
          </div>
          <p style={styles.meta}>
            {itemCount} item{itemCount > 1 ? 's' : ''} · {formatNaira(order.total_amount)}
          </p>
          <p style={styles.time}>{timeAgo(order.created_at)}</p>
        </div>
        <span style={styles.arrow}>›</span>
      </div>
    </div>
  )
}

const styles = {
  card: { cursor: 'pointer' },
  cardInner: { padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' },
  vendorIcon: {
    width: '48px', height: '48px', background: 'var(--orange-pale)',
    borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
  },
  info: { flex: 1 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  badge: { fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '50px' },
  meta: { fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2px' },
  time: { fontSize: '0.78rem', color: 'var(--muted)' },
  arrow: { fontSize: '1.4rem', color: 'var(--muted)' },
}
