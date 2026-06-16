import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  vendorId: null,
  vendorName: null,

  addItem: (product, vendorId, vendorName) => {
    const { items, vendorId: currentVendorId } = get()

    // If adding from a different vendor, clear cart first
    if (currentVendorId && currentVendorId !== vendorId) {
      set({
        items: [{ ...product, quantity: 1 }],
        vendorId,
        vendorName,
      })
      return { vendorChanged: true }
    }

    const existing = items.find(i => i.id === product.id)
    if (existing) {
      set({
        items: items.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({
        items: [...items, { ...product, quantity: 1 }],
        vendorId,
        vendorName,
      })
    }
    return { vendorChanged: false }
  },

  removeItem: (productId) => {
    const items = get().items.filter(i => i.id !== productId)
    set({ items, vendorId: items.length ? get().vendorId : null })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map(i =>
        i.id === productId ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [], vendorId: null, vendorName: null }),

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getTotal: () => get().getSubtotal() + 100, // ₦100 delivery fee

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}))

export default useCartStore
