import { motion } from 'framer-motion';

interface SeedPathProps {
  index: number;
  total: number;
  simple?: boolean;
}

/** Soru ilerlemesi: tohum → filiz yolu (sayı yerine oyun hissi). */
export function SeedPath({ index, total, simple = false }: SeedPathProps) {
  if (total <= 0) return null;

  return (
    <ol className="seed-path" aria-label={`Soru ${index + 1} / ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < index;
        const current = i === index;
        const emoji = done ? '🌿' : current ? '🌱' : '🟤';
        return (
          <li key={i} className={`seed-path__step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}>
            <motion.span
              aria-hidden="true"
              animate={
                simple
                  ? {}
                  : current
                    ? { y: [0, -4, 0], scale: [1, 1.12, 1] }
                    : done
                      ? { scale: 1 }
                      : { scale: 0.92, opacity: 0.55 }
              }
              transition={{ duration: 0.9, ease: 'easeOut', repeat: current && !simple ? Infinity : 0, repeatDelay: 0.8 }}
            >
              {emoji}
            </motion.span>
            <span className="visually-hidden">
              {done ? 'Tamam' : current ? 'Şimdi' : 'Bekliyor'} {i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
