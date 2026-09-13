import { useState, useEffect } from 'react'

export interface CountdownState {
  isActive: boolean
  count: number // 3, 2, 1, 0 = cheese!
  phase: 'idle' | 'counting' | 'cheese' | 'done'
  currentShot: number // 1 to 4
}

export function useCountdown(
  countdownStartAt: string | null,
  onCapture: (shotIndex: number) => void,
  targetShot?: number
) {
  const [state, setState] = useState<CountdownState>({
    isActive: false,
    count: 3,
    phase: 'idle',
    currentShot: 1,
  })

  useEffect(() => {
    if (!countdownStartAt) {
      setState({ isActive: false, count: 3, phase: 'idle', currentShot: 1 })
      return
    }

    const startTime = new Date(countdownStartAt).getTime()
    const shotCycle = 5000 // 5 seconds per shot (3s count, 1s cheese, 1s pause)
    const maxShots = targetShot ? 1 : 4

    let animFrame: number
    let capturedShots = 0

    const tick = () => {
      const now = Date.now()
      const elapsed = now - startTime

      if (elapsed < 0) {
        // Not started yet
        setState({ isActive: false, count: 3, phase: 'idle', currentShot: 1 })
        animFrame = requestAnimationFrame(tick)
        return
      }

      const currentShotIndex = Math.floor(elapsed / shotCycle)
      const shotElapsed = elapsed % shotCycle

      if (currentShotIndex >= maxShots) {
        setState({ isActive: false, count: 0, phase: 'done', currentShot: maxShots })
        return // Stop loop
      }

      const currentShot = targetShot ? targetShot : currentShotIndex + 1

      if (shotElapsed < 3000) {
        // Counting phase
        const secondsLeft = Math.ceil((3000 - shotElapsed) / 1000)
        setState({ isActive: true, count: secondsLeft, phase: 'counting', currentShot })
      } else if (shotElapsed < 4000) {
        // Cheese phase
        setState({ isActive: true, count: 0, phase: 'cheese', currentShot })
        
        // Trigger capture exactly once per shot
        if (capturedShots === currentShotIndex) {
          capturedShots++
          onCapture(currentShot)
        }
      } else {
        // Pause phase before next shot
        setState({ isActive: true, count: 0, phase: 'idle', currentShot })
      }

      animFrame = requestAnimationFrame(tick)
    }

    animFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame)
  }, [countdownStartAt, onCapture])

  return state
}
