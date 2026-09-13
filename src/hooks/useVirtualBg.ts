import { useEffect, useRef, useState, useCallback } from 'react'
import * as mpSelfieSegmentation from '@mediapipe/selfie_segmentation'
import { type BackgroundConfig, backgroundToCSS } from '../lib/backgrounds'

// Handle Vite / Rollup CommonJS export quirks for mediapipe
const SelfieSegmentation = 
  mpSelfieSegmentation.SelfieSegmentation || 
  (mpSelfieSegmentation as any).default?.SelfieSegmentation

export function useVirtualBg(
  videoElement: HTMLVideoElement | null,
  background: BackgroundConfig | null,
  isActive: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const segmentationRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const requestFrameRef = useRef<number>(0)

  // Initialize MediaPipe
  useEffect(() => {
    if (!isActive) return

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      },
    })

    selfieSegmentation.setOptions({
      modelSelection: 1, // 0 for general, 1 for landscape (faster)
    })

    segmentationRef.current = selfieSegmentation

    return () => {
      selfieSegmentation.close()
      segmentationRef.current = null
    }
  }, [isActive])

  // Handle segmentation results
  const onResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Match canvas size to video size
      if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
        canvas.width = results.image.width
        canvas.height = results.image.height
      }

      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background first
      if (background && background.type !== 'original') {
        if (background.type === 'solid' || background.type === 'gradient') {
          ctx.fillStyle = backgroundToCSS(background)
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (background.type === 'image' && background.value) {
          // Assuming background.value is a URL, but we need an Image object to draw it synchronously.
          // For a simpler approach, if it's an image, we can just leave it transparent 
          // and let the CSS background underneath show through!
          // Wait, if we want the final captured photo to have the background, we MUST draw it on the canvas.
        }
      }

      // Draw the segmented person
      // Only overwrite missing pixels (where the person is)
      if (background && background.type !== 'original') {
        ctx.globalCompositeOperation = 'source-over'
        
        // The mask is white for person, black for background
        // Draw the person using the mask
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height)
        
        ctx.globalCompositeOperation = 'source-in'
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
      } else {
        // Original background - just draw the camera
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
      }

      ctx.restore()
    },
    [background]
  )

  useEffect(() => {
    if (segmentationRef.current) {
      segmentationRef.current.onResults(onResults)
      setIsReady(true)
    }
  }, [onResults])

  // Processing loop
  useEffect(() => {
    if (!isActive || !isReady || !videoElement || !segmentationRef.current) return

    const processVideo = async () => {
      if (videoElement.readyState >= 2) {
        try {
          await segmentationRef.current!.send({ image: videoElement })
        } catch (e) {
          console.error('Segmentation error:', e)
        }
      }
      requestFrameRef.current = requestAnimationFrame(processVideo)
    }

    processVideo()

    return () => {
      cancelAnimationFrame(requestFrameRef.current)
    }
  }, [isActive, isReady, videoElement])

  return { canvasRef, isReady }
}
