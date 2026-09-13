import { supabase } from './supabase'
import { generateRoomCode, generateUserId } from './utils'
import type { BackgroundConfig } from './backgrounds'

export interface RoomState {
  code: string
  hostId: string
  participants: Participant[]
  selectedFrame: string | null
  selectedBackground: BackgroundConfig | null
  sessionStatus: SessionStatus
  currentTake: number
  countdownStartAt: string | null
  maxParticipants: number
}

export interface Participant {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  roomCode: string
}

export type SessionStatus = 
  | 'waiting'
  | 'frame_select'
  | 'background_select'
  | 'countdown'
  | 'capturing'
  | 'review'
  | 'editing'
  | 'complete'

const USER_ID_KEY = 'photobox_user_id'
const USER_NAME_KEY = 'photobox_user_name'

export function getOrCreateUserId(): string {
  let id = sessionStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = generateUserId()
    sessionStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

export function getUserName(): string {
  return sessionStorage.getItem(USER_NAME_KEY) || ''
}

export function setUserName(name: string) {
  sessionStorage.setItem(USER_NAME_KEY, name)
}

// Create a new room in Supabase
export async function createRoom(hostName: string): Promise<{ roomCode: string; userId: string } | null> {
  const userId = getOrCreateUserId()
  setUserName(hostName)
  const code = generateRoomCode()
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

  const { error: roomError } = await supabase.from('rooms').insert({
    code,
    host_id: userId,
    selected_frame: null,
    selected_background: null,
    current_take: 0,
    session_status: 'waiting',
    countdown_start_at: null,
    max_participants: 8,
    expires_at: expiresAt,
  })

  if (roomError) {
    console.error('Error creating room:', roomError)
    return null
  }

  const { error: partError } = await supabase.from('participants').insert({
    id: userId,
    room_code: code,
    name: hostName,
    is_host: true,
    is_ready: false,
  })

  if (partError) {
    console.error('Error adding host as participant:', partError)
    return null
  }

  return { roomCode: code, userId }
}

// Join an existing room
export async function joinRoom(
  code: string,
  participantName: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  const userId = getOrCreateUserId()
  setUserName(participantName)
  const upperCode = code.toUpperCase()

  // Check room exists and is not full/expired
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, participants(*)')
    .eq('code', upperCode)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (roomError || !room) {
    return { success: false, error: 'Room not found or has expired.' }
  }

  const currentParticipants = (room.participants as Participant[]).length
  if (currentParticipants >= room.max_participants) {
    return { success: false, error: 'This room is full.' }
  }

  // Check if user already in room
  const existing = (room.participants as Participant[]).find((p) => p.id === userId)
  if (existing) {
    return { success: true, userId }
  }

  const { error: partError } = await supabase.from('participants').insert({
    id: userId,
    room_code: upperCode,
    name: participantName,
    is_host: false,
    is_ready: false,
  })

  if (partError) {
    return { success: false, error: 'Failed to join room. Please try again.' }
  }

  return { success: true, userId }
}

// Fetch room state
export async function fetchRoom(code: string): Promise<RoomState | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, participants(*)')
    .eq('code', code.toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null

  return {
    code: data.code,
    hostId: data.host_id,
    participants: ((data.participants as Record<string, unknown>[]) || []).map((p) => ({
      id: p.id as string,
      name: p.name as string,
      isHost: p.is_host as boolean,
      isReady: p.is_ready as boolean,
      roomCode: p.room_code as string,
    })),
    selectedFrame: data.selected_frame,
    selectedBackground: data.selected_background as BackgroundConfig | null,
    sessionStatus: data.session_status as SessionStatus,
    currentTake: data.current_take,
    countdownStartAt: data.countdown_start_at,
    maxParticipants: data.max_participants,
  }
}

// Update room state (host only)
export async function updateRoom(code: string, updates: {
  selectedFrame?: string | null
  selectedBackground?: BackgroundConfig | null
  sessionStatus?: SessionStatus
  currentTake?: number
  countdownStartAt?: string | null
}) {
  const mapped: Record<string, unknown> = {}
  if ('selectedFrame' in updates) mapped.selected_frame = updates.selectedFrame
  if ('selectedBackground' in updates) mapped.selected_background = updates.selectedBackground
  if ('sessionStatus' in updates) mapped.session_status = updates.sessionStatus
  if ('currentTake' in updates) mapped.current_take = updates.currentTake
  if ('countdownStartAt' in updates) mapped.countdown_start_at = updates.countdownStartAt

  const { error } = await supabase.from('rooms').update(mapped).eq('code', code)
  if (error) console.error('updateRoom error:', error)
}

// Update participant ready status
export async function updateParticipantReady(userId: string, isReady: boolean) {
  await supabase.from('participants').update({ is_ready: isReady }).eq('id', userId)
}

// Leave room / cleanup
export async function leaveRoom(code: string, userId: string, isHost: boolean, participants: Participant[]) {
  await supabase.from('participants').delete().eq('id', userId)

  if (isHost) {
    const others = participants.filter((p) => p.id !== userId)
    if (others.length > 0) {
      // Transfer host
      const newHost = others[0]
      await supabase.from('participants').update({ is_host: true }).eq('id', newHost.id)
      await supabase.from('rooms').update({ host_id: newHost.id }).eq('code', code)
    } else {
      // Delete room if empty
      await supabase.from('rooms').delete().eq('code', code)
    }
  }
}

// Broadcast a room event
export async function broadcastEvent(code: string, eventType: string, payload: Record<string, unknown> = {}) {
  await supabase.from('room_events').insert({
    room_code: code,
    event_type: eventType,
    payload,
  })
}

// Start countdown - uses server time for sync
export async function startCountdown(code: string) {
  const countdownStartAt = new Date(Date.now() + 500).toISOString() // 500ms buffer
  await updateRoom(code, {
    sessionStatus: 'countdown',
    countdownStartAt,
    currentTake: 0,
  })
  await broadcastEvent(code, 'countdown_start', { countdownStartAt })
}
