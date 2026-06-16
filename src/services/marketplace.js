import { supabase } from './supabase'

// Get all active vendors for a campus
export async function getVendors(campusId) {
  const query = supabase
    .from('vendors')
    .select('*')
    .eq('status', 'active')

  if (campusId) query.eq('campus_id', campusId)

  const { data, error } = await query.order('name')
  if (error) throw error
  return data
}

// Get single vendor with their products
export async function getVendorWithProducts(vendorId) {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      products (
        id, name, description, category, image_url, price, is_available
      )
    `)
    .eq('id', vendorId)
    .maybeSingle()

  if (error) throw error
  return data
}

// Search products and vendors
export async function searchProducts(query) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors(id, name, is_open)
    `)
    .eq('is_available', true)
    .ilike('name', `%${query}%`)
    .order('name')

  if (error) throw error
  return data
}

// Get products by category
export async function getProductsByCategory(category) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      vendor:vendors(id, name, is_open)
    `)
    .eq('category', category)
    .eq('is_available', true)
    .order('name')

  if (error) throw error
  return data
}

// Get campuses
export async function getCampuses() {
  const { data, error } = await supabase
    .from('campuses')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// Get hostels by campus
export async function getHostelsByCampus(campusId) {
  const { data, error } = await supabase
    .from('hostels')
    .select('*')
    .eq('campus_id', campusId)
    .order('name')
  if (error) throw error
  return data
}
