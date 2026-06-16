import { useState, useEffect } from 'react'
import { getMyVendorProfile } from '../../services/vendor'
import { getVendorOrders, updateOrderStatus } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, timeAgo } from '../../utils'
import { ORDER_STATUS } from '../../constants'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/vendor', label: 'Dashboard' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/menu', label: 'My Menu' },
]

const NEXT_STATUS = {
  received: { next: 'preparing', label: 'Accept & Start Preparing' },
  preparing: { next: 'ready_for_pickup', label: 'Mark Ready for Pickup' },
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([])
  const [vendorId, setVendorId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
  getMyVendorProfile()
    .then(v => {
      if (!v) return []
      setVendorId(v.id)
      return getVendorOrders(v.id)
    })
    .then(setOrders)
    .catch(() => toast.error('Could not load orders'))
    .finally(() => setLoading(false))
}, [])

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdating(orderId)
    try {
      const updated = await updateOrderStatus(orderId, nextStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o))
      toast.success(`Order updated to: ${ORDER_STATUS[nextStatus]?.label}`)
    } catch {
      toast.error('Could not update order status')
    } finally {
      setUpdating(null)
    }
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status))

  if (loading) return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="loading-screen"><div className="spinner spinner-lg" /></div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="container" style={{ padding: '32px 16px', maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '24px' }}>Orders</h2>

        <h3 style={{ marginBottom: '16px' }}>
          Active <span style={{ color: 'var(--orange)' }}>({activeOrders.length})</span>
        </h3>

        {activeOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px' }}>
            <div className="emoji">✅</div>
            <h3>No active orders</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
            {activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                updating={updating === order.id}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}

        {pastOrders.length > 0 && (
          <>
            <h3 style={{ marginBottom: '16px', color: 'var(--muted)' }}>Completed & Cancelled</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pastOrders.slice(0, 10).map(order => (
                <OrderCard key={order.id} order={order} compact />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, onUpdateStatus, updating, compact }) {
  const statusConfig = ORDER_STATUS[order.status]
  const nextAction = NEXT_STATUS[order.status]
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0

  return (
    <div className="card card-body" style={{ borderLeft: `4px solid ${statusConfig?.color}` }}>
      <div style={styles.cardHeader}>
        <div>
          <p style={{ fontWeight: 700, marginBottom: '2px' }}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-muted text-sm">
            {order.hostel?.name} · {timeAgo(order.created_at)}
          </p>
        </div>
        <span style={{ color: statusConfig?.color, fontWeight: 700, fontSize: '0.82rem',
          background: statusConfig?.color + '18', padding: '4px 12px', borderRadius: '50px' }}>
          {statusConfig?.label}
        </span>
      </div>

      {!compact && (
        <>
          <div style={styles.itemsList}>
            {order.order_items?.map(item => (
              <span key={item.id} style={styles.itemTag}>
                {item.quantity}× {item.product?.name}
              </span>
            ))}
          </div>

          <div style={styles.cardFooter}>
            <span style={{ fontWeight: 700, color: 'var(--orange)' }}>
              {formatNaira(order.total_amount)}
            </span>
            {nextAction && (
              <button
                className="btn btn-primary btn-sm"
                disabled={updating}
                onClick={() => onUpdateStatus(order.id, nextAction.next)}
              >
                {updating ? <span className="spinner" /> : nextAction.label}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  itemsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' },
  itemTag: {
    background: 'var(--orange-pale)', color: 'var(--orange)',
    padding: '3px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
  },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
}
