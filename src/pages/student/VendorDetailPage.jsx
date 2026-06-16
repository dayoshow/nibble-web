import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVendorWithProducts } from '../../services/marketplace'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import { ShoppingBag, Plus, Minus, ArrowLeft } from 'lucide-react'
import { formatNaira, getCategoryEmoji } from '../../utils'
import { CATEGORIES } from '../../constants'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/student', label: 'Home' },
  { to: '/student/orders', label: 'My Orders' },
]

export default function VendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { addItem, items, updateQuantity, removeItem, getItemCount, getTotal, vendorId } = useCartStore()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    getVendorWithProducts(id)
      .then(setVendor)
      .catch(() => toast.error('Could not load vendor'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddItem = (product) => {
    const result = addItem(product, vendor.id, vendor.name)
    if (result?.vendorChanged) {
      toast('Cart cleared — you can only order from one vendor at a time.', { icon: '⚠️' })
    } else {
      toast.success(`${product.name} added to cart`)
    }
  }

  const getItemQty = (productId) => {
    const item = items.find(i => i.id === productId)
    return item ? item.quantity : 0
  }

  const availableCategories = vendor
    ? [...new Set(vendor.products?.map(p => p.category))]
    : []

  const displayedProducts = vendor?.products?.filter(p =>
    p.is_available && (activeCategory === 'all' || p.category === activeCategory)
  ) || []

  const cartCount = getItemCount()
  const hasDifferentVendor = vendorId && vendorId !== id

  if (loading) return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="loading-screen"><div className="spinner spinner-lg" /></div>
    </div>
  )

  if (!vendor) return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />
      <div className="empty-state" style={{ marginTop: '80px' }}>
        <div className="emoji">😕</div>
        <h3>Vendor not found</h3>
        <button className="btn btn-primary mt-16" onClick={() => navigate('/student')}>Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />

      {/* Vendor header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <button onClick={() => navigate('/student')} style={styles.backBtn}>
            <ArrowLeft size={18} />
          </button>
          <div style={styles.vendorLogo}>
            {vendor.logo_url
              ? <img src={vendor.logo_url} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              : <span style={{ fontSize: '2.4rem' }}>🍛</span>}
          </div>
          <div>
            <h1 style={styles.vendorName}>{vendor.name}</h1>
            <p style={styles.vendorDesc}>{vendor.description || 'Campus food vendor'}</p>
            <div style={styles.vendorMeta}>
              <span style={{ ...styles.openTag, background: vendor.is_open ? 'var(--success)' : '#888' }}>
                {vendor.is_open ? '● Open' : '● Closed'}
              </span>
              <span style={styles.metaText}>🛵 ₦100 delivery</span>
              <span style={styles.metaText}>⏱ 15–20 min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px 120px' }}>
        {/* Category tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeCategory === 'all' ? styles.tabActive : {}) }}
            onClick={() => setActiveCategory('all')}
          >All</button>
          {CATEGORIES.filter(c => availableCategories.includes(c.key)).map(cat => (
            <button
              key={cat.key}
              style={{ ...styles.tab, ...(activeCategory === cat.key ? styles.tabActive : {}) }}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Products */}
        {displayedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🍽️</div>
            <h3>No items in this category</h3>
          </div>
        ) : (
          <div style={styles.productGrid}>
            {displayedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                qty={getItemQty(product.id)}
                onAdd={() => handleAddItem(product)}
                onIncrease={() => updateQuantity(product.id, getItemQty(product.id) + 1)}
                onDecrease={() => {
                  const q = getItemQty(product.id)
                  if (q <= 1) removeItem(product.id)
                  else updateQuantity(product.id, q - 1)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {cartCount > 0 && !hasDifferentVendor && (
        <div style={styles.cartBar}>
          <div style={styles.cartBarInner}>
            <div style={styles.cartInfo}>
              <div style={styles.cartCount}>{cartCount}</div>
              <span style={{ color: 'white', fontWeight: 600 }}>item{cartCount > 1 ? 's' : ''} in cart</span>
            </div>
            <button className="btn btn-lg" style={styles.cartBtn} onClick={() => navigate('/student/cart')}>
              <ShoppingBag size={18} />
              View Cart · {formatNaira(getTotal())}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, qty, onAdd, onIncrease, onDecrease }) {
  return (
    <div className="card" style={styles.productCard}>
      <div style={styles.productImg}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '2.5rem' }}>{getCategoryEmoji(product.category)}</span>
        }
      </div>
      <div style={styles.productBody}>
        <h4 style={styles.productName}>{product.name}</h4>
        {product.description && (
          <p style={styles.productDesc}>{product.description}</p>
        )}
        <div style={styles.productFooter}>
          <span style={styles.productPrice}>{formatNaira(product.price)}</span>
          {qty === 0 ? (
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              <Plus size={14} /> Add
            </button>
          ) : (
            <div style={styles.qtyControl}>
              <button style={styles.qtyBtn} onClick={onDecrease}><Minus size={14} /></button>
              <span style={styles.qtyNum}>{qty}</span>
              <button style={styles.qtyBtn} onClick={onIncrease}><Plus size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  header: { background: 'var(--dark)', padding: '24px 16px 28px' },
  headerInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '16px' },
  backBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
    padding: '8px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0, marginTop: '4px',
  },
  vendorLogo: {
    width: '64px', height: '64px', background: 'var(--orange-pale)',
    borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
  },
  vendorName: { color: 'white', marginBottom: '4px', fontSize: '1.5rem' },
  vendorDesc: { color: '#BFB5A8', fontSize: '0.875rem', marginBottom: '10px' },
  vendorMeta: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  openTag: { color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '50px' },
  metaText: { color: '#BFB5A8', fontSize: '0.82rem' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: {
    padding: '8px 18px', borderRadius: '50px', border: '1.5px solid var(--border)',
    background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
    color: 'var(--muted)', transition: 'all 0.15s',
  },
  tabActive: { background: 'var(--orange)', color: 'white', border: '1.5px solid var(--orange)' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  productCard: { display: 'flex', flexDirection: 'column' },
  productImg: {
    height: '140px', background: 'var(--orange-pale)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  productBody: { padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  productName: { fontSize: '0.95rem', color: 'var(--dark)' },
  productDesc: { fontSize: '0.8rem', color: 'var(--muted)', flex: 1 },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  productPrice: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--orange)' },
  qtyControl: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--orange-pale)', borderRadius: '50px', padding: '4px 8px',
  },
  qtyBtn: {
    background: 'var(--orange)', border: 'none', color: 'white',
    width: '26px', height: '26px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  qtyNum: { fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)', minWidth: '20px', textAlign: 'center' },
  cartBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'var(--dark)', borderTop: '2px solid var(--orange)',
    padding: '12px 16px', zIndex: 50,
  },
  cartBarInner: { maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cartInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  cartCount: {
    background: 'var(--orange)', color: 'white', width: '28px', height: '28px',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.875rem',
  },
  cartBtn: { background: 'var(--orange)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
}
