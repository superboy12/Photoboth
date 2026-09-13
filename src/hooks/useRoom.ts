import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchRoom,
  updateRoom,
  broadcastEvent,
  leaveRoom as leaveRoomLib,
  updateParticipantReady,
  startCountdown,
  type RoomState,
  type SessionStatus,
} from '../lib/room'
import type { BackgroundConfig } from '../lib/backgrounds'

export interface UseRoomReturn {
  room: RoomState | null
  isLoading: boolean
  error: string | null
  userId: string
  isHost: boolean
  // Actions
  selectFrame: (frameId: string) => Promise<void>
  selectBackground: (bg: BackgroundConfig) => Promise<void>
  setReady: (ready: boolean) => Promise<void>
  triggerCountdown: () => Promise<void>
  setSessionStatus: (status: SessionStatus) => Promise<void>
  leaveRoom: () => Promise<void>
  incrementTake: () => Promise<void>
}

export function useRoom(roomCode: string, userId: string): UseRoomReturn {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const isHost = room?.hostId === userId

  const loadRoom = useCallback(async () => {
    const data = await fetchRoom(roomCode)
    if (!data) {
      setError('Room not found or has expired.')
    } else {
      setRoom(data)
    }
    setIsLoading(false)
  }, [roomCode])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  // Supabase Realtime subscriptions
  useEffect(() => {
    if (!roomCode) return

    // Subscribe to room changes
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setError('The room has been closed.')
            return
          }
          const updated = payload.new as Record<string, unknown>
          setRoom((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              hostId: updated.host_id as string,
              selectedFrame: updated.selected_frame as string | null,
              selectedBackground: updated.selected_background as BackgroundConfig | null,
              sessionStatus: updated.session_status as SessionStatus,
              currentTake: updated.current_take as number,
              countdownStartAt: updated.countdown_start_at as string | null,
            }
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          // Reload participants on any change
          loadRoom()
        }
      )
      .subscribe()

    subscriptionRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [roomCode, loadRoom])

  const selectFrame = useCallback(
    async (frameId: string) => {
      if (!isHost) return
      await updateRoom(roomCode, { selectedFrame: frameId })
    },
    [roomCode, isHost]
  )

  const selectBackground = useCallback(
    async (bg: BackgroundConfig) => {
      if (!isHost) return
      await updateRoom(roomCode, { selectedBackground: bg })
    },
    [roomCode, isHost]
  )

  const setReady = useCallback(
    async (ready: boolean) => {
      await updateParticipantReady(userId, ready)
    },
    [userId]
  )

  const triggerCountdown = useCallback(async () => {
    if (!isHost) return
    await startCountdown(roomCode)
  }, [roomCode, isHost])

  const setSessionStatus = useCallback(
    async (status: SessionStatus) => {
      if (!isHost) return
      await updateRoom(roomCode, { sessionStatus: status })
    },
    [roomCode, isHost]
  )

  const incrementTake = useCallback(async () => {
    if (!isHost || !room) return
    await updateRoom(roomCode, {
      currentTake: room.currentTake + 1,
      sessionStatus: 'countdown',
      countdownStartAt: new Date(Date.now() + 500).toISOString(),
    })
  }, [roomCode, isHost, room])

  const leaveRoom = useCallback(async () => {
    if (!room) return
    await leaveRoomLib(roomCode, userId, isHost, room.participants)
    await broadcastEvent(roomCode, 'participant_left', { userId })
  }, [roomCode, userId, isHost, room])

  return {
    room,
    isLoading,
    error,
    userId,
    isHost,
    selectFrame,
    selectBackground,
    setReady,
    triggerCountdown,
    setSessionStatus,
    leaveRoom,
    incrementTake,
  }
}
