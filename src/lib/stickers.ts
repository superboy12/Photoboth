export interface Sticker {
  id: string
  emoji: string
  name: string
  category: string
}

export const STICKERS: Sticker[] = [
  // Hearts
  { id: 'heart-red', emoji: '❤️', name: 'Red Heart', category: 'hearts' },
  { id: 'heart-pink', emoji: '🩷', name: 'Pink Heart', category: 'hearts' },
  { id: 'heart-purple', emoji: '💜', name: 'Purple Heart', category: 'hearts' },
  { id: 'heart-blue', emoji: '💙', name: 'Blue Heart', category: 'hearts' },
  { id: 'heart-sparkle', emoji: '💖', name: 'Sparkle Heart', category: 'hearts' },
  { id: 'heart-kiss', emoji: '💋', name: 'Kiss', category: 'hearts' },
  { id: 'heart-revolving', emoji: '💞', name: 'Revolving', category: 'hearts' },

  // Stars
  { id: 'star', emoji: '⭐', name: 'Star', category: 'stars' },
  { id: 'star-glowing', emoji: '🌟', name: 'Glowing Star', category: 'stars' },
  { id: 'sparkles', emoji: '✨', name: 'Sparkles', category: 'stars' },
  { id: 'dizzy', emoji: '💫', name: 'Dizzy', category: 'stars' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', category: 'stars' },

  // Flowers
  { id: 'flower-cherry', emoji: '🌸', name: 'Cherry Blossom', category: 'flowers' },
  { id: 'flower-rose', emoji: '🌹', name: 'Rose', category: 'flowers' },
  { id: 'flower-sunflower', emoji: '🌻', name: 'Sunflower', category: 'flowers' },
  { id: 'flower-tulip', emoji: '🌷', name: 'Tulip', category: 'flowers' },
  { id: 'flower-bouquet', emoji: '💐', name: 'Bouquet', category: 'flowers' },

  // Animals - Cat
  { id: 'cat', emoji: '🐱', name: 'Cat', category: 'animals' },
  { id: 'cat-heart', emoji: '😻', name: 'Heart Eyes Cat', category: 'animals' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny', category: 'animals' },
  { id: 'dog', emoji: '🐶', name: 'Dog', category: 'animals' },
  { id: 'bear', emoji: '🐻', name: 'Bear', category: 'animals' },
  { id: 'panda', emoji: '🐼', name: 'Panda', category: 'animals' },
  { id: 'hamster', emoji: '🐹', name: 'Hamster', category: 'animals' },

  // Funny
  { id: 'sunglasses', emoji: '😎', name: 'Sunglasses', category: 'funny' },
  { id: 'clown', emoji: '🤡', name: 'Clown', category: 'funny' },
  { id: 'crown', emoji: '👑', name: 'Crown', category: 'funny' },
  { id: 'glasses', emoji: '👓', name: 'Glasses', category: 'funny' },
  { id: 'party', emoji: '🎉', name: 'Party', category: 'funny' },
  { id: 'balloon', emoji: '🎈', name: 'Balloon', category: 'funny' },
  { id: 'fire', emoji: '🔥', name: 'Fire', category: 'funny' },
  { id: 'eyes', emoji: '👀', name: 'Eyes', category: 'funny' },
  { id: 'muscle', emoji: '💪', name: 'Muscle', category: 'funny' },

  // Food
  { id: 'boba', emoji: '🧋', name: 'Boba', category: 'food' },
  { id: 'cake', emoji: '🎂', name: 'Cake', category: 'food' },
  { id: 'coffee', emoji: '☕', name: 'Coffee', category: 'food' },
  { id: 'donut', emoji: '🍩', name: 'Donut', category: 'food' },
  { id: 'sushi', emoji: '🍣', name: 'Sushi', category: 'food' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', category: 'food' },
  { id: 'noodles', emoji: '🍜', name: 'Noodles', category: 'food' },
  { id: 'ice-cream', emoji: '🍦', name: 'Ice Cream', category: 'food' },

  // Objects
  { id: 'camera', emoji: '📷', name: 'Camera', category: 'objects' },
  { id: 'music', emoji: '🎵', name: 'Music', category: 'objects' },
  { id: 'bow', emoji: '🎀', name: 'Bow', category: 'objects' },
  { id: 'gem', emoji: '💎', name: 'Gem', category: 'objects' },
  { id: 'magic', emoji: '🪄', name: 'Magic', category: 'objects' },
  { id: 'moon', emoji: '🌙', name: 'Moon', category: 'objects' },
]

export const STICKER_CATEGORIES = [
  { id: 'hearts', label: 'Hearts', emoji: '❤️' },
  { id: 'stars', label: 'Stars', emoji: '⭐' },
  { id: 'flowers', label: 'Flowers', emoji: '🌸' },
  { id: 'animals', label: 'Animals', emoji: '🐱' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'food', label: 'Food', emoji: '🧋' },
  { id: 'objects', label: 'Objects', emoji: '💎' },
] as const

export interface PlacedSticker {
  id: string
  stickerId: string
  emoji: string
  x: number
  y: number
  scale: number
  rotation: number
}
