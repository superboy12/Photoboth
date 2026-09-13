import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Lock } from 'lucide-react'
import { SOLID_COLORS, GRADIENTS, IMAGE_BACKGROUNDS, ORIGINAL_BG, type BackgroundConfig } from '../../lib/backgrounds'
import toast from 'react-hot-toast'

interface Props {
  selectedBackground: BackgroundConfig | null | undefined
  onSelectBackground?: (bg: BackgroundConfig) => void
  isHost: boolean
}

type BgTab = 'original' | 'solid' | 'gradient' | 'image'

export default function BackgroundPicker({ selectedBackground, onSelectBackground, isHost }: Props) {
  const [activeTab, setActiveTab] = useState<BgTab>('original')
  const [customColor, setCustomColor] = useState('#ff9fba')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const select = (bg: BackgroundConfig) => {
    if (!isHost) return
    onSelectBackground?.(bg)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      select({ type: 'image', value: url })
    }
    reader.readAsDataURL(file)
  }

  const isSelected = (bg: BackgroundConfig) =>
    selectedBackground?.type === bg.type && selectedBackground?.value === bg.value

  const tabs: { id: BgTab; label: string }[] = [
    { id: 'original', label: '📷 Original' },
    { id: 'solid', label: '🎨 Solid' },
    { id: 'gradient', label: '🌈 Gradient' },
    { id: 'image', label: '🖼️ Image' },
  ]

  return (
    <div className="p-3">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-white/5 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === tab.id ? 'bg-pink-500 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'original' && (
        <button
          onClick={() => select(ORIGINAL_BG)}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
            selectedBackground?.type === 'original' || !selectedBackground
              ? 'bg-pink-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          📷 Use Original Camera
        </button>
      )}

      {activeTab === 'solid' && (
        <div>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {SOLID_COLORS.map((bg) => (
              <motion.button
                key={bg.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => select({ type: 'solid', value: bg.value })}
                className={`aspect-square rounded-xl border-2 transition-all ${
                  isSelected({ type: 'solid', value: bg.value })
                    ? 'border-pink-400 scale-110 shadow-lg shadow-pink-500/30'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ background: bg.value }}
                title={bg.name}
              />
            ))}
          </div>
          {/* Custom color */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-10 h-10 rounded-xl border-0 cursor-pointer"
            />
            <button
              onClick={() => select({ type: 'solid', value: customColor })}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20"
            >
              Custom Color
            </button>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="grid grid-cols-2 gap-2">
          {GRADIENTS.map((bg) => (
            <motion.button
              key={bg.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => select({ type: 'gradient', value: bg.value })}
              className={`aspect-video rounded-xl border-2 flex items-end p-2 transition-all ${
                isSelected({ type: 'gradient', value: bg.value })
                  ? 'border-pink-400 shadow-lg shadow-pink-500/30'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ background: bg.thumbnail }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full">
                {bg.name}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {activeTab === 'image' && (
        <div>
          {/* Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => isHost && fileInputRef.current?.click()}
            className="w-full py-3 mb-3 rounded-xl bg-gradient-to-r from-pink-500 to-lavender-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Upload className="w-4 h-4" />
            Upload Custom Background
          </button>

          <div className="grid grid-cols-2 gap-2">
            {IMAGE_BACKGROUNDS.map((bg) => (
              <motion.button
                key={bg.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => select({ type: 'image', value: bg.value })}
                className={`aspect-video rounded-xl overflow-hidden border-2 relative transition-all ${
                  isSelected({ type: 'image', value: bg.value })
                    ? 'border-pink-400 shadow-lg shadow-pink-500/30'
                    : 'border-transparent hover:scale-105'
                }`}
              >
                <img
                  src={bg.thumbnail}
                  alt={bg.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 flex items-end p-1">
                  <span className="text-[10px] font-bold text-white drop-shadow-md">
                    {bg.emoji} {bg.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {!isHost && (
        <div className="flex items-center justify-center gap-1.5 mt-4 text-white/30 text-xs">
          <Lock className="w-3 h-3" />
          Only the host can change backgrounds
        </div>
      )}
    </div>
  )
}
