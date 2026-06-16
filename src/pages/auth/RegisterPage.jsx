import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUpWithEmail } from '../../services/auth'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'student', label: '🎓 Student — I want to order food' },
  { value: 'vendor',  label: '🍽️ Vendor — I sell food on campus' },
  { value: 'runner',  label: '🏃 Runner — I deliver orders' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'student',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Fill in all fields'); return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return
    }
    setLoading(true)
    try {
      await signUpWithEmail({
        email: form.email, password: form.password,
        firstName: form.firstName, lastName: form.lastName, role: form.role,
      })
      toast.success('Account created! Check your email to confirm.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.logo}>🍛</span>
          <span style={styles.logoText}>Nibble</span>
        </div>
        <p style={styles.tagline}>Create your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First name</label>
              <input type="text" name="firstName" className="form-input"
                placeholder="Emeka" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Last name</label>
              <input type="text" name="lastName" className="form-input"
                placeholder="Obi" value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" name="email" className="form-input"
              placeholder="you@unilag.edu.ng" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select name="role" className="form-input" value={form.role} onChange={handleChange}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input"
              placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input type="password" name="confirmPassword" className="form-input"
              placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
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
    padding: '40px 36px', width: '100%', maxWidth: '480px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1,
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  logo: { fontSize: '2.2rem' },
  logoText: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: '2rem', color: 'var(--orange)', letterSpacing: '-0.03em',
  },
  tagline: { color: 'var(--muted)', marginBottom: '32px', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
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
