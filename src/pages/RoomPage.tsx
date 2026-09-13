import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { LogOut, Users, Camera, ChevronDown, RefreshCw, Mic, MicOff, Volume2 } from 'lucide-react'
import { useRoom } from '../hooks/useRoom'
import { useAudioChat } from '../hooks/useAudioChat'
import { useCamera } from '../hooks/useCamera'
import { useCountdown } from '../hooks/useCountdown'
import { getOrCreateUserId, getUserName } from '../lib/room'
import { applyFrameToCanvas } from '../lib/frames'
import { ORIGINAL_BG, backgroundToCSS } from '../lib/backgrounds'
import { getInitials, getPastelColor, formatParticipantCount } from '../lib/utils'
import FramePicker from '../components/editor/FramePicker'
import BackgroundPicker from '../components/editor/BackgroundPicker'
import PhotoEditor from '../components/editor/PhotoEditor'
import CountdownOverlay from '../components/room/CountdownOverlay'

export default function RoomPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const userId = getOrCreateUserId()
  const userName = getUserName()

  const { room, isLoading, error, isHost, selectFrame, selectBackground, setReady, triggerCountdown, setSessionStatus, leaveRoom, incrementTake } =
    useRoom(code || '', userId)

  const { videoRef, devices, selectedDevice, isLoading: camLoading, error: camError, capturePhoto, switchCamera, stopCamera, startCamera } =
    useCamera()

  const participantIds = room?.participants.map((p) => p.id) || []
  const { isMicOn, isMuted, micError, speakingUsers, participantMicStatus, turnMicOn, turnMicOff, toggleMute } =
    useAudioChat(code || '', userId, participantIds)

  useEffect(() => {
    if (micError) toast.error(micError)
  }, [micError])

  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]) // current take photos
  const [allTakes, setAllTakes] = useState<string[][]>([]) // all takes for photostrip
  const [showFlash, setShowFlash] = useState(false)
  const [activeTab, setActiveTab] = useState<'frame' | 'background'>('frame')
  const [showEditor, setShowEditor] = useState(false)
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null)
  const hasStartedCamera = useRef(false)

  // Start camera on mount
  useEffect(() => {
    if (!hasStartedCamera.current) {
      hasStartedCamera.current = true
      startCamera()
    }
    return () => stopCamera()
  }, [])

  const doCapture = useCallback(async () => {
    // Camera flash
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 500)

    const photo = capturePhoto()
    if (!photo) {
      toast.error('Could not capture photo. Camera may not be ready.')
      return
    }

    setCapturedPhotos((prev) => [...prev, photo])
    setAllTakes((prev) => [...prev, [photo]])

    // Notify status change to review
    if (isHost) {
      await setSessionStatus('review')
    }
  }, [capturePhoto, isHost, setSessionStatus])

  const countdown = useCountdown(room?.countdownStartAt || null, doCapture)

  useEffect(() => {
    if (!userName) {
      navigate('/')
    }
  }, [userName, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      setTimeout(() => navigate('/'), 2000)
    }
  }, [error, navigate])

  const handleLeave = async () => {
    stopCamera()
    turnMicOff()
    await leaveRoom()
    navigate('/')
  }

  const handleRetake = async () => {
    setCapturedPhotos([])
    if (isHost) {
      await incrementTake()
    } else {
      toast('Waiting for host to start retake...')
    }
  }

  const handleUsePhoto = () => {
    const last = capturedPhotos[capturedPhotos.length - 1]
    if (last) {
      setFinalPhoto(last)
      setShowEditor(true)
    }
  }

  const allReady = room?.participants.every((p) => p.isReady) ?? false
  const myParticipant = room?.participants.find((p) => p.id === userId)
  const isReady = myParticipant?.isReady ?? false
  const sessionStatus = room?.sessionStatus || 'waiting'
  const bg = room?.selectedBackground || ORIGINAL_BG
  const bgCSS = backgroundToCSS(bg)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!room) return null

  if (showEditor && finalPhoto) {
    return (
      <PhotoEditor
        photo={finalPhoto}
        allTakes={allTakes.flat()}
        roomCode={code || ''}
        frameId={room.selectedFrame || undefined}
        onBack={() => setShowEditor(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>

      {/* Countdown overlay */}
      <AnimatePresence>
        {(countdown.phase === 'counting' || countdown.phase === 'cheese') && (
          <CountdownOverlay count={countdown.count} phase={countdown.phase} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="glass-dark text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-lavender-500 rounded-xl flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-black text-sm tracking-widest">{room.code}</div>
            <div className="text-xs text-white/50 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatParticipantCount(room.participants.length)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera switcher */}
          {devices.length > 1 && (
            <div className="relative">
              <select
                className="appearance-none bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20 pr-6"
                value={selectedDevice}
                onChange={(e) => switchCamera(e.target.value)}
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="text-black">
                    {d.label.slice(0, 20)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1 top-1 w-3 h-3 text-white/50 pointer-events-none" />
            </div>
          )}

          {/* Mic Toggle */}
          <button
            onClick={isMicOn ? toggleMute : turnMicOn}
            className={`p-2 rounded-xl transition-colors ${
              isMicOn
                ? isMuted
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                : 'bg-white/10 text-white/50 hover:bg-white/20'
            }`}
            title={isMicOn ? (isMuted ? 'Unmute' : 'Mute') : 'Turn on Mic'}
          >
            {isMicOn ? isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            id="btn-leave-room"
            onClick={handleLeave}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main camera area */}
        <div className="flex-1 flex flex-col">
          {/* Camera preview */}
          <div className="relative flex-1 bg-black overflow-hidden" style={{ minHeight: '300px' }}>
            {camError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 p-6">
                <Camera className="w-16 h-16 text-white/30" />
                <p className="text-center font-semibold text-white/70">{camError}</p>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 rounded-xl text-white font-bold hover:bg-pink-600"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Background layer */}
                {bg.type !== 'original' && (
                  <div
                    className="absolute inset-0"
                    style={{ background: bgCSS }}
                  />
                )}

                {/* Video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-mirror w-full h-full object-cover"
                  style={{ position: 'relative', zIndex: 1 }}
                />

                {/* Photo preview overlay after capture */}
                {sessionStatus === 'review' && capturedPhotos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-10"
                  >
                    <img
                      src={capturedPhotos[capturedPhotos.length - 1]}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    {room.selectedFrame && (
                      <CanvasFrameOverlay
                        frameId={room.selectedFrame}
                        width={640}
                        height={480}
                      />
                    )}
                  </motion.div>
                )}

                {/* Frame overlay on live video */}
                {room.selectedFrame && sessionStatus !== 'review' && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <CanvasFrameOverlay frameId={room.selectedFrame} width={640} height={480} />
                  </div>
                )}

                {/* Loading indicator */}
                {camLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom controls */}
          <div className="bg-gray-900 p-4">
            {sessionStatus === 'review' && capturedPhotos.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-center"
              >
                <button
                  id="btn-retake"
                  onClick={handleRetake}
                  className="flex-1 max-w-[160px] flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-white/20"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
                <button
                  id="btn-use-photo"
                  onClick={handleUsePhoto}
                  className="flex-1 max-w-[160px] btn-primary py-3 flex items-center justify-center gap-2"
                >
                  ✓ Use Photo
                </button>
              </motion.div>
            ) : sessionStatus === 'waiting' || sessionStatus === 'frame_select' || sessionStatus === 'background_select' ? (
              <div className="flex flex-col gap-3 items-center">
                {/* Ready toggle */}
                <button
                  id="btn-toggle-ready"
                  onClick={() => setReady(!isReady)}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${
                    isReady
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {isReady ? '✓ Ready!' : 'Mark as Ready'}
                </button>

                {isHost && (
                  <button
                    id="btn-start-session"
                    onClick={triggerCountdown}
                    disabled={room.participants.length < 1}
                    className="btn-primary px-10 py-4 text-lg w-full max-w-[280px] flex items-center justify-center gap-2"
                  >
                    📸 Start Photo Session
                  </button>
                )}
              </div>
            ) : sessionStatus === 'countdown' ? (
              <div className="text-center text-white/50 text-sm py-2">
                Get ready...
              </div>
            ) : null}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:w-80 bg-gray-800 flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              {formatParticipantCount(room.participants.length)}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto picker-scroll">
              {room.participants.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: getPastelColor(p.id) }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {p.name} {p.id === userId && '(you)'}
                    </div>
                    <div className="text-xs text-white/40 flex items-center gap-2">
                      {p.isHost ? '👑 Host' : ''}
                      
                      {/* Audio Indicators */}
                      {(participantMicStatus[p.id] || (p.id === userId && isMicOn)) && (
                        <div className={`flex items-center gap-1 ${speakingUsers.has(p.id) ? 'text-green-400' : 'text-white/30'}`}>
                          {speakingUsers.has(p.id) ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Mic className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${p.isReady ? 'bg-green-400' : 'bg-white/20'}`} />
                </motion.div>
              ))}
            </div>
            {allReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 text-center text-green-400 text-sm font-bold"
              >
                Everyone Ready ✓
              </motion.div>
            )}
          </div>

          {/* Frame & Background tabs */}
          <div className="flex border-b border-white/10">
            {(['frame', 'background'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? 'text-pink-400 border-b-2 border-pink-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab === 'frame' ? '🖼️ Frame' : '🎨 Background'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto picker-scroll">
            {activeTab === 'frame' ? (
              <FramePicker
                selectedFrame={room.selectedFrame}
                onSelectFrame={isHost ? selectFrame : undefined}
                isHost={isHost}
              />
            ) : (
              <BackgroundPicker
                selectedBackground={room.selectedBackground}
                onSelectBackground={isHost ? selectBackground : undefined}
                isHost={isHost}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline canvas frame overlay component
function CanvasFrameOverlay({ frameId, width, height }: { frameId: string; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    applyFrameToCanvas(ctx, frameId, width, height)
  }, [frameId, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
