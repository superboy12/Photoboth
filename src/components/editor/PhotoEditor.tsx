import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, RotateCcw, Plus, Type, Sliders, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { STICKERS, STICKER_CATEGORIES, type PlacedSticker } from '../../lib/stickers'
import { applyFrameToCanvas } from '../../lib/frames'
import { downloadCanvas, shareImage } from '../../lib/utils'
import confetti from 'canvas-confetti'

interface TextOverlay {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  font: string
  rotation: number
}

const FILTERS = [
  { id: 'none', name: 'Original', style: 'none' },
  { id: 'vintage', name: 'Vintage', style: 'sepia(0.5) contrast(1.1) brightness(0.95)' },
  { id: 'warm', name: 'Warm', style: 'sepia(0.3) saturate(1.3) brightness(1.05)' },
  { id: 'cool', name: 'Cool', style: 'hue-rotate(30deg) saturate(1.2)' },
  { id: 'retro', name: 'Retro', style: 'sepia(0.8) contrast(1.2) brightness(0.9)' },
  { id: 'film', name: 'Film', style: 'contrast(1.15) brightness(0.9) saturate(1.1)' },
  { id: 'bw', name: 'B&W', style: 'grayscale(1) contrast(1.1)' },
  { id: 'soft', name: 'Soft', style: 'brightness(1.1) saturate(0.8) blur(0.5px)' },
  { id: 'pastel', name: 'Pastel', style: 'brightness(1.15) saturate(0.7)' },
  { id: 'dreamy', name: 'Dreamy', style: 'brightness(1.1) saturate(1.3) hue-rotate(-10deg)' },
]

const FONTS = [
  { id: 'Outfit', name: 'Modern' },
  { id: 'Nunito', name: 'Cute' },
  { id: '"Dancing Script"', name: 'Handwritten' },
  { id: '"Space Grotesk"', name: 'Retro' },
  { id: 'Georgia', name: 'Classic' },
]

interface Props {
  photo: string
  allTakes: string[]
  roomCode: string
  frameId?: string
  onBack: () => void
}

