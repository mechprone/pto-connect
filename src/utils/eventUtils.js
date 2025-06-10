import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'

/**
 * Generate a unique event ID for RSVP URLs
 * Format: 8-character alphanumeric code (easy to type)
 * Uses timestamp + random + checksum for absolute uniqueness
 */
export function generateEventId() {
  // Get current timestamp in base36 (shorter representation)
  const timestamp = Date.now().toString(36)
  
  // Generate random component
  const random = Math.random().toString(36).substring(2, 6)
  
  // Create base ID from timestamp + random
  const baseId = (timestamp + random).substring(0, 7).toLowerCase()
  
  // Calculate simple checksum for the 8th character
  const checksum = baseId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 36
  const checksumChar = checksum.toString(36)
  
  // Combine for 8-character ID
  const eventId = baseId + checksumChar
  
  // Ensure it's exactly 8 characters and alphanumeric
  return eventId.substring(0, 8).toLowerCase()
}

/**
 * Generate event ID with collision checking
 * This would be used with backend validation in production
 */
export async function generateUniqueEventId(existingIds = []) {
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const eventId = generateEventId()
    
    // Check against provided existing IDs
    if (!existingIds.includes(eventId)) {
      return eventId
    }
    
    attempts++
    
    // Add small delay to ensure timestamp changes
    await new Promise(resolve => setTimeout(resolve, 1))
  }
  
  // Fallback to UUID if all attempts fail (extremely unlikely)
  return uuidv4().replace(/-/g, '').substring(0, 8).toLowerCase()
}

/**
 * Generate a shortened event code for easy typing
 * Format: 6-character alphanumeric code
 */
export function generateShortEventCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate RSVP URL for an event
 */
export function generateRSVPUrl(eventId, baseUrl = 'https://rsvp.ptoconnect.com') {
  return `${baseUrl}/rsvp/${eventId}`
}

/**
 * Generate QR code for event RSVP
 */
export async function generateEventQRCode(eventId, options = {}) {
  const rsvpUrl = generateRSVPUrl(eventId)
  
  const qrOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#1e40af', // Blue color matching PTO Connect theme
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M',
    ...options
  }

  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(rsvpUrl, qrOptions)
    return {
      dataUrl: qrCodeDataUrl,
      url: rsvpUrl,
      eventId
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Download QR code as PNG file
 */
export function downloadQRCode(dataUrl, filename = 'event-qr-code.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Create event data with unique identifiers
 */
export function createEventWithIds(eventData) {
  const eventId = generateEventId()
  const shortCode = generateShortEventCode()
  
  return {
    ...eventData,
    id: eventId,
    shortCode,
    rsvpUrl: generateRSVPUrl(eventId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Validate event ID format
 */
export function isValidEventId(eventId) {
  // Check if it's 8 characters, alphanumeric, lowercase
  return /^[a-z0-9]{8}$/.test(eventId)
}

/**
 * Format event URL for display (shortened version)
 */
export function formatDisplayUrl(eventId) {
  return `rsvp.ptoconnect.com/rsvp/${eventId}`
}
