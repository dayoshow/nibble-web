import { supabase } from './supabase'

// Get vendor profile for logged-in user
export async function getMyVendorProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

// Create vendor profile
export async function createVendorProfile({ name, description, phone, campusId }) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('vendors')
    .insert({ profile_id: user.id, name, description, phone, campus_id: campusId })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Toggle vendor open/closed
export async function toggleVendorOpen(vendorId, isOpen) {
  const { data, error } = await supabase
    .from('vendors')
    .update({ is_open: isOpen })
    .eq('id', vendorId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Get all products for a vendor
export async function getVendorProducts(vendorId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('category')
    .order('name')

  if (error) throw error
  return data
}

// Create product
export async function createProduct({ vendorId, name, description, category, price, imageUrl }) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      vendor_id: vendorId,
      name,
      description,
      category,
      price,
      image_url: imageUrl || null,
      is_available: true,
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Update product
export async function updateProduct(productId, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Toggle product availability
export async function toggleProductAvailability(productId, isAvailable) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', productId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Delete product (soft delete via availability)
export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .update({ is_available: false })
    .eq('id', productId)

  if (error) throw error
}
