import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getVendors } from '../../services/marketplace'
import useAuthStore from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import { Search } from 'lucide-react'
import { CATEGORIES } from '../../constants'

const NAV_LINKS = [
  { to: '/student', label: 'Home' },
  { to: '/student/orders', label: 'My Orders' },
]

export default function StudentHome() {
  const { profile } = useAuthStore()
  const [vendors, setVendors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVendors(profile?.campus_id)
      .then(data => { setVendors(data); setFiltered(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [profile?.campus_id])

  useEffect(() => {
    if (!search.trim()) { setFiltered(vendors); return }
    setFiltered(vendors.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, vendors])

  return (
    <div className="page-wrapper">
      <Navbar links={NAV_LINKS} />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.greeting}>Good day, {profile?.first_name} 👋</p>
          <h1 style={styles.heroTitle}>What are you eating today?</h1>
          <p style={styles.heroSub}>
            {profile?.hostel?.name || profile?.hostel_id
              ? `Delivering to ${profile?.hostel?.name || 'your hostel'}`
              : 'Fast delivery to your hostel'}
          </p>

          {/* Search */}
          <div style={styles.searchWrap}>
            <Search size={18} style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search vendors or food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 16px' }}>
        {/* Categories */}
        <div style={styles.categories}>
          {CATEGORIES.map(cat => (
            <div key={cat.key} style={styles.catChip}>
              <span style={{ fontSize: '1.4rem' }}>{cat.emoji}</span>
              <span style={styles.catLabel}>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Vendors */}
        <h2 style={styles.sectionTitle}>
          {search ? `Results for "${search}"` : 'Vendors on Campus'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🍽️</div>
            <h3>No vendors found</h3>
            <p>Try a different search or check back later.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VendorCard({ vendor }) {
  return (
    <Link to={`/student/vendor/${vendor.id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-hover">
        {/* Vendor image / placeholder */}
        <div style={styles.vendorImg}>
          {vendor.logo_url
            ? <img src={vendor.logo_url} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '3rem' }}>🍛</span>
          }
          <span style={{ ...styles.openBadge, background: vendor.is_open ? 'var(--success)' : '#888' }}>
            {vendor.is_open ? 'Open' : 'Closed'}
          </span>
        </div>
        <div className="card-body">
          <h3 style={{ marginBottom: '4px', fontSize: '1rem' }}>{vendor.name}</h3>
          <p className="text-muted" style={{ fontSize: '0.82rem' }}>{vendor.description || 'Campus vendor'}</p>
          <p style={styles.deliveryNote}>🛵 ₦100 delivery · ~15–20 min</p>
        </div>
      </div>
    </Link>
  )
}

const styles = {
  hero: { background: 'var(--dark)', padding: '40px 16px 48px' },
  heroInner: { maxWidth: '720px', margin: '0 auto' },
  greeting: { color: 'var(--orange)', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' },
  heroTitle: { color: 'white', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '8px' },
  heroSub: { color: '#BFB5A8', marginBottom: '24px', fontSize: '0.95rem' },
  searchWrap: {
    position: 'relative', maxWidth: '520px',
    background: 'rgba(255,255,255,0.08)', borderRadius: '50px',
    display: 'flex', alignItems: 'center',
  },
  searchIcon: { position: 'absolute', left: '18px', color: 'var(--muted)' },
  searchInput: {
    width: '100%', padding: '14px 20px 14px 48px',
    background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: '50px', color: 'white', fontSize: '0.95rem',
    fontFamily: 'var(--font-body)', outline: 'none',
  },
  categories: { display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' },
  catChip: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'white', border: '1.5px solid var(--border)',
    padding: '10px 18px', borderRadius: 'var(--radius-full)',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  catLabel: { fontWeight: 600, fontSize: '0.875rem', color: 'var(--dark)' },
  sectionTitle: { marginBottom: '20px' },
  vendorImg: {
    height: '150px', background: 'var(--orange-pale)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  openBadge: {
    position: 'absolute', top: '10px', right: '10px',
    color: 'white', fontSize: '0.72rem', fontWeight: 700,
    padding: '3px 10px', borderRadius: 'var(--radius-full)',
  },
  deliveryNote: { marginTop: '8px', fontSize: '0.8rem', color: 'var(--muted)' },
}
