import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Share2, RotateCcw, Home } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { downloadCanvas, shareImage } from '../lib/utils'

interface ResultState {
  photos: string[]
  roomCode?: string
}

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = location.state as ResultState | null

  const photos = state?.photos || []
  const roomCode = state?.roomCode || ''

  // Launch confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#fb7185'],
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Build photostrip on canvas
  useEffect(() => {
    if (photos.length === 0) return
    buildPhotostrip()
  }, [photos])

  const buildPhotostrip = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const STRIP_W = 400
    const PHOTO_H = 300
    const GAP = 8
    const PADDING = 16
    const LABEL_H = 60

    canvas.width = STRIP_W
    canvas.height = PADDING + photos.length * (PHOTO_H + GAP) + LABEL_H

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Pink border
    ctx.strokeStyle = '#f9a8d4'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

    // Load and draw each photo
    for (let i = 0; i < photos.length; i++) {
      const img = new Image()
      img.src = photos[i]
      await new Promise((res) => { img.onload = res; img.onerror = res })

      const y = PADDING / 2 + i * (PHOTO_H + GAP)
      // Photo border
      ctx.strokeStyle = '#fbcfe8'
      ctx.lineWidth = 2
      ctx.strokeRect(PADDING / 2, y, STRIP_W - PADDING, PHOTO_H)
      ctx.drawImage(img, PADDING / 2, y, STRIP_W - PADDING, PHOTO_H)
    }

    // Bottom label
    const labelY = PADDING / 2 + photos.length * (PHOTO_H + GAP) + 10
    ctx.fillStyle = '#ec4899'
    ctx.font = 'bold 20px Outfit, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📸 Photobox Multiplayer', canvas.width / 2, labelY + 16)
    if (roomCode) {
      ctx.fillStyle = '#a78bfa'
      ctx.font = '14px Outfit, sans-serif'
      ctx.fillText(`Room: ${roomCode}`, canvas.width / 2, labelY + 36)
    }
  }

  const handleDownloadStrip = async () => {
    await buildPhotostrip()
    const canvas = canvasRef.current
    if (!canvas) return
    downloadCanvas(canvas, `photostrip-${roomCode || 'photobox'}-${Date.now()}`, 'png')
    toast.success('Photostrip downloaded! 🎞️')
  }

  const handleShare = async () => {
    await buildPhotostrip()
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const shared = await shareImage(dataUrl, '📸 My Photobox Strip!')
    if (!shared) {
      toast('Download first, then share!', { icon: '💡' })
    }
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <div className="card text-center max-w-sm">
          <div className="text-5xl mb-4">😅</div>
          <h2 className="text-2xl font-black mb-4">No photos yet!</h2>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-3"
          >
            🎉
          </motion.div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-lavender-500">
            Photo Session Complete!
          </h1>
          {roomCode && (
            <p className="text-gray-400 mt-1">Room {roomCode}</p>
          )}
        </div>

        {/* Photostrip preview */}
        <div className="card mb-6 p-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded-xl shadow-xl"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            id="btn-download-strip"
            onClick={handleDownloadStrip}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
          >
            <Download className="w-5 h-5" />
            Download Photostrip
          </button>

          <button
            id="btn-share-result"
            onClick={handleShare}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-lg py-4"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-pink-200 text-pink-500 font-bold hover:border-pink-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Take More
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          📸 Made with Photobox Multiplayer — take photos together from anywhere!
        </p>
      </motion.div>
    </div>
  )
}