export default function PhotoEditor({ photo, allTakes: _allTakes, roomCode, frameId, onBack }: Props) {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<'filter' | 'sticker' | 'text' | 'adjust'>('filter')
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [stickers, setStickers] = useState<PlacedSticker[]>([])
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [stickerCategory, setStickerCategory] = useState('hearts')
  const [texts, setTexts] = useState<TextOverlay[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [textFont, setTextFont] = useState('Outfit')
  const [textSize, setTextSize] = useState(28)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [dragging, setDragging] = useState<{ id: string; type: 'sticker' | 'text'; startX: number; startY: number; origX: number; origY: number } | null>(null)

  // Render canvas
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = photo
    await new Promise((res) => { img.onload = res })

    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const W = canvas.width
    const H = canvas.height

    // Apply CSS filter via off-screen canvas is complex; we compose with CSS
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(img, 0, 0, W, H)

    // Apply frame overlay
    if (frameId) {
      applyFrameToCanvas(ctx, frameId, W, H)
    }

    // Draw stickers
    ctx.save()
    for (const s of stickers) {
      const absX = s.x * W
      const absY = s.y * H
      const size = s.scale * Math.min(W, H) * 0.12
      ctx.save()
      ctx.translate(absX, absY)
      ctx.rotate((s.rotation * Math.PI) / 180)
      ctx.font = `${size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.emoji, 0, 0)
      ctx.restore()
    }
    ctx.restore()

    // Draw texts
    for (const t of texts) {
      const absX = t.x * W
      const absY = t.y * H
      ctx.save()
      ctx.translate(absX, absY)
      ctx.rotate((t.rotation * Math.PI) / 180)
      ctx.font = `bold ${t.fontSize}px ${t.font}`
      ctx.fillStyle = t.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(t.text, 0, 0)
      ctx.restore()
    }
  }, [photo, frameId, stickers, texts])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  const addSticker = (emoji: string, stickerId: string) => {
    const newS: PlacedSticker = {
      id: `s-${Date.now()}`,
      stickerId,
      emoji,
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
      scale: 1,
      rotation: Math.random() * 30 - 15,
    }
    setStickers((prev) => [...prev, newS])
  }

  const addText = () => {
    if (!textInput.trim()) return
    const newT: TextOverlay = {
      id: `t-${Date.now()}`,
      text: textInput.trim(),
      x: 0.5,
      y: 0.5,
      fontSize: textSize,
      color: textColor,
      font: textFont,
      rotation: 0,
    }
    setTexts((prev) => [...prev, newT])
    setTextInput('')
  }

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id))
    setSelectedStickerId(null)
  }

  const removeText = (id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id))
    setSelectedTextId(null)
  }

  const handleDownload = async (format: 'png' | 'jpg') => {
    await renderCanvas()
    const canvas = canvasRef.current
    if (!canvas) return
    const filename = `photobox-${roomCode}-${Date.now()}`
    downloadCanvas(canvas, filename, format)
    toast.success(`Downloaded as ${format.toUpperCase()}! 🎉`)
    // Launch confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#a78bfa', '#34d399', '#fbbf24'],
    })
  }

  const handleShare = async () => {
    await renderCanvas()
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const shared = await shareImage(dataUrl, 'My Photobox Moment! 📸')
    if (!shared) {
      toast('Tip: Download the photo first, then share manually!', { icon: '💡' })
    }
  }

  const filterStyle = FILTERS.find((f) => f.id === selectedFilter)?.style || 'none'
  const adjustStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  const combinedFilter = [filterStyle !== 'none' ? filterStyle : '', adjustStyle].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="glass-dark text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>
        <h1 className="font-black text-lg">✨ Photo Editor</h1>
        <div className="flex gap-2">
          <button
            id="btn-share"
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            id="btn-download-png"
            onClick={() => handleDownload('png')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-lavender-500 text-white font-bold text-sm hover:opacity-90"
          >
            <Download className="w-4 h-4" />
            PNG
          </button>
          <button
            id="btn-download-jpg"
            onClick={() => handleDownload('jpg')}
            className="px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20"
          >
            JPG
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas preview */}
        <div className="flex-1 flex items-center justify-center bg-gray-950 p-4 overflow-hidden">
          <div className="relative max-w-full max-h-[calc(100vh-200px)]">
            {/* Interactive overlay for dragging */}
            <div
              className="absolute inset-0 z-20"
              onMouseMove={(e) => {
                if (!dragging) return
                const rect = e.currentTarget.getBoundingClientRect()
                const dx = (e.clientX - dragging.startX) / rect.width
                const dy = (e.clientY - dragging.startY) / rect.height
                if (dragging.type === 'sticker') {
                  setStickers((prev) =>
                    prev.map((s) =>
                      s.id === dragging.id
                        ? { ...s, x: Math.max(0, Math.min(1, dragging.origX + dx)), y: Math.max(0, Math.min(1, dragging.origY + dy)) }
                        : s
                    )
                  )
                } else {
                  setTexts((prev) =>
                    prev.map((t) =>
                      t.id === dragging.id
                        ? { ...t, x: Math.max(0, Math.min(1, dragging.origX + dx)), y: Math.max(0, Math.min(1, dragging.origY + dy)) }
                        : t
                    )
                  )
                }
              }}
              onMouseUp={() => setDragging(null)}
              onTouchEnd={() => setDragging(null)}
            >
              {/* Sticker overlays */}
              {stickers.map((s) => (
                <div
                  key={s.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${s.x * 100}%`,
                    top: `${s.y * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                    fontSize: '40px',
                    lineHeight: 1,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setSelectedStickerId(s.id)
                    setDragging({ id: s.id, type: 'sticker', startX: e.clientX, startY: e.clientY, origX: s.x, origY: s.y })
                  }}
                  onClick={() => setSelectedStickerId(selectedStickerId === s.id ? null : s.id)}
                >
                  {s.emoji}
                  {selectedStickerId === s.id && (
                    <button
                      className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); removeSticker(s.id) }}
                    >×</button>
                  )}
                </div>
              ))}

              {/* Text overlays */}
              {texts.map((t) => (
                <div
                  key={t.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${t.x * 100}%`,
                    top: `${t.y * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`,
                    fontSize: `${t.fontSize * 0.05}em`,
                    color: t.color,
                    fontFamily: t.font,
                    fontWeight: 'bold',
                    textShadow: '0 0 4px rgba(0,0,0,0.6)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setSelectedTextId(t.id)
                    setDragging({ id: t.id, type: 'text', startX: e.clientX, startY: e.clientY, origX: t.x, origY: t.y })
                  }}
                  onClick={() => setSelectedTextId(selectedTextId === t.id ? null : t.id)}
                >
                  {t.text}
                  {selectedTextId === t.id && (
                    <button
                      className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); removeText(t.id) }}
                    >×</button>
                  )}
                </div>
              ))}
            </div>

            {/* Photo with filter */}
            <img
              src={photo}
              alt="Photo"
              className="max-w-full max-h-[calc(100vh-200px)] rounded-2xl shadow-2xl object-contain"
              style={{ filter: combinedFilter }}
            />

            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Editor sidebar */}
        <div className="lg:w-80 bg-gray-800 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'filter', icon: <Layers className="w-4 h-4" />, label: 'Filter' },
              { id: 'sticker', icon: <Plus className="w-4 h-4" />, label: 'Sticker' },
              { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
              { id: 'adjust', icon: <Sliders className="w-4 h-4" />, label: 'Adjust' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'text-pink-400 border-b-2 border-pink-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto picker-scroll p-3">
            {/* Filter tab */}
            {activeTab === 'filter' && (
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      selectedFilter === f.id ? 'border-pink-400 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={f.name}
                      className="w-full aspect-square object-cover"
                      style={{ filter: f.style !== 'none' ? f.style : undefined }}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 text-center text-white text-xs font-bold">
                      {f.name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Sticker tab */}
            {activeTab === 'sticker' && (
              <div>
                {/* Category pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 picker-scroll">
                  {STICKER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStickerCategory(cat.id)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        stickerCategory === cat.id ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {STICKERS.filter((s) => s.category === stickerCategory).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addSticker(s.emoji, s.id)}
                      className="aspect-square rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-2xl transition-all hover:scale-110"
                      title={s.name}
                    >
                      {s.emoji}
                    </button>
                  ))}
                </div>

                {stickers.length > 0 && selectedStickerId && (
                  <div className="mt-4 p-3 bg-white/5 rounded-xl">
                    <p className="text-white/50 text-xs mb-2">Selected Sticker</p>
                    {stickers.filter((s) => s.id === selectedStickerId).map((s) => (
                      <div key={s.id} className="space-y-2">
                        <div>
                          <label className="text-xs text-white/50">Size</label>
                          <input
                            type="range" min="0.3" max="3" step="0.1"
                            value={s.scale}
                            onChange={(e) => setStickers((prev) => prev.map((x) => x.id === s.id ? { ...x, scale: +e.target.value } : x))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Rotation</label>
                          <input
                            type="range" min="-180" max="180"
                            value={s.rotation}
                            onChange={(e) => setStickers((prev) => prev.map((x) => x.id === s.id ? { ...x, rotation: +e.target.value } : x))}
                            className="w-full"
                          />
                        </div>
                        <button onClick={() => removeSticker(s.id)} className="w-full py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold">
                          🗑️ Remove Sticker
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Text tab */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addText()}
                  placeholder="Type your text..."
                  className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:border-pink-400 focus:outline-none text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Color</label>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-9 rounded-lg border-0 cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Size</label>
                    <input type="range" min="12" max="80" value={textSize}
                      onChange={(e) => setTextSize(+e.target.value)}
                      className="w-full mt-2" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 block mb-1">Font</label>
                  <div className="grid grid-cols-2 gap-1">
                    {FONTS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setTextFont(f.id)}
                        className={`py-2 px-2 rounded-lg text-xs transition-all ${
                          textFont === f.id ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                        style={{ fontFamily: f.id }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addText}
                  disabled={!textInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-lavender-500 text-white font-bold text-sm"
                >
                  + Add Text
                </button>

                {selectedTextId && texts.find((t) => t.id === selectedTextId) && (
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white/50 text-xs mb-2">Selected Text</p>
                    <div>
                      <label className="text-xs text-white/50">Rotation</label>
                      <input
                        type="range" min="-180" max="180"
                        value={texts.find((t) => t.id === selectedTextId)?.rotation || 0}
                        onChange={(e) => setTexts((prev) => prev.map((t) => t.id === selectedTextId ? { ...t, rotation: +e.target.value } : t))}
                        className="w-full"
                      />
                    </div>
                    <button onClick={() => removeText(selectedTextId)} className="w-full mt-2 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold">
                      🗑️ Remove Text
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Adjust tab */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                {[
                  { label: 'Brightness', value: brightness, setValue: setBrightness, min: 50, max: 200 },
                  { label: 'Contrast', value: contrast, setValue: setContrast, min: 50, max: 200 },
                  { label: 'Saturation', value: saturation, setValue: setSaturation, min: 0, max: 200 },
                ].map((ctrl) => (
                  <div key={ctrl.label}>
                    <div className="flex justify-between mb-1">
                      <label className="text-white/70 text-sm font-semibold">{ctrl.label}</label>
                      <span className="text-white/40 text-sm">{ctrl.value}%</span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      value={ctrl.value}
                      onChange={(e) => ctrl.setValue(+e.target.value)}
                      className="w-full accent-pink-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => { setBrightness(100); setContrast(100); setSaturation(100) }}
                  className="w-full py-2 rounded-xl bg-white/10 text-white/60 text-sm font-bold hover:bg-white/20 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Adjustments
                </button>
              </div>
            )}
          </div>

          {/* Bottom download bar */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              id="btn-download-photostrip"
              onClick={() => {
                navigate('/result', { state: { photos: [photo], roomCode } })
              }}
              className="w-full py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 flex items-center justify-center gap-2"
            >
              🎞️ Create Photostrip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
