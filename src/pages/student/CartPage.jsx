import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import Navbar from '../../components/layout/Navbar'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { formatNaira, getCategoryEmoji } from '../../utils'
import { DELIVERY_FEE } from '../../constants'

const NAV_LINKS = [
  { to: '/student', label: 'Home' },
  { to: '/student/orders', label: 'My Orders' },
]

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTotal, vendorName } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <Navbar links={NAV_LINKS} />
        <div className="empty-state" style={{ marginTop: '80px' }}>
          <div className="emoji"><ShoppingBag size={48} style={{ color: 'var(--muted)' }} /></div>
          <h3>Your cart is empty</h3>
          <p>Browse vendors and add items to get started.</p>
          <button className="btn btn-primary mt-16" onClick={() => navigate('/student')}>
            Browse Vendors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />

      <div className="container" style={{ padding: '32px 16px', maxWidth: '640px' }}>
        <div style={styles.pageHeader}>
          <h2>Your Cart</h2>
          <button style={styles.clearBtn} onClick={() => { clearCart(); navigate('/student') }}>
            Clear cart
          </button>
        </div>

        <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
          From <strong style={{ color: 'var(--dark)' }}>{vendorName}</strong>
        </p>

        {/* Items */}
        <div style={styles.itemsList}>
          {items.map(item => (
            <div key={item.id} className="card card-body" style={styles.cartItem}>
              <div style={styles.itemEmoji}>{getCategoryEmoji(item.category)}</div>
              <div style={styles.itemInfo}>
                <h4 style={{ fontSize: '0.95rem' }}>{item.name}</h4>
                <span style={styles.itemPrice}>{formatNaira(item.price)}</span>
              </div>
              <div style={styles.itemControls}>
                <button style={styles.qtyBtn} onClick={() => {
                  if (item.quantity <= 1) removeItem(item.id)
                  else updateQuantity(item.id, item.quantity - 1)
                }}>
                  {item.quantity <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                </button>
                <span style={styles.qtyNum}>{item.quantity}</span>
                <button style={{ ...styles.qtyBtn, background: 'var(--orange)' }}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <span style={styles.itemTotal}>{formatNaira(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="card card-body" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Order Summary</h3>
          <div style={styles.summaryRow}>
            <span className="text-muted">Subtotal</span>
            <span style={{ fontWeight: 600 }}>{formatNaira(getSubtotal())}</span>
          </div>
          <div style={styles.summaryRow}>
            <span className="text-muted">Delivery fee</span>
            <span style={{ fontWeight: 600 }}>{formatNaira(DELIVERY_FEE)}</span>
          </div>
          <div style={styles.summaryRow}>
            <span className="text-muted text-sm">Payment</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600 }}>💵 Cash on Delivery</span>
          </div>
          <hr className="divider" />
          <div style={styles.summaryTotal}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Total</span>
            <span style={styles.totalAmount}>{formatNaira(getTotal())}</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          style={{ marginTop: '24px' }}
          onClick={() => navigate('/student/checkout')}
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  )
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  clearBtn: { background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  itemEmoji: {
    width: '48px', height: '48px', background: 'var(--orange-pale)',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
  },
  itemInfo: { flex: 1 },
  itemPrice: { fontSize: '0.82rem', color: 'var(--muted)' },
  itemControls: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '28px', height: '28px', background: 'var(--border)',
    border: 'none', borderRadius: '50%', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark)',
  },
  qtyNum: { fontWeight: 700, minWidth: '20px', textAlign: 'center' },
  itemTotal: { fontWeight: 700, color: 'var(--orange)', flexShrink: 0, fontSize: '0.95rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalAmount: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--orange)' },
}
