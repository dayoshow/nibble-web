// Brand colours (Lagos street food vibe)
export const COLORS = {
  primary: '#E8630A',      // deep street food orange
  primaryLight: '#FF8534', // lighter orange
  secondary: '#2D6A2D',    // rich market green
  secondaryLight: '#3D8B3D',
  accent: '#F5C518',       // suya yellow
  dark: '#1A1208',         // deep smoke brown (near black)
  surface: '#FFF8F0',      // warm white
  muted: '#8A7560',        // muted earth tone
  danger: '#D93025',
  success: '#1E8449',
  warning: '#E67E22',
  white: '#FFFFFF',
}

// Delivery fee in Naira
export const DELIVERY_FEE = 100

// Runner earnings per delivery
export const RUNNER_EARNINGS_PER_DELIVERY = 50

// Product categories
export const CATEGORIES = [
  { key: 'meals', label: 'Meals', emoji: '🍛' },
  { key: 'snacks', label: 'Snacks', emoji: '🥧' },
  { key: 'drinks', label: 'Drinks', emoji: '🥤' },
  { key: 'essentials', label: 'Essentials', emoji: '🛒' },
]

// Order status config — label, colour, next action
export const ORDER_STATUS = {
  received: {
    label: 'Order Received',
    color: '#E8630A',
    description: 'Your order has been received by the vendor.',
    step: 1,
  },
  preparing: {
    label: 'Preparing',
    color: '#E67E22',
    description: 'The vendor is preparing your food.',
    step: 2,
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    color: '#F5C518',
    description: 'Your order is ready and waiting for a runner.',
    step: 3,
  },
  picked_up: {
    label: 'Picked Up',
    color: '#2D6A2D',
    description: 'A runner has picked up your order.',
    step: 4,
  },
  on_the_way: {
    label: 'On The Way',
    color: '#2D6A2D',
    description: 'Your order is on its way to you.',
    step: 5,
  },
  delivered: {
    label: 'Delivered',
    color: '#1E8449',
    description: 'Your order has been delivered. Enjoy!',
    step: 6,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#D93025',
    description: 'This order was cancelled.',
    step: 0,
  },
}

// User roles
export const ROLES = {
  STUDENT: 'student',
  VENDOR: 'vendor',
  RUNNER: 'runner',
  ADMIN: 'admin',
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COMPLETE_PROFILE: '/complete-profile',

  // Student
  STUDENT_HOME: '/student',
  VENDOR_DETAIL: '/student/vendor/:id',
  CART: '/student/cart',
  CHECKOUT: '/student/checkout',
  ORDER_TRACKING: '/student/orders/:id',
  ORDER_HISTORY: '/student/orders',

  // Vendor
  VENDOR_DASHBOARD: '/vendor',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_MENU: '/vendor/menu',

  // Runner
  RUNNER_DASHBOARD: '/runner',
  RUNNER_DELIVERIES: '/runner/deliveries',
  RUNNER_EARNINGS: '/runner/earnings',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_ORDERS: '/admin/orders',
}
