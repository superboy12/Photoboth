import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  count: number
  phase: 'counting' | 'cheese'
}

export default function CountdownOverlay({ count, phase }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <AnimatePresence mode="wait">
        {phase === 'counting' ? (
          <motion.div
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative text-center"
          >
            <div
              className="text-[160px] md:text-[220px] font-black leading-none select-none"
              style={{
                textShadow: '0 0 60px rgba(236,72,153,0.8), 0 0 120px rgba(139,92,246,0.6)',
                color: 'white',
              }}
            >
              {count}
            </div>
            <div className="text-white/70 text-2xl font-bold tracking-widest uppercase mt-2">
              Get Ready!
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cheese"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">📸</div>
            <div
              className="text-6xl md:text-8xl font-black text-yellow-300 select-none"
              style={{
                textShadow: '0 0 40px rgba(250,204,21,0.8)',
              }}
            >
              CHEESE!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
