import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCampuses, getHostelsByCampus } from '../../services/marketplace'
import { updateProfile } from '../../services/auth'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuthStore()
  const [campuses, setCampuses] = useState([])
  const [hostels, setHostels] = useState([])
  const [form, setForm] = useState({ campus_id: '', hostel_id: '', room_number: '', phone_number: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCampuses().then(setCampuses).catch(() => toast.error('Could not load campuses'))
  }, [])

  useEffect(() => {
    if (form.campus_id) {
      getHostelsByCampus(form.campus_id).then(setHostels)
      setForm(f => ({ ...f, hostel_id: '' }))
    }
  }, [form.campus_id])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

 const handleSubmit = async e => {
  e.preventDefault()
  if (!form.campus_id || !form.hostel_id) {
    toast.error('Select your campus and hostel'); return
  }
  setLoading(true)
  try {
    await updateProfile(form)
    await refreshProfile()
    
    // Wait briefly for state to update before redirecting
    setTimeout(() => {
      const roleMap = { 
        student: '/student', 
        vendor: '/vendor', 
        runner: '/runner', 
        admin: '/admin' 
      }
      navigate(roleMap[profile?.role] || '/student')
    }, 500)
    
    toast.success('Profile complete! Welcome to Nibble 🍛')
  } catch (err) {
    toast.error(err.message || 'Could not save profile')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontSize: '2.5rem' }}>📍</span>
          <h2 style={{ fontFamily: 'var(--font-display)' }}>Where are you?</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            We need your location so runners can find you.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Campus</label>
            <select name="campus_id" className="form-input" value={form.campus_id} onChange={handleChange}>
              <option value="">Select your campus</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hostel</label>
            <select
              name="hostel_id" className="form-input"
              value={form.hostel_id} onChange={handleChange}
              disabled={!form.campus_id}
            >
              <option value="">Select your hostel</option>
              {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Room number <span style={{ color: 'var(--muted)' }}>(optional)</span></label>
            <input type="text" name="room_number" className="form-input"
              placeholder="e.g. Block A, Room 14"
              value={form.room_number} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Phone number <span style={{ color: 'var(--muted)' }}>(optional)</span></label>
            <input type="tel" name="phone_number" className="form-input"
              placeholder="08012345678"
              value={form.phone_number} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--dark)', padding: '24px',
  },
  card: {
    background: 'var(--surface)', borderRadius: '24px',
    padding: '40px 36px', width: '100%', maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  header: { textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
}
