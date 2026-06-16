import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHostelsByCampus } from '../../services/marketplace'
import { createOrder } from '../../services/orders'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import Navbar from '../../components/layout/Navbar'
import { formatNaira } from '../../utils'
import { DELIVERY_FEE } from '../../constants'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/student', label: 'Home' },
  { to: '/student/cart', label: 'Cart' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { items, vendorId, getSubtotal, getTotal, clearCart } = useCartStore()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    hostel_id: profile?.hostel_id || '',
    room_number: profile?.room_number || '',
    notes: '',
  })

  useEffect(() => {
    if (items.length === 0) navigate('/student/cart')
  }, [items, navigate])

  useEffect(() => {
    if (profile?.campus_id) {
      getHostelsByCampus(profile.campus_id).then(setHostels)
    }
  }, [profile?.campus_id])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async () => {
    if (!form.hostel_id) { toast.error('Select your delivery hostel'); return }
    if (!form.room_number) { toast.error('Enter your room number'); return }

    setLoading(true)
    try {
      const orderItems = items.map(i => ({
        product_id: i.id,
        quantity: i.quantity,
        unit_price: i.price,
      }))

      const order = await createOrder({
        vendorId,
        hostelId: form.hostel_id,
        roomNumber: form.room_number,
        items: orderItems,
        notes: form.notes,
      })

      clearCart()
      toast.success('Order placed! 🎉 Pay cash on delivery.')
      navigate(`/student/orders/${order.id}`)
    } catch (err) {
      toast.error(err.message || 'Could not place order. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />

      <div className="container" style={{ padding: '32px 16px', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '8px' }}>Checkout</h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          Confirm your delivery details before placing your order.
        </p>

        {/* Delivery details */}
        <div className="card card-body" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>📍 Delivery Details</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Delivery hostel</label>
              <select name="hostel_id" className="form-input" value={form.hostel_id} onChange={handleChange}>
                <option value="">Select hostel</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Room number</label>
              <input
                type="text" name="room_number" className="form-input"
                placeholder="e.g. Block A, Room 14"
                value={form.room_number} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Special instructions <span style={{ color: 'var(--muted)' }}>(optional)</span>
              </label>
              <textarea
                name="notes" className="form-input"
                placeholder="Any notes for the vendor or runner..."
                rows={3}
                value={form.notes} onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="card card-body" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>🧾 Order Summary</h3>
          {items.map(item => (
            <div key={item.id} style={styles.summaryItem}>
              <span>{item.quantity}× {item.name}</span>
              <span style={{ fontWeight: 600 }}>{formatNaira(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr className="divider" />
          <div style={styles.summaryItem}>
            <span className="text-muted">Subtotal</span>
            <span>{formatNaira(getSubtotal())}</span>
          </div>
          <div style={styles.summaryItem}>
            <span className="text-muted">Delivery fee</span>
            <span>{formatNaira(DELIVERY_FEE)}</span>
          </div>
          <hr className="divider" />
          <div style={{ ...styles.summaryItem, fontWeight: 700, fontSize: '1.1rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--orange)' }}>{formatNaira(getTotal())}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="card card-body" style={{ marginBottom: '24px', background: 'var(--green-pale)', border: '1.5px solid var(--green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>💵</span>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--green)', marginBottom: '2px' }}>Cash on Delivery</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Pay the runner <strong>{formatNaira(getTotal())}</strong> when your order arrives.
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : `Place Order · ${formatNaira(getTotal())}`}
        </button>
      </div>
    </div>
  )
}

const styles = {
  summaryItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '10px', fontSize: '0.9rem',
  },
}
