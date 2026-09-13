import { useState, useEffect, useRef, useCallback } from 'react'

export interface CameraDevice {
  deviceId: string
  label: string
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  devices: CameraDevice[]
  selectedDevice: string
  isLoading: boolean
  error: string | null
  capturePhoto: () => string | null
  switchCamera: (deviceId: string) => void
  stopCamera: () => void
  startCamera: () => void
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${i + 1}`,
        }))
      setDevices(videoDevices)
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId)
      }
    } catch {
      console.warn('Could not enumerate devices')
    }
  }, [selectedDevice])

  const startCamera = useCallback(async (deviceId?: string) => {
    setIsLoading(true)
    setError(null)

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'user',
        },
        audio: false,
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)

      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        await videoRef.current.play()
      }

      await enumerateDevices()
    } catch (err) {
      const e = err as Error
      let msg = 'Could not access camera.'
      if (e.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please allow camera access and refresh.'
      } else if (e.name === 'NotFoundError') {
        msg = 'No camera found on this device.'
      } else if (e.name === 'NotReadableError') {
        msg = 'Camera is being used by another application.'
      } else if (e.name === 'OverconstrainedError') {
        msg = 'Camera constraints not satisfied. Trying default camera...'
        // Retry without specific deviceId
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          setStream(fallback)
          if (videoRef.current) {
            videoRef.current.srcObject = fallback
            await videoRef.current.play()
          }
          setIsLoading(false)
          return
        } catch {
          msg = 'Could not access any camera.'
        }
      }
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [stream, enumerateDevices])

  const switchCamera = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId)
    startCamera(deviceId)
  }, [startCamera])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Mirror the capture (un-mirror from CSS transform)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/png', 0.95)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stream])

  return {
    videoRef,
    stream,
    devices,
    selectedDevice,
    isLoading,
    error,
    capturePhoto,
    switchCamera,
    stopCamera,
    startCamera: () => startCamera(selectedDevice || undefined),
  }
}
