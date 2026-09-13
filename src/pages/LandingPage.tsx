import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Users, Sparkles, Heart, Star, Zap, Image, Download } from 'lucide-react'

const floatingEmojis = ['📸', '✨', '💕', '🌸', '⭐', '🎀', '💫', '🌺', '🩷', '🎉']

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden">
      {/* Animated floating emojis background */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none select-none"
          style={{
            left: `${(i * 10.7) % 100}%`,
            top: `${(i * 17.3) % 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-pink-400 to-lavender-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
              <Camera className="w-14 h-14 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-lavender-500 to-pink-400 mb-4"
          >
            Photobox
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-lavender-600 mb-3"
          >
            Multiplayer 📸
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-pink-400 font-medium mb-12 max-w-md"
          >
            Take photos together with friends — from anywhere in the world! ✨
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-sm"
          >
            <button
              id="btn-create-room"
              onClick={() => navigate('/create')}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-4"
            >
              <Sparkles className="w-5 h-5" />
              Create Room
            </button>
            <button
              id="btn-join-room"
              onClick={() => navigate('/join')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 text-lg py-4"
            >
              <Users className="w-5 h-5" />
              Join Room
            </button>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="px-4 pb-16"
        >
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-6 h-6" />, title: 'Multiplayer', desc: 'Up to 8 friends', color: 'from-pink-400 to-pink-500' },
              { icon: <Heart className="w-6 h-6" />, title: 'Cute Frames', desc: '20+ frame styles', color: 'from-lavender-400 to-lavender-500' },
              { icon: <Image className="w-6 h-6" />, title: 'Backgrounds', desc: 'Virtual BG support', color: 'from-blue-400 to-blue-500' },
              { icon: <Download className="w-6 h-6" />, title: 'Download', desc: 'PNG & Photostrip', color: 'from-green-400 to-green-500' },
              { icon: <Star className="w-6 h-6" />, title: 'Stickers', desc: '50+ emoji stickers', color: 'from-yellow-400 to-orange-400' },
              { icon: <Zap className="w-6 h-6" />, title: 'Real-time', desc: 'Synced countdown', color: 'from-purple-400 to-purple-500' },
              { icon: <Camera className="w-6 h-6" />, title: 'Filters', desc: '10 photo filters', color: 'from-rose-400 to-rose-500' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'Share', desc: 'Instantly share', color: 'from-teal-400 to-teal-500' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="glass rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feat.color} rounded-xl flex items-center justify-center text-white`}>
                  {feat.icon}
                </div>
                <p className="font-bold text-gray-700 text-sm">{feat.title}</p>
                <p className="text-xs text-gray-500">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pb-8 text-pink-300 text-sm font-medium">
          <p>📸 Photobox Multiplayer — Take photos together, from anywhere 💕</p>
        </div>
      </div>
    </div>
  )
}
