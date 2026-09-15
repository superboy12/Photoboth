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
  capturePhoto: (sources?: (HTMLCanvasElement | HTMLVideoElement)[]) => string | null
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
          width: { ideal: 1920 },
          height: { ideal: 1080 },
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

  const capturePhoto = useCallback((sources?: (HTMLCanvasElement | HTMLVideoElement)[]): string | null => {
    const validSources = sources && sources.length > 0 ? sources : (videoRef.current ? [videoRef.current] : [])
    if (validSources.length === 0) return null
    
    const canvas = document.createElement('canvas')
    // Set output resolution (high quality)
    canvas.width = 1440 
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Mirror the capture (un-mirror from CSS transform)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    
    const numSources = validSources.length
    const destWidth = canvas.width / numSources

    validSources.forEach((src, idx) => {
      const vWidth = (src as HTMLVideoElement).videoWidth || (src as HTMLCanvasElement).width || 1920
      const vHeight = (src as HTMLVideoElement).videoHeight || (src as HTMLCanvasElement).height || 1080

      // Calculate crop dimensions for each section
      const sectionRatio = destWidth / canvas.height
      const vRatio = vWidth / vHeight

      let sWidth = vWidth
      let sHeight = vHeight
      let sx = 0
      let sy = 0

      if (vRatio > sectionRatio) {
        // Video is wider, crop sides
        sWidth = vHeight * sectionRatio
        sx = (vWidth - sWidth) / 2
      } else if (vRatio < sectionRatio) {
        // Video is taller, crop top/bottom
        sHeight = vWidth / sectionRatio
        sy = (vHeight - sHeight) / 2
      }

      const dx = canvas.width - destWidth * (idx + 1)
      ctx.drawImage(src, sx, sy, sWidth, sHeight, dx, 0, destWidth, canvas.height)
    })

    return canvas.toDataURL('image/png', 1.0)
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
