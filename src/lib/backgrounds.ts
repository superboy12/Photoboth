export interface BackgroundOption {
  id: string
  name: string
  type: 'original' | 'solid' | 'gradient' | 'image'
  value: string // CSS color, CSS gradient, or image URL
  thumbnail: string // CSS value for thumbnail preview
  emoji?: string
}

export const SOLID_COLORS: BackgroundOption[] = [
  { id: 'solid-white', name: 'White', type: 'solid', value: '#ffffff', thumbnail: '#ffffff' },
  { id: 'solid-black', name: 'Black', type: 'solid', value: '#0f172a', thumbnail: '#0f172a' },
  { id: 'solid-pink', name: 'Pink', type: 'solid', value: '#fbcfe8', thumbnail: '#fbcfe8' },
  { id: 'solid-lavender', name: 'Lavender', type: 'solid', value: '#ddd6fe', thumbnail: '#ddd6fe' },
  { id: 'solid-blue', name: 'Blue', type: 'solid', value: '#bae6fd', thumbnail: '#bae6fd' },
  { id: 'solid-green', name: 'Mint', type: 'solid', value: '#bbf7d0', thumbnail: '#bbf7d0' },
  { id: 'solid-cream', name: 'Cream', type: 'solid', value: '#fef9ef', thumbnail: '#fef9ef' },
  { id: 'solid-yellow', name: 'Yellow', type: 'solid', value: '#fef08a', thumbnail: '#fef08a' },
  { id: 'solid-peach', name: 'Peach', type: 'solid', value: '#fed7aa', thumbnail: '#fed7aa' },
  { id: 'solid-sky', name: 'Sky', type: 'solid', value: '#e0f2fe', thumbnail: '#e0f2fe' },
]

export const GRADIENTS: BackgroundOption[] = [
  {
    id: 'grad-pink-purple',
    name: 'Pink → Purple',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fbcfe8 0%, #ddd6fe 100%)',
    thumbnail: 'linear-gradient(135deg, #fbcfe8, #ddd6fe)',
  },
  {
    id: 'grad-blue-purple',
    name: 'Blue → Purple',
    type: 'gradient',
    value: 'linear-gradient(135deg, #bae6fd 0%, #a78bfa 100%)',
    thumbnail: 'linear-gradient(135deg, #bae6fd, #a78bfa)',
  },
  {
    id: 'grad-orange-pink',
    name: 'Sunset Glow',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fed7aa 0%, #fda4af 50%, #c084fc 100%)',
    thumbnail: 'linear-gradient(135deg, #fed7aa, #fda4af, #c084fc)',
  },
  {
    id: 'grad-pastel',
    name: 'Pastel Dream',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 33%, #dbeafe 66%, #dcfce7 100%)',
    thumbnail: 'linear-gradient(135deg, #fce7f3, #ede9fe, #dbeafe, #dcfce7)',
  },
  {
    id: 'grad-midnight',
    name: 'Midnight',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    thumbnail: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  },
  {
    id: 'grad-aurora',
    name: 'Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 33%, #4facfe 66%, #00f2fe 100%)',
    thumbnail: 'linear-gradient(135deg, #43e97b, #38f9d7, #4facfe)',
  },
  {
    id: 'grad-rose-gold',
    name: 'Rose Gold',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 50%, #f9a8d4 100%)',
    thumbnail: 'linear-gradient(135deg, #f7971e, #ffd200, #f9a8d4)',
  },
  {
    id: 'grad-cotton-candy',
    name: 'Cotton Candy',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    thumbnail: 'linear-gradient(135deg, #a8edea, #fed6e3)',
  },
]

// Image backgrounds using Unsplash URLs (no attribution needed for demo)
export const IMAGE_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'img-studio-pink',
    name: 'Pink Studio',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&q=60',
    emoji: '🩷',
  },
  {
    id: 'img-cafe',
    name: 'Cozy Cafe',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=60',
    emoji: '☕',
  },
  {
    id: 'img-beach',
    name: 'Beach',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=60',
    emoji: '🏖️',
  },
  {
    id: 'img-sunset',
    name: 'Sunset',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1476900164809-ff19b8ae5968?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1476900164809-ff19b8ae5968?w=200&q=60',
    emoji: '🌅',
  },
  {
    id: 'img-night-city',
    name: 'Night City',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&q=60',
    emoji: '🌃',
  },
  {
    id: 'img-flowers',
    name: 'Flower Garden',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1490750967868-88df5691cc3d?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88df5691cc3d?w=200&q=60',
    emoji: '🌺',
  },
  {
    id: 'img-clouds',
    name: 'Cloud Room',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=60',
    emoji: '☁️',
  },
  {
    id: 'img-space',
    name: 'Space',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&q=60',
    emoji: '🌌',
  },
  {
    id: 'img-forest',
    name: 'Forest',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60',
    emoji: '🌲',
  },
  {
    id: 'img-japan',
    name: 'Japanese Street',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=60',
    emoji: '🗾',
  },
  {
    id: 'img-retro-studio',
    name: 'Retro Studio',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&q=60',
    emoji: '📟',
  },
  {
    id: 'img-arcade',
    name: 'Arcade',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&q=60',
    emoji: '🕹️',
  },
]

export const ORIGINAL_BG: BackgroundOption = {
  id: 'original',
  name: 'Original',
  type: 'original',
  value: 'original',
  thumbnail: 'transparent',
  emoji: '📷',
}

export type BackgroundConfig = {
  type: 'original' | 'solid' | 'gradient' | 'image'
  value: string
}

export function backgroundToCSS(bg: BackgroundConfig): string {
  if (bg.type === 'original') return 'transparent'
  if (bg.type === 'solid') return bg.value
  if (bg.type === 'gradient') return bg.value
  if (bg.type === 'image') return `url('${bg.value}') center/cover no-repeat`
  return 'transparent'
}
