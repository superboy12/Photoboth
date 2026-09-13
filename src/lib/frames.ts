export interface Frame {
  id: string
  name: string
  emoji: string
  category: 'cute' | 'funny' | 'romantic' | 'friendship' | 'minimalist' | 'indonesian'
  type: 'svg' | 'css'
  // CSS-based frame styling
  borderStyle?: {
    border?: string
    borderRadius?: string
    padding?: string
    background?: string
    boxShadow?: string
  }
  // Overlay drawn on canvas
  canvasOverlay?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  // Label text overlay
  label?: {
    text: string
    position: 'top' | 'bottom' | 'both'
    font?: string
    color?: string
    fontSize?: number
  }
  thumbnail: string // emoji or color for thumbnail
}

// Helper: draw rounded rect
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Draw hearts around edges
function drawHearts(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, size: number, count: number) {
  ctx.fillStyle = color
  ctx.font = `${size}px serif`
  ctx.textAlign = 'center'
  // Top row
  for (let i = 0; i < count; i++) {
    ctx.fillText('♥', (w / count) * i + w / count / 2, size + 4)
  }
  // Bottom row
  for (let i = 0; i < count; i++) {
    ctx.fillText('♥', (w / count) * i + w / count / 2, h - 4)
  }
  // Left col
  for (let i = 1; i < count - 1; i++) {
    ctx.fillText('♥', size / 2, (h / count) * i + h / count / 2)
  }
  // Right col
  for (let i = 1; i < count - 1; i++) {
    ctx.fillText('♥', w - size / 2, (h / count) * i + h / count / 2)
  }
}

