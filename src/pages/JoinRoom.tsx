import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { joinRoom } from '../lib/room'

export default function JoinRoom() {
  const navigate = useNavigate()
  const { code: urlCode } = useParams()
  const [code, setCode] = useState(urlCode || '')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (urlCode) setCode(urlCode.toUpperCase())
  }, [urlCode])

  const handleJoin = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name!')
      return
    }
    if (code.trim().length < 5) {
      toast.error('Please enter a valid room code!')
      return
    }

    setIsLoading(true)
    try {
      const result = await joinRoom(code.trim().toUpperCase(), name.trim())
      if (!result.success) {
        toast.error(result.error || 'Failed to join room.')
        return
      }
      toast.success('Joined room! 🎉')
      navigate(`/room/${code.trim().toUpperCase()}`)
    } catch {
      toast.error('Something went wrong. Check your connection.')
    } finally {
      setIsLoading(false)
    }
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

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🤝</div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-lavender-500">
            Join Room
          </h1>
          <p className="text-gray-500 mt-2">Enter the room code from your friend</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 text-center">
              Room Code
            </label>
            <input
              id="input-room-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="e.g. PX7K92"
              maxLength={6}
              className="input-field text-3xl font-black tracking-widest text-pink-500 placeholder:text-pink-200 placeholder:text-xl"
              autoFocus={!urlCode}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 text-center">
              Your Name
            </label>
            <input
              id="input-name-join"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Your nickname 😊"
              maxLength={20}
              className="input-field"
              autoFocus={!!urlCode}
            />
          </div>

          <button
            id="btn-join-submit"
            onClick={handleJoin}
            disabled={isLoading || !name.trim() || code.length < 5}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Joining...</>
            ) : (
              <>🚀 Join Room</>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have a code?{' '}
          <button
            onClick={() => navigate('/create')}
            className="text-pink-500 font-bold hover:underline"
          >
            Create a room instead
          </button>
        </p>
      </motion.div>
    </div>
  )
}
