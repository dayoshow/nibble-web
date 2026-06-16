import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderById, subscribeToOrder, cancelOrder } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, formatDate } from '../../utils'
import { ORDER_STATUS } from '../../constants'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/student', label: 'Home' },
  { to: '/student/orders', label: 'My Orders' },
]

const STATUS_STEPS = ['received', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way', 'delivered']

export default function OrderTrackingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch(() => toast.error('Could not load order'))
      .finally(() => setLoading(false))

    // Real-time subscription
    channelRef.current = subscribeToOrder(id, (updated) => {
      setOrder(prev => ({ ...prev, ...updated }))
      const status = ORDER_STATUS[updated.status]
      if (status) toast(status.description, { icon: '📦' })
    })

    return () => channelRef.current?.unsubscribe()
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    try {
      const updated = await cancelOrder(id)
      setOrder(prev => ({ ...prev, status: updated.status }))
      toast.success('Order cancelled.')
    } catch {
      toast.error('Could not cancel order.')
    }
  }

  if (loading) return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="loading-screen"><div className="spinner spinner-lg" /></div>
    </div>
  )

  if (!order) return null

  const currentStatusConfig = ORDER_STATUS[order.status]
  const currentStep = currentStatusConfig?.step || 0
  const isCancelled = order.status === 'cancelled'
  const canCancel = order.status === 'received'

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />

      <div className="container" style={{ padding: '32px 16px', maxWidth: '640px' }}>

        {/* Status card */}
        <div className="card card-body" style={{ ...styles.statusCard, borderColor: currentStatusConfig?.color }}>
          <div style={styles.statusHeader}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px' }}>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <h2 style={{ color: currentStatusConfig?.color, fontFamily: 'var(--font-display)' }}>
                {currentStatusConfig?.label}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                {currentStatusConfig?.description}
              </p>
            </div>
            <span style={{ fontSize: '2.8rem' }}>
              {isCancelled ? '❌' : order.status === 'delivered' ? '✅' : '🛵'}
            </span>
          </div>

          {/* Progress bar */}
          {!isCancelled && (
            <div className="status-progress" style={{ marginTop: '20px' }}>
              {STATUS_STEPS.map((step, i) => {
                const stepNum = ORDER_STATUS[step]?.step || 0
                const isDone = stepNum < currentStep
                const isActive = stepNum === currentStep
                const isLast = i === STATUS_STEPS.length - 1
                return (
                  <div key={step} className="status-step">
                    {!isLast && (
                      <div className={`status-line ${isDone ? 'done' : ''}`} />
                    )}
                    <div className={`status-dot ${isDone ? 'done' : isActive ? 'active' : ''}`} />
                    <span className={`status-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                      {ORDER_STATUS[step]?.label.split(' ').slice(-1)[0]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Delivery info */}
        <div className="card card-body" style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '16px' }}>📍 Delivery Info</h3>
          <div style={styles.infoGrid}>
            <InfoRow label="Hostel" value={order.hostel?.name} />
            <InfoRow label="Room" value={order.room_number} />
            <InfoRow label="Ordered" value={formatDate(order.created_at)} />
            <InfoRow label="Payment" value="💵 Cash on Delivery" />
            {order.runner && (
              <InfoRow label="Runner" value={`${order.runner.first_name} ${order.runner.last_name}`} />
            )}
          </div>
        </div>

        {/* Order items */}
        <div className="card card-body" style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '16px' }}>🧾 Items</h3>
          {order.order_items?.map(item => (
            <div key={item.id} style={styles.orderItem}>
              <span>{item.quantity}× {item.product?.name}</span>
              <span style={{ fontWeight: 600 }}>{formatNaira(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <hr className="divider" />
          <div style={styles.orderItem}>
            <span className="text-muted">Delivery fee</span>
            <span>{formatNaira(order.delivery_fee)}</span>
          </div>
          <div style={{ ...styles.orderItem, fontWeight: 700, fontSize: '1.05rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--orange)' }}>{formatNaira(order.total_amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost btn-full" onClick={() => navigate('/student/orders')}>
            View All Orders
          </button>
          {canCancel && (
            <button className="btn btn-danger btn-full" onClick={handleCancel}>
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
      <span className="text-muted">{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{value || '—'}</span>
    </div>
  )
}

const styles = {
  statusCard: { border: '2px solid var(--orange)' },
  statusHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoGrid: {},
  orderItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' },
}
