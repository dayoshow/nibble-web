import { useState, useEffect } from 'react'
import { getAvailableDeliveries, getRunnerDeliveries, acceptDelivery, markDelivered } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, timeAgo } from '../../utils'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/runner', label: 'Dashboard' },
  { to: '/runner/deliveries', label: 'Deliveries' },
  { to: '/runner/earnings', label: 'Earnings' },
]

export default function RunnerDeliveriesPage() {
  const [available, setAvailable] = useState([])
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const load = () =>
    Promise.all([getAvailableDeliveries(), getRunnerDeliveries()])
      .then(([avail, act]) => { setAvailable(avail); setActive(act) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleAccept = async (orderId) => {
    setUpdating(orderId)
    try {
      await acceptDelivery(orderId)
      toast.success('Delivery accepted! Head to the vendor.')
      load()
    } catch {
      toast.error('Could not accept delivery — it may already be taken.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDeliver = async (orderId) => {
    setUpdating(orderId)
    try {
      await markDelivered(orderId)
      toast.success('Delivery complete! ₦50 added to your earnings.')
      load()
    } catch {
      toast.error('Could not mark as delivered')
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
      <div className="container" style={{ padding: '32px 16px', maxWidth: '720px' }}>
        <h2 style={{ marginBottom: '28px' }}>Deliveries</h2>

        {/* Active deliveries */}
        {active.length > 0 && (
          <>
            <h3 style={{ marginBottom: '14px', color: 'var(--orange)' }}>
              🛵 My Active Deliveries ({active.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {active.map(order => (
                <div key={order.id} className="card card-body" style={{ borderLeft: '4px solid var(--orange)' }}>
                  <div style={styles.cardHeader}>
                    <div>
                      <p style={{ fontWeight: 700 }}>From: {order.vendor?.name}</p>
                      <p className="text-muted text-sm">
                        To: {order.hostel?.name} · {order.order_items?.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                      <p className="text-muted text-sm">{timeAgo(order.created_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--orange)', marginBottom: '8px' }}>
                        {formatNaira(order.total_amount)}
                      </p>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={updating === order.id}
                        onClick={() => handleDeliver(order.id)}
                      >
                        {updating === order.id ? <span className="spinner" /> : '✅ Mark Delivered'}
                      </button>
                    </div>
                  </div>
                  <div style={styles.itemsList}>
                    {order.order_items?.map(i => (
                      <span key={i.id} style={styles.itemTag}>{i.quantity}× {i.product?.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Available deliveries */}
        <h3 style={{ marginBottom: '14px' }}>
          Available Jobs ({available.length})
        </h3>

        {available.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🛵</div>
            <h3>No deliveries available right now</h3>
            <p>New jobs appear as vendors mark orders ready for pickup.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {available.map(order => (
              <div key={order.id} className="card card-body" style={{ borderLeft: '4px solid var(--green)' }}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={{ fontWeight: 700 }}>From: {order.vendor?.name}</p>
                    <p className="text-muted text-sm">
                      To: {order.hostel?.name} · {order.order_items?.reduce((s, i) => s + i.quantity, 0)} items
                    </p>
                    <p style={{ color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600, marginTop: '4px' }}>
                      Earn: ₦50
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={updating === order.id}
                    onClick={() => handleAccept(order.id)}
                  >
                    {updating === order.id ? <span className="spinner" /> : 'Accept Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  itemsList: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  itemTag: {
    background: 'var(--orange-pale)', color: 'var(--orange)',
    padding: '2px 10px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600,
  },
}
