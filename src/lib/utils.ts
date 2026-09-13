// Room code generator - 6 chars alphanumeric, uppercase
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Generate a unique user ID for this session
export function generateUserId(): string {
  return `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Format participant count
export function formatParticipantCount(count: number): string {
  if (count === 1) return '1 Participant'
  return `${count} Participants`
}

// Truncate name
export function truncateName(name: string, maxLen = 12): string {
  return name.length > maxLen ? name.slice(0, maxLen) + '…' : name
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Pastel color from string (for participant avatars)
export function getPastelColor(str: string): string {
  const colors = [
    '#f9a8d4', '#c4b5fd', '#93c5fd', '#6ee7b7',
    '#fcd34d', '#fb7185', '#a78bfa', '#34d399',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Sleep utility
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

// Format time ago
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

// Download canvas as image
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpg' = 'png') {
  const link = document.createElement('a')
  link.download = `${filename}.${format}`
  link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95)
  link.click()
}

// Share image via Web Share API or fallback
export async function shareImage(dataUrl: string, title: string): Promise<boolean> {
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'photobox.png', { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title, files: [file] })
        return true
      }
    } catch {
      // Fall through
    }
  }
  return false
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}
