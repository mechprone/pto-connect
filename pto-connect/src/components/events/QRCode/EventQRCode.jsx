import { useState, useEffect } from 'react'
import { Download, Share2, Copy, Check } from 'lucide-react'
import { generateEventQRCode, downloadQRCode, formatDisplayUrl } from '../../../utils/eventUtils'

export default function EventQRCode({ eventId, eventTitle, className = '' }) {
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (eventId) {
      generateQRCode()
    }
  }, [eventId])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      setError(null)
      const qrData = await generateEventQRCode(eventId)
      setQrCode(qrData)
    } catch (err) {
      setError('Failed to generate QR code')
      console.error('QR Code generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (qrCode) {
      const filename = `${eventTitle?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'event'}-qr-code.png`
      downloadQRCode(qrCode.dataUrl, filename)
    }
  }

  const handleCopyUrl = async () => {
    if (qrCode) {
      try {
        await navigator.clipboard.writeText(qrCode.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy URL:', err)
      }
    }
  }

  const handleShare = async () => {
    if (qrCode && navigator.share) {
      try {
        await navigator.share({
          title: `RSVP for ${eventTitle}`,
          text: `Please RSVP for ${eventTitle}`,
          url: qrCode.url
        })
      } catch (err) {
        console.error('Failed to share:', err)
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl()
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating QR Code...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={generateQRCode}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!qrCode) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event QR Code
        </h3>
        
        {/* QR Code Image */}
        <div className="mb-6">
          <img
            src={qrCode.dataUrl}
            alt="Event RSVP QR Code"
            className="mx-auto border rounded-lg shadow-sm"
            style={{ maxWidth: '200px', height: 'auto' }}
          />
        </div>

        {/* URL Display */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">RSVP URL:</p>
          <div className="bg-gray-50 rounded-lg p-3 border">
            <code className="text-sm text-blue-600 break-all">
              {formatDisplayUrl(eventId)}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
          
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy URL
              </>
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">
            <strong>How to use:</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• Share the QR code in emails, flyers, or social media</li>
            <li>• Parents can scan with their phone camera to RSVP</li>
            <li>• Or share the URL directly for easy typing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
