import { useState, useEffect } from 'react'
import { getAllVendors, updateVendorStatus } from '../../services/admin'
import Navbar from '../../components/layout/Navbar'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/orders', label: 'Orders' },
]

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    getAllVendors().then(setVendors).finally(() => setLoading(false))
  }, [])

  const handleToggle = async (vendor) => {
    const next = vendor.status === 'active' ? 'suspended' : 'active'
    setUpdating(vendor.id)
    try {
      const updated = await updateVendorStatus(vendor.id, next)
      setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: updated.status } : v))
      toast.success(`Vendor ${next}`)
    } catch {
      toast.error('Could not update vendor')
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
      <div className="container" style={{ padding: '32px 16px', maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '24px' }}>Vendors ({vendors.length})</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {vendors.length === 0 && (
            <div className="empty-state">
              <div className="emoji">🍽️</div>
              <h3>No vendors yet</h3>
            </div>
          )}
          {vendors.map(vendor => (
            <div key={vendor.id} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={styles.vendorIcon}>🍛</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '2px' }}>{vendor.name}</p>
                <p className="text-muted text-sm">
                  {vendor.profile?.first_name} {vendor.profile?.last_name} · {vendor.phone || 'No phone'}
                </p>
              </div>
              <span style={{
                fontSize: '0.78rem', fontWeight: 600,
                color: vendor.is_open ? 'var(--success)' : 'var(--muted)',
              }}>
                {vendor.is_open ? '● Open' : '● Closed'}
              </span>
              <span style={{
                fontSize: '0.78rem', fontWeight: 600,
                color: vendor.status === 'active' ? 'var(--success)' : 'var(--danger)',
              }}>
                {vendor.status}
              </span>
              <button
                className={`btn btn-sm ${vendor.status === 'active' ? 'btn-ghost' : 'btn-secondary'}`}
                disabled={updating === vendor.id}
                onClick={() => handleToggle(vendor)}
              >
                {updating === vendor.id
                  ? <span className="spinner" />
                  : vendor.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  vendorIcon: {
    width: '44px', height: '44px', background: 'var(--orange-pale)',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
  },
}
