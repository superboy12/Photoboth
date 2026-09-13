import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { FRAMES, FRAME_CATEGORIES } from '../../lib/frames'

interface Props {
  selectedFrame: string | null | undefined
  onSelectFrame?: (frameId: string) => void
  isHost: boolean
}

export default function FramePicker({ selectedFrame, onSelectFrame, isHost }: Props) {
  const [activeCategory, setActiveCategory] = useState('cute')

  const filtered = FRAMES.filter((f) => f.category === activeCategory)

  return (
    <div className="p-3">
      {/* No frame option */}
      <motion.button
        id="btn-frame-none"
        onClick={() => isHost && onSelectFrame?.('')}
        className={`w-full mb-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          !selectedFrame
            ? 'bg-pink-500 text-white'
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
        }`}
      >
        No Frame
      </motion.button>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 picker-scroll">
        {FRAME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-pink-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Frames grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((frame) => (
          <motion.button
            key={frame.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => isHost ? onSelectFrame?.(frame.id) : undefined}
            className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center p-2 ${
              selectedFrame === frame.id
                ? 'bg-pink-500 ring-2 ring-pink-400 ring-offset-2 ring-offset-gray-800'
                : 'bg-white/5 hover:bg-white/15'
            } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className="text-2xl">{frame.emoji}</span>
            <span className="text-[10px] text-white/70 font-semibold leading-tight">{frame.name}</span>
            {!isHost && (
              <div className="absolute top-1 right-1">
                <Lock className="w-3 h-3 text-white/30" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {!isHost && (
        <p className="text-center text-white/30 text-xs mt-4">
          Only the host can change the frame
        </p>
      )}
    </div>
  )
}
