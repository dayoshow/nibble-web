import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import { ShoppingBag, LogOut, User } from 'lucide-react'

export default function Navbar({ links = [] }) {
  const { profile, signOut } = useAuthStore()
  const cartCount = useCartStore(s => s.getItemCount())
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span>🍛</span>
          <span style={styles.logoText}>Nibble</span>
        </Link>

        {/* Nav links */}
        <div style={styles.links}>
          {links.map(link => (
            <Link
              key={link.to} to={link.to}
              style={{ ...styles.link, ...(pathname === link.to ? styles.linkActive : {}) }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {profile?.role === 'student' && (
            <Link to="/student/cart" style={styles.cartBtn}>
              <ShoppingBag size={18} />
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </Link>
          )}

          <div style={styles.userChip}>
            <User size={14} />
            <span style={styles.userName}>{profile?.first_name}</span>
          </div>

          <button onClick={handleSignOut} style={styles.signOutBtn} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: 'var(--dark)', position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '2px solid var(--orange)',
  },
  inner: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 16px',
    display: 'flex', alignItems: 'center', height: '60px', gap: '24px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    textDecoration: 'none', flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: '1.4rem', color: 'var(--orange)', letterSpacing: '-0.02em',
  },
  links: { display: 'flex', gap: '4px', flex: 1 },
  link: {
    padding: '6px 14px', borderRadius: 'var(--radius-full)',
    color: '#BFB5A8', fontSize: '0.875rem', fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.15s',
  },
  linkActive: { background: 'rgba(232,99,10,0.2)', color: 'var(--orange)' },
  right: { display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' },
  cartBtn: {
    position: 'relative', background: 'rgba(255,255,255,0.08)',
    border: 'none', color: 'white', padding: '8px', borderRadius: '10px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none',
  },
  cartBadge: {
    position: 'absolute', top: '-6px', right: '-6px',
    background: 'var(--orange)', color: 'white', borderRadius: '50%',
    width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.08)', padding: '6px 12px',
    borderRadius: 'var(--radius-full)', color: '#BFB5A8', fontSize: '0.85rem',
  },
  userName: { fontWeight: 600, color: 'white' },
  signOutBtn: {
    background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)',
    color: '#BFB5A8', padding: '7px', borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', transition: 'all 0.15s',
  },
}
