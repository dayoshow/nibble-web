import { useState, useEffect } from 'react'
import { getMyVendorProfile, getVendorProducts, createProduct, updateProduct, toggleProductAvailability } from '../../services/vendor'
import Navbar from '../../components/layout/Navbar'
import { formatNaira, getCategoryEmoji } from '../../utils'
import { CATEGORIES } from '../../constants'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/vendor', label: 'Dashboard' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/menu', label: 'My Menu' },
]

const EMPTY_FORM = { name: '', description: '', category: 'meals', price: '', image_url: '' }

export default function VendorMenuPage() {
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
  getMyVendorProfile()
    .then(v => {
      if (!v) return []
      setVendor(v)
      return getVendorProducts(v.id)
    })
    .then(p => setProducts(p || []))
    .catch(() => toast.error('Could not load menu'))
    .finally(() => setLoading(false))
}, [])

  const openAddForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }
  const openEditForm = (product) => {
    setForm({ name: product.name, description: product.description || '', category: product.category, price: product.price, image_url: product.image_url || '' })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateProduct(editingId, { ...form, price: Number(form.price) })
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p))
        toast.success('Product updated')
      } else {
        const created = await createProduct({ vendorId: vendor.id, ...form, price: Number(form.price) })
        setProducts(prev => [...prev, created])
        toast.success('Product added to menu')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err.message || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (product) => {
    try {
      const updated = await toggleProductAvailability(product.id, !product.is_available)
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p))
    } catch {
      toast.error('Could not update product')
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
        <div style={styles.pageHeader}>
          <h2>My Menu</h2>
          <button className="btn btn-primary" onClick={openAddForm}>
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card card-body" style={{ marginBottom: '24px', border: '2px solid var(--orange)' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Item name</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Jollof Rice" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₦)</label>
                  <input className="form-input" type="number" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="500" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description <span style={{ color: 'var(--muted)' }}>(optional)</span></label>
                <input className="form-input" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editingId ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products by category */}
        {products.length === 0 && !showForm ? (
          <div className="empty-state">
            <div className="emoji">🍽️</div>
            <h3>Your menu is empty</h3>
            <p>Add your first item to start receiving orders.</p>
            <button className="btn btn-primary mt-16" onClick={openAddForm}><Plus size={16} /> Add First Item</button>
          </div>
        ) : (
          CATEGORIES.map(cat => {
            const catProducts = products.filter(p => p.category === cat.key)
            if (!catProducts.length) return null
            return (
              <div key={cat.key} style={{ marginBottom: '28px' }}>
                <h3 style={{ marginBottom: '14px' }}>{cat.emoji} {cat.label}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {catProducts.map(product => (
                    <div key={product.id} className="card card-body" style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      opacity: product.is_available ? 1 : 0.55,
                    }}>
                      <div style={styles.productEmoji}>{getCategoryEmoji(product.category)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, marginBottom: '2px' }}>{product.name}</p>
                        {product.description && <p className="text-muted text-sm">{product.description}</p>}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--orange)', flexShrink: 0 }}>
                        {formatNaira(product.price)}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={styles.iconBtn} onClick={() => openEditForm(product)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          style={{ ...styles.iconBtn, color: product.is_available ? 'var(--success)' : 'var(--muted)' }}
                          onClick={() => handleToggle(product)}
                          title={product.is_available ? 'Hide item' : 'Show item'}
                        >
                          {product.is_available ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  productEmoji: {
    width: '44px', height: '44px', background: 'var(--orange-pale)',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
  },
  iconBtn: {
    background: 'var(--border)', border: 'none', padding: '7px',
    borderRadius: '8px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', color: 'var(--muted)',
  },
}
