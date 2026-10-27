import { AnimatePresence, motion } from 'framer-motion';

interface GrowthPopProps {
  active: boolean;
  emoji: string;
  simple?: boolean;
}

/** Doğru cevapta kısa filizlenme kutlaması. */
export function GrowthPop({ active, emoji, simple = false }: GrowthPopProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="growth-pop"
          role="status"
          aria-live="polite"
          initial={simple ? { opacity: 1 } : { opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="growth-pop__pot" aria-hidden="true">
            <span className="growth-pop__soil">🪴</span>
            <motion.span
              className="growth-pop__plant"
              initial={simple ? false : { scale: 0.2, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4, ease: 'easeOut' }}
            >
              {emoji}
            </motion.span>
          </div>
          <p className="growth-pop__text">Bahçene eklendi!</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
