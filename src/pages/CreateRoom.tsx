import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Loader2, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'
import { createRoom } from '../lib/room'
import { copyToClipboard } from '../lib/utils'

type Step = 'name' | 'created'

export default function CreateRoom() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const roomUrl = roomCode ? `${window.location.origin}/join/${roomCode}` : ''

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name!')
      return
    }
    setIsLoading(true)
    try {
      const result = await createRoom(name.trim())
      if (!result) {
        toast.error('Failed to create room. Please try again.')
        return
      }
      setRoomCode(result.roomCode)
      setStep('created')
    } catch {
      toast.error('Something went wrong. Check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(roomCode)
    setCopied(true)
    toast.success('Room code copied! 📋')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = async () => {
    await copyToClipboard(roomUrl)
    toast.success('Link copied! 🔗')
  }

  const handleEnterRoom = () => {
    navigate(`/room/${roomCode}`)
  }

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card w-full max-w-md"
      >
        <button
          onClick={() => navigate('/')}
          className="btn-ghost flex items-center gap-2 mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📸</div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-lavender-500">
                Create Room
              </h1>
              <p className="text-gray-500 mt-2">What should we call you?</p>
            </div>

            <div className="space-y-4">
              <input
                id="input-name-create"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Your nickname 😊"
                maxLength={20}
                className="input-field"
                autoFocus
              />

              <button
                id="btn-create-submit"
                onClick={handleCreate}
                disabled={isLoading || !name.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating Room...</>
                ) : (
                  <>✨ Create Room</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'created' && (
          <motion.div
            key="created"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">Room Created!</h2>
            <p className="text-gray-500 mb-6">Share this code with your friends</p>

            {/* Room Code */}
            <div className="bg-gradient-to-r from-pink-50 to-lavender-50 rounded-2xl p-6 mb-6 border-2 border-pink-200">
              <p className="text-sm font-semibold text-pink-400 mb-2 uppercase tracking-widest">Room Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-lavender-600">
                  {roomCode}
                </span>
                <button
                  id="btn-copy-code"
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-500 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500">
                <QrCode className="w-4 h-4" />
                Scan to join
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-md border border-pink-100">
                <QRCode value={roomUrl} size={160} level="M" />
              </div>
              <button
                id="btn-copy-link"
                onClick={handleCopyLink}
                className="btn-ghost mt-2 text-sm"
              >
                Or copy invite link
              </button>
            </div>

            <button
              id="btn-enter-room"
              onClick={handleEnterRoom}
              className="btn-primary w-full text-lg py-4"
            >
              🚀 Enter Room
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
