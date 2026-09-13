import { useState, useEffect } from 'react'

export interface CountdownState {
  isActive: boolean
  count: number // 3, 2, 1, 0 = cheese!
  phase: 'idle' | 'counting' | 'cheese' | 'done'
}

export function useCountdown(
  countdownStartAt: string | null,
  onCapture: () => void
) {
  const [state, setState] = useState<CountdownState>({
    isActive: false,
    count: 3,
    phase: 'idle',
  })

  useEffect(() => {
    if (!countdownStartAt) {
      setState({ isActive: false, count: 3, phase: 'idle' })
      return
    }

    const startTime = new Date(countdownStartAt).getTime()
    const countdownDuration = 3000 // 3 seconds

    let animFrame: number

    const tick = () => {
      const now = Date.now()
      const elapsed = now - startTime

      if (elapsed < 0) {
        // Not started yet
        setState({ isActive: false, count: 3, phase: 'idle' })
        animFrame = requestAnimationFrame(tick)
        return
      }

      if (elapsed < countdownDuration) {
        const secondsLeft = Math.ceil((countdownDuration - elapsed) / 1000)
        setState({ isActive: true, count: secondsLeft, phase: 'counting' })
        animFrame = requestAnimationFrame(tick)
      } else if (elapsed < countdownDuration + 1000) {
        setState({ isActive: true, count: 0, phase: 'cheese' })
        animFrame = requestAnimationFrame(tick)
      } else {
        setState({ isActive: false, count: 0, phase: 'done' })
        onCapture()
        return // Stop loop
      }
    }

    animFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame)
  }, [countdownStartAt, onCapture])

  return state
}
