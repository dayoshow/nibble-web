import { supabase } from './supabase'

// Create a new order
export async function createOrder({ vendorId, hostelId, roomNumber, items, notes }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const deliveryFee = 100
  const totalAmount = subtotal + deliveryFee

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      student_id: user.id,
      vendor_id: vendorId,
      hostel_id: hostelId,
      room_number: roomNumber,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: 'cash',
      notes: notes || null,
      status: 'received',
    })
    .select()
    .maybeSingle()

  if (orderError) throw orderError

  // Insert order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  // Create pending payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    amount: totalAmount,
    method: 'cash',
    status: 'pending',
  })

  return order
}

// Get student's order history
export async function getStudentOrders() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      vendor:vendors(id, name, logo_url),
      hostel:hostels(id, name),
      order_items(
        id, quantity, unit_price,
        product:products(id, name, image_url)
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get single order with all details
export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      vendor:vendors(id, name, logo_url, phone),
      hostel:hostels(id, name),
      runner:profiles!orders_runner_id_fkey(id, first_name, last_name, phone_number),
      order_items(
        id, quantity, unit_price,
        product:products(id, name, image_url, category)
      )
    `)
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  return data
}

// Cancel order (student)
export async function cancelOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Subscribe to real-time order updates
export function subscribeToOrder(orderId, callback) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      payload => callback(payload.new)
    )
    .subscribe()
}

// ── VENDOR ──────────────────────────────────────

// Get vendor's incoming orders
export async function getVendorOrders(vendorId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      hostel:hostels(id, name),
      order_items(
        id, quantity, unit_price,
        product:products(id, name)
      )
    `)
    .eq('vendor_id', vendorId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Update order status (vendor or runner)
export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// ── RUNNER ──────────────────────────────────────

// Get available orders for runners (ready_for_pickup, no runner assigned)
export async function getAvailableDeliveries() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      vendor:vendors(id, name),
      hostel:hostels(id, name),
      order_items(id, quantity)
    `)
    .eq('status', 'ready_for_pickup')
    .is('runner_id', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// Runner accepts a delivery
export async function acceptDelivery(orderId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('orders')
    .update({ runner_id: user.id, status: 'picked_up' })
    .eq('id', orderId)
    .is('runner_id', null)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// Runner marks order as delivered
export async function markDelivered(orderId) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'delivered' })
    .eq('id', orderId)
    .eq('runner_id', user.id)
    .select()
    .maybeSingle()

  if (error) throw error

  // Record runner earnings
  await supabase.from('runner_earnings').insert({
    runner_id: user.id,
    order_id: orderId,
    amount: 50,
  })

  return data
}

// Get runner's assigned deliveries
export async function getRunnerDeliveries() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      vendor:vendors(id, name),
      hostel:hostels(id, name),
      order_items(id, quantity, product:products(name))
    `)
    .eq('runner_id', user.id)
    .in('status', ['picked_up', 'on_the_way'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get runner earnings summary
export async function getRunnerEarnings() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('runner_earnings')
    .select('*, order:orders(id, created_at)')
    .eq('runner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
