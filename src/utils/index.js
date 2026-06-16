// Format price as Naira
export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

// Format date
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Format time ago
export function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDate(dateString)
}

// Get initials from name
export function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

// Truncate text
export function truncate(text, maxLength = 60) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

// Validate Nigerian phone number
export function isValidNigerianPhone(phone) {
  return /^(\+234|0)[789][01]\d{8}$/.test(phone)
}

// Validate email
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Get category emoji
export function getCategoryEmoji(category) {
  const map = { meals: '🍛', snacks: '🥧', drinks: '🥤', essentials: '🛒' }
  return map[category] || '🍽️'
}
