import { supabase } from './supabase'

// Get all users
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, campus:campuses(name), hostel:hostels(name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Update user status
export async function updateUserStatus(userId, status) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Get all vendors
export async function getAllVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*, profile:profiles(first_name, last_name, phone_number)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Update vendor status
export async function updateVendorStatus(vendorId, status) {
  const { data, error } = await supabase
    .from('vendors')
    .update({ status })
    .eq('id', vendorId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Get all orders with full detail
export async function getAllOrders(filters = {}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      student:profiles!orders_student_id_fkey(first_name, last_name, phone_number),
      vendor:vendors(name),
      hostel:hostels(name),
      runner:profiles!orders_runner_id_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Get platform stats
export async function getPlatformStats() {
  const [students, vendors, runners, orders, delivered] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
    supabase.from('vendors').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'runner'),
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'delivered'),
  ])

  return {
    totalStudents: students.count || 0,
    activeVendors: vendors.count || 0,
    activeRunners: runners.count || 0,
    totalOrders: orders.count || 0,
    deliveredOrders: delivered.count || 0,
  }
}
