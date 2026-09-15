import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface PeerConnection {
  userId: string
  pc: RTCPeerConnection
  audioEl: HTMLAudioElement
}

interface WebRTCState {
  isMicOn: boolean
  isMuted: boolean
  micError: string | null
  speakingUsers: Set<string>
  participantMicStatus: Record<string, boolean>
  remoteVideoStreams: Record<string, MediaStream>
}

// Free Google STUN servers for NAT traversal
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

export function useWebRTC(roomCode: string, userId: string, participantIds: string[], localVideoStream: MediaStream | null) {
  const [state, setState] = useState<WebRTCState>({
    isMicOn: false,
    isMuted: false,
    micError: null,
    speakingUsers: new Set(),
    participantMicStatus: {},
    remoteVideoStreams: {},
  })

  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, PeerConnection>>(new Map())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserTimersRef = useRef<Map<string, number>>(new Map())

  // Broadcast a signaling message
  const broadcastSignal = useCallback(
    async (type: string, payload: Record<string, unknown>, targetUserId?: string) => {
      if (!channelRef.current) return
      channelRef.current.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: { type, from: userId, to: targetUserId, ...payload },
      })
    },
    [userId]
  )

  // Voice activity detection
  const detectSpeaking = useCallback((uid: string, stream: MediaStream) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    const ctx = audioCtxRef.current
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    const source = ctx.createMediaStreamSource(stream)
    source.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    const timer = window.setInterval(() => {
      analyser.getByteFrequencyData(data)
      const volume = data.reduce((a, b) => a + b, 0) / data.length
      setState((prev) => {
        const next = new Set(prev.speakingUsers)
        if (volume > 10) next.add(uid)
        else next.delete(uid)
        return { ...prev, speakingUsers: next }
      })
    }, 100)

    analyserTimersRef.current.set(uid, timer)
  }, [])

  // Detect own speaking
  const detectOwnSpeaking = useCallback((stream: MediaStream) => {
    detectSpeaking(userId, stream)
  }, [userId, detectSpeaking])

  // Create a peer connection for a specific user
  const createPeer = useCallback(
    (remoteUserId: string, isInitiator: boolean): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS)

      // Add local audio tracks to peer
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!)
        })
      }

      // Add local video tracks to peer
      if (localVideoStream) {
        localVideoStream.getVideoTracks().forEach((track) => {
          pc.addTrack(track, localVideoStream)
        })
      }

      // Handle remote stream
      const audioEl = new Audio()
      audioEl.autoplay = true
      audioEl.setAttribute('playsinline', 'true')
      audioEl.style.display = 'none'
      document.body.appendChild(audioEl)

      pc.ontrack = (event) => {
        const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track])
        if (event.track.kind === 'audio') {
          audioEl.srcObject = stream
          audioEl.play().catch(console.warn)
          // Detect speaking
          detectSpeaking(remoteUserId, stream)
        } else if (event.track.kind === 'video') {
          setState((prev) => ({
            ...prev,
            remoteVideoStreams: {
              ...prev.remoteVideoStreams,
              [remoteUserId]: stream,
            }
          }))
        }
      }

      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          broadcastSignal('ice-candidate', { candidate: event.candidate.toJSON() }, remoteUserId)
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          peersRef.current.delete(remoteUserId)
        }
      }

      pc.onnegotiationneeded = async () => {
        if (isInitiator) {
          try {
            const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
            if (pc.signalingState !== 'stable') return
            await pc.setLocalDescription(offer)
            broadcastSignal('offer', { sdp: pc.localDescription }, remoteUserId)
          } catch (err) {
            console.error(err)
          }
        }
      }

      if (isInitiator) {
        // Create and send initial offer just in case onnegotiationneeded doesn't fire
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            broadcastSignal('offer', { sdp: pc.localDescription }, remoteUserId)
          })
          .catch(console.error)
      }

      peersRef.current.set(remoteUserId, { userId: remoteUserId, pc, audioEl })
      return pc
    },
    [broadcastSignal, localVideoStream, detectSpeaking]
  )



  // Turn mic on
  const turnMicOn = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      setState((prev) => ({ ...prev, isMicOn: true, micError: null }))
      detectOwnSpeaking(stream)

      // Add track to all existing peers
      peersRef.current.forEach(({ pc }) => {
        stream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, stream)
        })
      })

      // Broadcast mic on status
      await broadcastSignal('mic-status', { micOn: true })

      // Initiate connections with all other participants
      participantIds.forEach((pid) => {
        if (pid !== userId && !peersRef.current.has(pid)) {
          // Initiator is the one with the "larger" userId (alphabetically)
          const isInitiator = userId > pid
          createPeer(pid, isInitiator)
        }
      })
    } catch (err) {
      const e = err as Error
      let msg = 'Could not access microphone.'
      if (e.name === 'NotAllowedError') msg = 'Microphone permission denied.'
      else if (e.name === 'NotFoundError') msg = 'No microphone found.'
      setState((prev) => ({ ...prev, micError: msg }))
    }
  }, [userId, participantIds, broadcastSignal, createPeer, detectOwnSpeaking])

  // Turn mic off
  const turnMicOff = useCallback(async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => t.stop())
      
      // Remove audio tracks from all peer connections
      peersRef.current.forEach(({ pc }) => {
        const senders = pc.getSenders()
        const audioSender = senders.find(s => s.track?.kind === 'audio')
        if (audioSender) {
          try { pc.removeTrack(audioSender) } catch {}
        }
      })
      
      localStreamRef.current = null
    }

    // Clear speaking timers
    analyserTimersRef.current.forEach((timer) => clearInterval(timer))
    analyserTimersRef.current.clear()

    await broadcastSignal('mic-status', { micOn: false })
    setState((prev) => ({
      ...prev,
      isMicOn: false,
      speakingUsers: new Set(),
    }))
  }, [broadcastSignal])

  // Toggle mute (keep connection but silence mic)
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return
    const audioTrack = localStreamRef.current.getAudioTracks()[0]
    if (!audioTrack) return
    audioTrack.enabled = !audioTrack.enabled
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }))
  }, [])

  // Setup Supabase Realtime channel for WebRTC signaling
  useEffect(() => {
    const channel = supabase.channel(`audio-${roomCode}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'webrtc-signal' }, async ({ payload }) => {
      const { type, from, to, sdp, candidate, micOn } = payload as {
        type: string
        from: string
        to?: string
        sdp?: RTCSessionDescriptionInit
        candidate?: RTCIceCandidateInit
        micOn?: boolean
      }

      // Only process messages meant for us (or broadcast messages)
      if (to && to !== userId) return

      if (type === 'mic-status') {
        setState((prev) => ({
          ...prev,
          participantMicStatus: { ...prev.participantMicStatus, [from]: micOn ?? false },
        }))
        return
      }

      // Handle WebRTC signaling
      if (type === 'offer' && sdp) {
        let peer = peersRef.current.get(from)
        if (!peer) {
          const pc = createPeer(from, false)
          peer = peersRef.current.get(from)!
          // Add our local stream tracks
          if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
              pc.addTrack(track, localStreamRef.current!)
            })
          }
          if (localVideoStream) {
            localVideoStream.getVideoTracks().forEach((track) => {
              pc.addTrack(track, localVideoStream)
            })
          }
        }
        await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp))
        const answer = await peer.pc.createAnswer()
        await peer.pc.setLocalDescription(answer)
        broadcastSignal('answer', { sdp: peer.pc.localDescription }, from)
      } else if (type === 'answer' && sdp) {
        const peer = peersRef.current.get(from)
        if (peer && peer.pc.signalingState !== 'stable') {
          await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp))
        }
      } else if (type === 'ice-candidate' && candidate) {
        const peer = peersRef.current.get(from)
        if (peer) {
          try {
            await peer.pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch {
            // Ignore if connection already stable
          }
        }
      }
    })

    channel.subscribe()
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [roomCode, userId, createPeer, broadcastSignal, localVideoStream])

  // Replace video track if it changes
  useEffect(() => {
    if (localVideoStream) {
      peersRef.current.forEach(({ pc }) => {
        const senders = pc.getSenders()
        const videoTransceiver = pc.getTransceivers().find(t => t.receiver.track.kind === 'video' || t.sender.track?.kind === 'video')
        const videoSender = videoTransceiver?.sender || senders.find(s => s.track?.kind === 'video')
        const videoTrack = localVideoStream.getVideoTracks()[0]
        
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack).catch(console.warn)
        } else if (videoTrack && pc.signalingState !== 'closed') {
          // If no video sender yet but we now have video, we might need to add it and renegotiate
          // For simplicity we just addTrack and rely on normal negotiation if it happens
          try {
            pc.addTrack(videoTrack, localVideoStream)
          } catch {
            // Track might already be added
          }
        }
      })
    }
  }, [localVideoStream])

  // When new participants join, try to connect
  useEffect(() => {
    participantIds.forEach((pid) => {
      if (pid !== userId && !peersRef.current.has(pid)) {
        const isInitiator = userId > pid
        createPeer(pid, isInitiator)
      }
    })
  }, [participantIds, userId, createPeer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      turnMicOff()
      peersRef.current.forEach(({ pc, audioEl }) => {
        pc.close()
        audioEl.srcObject = null
        audioEl.remove()
      })
      peersRef.current.clear()
    }
  }, [turnMicOff])

  return {
    ...state,
    turnMicOn,
    turnMicOff,
    toggleMute,
  }
}
