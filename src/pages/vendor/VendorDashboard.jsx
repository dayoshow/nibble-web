// ── VendorDashboard.jsx ──────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyVendorProfile, toggleVendorOpen } from '../../services/vendor'
import { getVendorOrders } from '../../services/orders'
import Navbar from '../../components/layout/Navbar'
import { formatNaira } from '../../utils'
import { ORDER_STATUS } from '../../constants'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/vendor', label: 'Dashboard' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/menu', label: 'My Menu' },
]

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  getMyVendorProfile()
    .then(v => {
      setVendor(v)
      if (v?.id) return getVendorOrders(v.id)
      return []
    })
    .then(o => setOrders(o || []))
    .catch(() => toast.error('Could not load dashboard'))
    .finally(() => setLoading(false))
}, [])

  const handleToggleOpen = async () => {
    try {
      const updated = await toggleVendorOpen(vendor.id, !vendor.is_open)
      setVendor(updated)
      toast.success(updated.is_open ? 'You are now Open 🟢' : 'You are now Closed 🔴')
    } catch {
      toast.error('Could not update status')
    }
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const todayRevenue = orders
    .filter(o => o.status === 'delivered' && new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + Number(o.total_amount), 0)

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

        {/* Vendor header */}
        <div style={styles.vendorHeader}>
          <div>
            <h2 style={{ marginBottom: '4px' }}>{vendor?.name || 'My Vendor'}</h2>
            <p className="text-muted">{vendor?.description || 'Campus food vendor'}</p>
          </div>
          <button
            className={`btn ${vendor?.is_open ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleToggleOpen}
            style={{ minWidth: '140px' }}
          >
            {vendor?.is_open ? '🔴 Close Shop' : '🟢 Open Shop'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '32px' }}>
          <StatCard label="Active Orders" value={activeOrders.length} color="var(--orange)" />
          <StatCard label="Today's Revenue" value={formatNaira(todayRevenue)} color="var(--green)" />
          <StatCard label="Total Orders" value={orders.length} color="var(--muted)" />
        </div>

        {/* Active orders preview */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Active Orders</h3>
          <Link to="/vendor/orders" style={{ color: 'var(--orange)', fontSize: '0.875rem', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">✅</div>
            <h3>No active orders</h3>
            <p>New orders will appear here in real time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeOrders.slice(0, 5).map(order => (
              <VendorOrderRow key={order.id} order={order} />
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
      <p style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}

function VendorOrderRow({ order }) {
  const status = ORDER_STATUS[order.status]
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0
  return (
    <div className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontWeight: 600, marginBottom: '2px' }}>
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-muted text-sm">{itemCount} items · {order.hostel?.name}</p>
      </div>
      <span style={{ color: status?.color, fontWeight: 700, fontSize: '0.82rem',
        background: status?.color + '18', padding: '4px 12px', borderRadius: '50px' }}>
        {status?.label}
      </span>
    </div>
  )
}

const styles = {
  vendorHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '28px', gap: '16px', flexWrap: 'wrap',
  },
}