export const FRAMES: Frame[] = [
  // ─── CUTE ───────────────────────────────────────────────────────────────────
  {
    id: 'pastel-hearts',
    name: 'Pastel Hearts',
    emoji: '💕',
    category: 'cute',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      // Pink border
      ctx.strokeStyle = '#f9a8d4'
      ctx.lineWidth = w * 0.025
      roundedRect(ctx, w * 0.012, h * 0.012, w * 0.976, h * 0.976, 16)
      ctx.stroke()
      drawHearts(ctx, w, h, '#f472b6', w * 0.05, 8)
    },
    thumbnail: '💕',
  },
  {
    id: 'pink-love',
    name: 'Pink Love',
    emoji: '🩷',
    category: 'cute',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, 'rgba(251,207,232,0.5)')
      grad.addColorStop(1, 'rgba(253,242,248,0.3)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h * 0.08)
      ctx.fillRect(0, h * 0.92, w, h * 0.08)
      ctx.fillStyle = '#ec4899'
      ctx.font = `bold ${w * 0.055}px Nunito, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('💕 PINK LOVE 💕', w / 2, h * 0.06)
    },
    thumbnail: '🩷',
  },
  {
    id: 'cute-clouds',
    name: 'Cute Clouds',
    emoji: '☁️',
    category: 'cute',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.font = `${w * 0.06}px serif`
      ctx.textAlign = 'center'
      const clouds = ['☁️', '⛅', '☁️', '🌤️']
      clouds.forEach((c, i) => ctx.fillText(c, (w / clouds.length) * i + w / clouds.length / 2, w * 0.07))
      ctx.strokeStyle = '#bae6fd'
      ctx.lineWidth = w * 0.018
      roundedRect(ctx, w * 0.01, h * 0.08, w * 0.98, h * 0.9, 12)
      ctx.stroke()
    },
    thumbnail: '☁️',
  },
  {
    id: 'stars',
    name: 'Stars',
    emoji: '⭐',
    category: 'cute',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      const positions = [
        [0.05, 0.05], [0.2, 0.02], [0.5, 0.03], [0.8, 0.02], [0.95, 0.05],
        [0.02, 0.5], [0.98, 0.5],
        [0.05, 0.95], [0.2, 0.98], [0.5, 0.97], [0.8, 0.98], [0.95, 0.95],
      ]
      ctx.font = `${w * 0.055}px serif`
      ctx.textAlign = 'center'
      positions.forEach(([x, y]) => ctx.fillText('⭐', w * x, h * y + w * 0.04))
    },
    thumbnail: '⭐',
  },
  {
    id: 'flowers',
    name: 'Flowers',
    emoji: '🌸',
    category: 'cute',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      const corners = [
        [0, 0], [w * 0.85, 0], [0, h * 0.85], [w * 0.85, h * 0.85]
      ]
      ctx.font = `${w * 0.1}px serif`
      corners.forEach(([x, y]) => ctx.fillText('🌸', x + w * 0.07, y + h * 0.1))
      ctx.strokeStyle = '#fbcfe8'
      ctx.lineWidth = w * 0.015
      roundedRect(ctx, w * 0.01, h * 0.01, w * 0.98, h * 0.98, 12)
      ctx.stroke()
    },
    thumbnail: '🌸',
  },
  {
    id: 'ribbon',
    name: 'Ribbon',
    emoji: '🎀',
    category: 'cute',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = 'rgba(249,168,212,0.4)'
      ctx.fillRect(0, 0, w, h * 0.1)
      ctx.fillRect(0, h * 0.9, w, h * 0.1)
      ctx.font = `${w * 0.07}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('🎀', w / 2, h * 0.075)
      ctx.fillText('🎀', w / 2, h * 0.97)
    },
    thumbnail: '🎀',
  },

  // ─── FUNNY ──────────────────────────────────────────────────────────────────
  {
    id: 'besties',
    name: 'BESTIES',
    emoji: '👯',
    category: 'funny',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(0, h * 0.88, w, h * 0.12)
      ctx.fillStyle = '#1a1a1a'
      ctx.font = `bold ${w * 0.08}px "Space Grotesk", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('✨ BESTIES ✨', w / 2, h * 0.965)
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = w * 0.02
      ctx.strokeRect(w * 0.01, h * 0.01, w * 0.98, h * 0.98)
    },
    thumbnail: '👯',
  },
  {
    id: 'chaos',
    name: 'CHAOS',
    emoji: '🔥',
    category: 'funny',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = 'rgba(239,68,68,0.8)'
      ctx.fillRect(0, 0, w, h * 0.12)
      ctx.fillStyle = 'white'
      ctx.font = `black ${w * 0.09}px "Space Grotesk", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('🔥 CHAOS MODE 🔥', w / 2, h * 0.08)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = w * 0.025
      ctx.strokeRect(w * 0.013, h * 0.013, w * 0.974, h * 0.974)
    },
    thumbnail: '🔥',
  },
  {
    id: 'why-are-we-like-this',
    name: 'WHY ARE WE LIKE THIS',
    emoji: '😭',
    category: 'funny',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, h * 0.88, w, h * 0.12)
      ctx.fillStyle = 'white'
      ctx.font = `bold ${w * 0.055}px Nunito, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('😭 WHY ARE WE LIKE THIS??', w / 2, h * 0.965)
    },
    thumbnail: '😭',
  },
  {
    id: 'big-glasses',
    name: 'Big Glasses',
    emoji: '🤓',
    category: 'funny',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.font = `${w * 0.15}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('🤓', w / 2, h * 0.15)
      ctx.fillStyle = '#fbbf24'
      ctx.lineWidth = w * 0.012
      ctx.strokeStyle = '#fbbf24'
      roundedRect(ctx, w * 0.015, h * 0.015, w * 0.97, h * 0.97, 16)
      ctx.stroke()
    },
    thumbnail: '🤓',
  },

  // ─── ROMANTIC ───────────────────────────────────────────────────────────────
  {
    id: 'love-frame',
    name: 'Love Frame',
    emoji: '❤️',
    category: 'romantic',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      drawHearts(ctx, w, h, '#ef4444', w * 0.055, 7)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = w * 0.018
      roundedRect(ctx, w * 0.01, h * 0.01, w * 0.98, h * 0.98, 16)
      ctx.stroke()
    },
    thumbnail: '❤️',
  },
  {
    id: 'polaroid-romantic',
    name: 'Polaroid',
    emoji: '📷',
    category: 'romantic',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.fillRect(0, h * 0.88, w, h * 0.12)
      ctx.fillStyle = '#1a1a1a'
      ctx.font = `italic ${w * 0.045}px "Nunito", cursive`
      ctx.textAlign = 'center'
      ctx.fillText('a moment to remember ♥', w / 2, h * 0.965)
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = w * 0.03
      ctx.strokeRect(0, 0, w, h)
    },
    thumbnail: '📷',
  },
  {
    id: 'valentine',
    name: "Valentine's",
    emoji: '💝',
    category: 'romantic',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h * 0.15)
      grad.addColorStop(0, 'rgba(253,164,175,0.7)')
      grad.addColorStop(1, 'rgba(253,164,175,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h * 0.15)

      const grad2 = ctx.createLinearGradient(0, h * 0.85, 0, h)
      grad2.addColorStop(0, 'rgba(253,164,175,0)')
      grad2.addColorStop(1, 'rgba(253,164,175,0.7)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, h * 0.85, w, h * 0.15)

      ctx.font = `${w * 0.08}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('💝', w / 2, h * 0.1)
    },
    thumbnail: '💝',
  },

  // ─── FRIENDSHIP ─────────────────────────────────────────────────────────────
  {
    id: 'best-friends',
    name: 'Best Friends',
    emoji: '🤝',
    category: 'friendship',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = '#6d28d9'
      ctx.fillRect(0, 0, w, h * 0.1)
      ctx.fillRect(0, h * 0.9, w, h * 0.1)
      ctx.fillStyle = 'white'
      ctx.font = `bold ${w * 0.065}px "Nunito", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('BEST FRIENDS 🤝', w / 2, h * 0.07)
      ctx.fillText('forever & always ✨', w / 2, h * 0.97)
    },
    thumbnail: '🤝',
  },
  {
    id: 'squad',
    name: 'Squad',
    emoji: '👥',
    category: 'friendship',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, h * 0.87, w, h * 0.13)
      ctx.fillStyle = '#a78bfa'
      ctx.font = `black ${w * 0.08}px "Space Grotesk", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('THE SQUAD 👥', w / 2, h * 0.965)
    },
    thumbnail: '👥',
  },
  {
    id: 'friends-forever',
    name: 'Friends Forever',
    emoji: '🌈',
    category: 'friendship',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
      ctx.lineWidth = h * 0.012
      colors.forEach((c, i) => {
        ctx.strokeStyle = c
        ctx.beginPath()
        ctx.moveTo(0, (i + 0.5) * h * 0.012)
        ctx.lineTo(w, (i + 0.5) * h * 0.012)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, h - (i + 0.5) * h * 0.012)
        ctx.lineTo(w, h - (i + 0.5) * h * 0.012)
        ctx.stroke()
      })
    },
    thumbnail: '🌈',
  },

  // ─── MINIMALIST ─────────────────────────────────────────────────────────────
  {
    id: 'white-border',
    name: 'White Border',
    emoji: '⬜',
    category: 'minimalist',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.strokeStyle = 'white'
      ctx.lineWidth = w * 0.03
      ctx.strokeRect(w * 0.015, h * 0.015, w * 0.97, h * 0.97)
    },
    thumbnail: '⬜',
  },
  {
    id: 'black-border',
    name: 'Black Border',
    emoji: '⬛',
    category: 'minimalist',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = w * 0.025
      ctx.strokeRect(w * 0.013, h * 0.013, w * 0.974, h * 0.974)
    },
    thumbnail: '⬛',
  },
  {
    id: 'film-camera',
    name: 'Film Camera',
    emoji: '🎞️',
    category: 'minimalist',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      // Film holes top
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, w, h * 0.08)
      ctx.fillRect(0, h * 0.92, w, h * 0.08)
      ctx.fillStyle = 'white'
      for (let i = 0; i < 8; i++) {
        const x = (w / 8) * i + w / 16 - w * 0.025
        const y = h * 0.01
        roundedRect(ctx, x, y, w * 0.05, h * 0.06, 3)
        ctx.fill()
        roundedRect(ctx, x, h * 0.93, w * 0.05, h * 0.06, 3)
        ctx.fill()
      }
    },
    thumbnail: '🎞️',
  },
  {
    id: 'retro',
    name: 'Retro',
    emoji: '📟',
    category: 'minimalist',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.strokeStyle = '#b45309'
      ctx.lineWidth = w * 0.02
      ctx.setLineDash([w * 0.02, w * 0.01])
      ctx.strokeRect(w * 0.015, h * 0.015, w * 0.97, h * 0.97)
      ctx.setLineDash([])
      ctx.fillStyle = '#b45309'
      ctx.font = `${w * 0.04}px "Space Grotesk", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('📟 RETRO MEMORIES', w / 2, h * 0.045)
    },
    thumbnail: '📟',
  },

  // ─── INDONESIAN ─────────────────────────────────────────────────────────────
  {
    id: 'anak-nongkrong',
    name: 'Anak Nongkrong',
    emoji: '☕',
    category: 'indonesian',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      // Warm coffee brown + red-white accent
      ctx.fillStyle = '#7c3810'
      ctx.fillRect(0, 0, w, h * 0.1)
      ctx.fillRect(0, h * 0.9, w, h * 0.1)
      // Red strip
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(0, h * 0.1, w, h * 0.012)
      ctx.fillRect(0, h * 0.888, w, h * 0.012)
      ctx.fillStyle = 'white'
      ctx.font = `bold ${w * 0.065}px "Nunito", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('☕ anak nongkrong', w / 2, h * 0.07)
      ctx.font = `${w * 0.04}px "Nunito", sans-serif`
      ctx.fillText('vibes only ✨', w / 2, h * 0.97)
    },
    thumbnail: '☕',
  },
  {
    id: 'merah-putih',
    name: 'Merah Putih',
    emoji: '🇮🇩',
    category: 'indonesian',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(0, 0, w, h * 0.06)
      ctx.fillStyle = 'white'
      ctx.fillRect(0, h * 0.94, w, h * 0.06)
      // Side strips
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(0, h * 0.06, w * 0.04, h * 0.88)
      ctx.fillStyle = 'white'
      ctx.fillRect(w * 0.96, h * 0.06, w * 0.04, h * 0.88)
    },
    thumbnail: '🇮🇩',
  },
  {
    id: 'batik-modern',
    name: 'Batik Modern',
    emoji: '🏺',
    category: 'indonesian',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      // Geometric batik-inspired border
      const borderSize = w * 0.06
      ctx.strokeStyle = '#92400e'
      ctx.lineWidth = 2
      // Top geometric pattern
      for (let x = 0; x < w; x += borderSize * 0.6) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + borderSize * 0.3, borderSize)
        ctx.lineTo(x + borderSize * 0.6, 0)
        ctx.stroke()
      }
      // Bottom
      for (let x = 0; x < w; x += borderSize * 0.6) {
        ctx.beginPath()
        ctx.moveTo(x, h)
        ctx.lineTo(x + borderSize * 0.3, h - borderSize)
        ctx.lineTo(x + borderSize * 0.6, h)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(146,64,14,0.7)'
      ctx.fillRect(0, h * 0.87, w, h * 0.13)
      ctx.fillStyle = '#fef3c7'
      ctx.font = `bold ${w * 0.055}px "Nunito", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('🏺 Batik Modern 🏺', w / 2, h * 0.965)
    },
    thumbnail: '🏺',
  },
  {
    id: 'bestie-indonesia',
    name: 'Bestie Indonesia',
    emoji: '🥰',
    category: 'indonesian',
    type: 'css',
    canvasOverlay: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, 'rgba(220,38,38,0.4)')
      grad.addColorStop(0.5, 'rgba(255,255,255,0.1)')
      grad.addColorStop(1, 'rgba(220,38,38,0.4)')
      ctx.fillStyle = grad
      ctx.fillRect(0, h * 0.85, w, h * 0.15)
      ctx.fillStyle = 'white'
      ctx.font = `bold ${w * 0.055}px "Nunito", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('🥰 bestie Indonesia 🥰', w / 2, h * 0.965)
    },
    thumbnail: '🥰',
  },
]

export const FRAME_CATEGORIES = [
  { id: 'cute', label: 'Cute', emoji: '🌸' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️' },
  { id: 'friendship', label: 'Friendship', emoji: '🤝' },
  { id: 'minimalist', label: 'Minimalist', emoji: '⬜' },
  { id: 'indonesian', label: 'Indonesian', emoji: '🇮🇩' },
] as const

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find((f) => f.id === id)
}

export function applyFrameToCanvas(ctx: CanvasRenderingContext2D, frameId: string, w: number, h: number) {
  const frame = getFrameById(frameId)
  if (frame?.canvasOverlay) {
    frame.canvasOverlay(ctx, w, h)
  }
}
