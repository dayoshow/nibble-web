import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../../services/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      await signInWithEmail(form)
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.logo}>🍛</span>
          <span style={styles.logoText}>Nibble</span>
        </div>
        <p style={styles.tagline}>Campus food, delivered fast.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email" name="email" className="form-input"
              placeholder="you@unilag.edu.ng"
              value={form.email} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-input"
              placeholder="Your password"
              value={form.password} onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--orange)', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>

      {/* Background decoration */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--dark)',
    padding: '24px', position: 'relative', overflow: 'hidden',
  },
  card: {
    background: 'var(--surface)', borderRadius: '24px',
    padding: '40px 36px', width: '100%', maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1,
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  logo: { fontSize: '2.2rem' },
  logoText: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: '2rem', color: 'var(--orange)', letterSpacing: '-0.03em',
  },
  tagline: { color: 'var(--muted)', marginBottom: '32px', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  footer: { textAlign: 'center', marginTop: '24px', color: 'var(--muted)', fontSize: '0.9rem' },
  bgCircle1: {
    position: 'absolute', width: '400px', height: '400px',
    background: 'rgba(232,99,10,0.12)', borderRadius: '50%',
    top: '-100px', right: '-100px', pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute', width: '300px', height: '300px',
    background: 'rgba(45,106,45,0.10)', borderRadius: '50%',
    bottom: '-80px', left: '-80px', pointerEvents: 'none',
  },
}
